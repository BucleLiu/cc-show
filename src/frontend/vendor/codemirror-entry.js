// CodeMirror 6 bundle entry for cc-show
// Bundled into a single IIFE via esbuild, injected into the frontend at build time.
// Exposes window.CodeMirrorSetup with all the APIs needed by the JSON formatter.

import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter } from '@codemirror/lint'
import { syntaxHighlighting, defaultHighlightStyle, foldGutter, foldKeymap } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { search, searchKeymap } from '@codemirror/search'

window.CodeMirrorSetup = {
  EditorView,
  EditorState,
  Compartment,
  keymap,
  lineNumbers,
  highlightActiveLine,
  defaultKeymap,
  history,
  historyKeymap,
  json,
  jsonParseLinter,
  linter,
  syntaxHighlighting,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  oneDark,
  search,
  searchKeymap,
}
