import {DocState, DocType, Edit, saveDocState} from './Core'
import vscode, {Position, Range, TextDocument, TextEdit, TextEditor} from 'vscode'
import fd from 'fast-diff'
import GetCustomMarkers from './CustomLanguage'
const getCustomMarkers = GetCustomMarkers()


/** Gets an object representing the state of the document and selections. When a standard
 *  wrap is done, the state is compared with the state after the last wrap. If they are
 *  equal, and there are multiple rulers for the document, the next ruler is used for
 *  wrapping instead. */
export const getDocState = (editor: TextEditor) : DocState => {
  const doc = editor.document, selections = editor.selections
  return {filePath: docType(doc).path, version: doc.version, selections}
}

/** Creates and returns the vscode edits to be applied to the the document, and where the
 *  selections will be after they are applied. If a TextEditorEdit is supplied, the edits
 *  are applied to it. If saveState is true, also saves the state of the document. If the
 *  edit is empty this is a no-op */
export function buildEdits
  (doc: TextDocument, edit: Edit, eb?: vscode.TextEditorEdit, saveState = false)
  : {edits: TextEdit[], selections: vscode.Selection[]}
{
  const edits: TextEdit[] = []
  if (edit.isEmpty) return {edits, selections: []}

  // Selections are processed in document order, but they may be given in a different
  // order (the primary selection comes first). They are returned in the original order.
  const order = edit.selections.map((_, i) => i)
    .sort((a, b) => edit.selections[a].start.compareTo(edit.selections[b].start))
  const oldLines = Array(edit.endLine - edit.startLine + 1).fill(null)
          .map((_, i) => doc.lineAt(edit.startLine + i).text)
    , oldSelections = order.map(i => edit.selections[i]).reverse()
    , sortedSelections: vscode.Selection[] = []
  let sel = oldSelections.pop()

  const eol = doc.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n"
    , oldText = oldLines.join(eol), newText = edit.lines.join(eol)
    , diffs = fd(oldText, newText)
  let startPos = new vscode.Position (edit.startLine, 0), endPos
    , endOffset = doc.offsetAt(startPos), offsetDiff = 0
    , newAnchorPos: Position | undefined, newActivePos: Position | undefined
  const editStartOffset = endOffset
  const checkSelPos = (pos: vscode.Position, newOff?: number) => {
    if (pos.line < edit.startLine) return pos
    if (pos.isAfterOrEqual(endPos)) return undefined
    let off = (newOff ?? doc.offsetAt(pos)) + offsetDiff - editStartOffset
    for (let i = 0; i < edit.lines.length; i++) {
      const lineLength = edit.lines[i].length + eol.length
      if (off < lineLength) return new vscode.Position(edit.startLine + i, off)
      else off -= lineLength
    }
    throw new Error("Tried to find position outside edit range.")
  }

  for (let [op, str] of diffs) {
    if (op === fd.INSERT) {
      offsetDiff += str.length
      edits.push (TextEdit.insert (startPos, str))
      continue
    }

    endOffset += str.length, endPos = doc.positionAt(endOffset)

    while (sel) {
      // If selection falls in a deleted section it will be moved to the start of it
      let newOffset = op === fd.DELETE ? endOffset - str.length : undefined
      if (!newAnchorPos) newAnchorPos = checkSelPos(sel.anchor, newOffset)
      if (!newActivePos) newActivePos = checkSelPos(sel.active, newOffset)
      if (newAnchorPos && newActivePos) {
        sortedSelections.push (new vscode.Selection (newAnchorPos, newActivePos))
        newAnchorPos = newActivePos = undefined
        sel = oldSelections.pop ()
      }
      else break
    }

    if (op === fd.DELETE) {
      offsetDiff -= str.length
      edits.push (TextEdit.delete (new Range (startPos, endPos)))
    }
    startPos = endPos
  }

  // Handle special case of a selection that's right at the end of the edit. This won't
  // have been captured in the above because of the < endPos check.
  if (sel) {
    let endLine = edit.lines.length - 1
    const test = p => endPos.isEqual(p) ?
      new Position (edit.startLine + endLine, edit.lines[endLine].length) : undefined
    newAnchorPos = newAnchorPos || test (sel.anchor)
    newActivePos = newActivePos || test (sel.active)
  }

  // Finish off selections after the edit
  const lineDelta = edit.lines.length - (edit.endLine - edit.startLine + 1)
  while (sel) {
    sortedSelections.push (new vscode.Selection (
      newAnchorPos || sel.anchor.translate (lineDelta),
      newActivePos || sel.active.translate (lineDelta)
    ))
    newAnchorPos = newActivePos = undefined
    sel = oldSelections.pop ()
  }

  const selections: vscode.Selection[] = []
  order.forEach((origIndex, i) => selections[origIndex] = sortedSelections[i])

  if (eb)
    edits.forEach(e => e.newText ? eb.insert (e.range.start, e.newText) : eb.delete (e.range))
  if (saveState)
    saveDocState ({filePath: doc.fileName, version: doc.version + 1, selections})

  return {edits, selections}
}

/** This function applies an edit to the editor, and then explicitly sets the
 * selections to where they should be after it. Typically, you should not use
 * this function. It's preferable to just directly use buildEdits instead of
 * calling this function.
 * 
 * ```ts
 * editor.edit (builder => buildEdits(doc, edit, builder))
 * ```
 * 
 * VS Code moves the selections with the edit by itself just fine, and Rewrap
 * does not actually need to reset the selection. The problem is that the
 * VSCodeVim extension then sets the cursor back to a stale position, which is a
 * bug in VSCodeVim. This function was added as a hack to workaround VSCodeVim's
 * bug. It is notbe Rewrap's responsibility to come in after the fact and fix
 * VSCodeVim's mistakes. But we're offering this hack for now as a workaround to
 * improve the general vscode experience for users of that buggy extension.
 * 
 * See https://github.com/dnut/Rewrap/issues/63 for more context.
 * 
 * Remove this function if it causes other problems in Rewrap. It's more
 * important to address those problems than to address VSCodeVim bugs.
 * 
 * Remove this function if it no longer provides significant value to users. */
export async function applyEdit (editor: TextEditor, edit: Edit) {
  if (edit.isEmpty) return
  const doc = editor.document
  let selections: vscode.Selection[] = [], expectedVersion = -1
  const didEdit = await editor.edit (eb => {
    expectedVersion = doc.version + 1
    selections = buildEdits (doc, edit, eb).selections
  })
  // Don't touch the selections if anything else has changed in the meantime
  if (!didEdit || doc.version !== expectedVersion || editor !== vscode.window.activeTextEditor)
    return
  editor.selections = selections
}

/** Catches any error and displays a friendly message to the user. */
export function catchErr (err) {
  console.error("====== Rewrap: Error ======")
  console.log(err)
  console.error(
    "^^^^^^ Rewrap: Please report this (with a copy of the above lines) ^^^^^^\n" +
    "at https://github.com/dnut/rewrap/issues"
  )
  vscode.window.showInformationMessage(
    "Sorry, there was an error in Rewrap. " +
    "Go to: Help -> Toggle Developer Tools -> Console " +
    "for more information."
  )
}

/** Returns a function for the given document, that gets the line at the given index. */
export function docLine (document: TextDocument) {
  return (i: number) => i < document.lineCount ? document.lineAt(i).text : null
}

/** Gets the path and language of the document. These are used to determine the parser
 *  used for it. */
export function docType (document: TextDocument): DocType {
    const path = document.fileName, language = document.languageId
    return {path, language, getMarkers: () => getCustomMarkers(language)}
}
