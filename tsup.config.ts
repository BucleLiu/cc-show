import { defineConfig } from 'tsup'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8')) as { version: string }

// Read marked.min.js at build time and inject as a define constant
let markedMinJs = ''
try {
  markedMinJs = readFileSync(join(__dirname, 'node_modules/marked/marked.min.js'), 'utf-8')
} catch {
  markedMinJs = 'window.marked={parse:function(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}};'
}

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  target: 'node18',
  platform: 'node',
  clean: true,
  minify: false,
  bundle: true,
  splitting: false,
  outExtension: () => ({ js: '.js' }),
  banner: {
    js: '#!/usr/bin/env node',
  },
  noExternal: ['commander', 'picocolors'],
  // node:sqlite is a Node.js built-in (v22+) — must stay as-is, not bundled
  external: ['node:sqlite'],
  define: {
    '__PACKAGE_VERSION__': JSON.stringify(pkg.version),
    '__MARKED_MIN_JS__': JSON.stringify(markedMinJs),
  },
})
