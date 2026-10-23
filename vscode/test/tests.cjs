const assert = require('assert')
const {commands, window, workspace, Position, Selection} = require('vscode')
const {getCoreSettings, buildEdits} = require('../dist/Extension.node.js')

const testSettings = async (language, expected) => {
  const doc = await workspace.openTextDocument({language, content: ""})
  const editor = await window.showTextDocument(doc)
  const actual = getCoreSettings(editor, cs => cs[0])
  assert.deepStrictEqual(actual, expected)
  await commands.executeCommand("workbench.action.closeActiveEditor")
}

const expectedSettings = {
  plaintext: {
    column: 45,
    doubleSentenceSpacing: true,
    wholeComment: false,
    reformat: true,
    tabWidth: 2,
  },
  markdown: {
    column: 60,
    doubleSentenceSpacing: false,
    wholeComment: true,
    reformat: false,
    tabWidth: 6,
  },
}

const testWrapping = async (language, content, expected) => {
  const doc = await workspace.openTextDocument({language, content})
  await window.showTextDocument(doc)
  await commands.executeCommand("editor.action.selectAll")
  await commands.executeCommand("rewrap.rewrapComment")
  assert.equal(doc.getText(), expected)
  await commands.executeCommand("workbench.action.closeActiveEditor")
}

/** Multiple cursors, where the primary one (which comes first) is below the other. Both
 *  paragraphs are wrapped and the cursors stay in the same order. */
const testUnorderedCursors = async () => {
  const doc = await workspace.openTextDocument({language: 'markdown', content: 'a1\na2\n\n   b1\n   b2'})
  const editor = await window.showTextDocument(doc)
  editor.selections = [new Selection(4, 4, 4, 4), new Selection(0, 0, 0, 0)]
  await commands.executeCommand('rewrap.rewrapComment')
  assert.equal(doc.getText(), 'a1 a2\n\n   b1 b2')
  assert.deepStrictEqual(
    editor.selections.map(s => [s.active.line, s.active.character]), [[2, 7], [0, 0]])
  await commands.executeCommand('workbench.action.revertAndCloseActiveEditor')
}

/** Check the returned selections directly: the wrap command lets VS Code move the
 *  editor's selections, so checking the editor alone doesn't exercise this mapping. */
const testUnorderedSelectionMapping = async () => {
  const doc = await workspace.openTextDocument({
    language: 'markdown', content: 'header\na1\na2\n\n   b1\n   b2\nfooter',
  })
  const {selections} = buildEdits(doc, {
    isEmpty: false,
    startLine: 1,
    endLine: 5,
    lines: ['a1 a2', '', '   b1 b2'],
    selections: [
      new Selection(5, 5, 4, 3), // Backward range, with its anchor at the edit's end
      new Selection(6, 3, 6, 3), // Cursor after the edit
      new Selection(1, 1, 2, 2), // Forward range
      new Selection(0, 1, 0, 1), // Cursor before the edit
      new Selection(1, 0, 1, 0), // Cursor at the edit's start
    ],
  })
  assert.deepStrictEqual(
    selections.map(s => [s.anchor.line, s.anchor.character, s.active.line, s.active.character]),
    [[3, 8, 3, 3], [4, 3, 4, 3], [1, 1, 1, 5], [0, 1, 0, 1], [1, 0, 1, 0]])
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/** Waits until `check` has returned true for `stableFor` ms in a row, or until `timeout`
 *  ms have passed. This doesn't fail by itself on a timeout, the assertions after it do. */
const waitFor = async (check, {stableFor = 0, timeout = 3000} = {}) => {
  const start = Date.now()
  let trueSince = null
  while (Date.now() - start < timeout) {
    if (!check()) trueSince = null
    else if (trueSince === null) trueSince = Date.now()
    if (trueSince !== null && Date.now() - trueSince >= stableFor) return
    await sleep(10)
  }
}

/** Simulates how VSCodeVim types in insert mode: it makes the edit itself and then sets
 *  the cursor to where it thinks it should be. Auto-wrap must still leave the cursor
 *  after the wrapped text (#63). */
const testAutoWrapCursorWithVimStyleTyping = async () => {
  const before = 'aaaa '.repeat(8) + 'bbbbbbbb' // 48 chars, plaintext column is 45
  const doc = await workspace.openTextDocument({language: 'plaintext', content: before})
  const editor = await window.showTextDocument(doc)
  await commands.executeCommand('rewrap.toggleAutoWrap')
  try {
    // The toggle finishes asynchronously, and the command doesn't wait for it
    await sleep(200)
    const end = new Position(0, before.length)
    editor.selection = new Selection(end, end)

    await editor.edit(eb => eb.insert(end, ' '), {undoStopBefore: false, undoStopAfter: false})
    const vimCursor = end.translate(0, 1)
    editor.selection = new Selection(vimCursor, vimCursor)

    const expectedText = 'aaaa '.repeat(8).trimEnd() + '\nbbbbbbbb '
    const expectedCursor = new Position(1, 9)
    // The cursor can briefly be in the right place before the stale one above is applied,
    // so wait for it to stay there
    await waitFor(() =>
      doc.getText() === expectedText && editor.selection.active.isEqual(expectedCursor),
      {stableFor: 200})

    assert.equal(doc.getText(), expectedText)
    assert.deepStrictEqual(
      [editor.selection.active.line, editor.selection.active.character], [1, 9])
  }
  finally {
    await commands.executeCommand('rewrap.toggleAutoWrap')
    await commands.executeCommand('workbench.action.revertAndCloseActiveEditor')
  }
}

exports.run = async () => {
  // Settings tests
  // breaks when run in parallel (Promise.all)
  for(const [l, e] of Object.entries(expectedSettings)) { await testSettings(l,e) }

  // Wrapping tests
  await testWrapping ("javascript", "// a\n// b", "// a b")
  await testWrapping ("rewrap-test-custom", "// a\n// b", "// a b")
  await testUnorderedCursors()
  await testUnorderedSelectionMapping()

  // Auto-wrap tests
  await testAutoWrapCursorWithVimStyleTyping()
  
  // lineComment can also be an object (#58)
  await testWrapping ("rewrap-test-custom-object", "# a\n# b", "# a b")
}
