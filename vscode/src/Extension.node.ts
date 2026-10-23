/** Desktop (Node) entry point. Installs the real filesystem reader on the
 *  shared `platform` object, then re-exports the host-agnostic extension
 *  surface from `./Extension`. VS Code's desktop host loads this file via
 *  the `main` field in package.json. */
import {readFileSync} from 'fs'
import {platform} from './Platform'

platform.readFile = path => readFileSync(path, 'utf-8')

export {activate, getCoreSettings, getEditorSettings} from './Extension'
export {buildEdits} from './Common'
