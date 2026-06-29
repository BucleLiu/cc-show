import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir, homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import {
  isTempCwd,
  resolveProject,
  truncateTitle,
  extractFirstUserPrompt,
  resolveSessionTitle,
  CX_TEMP_PLACEHOLDER,
  CX_TEMP_PROJECT_NAME,
  CX_TITLE_MAX_LEN,
} from '../cx-rollout.js'

const TMP = join(tmpdir(), 'cx-rollout-test-' + randomUUID())
beforeEach(() => mkdirSync(TMP, { recursive: true }))
afterEach(() => rmSync(TMP, { recursive: true, force: true }))

/** codex 未选项目时分配的临时会话工作目录 */
const codexTempSessionDir = (name: string) =>
  join(homedir(), 'Documents', 'Codex', '2026-06-29', name)

describe('isTempCwd', () => {
  it('空/null/undefined 视为临时', () => {
    expect(isTempCwd('')).toBe(true)
    expect(isTempCwd(null as unknown as undefined)).toBe(true)
    expect(isTempCwd(undefined)).toBe(true)
  })
  it('根目录视为临时', () => {
    expect(isTempCwd('/')).toBe(true)
  })
  it('home 目录视为临时', () => {
    expect(isTempCwd(homedir())).toBe(true)
  })
  it('~/Documents/Codex 临时会话树视为临时', () => {
    expect(isTempCwd(join(homedir(), 'Documents', 'Codex'))).toBe(true)
    expect(isTempCwd(codexTempSessionDir('f-3'))).toBe(true)
    expect(isTempCwd(codexTempSessionDir('f-2'))).toBe(true)
    expect(isTempCwd(codexTempSessionDir('1'))).toBe(true)
  })
  it('真实项目目录非临时', () => {
    expect(isTempCwd('/Users/admin/IdeaProjects/foo')).toBe(false)
    expect(isTempCwd('/home/user/code')).toBe(false)
    // 仅前缀相似但不在 Codex 树内不算
    expect(isTempCwd(join(homedir(), 'Documents', 'Other'))).toBe(false)
  })
})

describe('resolveProject', () => {
  it('临时 cwd 归一为占位项目', () => {
    const r = resolveProject('')
    expect(r.directory).toBe(CX_TEMP_PLACEHOLDER)
    expect(r.name).toBe(CX_TEMP_PROJECT_NAME)
    expect(r.isTemp).toBe(true)
  })
  it('不同临时 cwd（含 Codex 临时树）归一为同一占位 directory', () => {
    expect(resolveProject('').directory).toBe(resolveProject('/').directory)
    expect(resolveProject(homedir()).directory).toBe(CX_TEMP_PLACEHOLDER)
    expect(resolveProject(codexTempSessionDir('f-3')).directory).toBe(CX_TEMP_PLACEHOLDER)
    expect(resolveProject(codexTempSessionDir('f-2')).directory)
      .toBe(resolveProject(codexTempSessionDir('1')).directory)
  })
  it('真实 cwd 保留原路径与 basename', () => {
    const r = resolveProject('/Users/admin/IdeaProjects/foo')
    expect(r.directory).toBe('/Users/admin/IdeaProjects/foo')
    expect(r.name).toBe('foo')
    expect(r.isTemp).toBe(false)
  })
})

describe('truncateTitle', () => {
  it('短文本原样返回（空白规整）', () => {
    expect(truncateTitle('hello world')).toBe('hello world')
    expect(truncateTitle('  hello   world  ')).toBe('hello world')
  })
  it('多行压成单行', () => {
    expect(truncateTitle('line1\nline2\nline3')).toBe('line1 line2 line3')
  })
  it('超长截断并加省略号', () => {
    const long = 'a'.repeat(200)
    const r = truncateTitle(long)
    expect(r.length).toBe(CX_TITLE_MAX_LEN + 1)
    expect(r.endsWith('…')).toBe(true)
    expect(r.slice(0, CX_TITLE_MAX_LEN)).toBe('a'.repeat(CX_TITLE_MAX_LEN))
  })
  it('刚好等于上限不截断', () => {
    const exact = 'b'.repeat(CX_TITLE_MAX_LEN)
    expect(truncateTitle(exact)).toBe(exact)
  })
})

/** 一条 response_item user 消息行 */
const userLine = (text: string) =>
  JSON.stringify({
    type: 'response_item',
    payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] },
  })

describe('extractFirstUserPrompt', () => {
  it('路径为空返回 null', () => {
    expect(extractFirstUserPrompt('')).toBeNull()
    expect(extractFirstUserPrompt(null as unknown as undefined)).toBeNull()
  })
  it('文件不存在返回 null', () => {
    expect(extractFirstUserPrompt(join(TMP, 'nope.jsonl'))).toBeNull()
  })
  it('跳过内部指令，返回首条真实用户消息', () => {
    const p = join(TMP, 'a.jsonl')
    writeFileSync(p, [
      userLine('<environment_context>...internal...</environment_context>'),
      userLine('<permissions instructions>do not share</permissions instructions>'),
      JSON.stringify({ type: 'response_item', payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'hi' }] } }),
      userLine('帮我写一个排序算法'),
      userLine('第二条用户消息，不应被提取'),
    ].join('\n') + '\n', 'utf-8')
    expect(extractFirstUserPrompt(p)).toBe('帮我写一个排序算法')
  })
  it('event_msg 的 user_message 也能提取', () => {
    const p = join(TMP, 'b.jsonl')
    writeFileSync(p, JSON.stringify({ type: 'event_msg', payload: { type: 'user_message', message: '今天天气如何' } }) + '\n', 'utf-8')
    expect(extractFirstUserPrompt(p)).toBe('今天天气如何')
  })
  it('纯内部指令文件返回 null', () => {
    const p = join(TMP, 'c.jsonl')
    writeFileSync(p, userLine('<environment_context>x</environment_context>') + '\n', 'utf-8')
    expect(extractFirstUserPrompt(p)).toBeNull()
  })
})

describe('resolveSessionTitle', () => {
  it('优先用首条提示词', () => {
    const p = join(TMP, 't1.jsonl')
    writeFileSync(p, JSON.stringify({ type: 'event_msg', payload: { type: 'user_message', message: '这是我的提问' } }) + '\n', 'utf-8')
    expect(resolveSessionTitle(p, 'some db title')).toBe('这是我的提问')
  })
  it('无 rollout 时回退 DB 标题', () => {
    expect(resolveSessionTitle('', 'DB 标题')).toBe('DB 标题')
    expect(resolveSessionTitle(join(TMP, 'missing.jsonl'), 'DB 标题')).toBe('DB 标题')
  })
  it('无提示词且无 DB 标题时回退未命名会话', () => {
    expect(resolveSessionTitle('', '')).toBe('未命名会话')
    expect(resolveSessionTitle(null, null)).toBe('未命名会话')
  })
  it('首条提示词超长被截断', () => {
    const p = join(TMP, 't2.jsonl')
    writeFileSync(p, JSON.stringify({ type: 'event_msg', payload: { type: 'user_message', message: 'c'.repeat(200) } }) + '\n', 'utf-8')
    const r = resolveSessionTitle(p, '')
    expect(r.length).toBe(CX_TITLE_MAX_LEN + 1)
    expect(r.endsWith('…')).toBe(true)
  })
})
