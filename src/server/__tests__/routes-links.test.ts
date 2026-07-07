import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

// 测试用临时目录，避免污染真实 ~/.ccs
const TMP_BASE = join(homedir(), '.ccs-test-' + randomUUID())

// 通过环境变量让被测模块使用临时路径（见 notes.ts/config.ts 的 ccsHome()）
// 必须在 import routes 之前设置，因此用动态 import + beforeAll
let routesMod: typeof import('../routes.js')

describe('notes links routes', () => {
  const tmpDocs = join(TMP_BASE, 'docs')
  const mdA = join(tmpDocs, 'a.md')

  beforeAll(async () => {
    process.env.CCS_HOME = TMP_BASE
    process.env.CCS_TOOLS = '1'
    routesMod = await import('../routes.js')
  })

  beforeEach(() => {
    mkdirSync(join(TMP_BASE, '.ccs'), { recursive: true })
    mkdirSync(tmpDocs, { recursive: true })
    writeFileSync(mdA, '# A\n\ncontent', 'utf-8')
  })
  afterEach(() => {
    rmSync(TMP_BASE, { recursive: true, force: true })
  })

  // 路由模块导出一个 handleRequest(req, res) 函数（见 Step 3 说明）
  function request(method: string, path: string, body?: unknown): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const req = {
        method,
        url: path,
        headers: {},
        on(ev: string, cb: (c?: Buffer) => void) {
          if (ev === 'data' && body) cb(Buffer.from(JSON.stringify(body)))
          if (ev === 'end') cb()
        },
      } as unknown as IncomingMessage
      const chunks: Buffer[] = []
      const res = {
        writeHead(status: number, _h?: Record<string, string>) { (res as any)._status = status },
        setHeader(_name: string, _value: string) { /* no-op for tests */ },
        end(data?: unknown) {
          let parsed: any = null
          if (typeof data === 'string' || Buffer.isBuffer(data)) {
            try { parsed = JSON.parse(data.toString()) } catch { parsed = data.toString() }
          }
          resolve({ status: (res as any)._status, body: parsed })
        },
      } as unknown as ServerResponse
      routesMod.handleRequest(req, res).catch(reject)
    })
  }

  it('POST /api/notes/links creates a file link', async () => {
    const r = await request('POST', '/api/notes/links', { path: mdA })
    expect(r.status).toBe(201)
    expect(r.body.id).toMatch(/^lk_/)
    expect(r.body.type).toBe('file')
  })

  it('POST /api/notes/links 409 on duplicate', async () => {
    await request('POST', '/api/notes/links', { path: mdA })
    const r = await request('POST', '/api/notes/links', { path: mdA })
    expect(r.status).toBe(409)
  })

  it('POST /api/notes/links 400 on non-absolute', async () => {
    const r = await request('POST', '/api/notes/links', { path: 'rel/x.md' })
    expect(r.status).toBe(400)
  })

  it('GET /api/notes/links lists links', async () => {
    await request('POST', '/api/notes/links', { path: mdA })
    const r = await request('GET', '/api/notes/links')
    expect(r.status).toBe(200)
    expect(r.body.links).toHaveLength(1)
    expect(r.body.removed).toBe(0)
  })

  it('DELETE /api/notes/links/:id removes link', async () => {
    const created = await request('POST', '/api/notes/links', { path: mdA })
    const r = await request('DELETE', '/api/notes/links/' + created.body.id)
    expect(r.status).toBe(204)
  })

  it('GET /api/notes/links/:id/content returns file content', async () => {
    const created = await request('POST', '/api/notes/links', { path: mdA })
    const r = await request('GET', '/api/notes/links/' + created.body.id + '/content')
    expect(r.status).toBe(200)
    expect(r.body.content).toContain('# A')
  })

  it('GET /api/notes/links/:id/content 400 for folder link', async () => {
    const created = await request('POST', '/api/notes/links', { path: tmpDocs })
    const r = await request('GET', '/api/notes/links/' + created.body.id + '/content')
    expect(r.status).toBe(400)
  })

  it('GET /api/notes/links/:id/tree returns folder tree', async () => {
    const created = await request('POST', '/api/notes/links', { path: tmpDocs })
    const r = await request('GET', '/api/notes/links/' + created.body.id + '/tree')
    expect(r.status).toBe(200)
    expect(r.body.tree.some((n: any) => n.name === 'a.md')).toBe(true)
  })

  it('GET /api/notes/links/:id/tree 400 for file link', async () => {
    const created = await request('POST', '/api/notes/links', { path: mdA })
    const r = await request('GET', '/api/notes/links/' + created.body.id + '/tree')
    expect(r.status).toBe(400)
  })

  it('POST /api/notes/links/read returns content by path', async () => {
    const r = await request('POST', '/api/notes/links/read', { path: mdA })
    expect(r.status).toBe(200)
    expect(r.body.content).toContain('# A')
  })

  it('POST /api/notes/links/read 400 for non-md', async () => {
    const txt = join(tmpDocs, 'x.txt')
    writeFileSync(txt, 'x', 'utf-8')
    const r = await request('POST', '/api/notes/links/read', { path: txt })
    expect(r.status).toBe(400)
  })
})
