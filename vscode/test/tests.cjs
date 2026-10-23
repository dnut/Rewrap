const assert = require('assert')
const {commands, window, workspace, Position, Selection} = require('vscode')
const {getCoreSettings} = require('../dist/Extension.node.js')

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

  // Auto-wrap tests
  await testAutoWrapCursorWithVimStyleTyping()
  
  // lineComment can also be an object (#58)
  await testWrapping ("rewrap-test-custom-object", "# a\n# b", "# a b")
}
