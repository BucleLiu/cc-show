import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir, homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
// vitest 以 ESM 运行测试，import.meta.url 可用；但 tsc 按 CJS 输出检查会报错，故抑制
// @ts-expect-error import.meta 在 CJS 输出中不被允许
const nodeRequire = createRequire(import.meta.url)
const { DatabaseSync } = nodeRequire('node:sqlite') as typeof import('node:sqlite')

// 用 getter 延迟读取，避免 vi.mock hoisting 与模块级 let 的 TDZ 冲突
let tmpDbPath = ''
let tmpDir = ''
let extraSources: Array<{ id: 'orca'; label: string; home: string; dbPath: string }> = []

vi.mock('../cx-data-sources.js', () => ({
  getCxDataSources: () => [
    { id: 'default', label: '本机', home: tmpDir, dbPath: tmpDbPath },
    ...extraSources,
  ],
  getCxDataSource: (sourceId?: string) => [
    { id: 'default', label: '本机', home: tmpDir, dbPath: tmpDbPath },
    ...extraSources,
  ].find(source => source.id === sourceId) ?? { id: 'default', label: '本机', home: tmpDir, dbPath: tmpDbPath },
}))

function buildDb(): InstanceType<typeof DatabaseSync> {
  const db = new DatabaseSync(tmpDbPath, { open: true })
  db.exec('DROP TABLE IF EXISTS threads')
  db.exec(`
    CREATE TABLE threads (
      id TEXT, rollout_path TEXT, cwd TEXT, title TEXT,
      tokens_used INTEGER, model TEXT, created_at INTEGER, updated_at INTEGER, archived INTEGER
    )
  `)
  return db
}

function insertThread(db: InstanceType<typeof DatabaseSync>, row: {
  id: string; rollout_path: string; cwd: string; title: string
  tokens_used: number; model: string; created_at: number; updated_at: number
}) {
  db.prepare(
    `INSERT INTO threads (id, rollout_path, cwd, title, tokens_used, model, created_at, updated_at, archived)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
  ).run(row.id, row.rollout_path, row.cwd, row.title, row.tokens_used, row.model, row.created_at, row.updated_at)
}

/** 一条 response_item user 消息行 */
const userLine = (text: string) =>
  JSON.stringify({
    type: 'response_item',
    payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] },
  })

describe('loadCxHistory — 临时会话归类与首条提示词标题', () => {
  let loadCxHistory: typeof import('../cx-history.js').loadCxHistory
  let loadCxConversation: typeof import('../cx-history.js').loadCxConversation

  beforeEach(async () => {
    tmpDbPath = join(tmpdir(), 'cx-hist-' + randomUUID() + '.sqlite')
    tmpDir = join(tmpdir(), 'cx-hist-' + randomUUID())
    extraSources = []
    mkdirSync(tmpDir, { recursive: true })
    // resetModules 让 cx-rollout 的首条提示词缓存随每个用例重置
    vi.resetModules()
    ;({ loadCxHistory, loadCxConversation } = await import('../cx-history.js'))
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
    if (existsSync(tmpDbPath)) rmSync(tmpDbPath, { force: true })
  })

  it('空 cwd 归入临时会话项目，标题取首条提示词', () => {
    const r1 = join(tmpDir, 'rollout1.jsonl')
    const r2 = join(tmpDir, 'rollout2.jsonl')
    writeFileSync(r1, userLine('临时会话的第一条提问') + '\n', 'utf-8')
    writeFileSync(r2, userLine('正常项目的提问') + '\n', 'utf-8')

    const db = buildDb()
    insertThread(db, { id: 'sess-temp-1', rollout_path: r1, cwd: '', title: '', tokens_used: 100, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000100 })
    insertThread(db, { id: 'sess-real-1', rollout_path: r2, cwd: '/Users/admin/foo', title: '', tokens_used: 200, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000200 })
    db.close()

    const data = loadCxHistory()

    const tempProj = data.projects.find(p => p.isTemp)
    expect(tempProj).toBeDefined()
    expect(tempProj!.directory).toBe('__codex_temp__')
    expect(tempProj!.name).toBe('临时会话')
    expect(tempProj!.sessionCount).toBe(1)

    const tempSess = data.sessions.find(s => s.id === 'sess-temp-1')
    expect(tempSess!.cwd).toBe('__codex_temp__')          // 与 project.directory 一致，前端过滤不断链
    expect(tempSess!.projectName).toBe('临时会话')
    expect(tempSess!.title).toBe('临时会话的第一条提问')

    const realProj = data.projects.find(p => !p.isTemp)
    expect(realProj!.name).toBe('foo')
    expect(realProj!.directory).toBe('/Users/admin/foo')
    const realSess = data.sessions.find(s => s.id === 'sess-real-1')
    expect(realSess!.cwd).toBe('/Users/admin/foo')
    expect(realSess!.title).toBe('正常项目的提问')
  })

  it('home 目录 cwd 也归入临时会话项目', () => {
    const r = join(tmpDir, 'rollout-home.jsonl')
    writeFileSync(r, userLine('home 提问') + '\n', 'utf-8')
    const db = buildDb()
    insertThread(db, { id: 'sess-home', rollout_path: r, cwd: homedir(), title: '', tokens_used: 50, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000000 })
    db.close()

    const data = loadCxHistory()
    expect(data.projects.find(p => p.isTemp)).toBeDefined()
    expect(data.sessions[0].cwd).toBe('__codex_temp__')
    expect(data.sessions[0].projectName).toBe('临时会话')
  })

  it('~/Documents/Codex 临时会话树下的会话归入临时会话项目', () => {
    // f-2、f-3 是 codex 未选项目时分配的临时工作目录，basename 各不相同
    const r1 = join(tmpDir, 'rollout-f2.jsonl')
    const r2 = join(tmpDir, 'rollout-f3.jsonl')
    writeFileSync(r1, userLine('f-2 会话的提问') + '\n', 'utf-8')
    writeFileSync(r2, userLine('f-3 会话的提问') + '\n', 'utf-8')
    const db = buildDb()
    insertThread(db, { id: 'sess-f2', rollout_path: r1, cwd: join(homedir(), 'Documents', 'Codex', '2026-06-29', 'f-2'), title: '', tokens_used: 10, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000000 })
    insertThread(db, { id: 'sess-f3', rollout_path: r2, cwd: join(homedir(), 'Documents', 'Codex', '2026-06-29', 'f-3'), title: '', tokens_used: 10, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000001 })
    db.close()

    const data = loadCxHistory()
    const tempProj = data.projects.find(p => p.isTemp)
    expect(tempProj).toBeDefined()
    expect(tempProj!.name).toBe('临时会话')
    expect(tempProj!.sessionCount).toBe(2)
    // 两个不同 cwd 的会话归一到同一占位 directory
    expect(data.sessions.find(s => s.id === 'sess-f2')!.cwd).toBe('__codex_temp__')
    expect(data.sessions.find(s => s.id === 'sess-f3')!.cwd).toBe('__codex_temp__')
    expect(data.sessions.find(s => s.id === 'sess-f2')!.projectName).toBe('临时会话')
  })

  it('多个临时会话合并到同一临时项目', () => {
    const r1 = join(tmpDir, 'm1.jsonl')
    const r2 = join(tmpDir, 'm2.jsonl')
    writeFileSync(r1, userLine('提问一') + '\n', 'utf-8')
    writeFileSync(r2, userLine('提问二') + '\n', 'utf-8')
    const db = buildDb()
    insertThread(db, { id: 'm1', rollout_path: r1, cwd: '', title: '', tokens_used: 10, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000000 })
    insertThread(db, { id: 'm2', rollout_path: r2, cwd: '/', title: '', tokens_used: 10, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000001 })
    db.close()

    const data = loadCxHistory()
    const tempProj = data.projects.find(p => p.isTemp)
    expect(tempProj!.sessionCount).toBe(2)
    expect(data.sessions.every(s => s.cwd === '__codex_temp__')).toBe(true)
  })

  it('rollout 文件缺失时标题回退 DB title', () => {
    const db = buildDb()
    insertThread(db, { id: 'sess-db', rollout_path: '/nonexistent/rollout-x.jsonl', cwd: '', title: 'DB 里的标题', tokens_used: 10, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000000 })
    db.close()
    const data = loadCxHistory()
    expect(data.sessions.find(s => s.id === 'sess-db')!.title).toBe('DB 里的标题')
  })

  it('rollout 缺失且无 DB title 时回退未命名会话', () => {
    const db = buildDb()
    insertThread(db, { id: 'sess-unnamed', rollout_path: '/nonexistent/rollout-y.jsonl', cwd: '', title: '', tokens_used: 10, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000000 })
    db.close()
    const data = loadCxHistory()
    expect(data.sessions.find(s => s.id === 'sess-unnamed')!.title).toBe('未命名会话')
  })

  it('合并 Orca 数据源并标记会话来源', () => {
    const orcaDbPath = join(tmpdir(), 'cx-orca-' + randomUUID() + '.sqlite')
    const rollout = join(tmpDir, 'orca-rollout.jsonl')
    writeFileSync(rollout, userLine('来自 Orca 的提问') + '\n', 'utf-8')
    const orcaDb = new DatabaseSync(orcaDbPath, { open: true })
    orcaDb.exec(`
      CREATE TABLE threads (
        id TEXT, rollout_path TEXT, cwd TEXT, title TEXT,
        tokens_used INTEGER, model TEXT, created_at INTEGER, updated_at INTEGER, archived INTEGER
      )
    `)
    insertThread(orcaDb, { id: 'orca-session', rollout_path: rollout, cwd: '/Users/admin/orca-project', title: '', tokens_used: 300, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000300 })
    orcaDb.close()
    extraSources = [{ id: 'orca', label: 'Orca', home: tmpDir, dbPath: orcaDbPath }]

    const data = loadCxHistory()
    expect(data.sessions).toContainEqual(expect.objectContaining({
      id: 'orca-session', source: 'orca', sourceLabel: 'Orca', title: '来自 Orca 的提问',
    }))

    rmSync(orcaDbPath, { force: true })
  })

  it('按来源从 Orca 数据库加载会话详情', () => {
    const orcaDbPath = join(tmpdir(), 'cx-orca-detail-' + randomUUID() + '.sqlite')
    const rollout = join(tmpDir, 'orca-detail.jsonl')
    writeFileSync(rollout, [
      userLine('Orca 的用户消息'),
      JSON.stringify({
        type: 'response_item',
        payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Orca 的助手回复' }] },
      }),
    ].join('\n') + '\n', 'utf-8')
    const orcaDb = new DatabaseSync(orcaDbPath, { open: true })
    orcaDb.exec(`
      CREATE TABLE threads (
        id TEXT, rollout_path TEXT, cwd TEXT, title TEXT,
        tokens_used INTEGER, model TEXT, created_at INTEGER, updated_at INTEGER, archived INTEGER
      )
    `)
    insertThread(orcaDb, { id: 'orca-detail', rollout_path: rollout, cwd: '/Users/admin/orca-project', title: '', tokens_used: 300, model: 'gpt-5', created_at: 1700000000, updated_at: 1700000300 })
    orcaDb.close()
    extraSources = [{ id: 'orca', label: 'Orca', home: tmpDir, dbPath: orcaDbPath }]

    const data = loadCxConversation('orca-detail', 'orca')
    expect(data.path).toBe(rollout)
    expect(data.messages).toEqual([
      expect.objectContaining({ role: 'user', text: 'Orca 的用户消息' }),
      expect.objectContaining({ role: 'assistant', text: 'Orca 的助手回复' }),
    ])

    rmSync(orcaDbPath, { force: true })
  })
})
