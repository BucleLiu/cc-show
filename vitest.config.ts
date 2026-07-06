import { defineConfig } from 'vitest/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// 让被测源码里 __MARKED_MIN_JS__ 构建常量在测试中也有定义
// （routes.ts 间接 import frontend/notes-module.ts 与 claudemd-template.ts）
let markedMinJs = ''
try {
  markedMinJs = readFileSync(join(__dirname, 'node_modules/marked/marked.min.js'), 'utf-8')
} catch {
  markedMinJs = 'window.marked={parse:function(s){return s;}};'
}

// __CODEMIRROR_MIN_JS__ 同理
let codemirrorJs = ''
try {
  codemirrorJs = readFileSync(join(__dirname, 'src/frontend/vendor/codemirror.bundle.js'), 'utf-8')
} catch {
  codemirrorJs = 'window.CodeMirrorSetup={};'
}

export default defineConfig({
  define: {
    __MARKED_MIN_JS__: JSON.stringify(markedMinJs),
    __CODEMIRROR_MIN_JS__: JSON.stringify(codemirrorJs),
    __PACKAGE_VERSION__: JSON.stringify('0.0.0-test'),
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
