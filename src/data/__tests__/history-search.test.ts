import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'

// 用临时 dataDir 避免污染真实 ~/.claude
const TMP = join(homedir(), '.claude-test-' + randomUUID())

describe('searchSessionsByContent', () => {
  let searchSessionsByContent: typeof import('../history.js').searchSessionsByContent
  let execFileMock: ReturnType<typeof vi.fn>
  let mod: typeof import('../history.js')

  beforeEach(async () => {
    execFileMock = vi.fn()
    // 用 mock 替换 child_process.execFile，被测模块用 dynamic import 后取到 mock
    vi.doMock('node:child_process', () => ({
      execFile: execFileMock,
      execFileSync: vi.fn(() => Buffer.from('ripgrep 15.1.0')),
    }))
    vi.resetModules()
    mod = await import('../history.js')
    searchSessionsByContent = mod.searchSessionsByContent
    mkdirSync(join(TMP, 'projects', '-Users-admin-foo'), { recursive: true })
    writeFileSync(
      join(TMP, 'projects', '-Users-admin-foo', 'abc-123.jsonl'),
      '{"type":"assistant","message":{"content":[{"type":"text","text":"hello world"}]}}',
      'utf-8',
    )
  })

  it('rg 可用时返回命中的 sessionId，fallback=false', async () => {
    const hitPath = join(TMP, 'projects', '-Users-admin-foo', 'abc-123.jsonl')
    execFileMock.mockImplementation((_cmd, _args, _opts, cb) => {
      cb(null, hitPath + '\n', '')
    })
    const r = await searchSessionsByContent('hello', '/Users/admin/foo', TMP)
    expect(r.fallback).toBe(false)
    expect(r.sessionIds).toEqual(['abc-123'])
  })

  it('projectPath 为空时搜索所有项目目录', async () => {
    mkdirSync(join(TMP, 'projects', '-Users-admin-bar'), { recursive: true })
    writeFileSync(
      join(TMP, 'projects', '-Users-admin-bar', 'def-456.jsonl'),
      '{"type":"assistant","message":{"content":[{"type":"text","text":"hello world"}]}}',
      'utf-8',
    )
    const hitFoo = join(TMP, 'projects', '-Users-admin-foo', 'abc-123.jsonl')
    const hitBar = join(TMP, 'projects', '-Users-admin-bar', 'def-456.jsonl')
    execFileMock.mockImplementation((_cmd, args, _opts, cb) => {
      expect(args.at(-1)).toBe(join(TMP, 'projects'))
      cb(null, hitFoo + '\n' + hitBar + '\n', '')
    })

    const r = await searchSessionsByContent('hello', '', TMP)

    expect(r.fallback).toBe(false)
    expect(r.sessionIds).toEqual(['abc-123', 'def-456'])
  })

  it('rg 命令抛 ENOENT 时返回 fallback=true', async () => {
    vi.doMock('node:child_process', () => ({
      execFile: vi.fn((_c, _a, _o, cb) => cb(new Error('spawn rg ENOENT'), '', '')),
      execFileSync: vi.fn(() => { throw new Error('spawn rg ENOENT') }),
    }))
    vi.resetModules()
    const m = await import('../history.js')
    const r = await m.searchSessionsByContent('hello', '/Users/admin/foo', TMP)
    expect(r.fallback).toBe(true)
    expect(r.sessionIds).toEqual([])
  })

  it('rg 退出码 2（出错）时返回 fallback=true', async () => {
    execFileMock.mockImplementation((_c, _a, _o, cb) => {
      const err = new Error('rg failed') as Error & { code: number }
      err.code = 2
      cb(err, '', 'some error')
    })
    const r = await searchSessionsByContent('hello', '/Users/admin/foo', TMP)
    expect(r.fallback).toBe(true)
  })

  it('rg 退出码 1（无匹配）返回空列表，fallback=false', async () => {
    const err = new Error('no matches') as Error & { code: number }
    err.code = 1
    execFileMock.mockImplementation((_c, _a, _o, cb) => cb(err, '', ''))
    const r = await searchSessionsByContent('nomatch', '/Users/admin/foo', TMP)
    expect(r.fallback).toBe(false)
    expect(r.sessionIds).toEqual([])
  })

  it('关键词作为独立参数传入，含 - 时不被当选项（验证 args 形态）', async () => {
    execFileMock.mockImplementation((_c, _a, _o, cb) => cb(null, '', ''))
    await searchSessionsByContent('-weird', '/Users/admin/foo', TMP)
    const args = execFileMock.mock.calls[0][1] as string[]
    expect(args).toContain('-F')
    expect(args).toContain('--')
    expect(args[args.indexOf('--') + 1]).toBe('-weird')
  })

  it('q 为空时不调用 rg，返回空', async () => {
    const r = await searchSessionsByContent('', '/Users/admin/foo', TMP)
    expect(r.fallback).toBe(false)
    expect(r.sessionIds).toEqual([])
    expect(execFileMock).not.toHaveBeenCalled()
  })

  afterEach(() => {
    vi.doUnmock('node:child_process')
    vi.resetModules()
    rmSync(TMP, { recursive: true, force: true })
  })
})
