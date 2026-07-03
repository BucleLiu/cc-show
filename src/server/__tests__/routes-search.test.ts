import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'

const TMP = join(homedir(), '.claude-test-' + randomUUID())
let routesMod: typeof import('../routes.js')

beforeAll(async () => {
  // 创建包含可见 text 块的测试文件，确保二次验证通过
  mkdirSync(join(TMP, 'projects', '-Users-admin-foo'), { recursive: true })
  writeFileSync(
    join(TMP, 'projects', '-Users-admin-foo', 'all-123.jsonl'),
    '{"type":"assistant","message":{"content":[{"type":"text","text":"hello world"}]}}',
    'utf-8',
  )

  // mock 掉 rg，避免依赖真实环境
  vi.doMock('node:child_process', () => ({
    execFile: vi.fn((_c, args, _o, cb) => {
      const target = args.at(-1)
      if (target === join(TMP, 'projects')) {
        cb(null, join(TMP, 'projects', '-Users-admin-foo', 'all-123.jsonl') + '\n', '')
        return
      }
      cb(null, '', '')
    }),
    execFileSync: vi.fn(() => Buffer.from('ripgrep 15.1.0')),
  }))
  vi.resetModules()
  routesMod = await import('../routes.js')
})

afterAll(() => {
  rmSync(TMP, { recursive: true, force: true })
})

function request(method: string, path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      url: path,
      headers: {},
      on(ev: string, cb: (c?: Buffer) => void) {
        if (ev === 'end') cb()
      },
    } as unknown as IncomingMessage
    const res = {
      writeHead(status: number) { (res as any)._status = status },
      setHeader() {},
      end(data?: unknown) {
        let parsed: any = null
        if (typeof data === 'string' || Buffer.isBuffer(data)) {
          try { parsed = JSON.parse(data.toString()) } catch { parsed = data.toString() }
        }
        resolve({ status: (res as any)._status, body: parsed })
      },
    } as unknown as ServerResponse
    routesMod.handleRequest(req, res, TMP).catch(reject)
  })
}

describe('GET /api/history/search', () => {
  it('返回 200 和 {fallback, sessionIds} 结构', async () => {
    const r = await request('GET', '/api/history/search?q=hello&project=' + encodeURIComponent('/Users/admin/foo'))
    expect(r.status).toBe(200)
    expect(r.body).toHaveProperty('fallback')
    expect(r.body).toHaveProperty('sessionIds')
    expect(Array.isArray(r.body.sessionIds)).toBe(true)
  })

  it('缺 q 参数返回空结果', async () => {
    const r = await request('GET', '/api/history/search?project=' + encodeURIComponent('/Users/admin/foo'))
    expect(r.status).toBe(200)
    expect(r.body.sessionIds).toEqual([])
  })

  it('缺 project 参数时搜索所有项目', async () => {
    const r = await request('GET', '/api/history/search?q=hello')
    expect(r.status).toBe(200)
    expect(r.body.sessionIds).toEqual(['all-123'])
  })
})
