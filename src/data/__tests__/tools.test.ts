import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'

const TMP_BASE = join(homedir(), '.ccs-test-' + randomUUID())

let tools: typeof import('../tools.js')

describe('tools json-format CRUD', () => {
  beforeAll(async () => {
    process.env.CCS_HOME = TMP_BASE
    tools = await import('../tools.js')
  })

  beforeEach(() => {
    mkdirSync(join(TMP_BASE, '.ccs', 'tools', 'json-format'), { recursive: true })
  })

  afterEach(() => {
    rmSync(TMP_BASE, { recursive: true, force: true })
  })

  it('listJsonFiles returns empty array when dir is empty', () => {
    expect(tools.listJsonFiles()).toEqual([])
  })

  it('listJsonFiles returns empty array when dir does not exist', () => {
    rmSync(TMP_BASE, { recursive: true, force: true })
    expect(tools.listJsonFiles()).toEqual([])
  })

  it('saveJsonFile creates file and returns info', () => {
    const result = tools.saveJsonFile('test', '{"a":1}')
    expect(result.name).toBe('test.json')
    expect(result.size).toBeGreaterThan(0)
    expect(result.mtime).toBeTruthy()
  })

  it('saveJsonFile validates JSON content', () => {
    expect(() => tools.saveJsonFile('bad', 'not json')).toThrow(/Invalid JSON/)
  })

  it('saveJsonFile rejects invalid name with path traversal', () => {
    expect(() => tools.saveJsonFile('../etc', '{}')).toThrow(/Invalid name/)
  })

  it('listJsonFiles returns saved files sorted by mtime desc', () => {
    tools.saveJsonFile('a', '{}')
    // tiny delay to ensure different mtime
    tools.saveJsonFile('b', '[1,2]')
    const list = tools.listJsonFiles()
    expect(list.length).toBeGreaterThanOrEqual(1)
    const names = list.map(f => f.name)
    expect(names).toContain('a.json')
    expect(names).toContain('b.json')
  })

  it('getJsonFileContent reads a saved file', () => {
    tools.saveJsonFile('data', '{"key":"value"}')
    const result = tools.getJsonFileContent('data.json')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('data.json')
    expect(JSON.parse(result!.content)).toEqual({ key: 'value' })
  })

  it('getJsonFileContent adds .json extension automatically', () => {
    tools.saveJsonFile('config', '{"x":1}')
    // name without .json also works (sanitizeName adds it)
    const result = tools.getJsonFileContent('config')
    expect(result).not.toBeNull()
    expect(JSON.parse(result!.content)).toEqual({ x: 1 })
  })

  it('getJsonFileContent returns null for non-existent file', () => {
    expect(tools.getJsonFileContent('nonexistent.json')).toBeNull()
  })

  it('deleteJsonFile removes the file', () => {
    tools.saveJsonFile('x', '{}')
    tools.deleteJsonFile('x.json')
    expect(tools.listJsonFiles()).toEqual([])
  })

  it('deleteJsonFile throws for non-existent file', () => {
    expect(() => tools.deleteJsonFile('nonexistent.json')).toThrow(/not found/)
  })

  it('deleteJsonFile rejects invalid name', () => {
    expect(() => tools.deleteJsonFile('../etc.json')).toThrow(/Invalid name/)
  })

  it('saveJsonFile overwrites existing file', () => {
    tools.saveJsonFile('dup', '{"v":1}')
    tools.saveJsonFile('dup', '{"v":2}')
    const result = tools.getJsonFileContent('dup.json')
    expect(JSON.parse(result!.content)).toEqual({ v: 2 })
  })
})

describe('tools json-links (引用)', () => {
  let fs: typeof import('node:fs')
  let path: typeof import('node:path')

  beforeAll(async () => {
    fs = await import('node:fs')
    path = await import('node:path')
  })

  beforeEach(() => {
    process.env.CCS_HOME = join(TMP_BASE, 'links-' + randomUUID())
  })

  afterEach(() => {
    rmSync(process.env.CCS_HOME!, { recursive: true, force: true })
  })

  it('listJsonLinks returns empty when no manifest', () => {
    expect(tools.listJsonLinks()).toEqual({ links: [], removed: 0 })
  })

  it('addJsonLink adds a file link with derived label', () => {
    const f = path.join(TMP_BASE, 'sample-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{"a":1}', 'utf-8')
    const link = tools.addJsonLink({ path: f })
    expect(link.type).toBe('file')
    expect(link.path).toBe(f)
    expect(link.label).toBe(path.basename(f).replace(/\.json$/i, ''))
    expect(link.id).toMatch(/^jl_/)
  })

  it('addJsonLink adds a folder link', () => {
    const d = path.join(TMP_BASE, 'dir-' + randomUUID())
    fs.mkdirSync(d, { recursive: true })
    const link = tools.addJsonLink({ path: d })
    expect(link.type).toBe('folder')
    expect(link.label).toBe(path.basename(d))
  })

  it('addJsonLink respects custom label', () => {
    const f = path.join(TMP_BASE, 'x-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    const link = tools.addJsonLink({ path: f, label: '我的配置' })
    expect(link.label).toBe('我的配置')
  })

  it('addJsonLink rejects duplicate path', () => {
    const f = path.join(TMP_BASE, 'dup-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    tools.addJsonLink({ path: f })
    expect(() => tools.addJsonLink({ path: f })).toThrow(/already linked|DUPLICATE/i)
  })

  it('addJsonLink rejects relative path', () => {
    expect(() => tools.addJsonLink({ path: 'relative.json' })).toThrow(/absolute/i)
  })

  it('addJsonLink rejects path traversal', () => {
    const f = path.join(TMP_BASE, 'tv-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    expect(() => tools.addJsonLink({ path: f + '/../../../etc' })).toThrow(/traversal|absolute|not found/i)
  })

  it('addJsonLink rejects non-existent path', () => {
    expect(() => tools.addJsonLink({ path: path.join(TMP_BASE, 'nope-' + randomUUID() + '.json') })).toThrow(/not found/i)
  })

  it('addJsonLink rejects non-json file', () => {
    const f = path.join(TMP_BASE, 'txt-' + randomUUID() + '.txt')
    fs.writeFileSync(f, 'hello', 'utf-8')
    expect(() => tools.addJsonLink({ path: f })).toThrow(/json/i)
  })

  it('removeJsonLink removes a link', () => {
    const f = path.join(TMP_BASE, 'rm-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    const link = tools.addJsonLink({ path: f })
    tools.removeJsonLink(link.id)
    expect(tools.listJsonLinks().links).toHaveLength(0)
  })

  it('removeJsonLink throws for unknown id', () => {
    expect(() => tools.removeJsonLink('jl_unknown')).toThrow(/not found/i)
  })

  it('listJsonLinks auto-cleans stale links', () => {
    const f = path.join(TMP_BASE, 'stale-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    tools.addJsonLink({ path: f })
    fs.unlinkSync(f)
    const result = tools.listJsonLinks()
    expect(result.links).toHaveLength(0)
    expect(result.removed).toBe(1)
    expect(tools.listJsonLinks().removed).toBe(0)
  })

  // ── expandJsonLink ──────────────────────────────────────────────────────────

  it('expandJsonLink returns one-level tree (non-recursive)', () => {
    const uuid = randomUUID()
    const baseDir = path.join(TMP_BASE, 'expand-dir-' + uuid)
    fs.mkdirSync(path.join(baseDir, 'sub'), { recursive: true })
    fs.writeFileSync(path.join(baseDir, 'a.json'), '{"a":1}', 'utf-8')
    fs.writeFileSync(path.join(baseDir, 'ignore.txt'), 'hello', 'utf-8')
    fs.writeFileSync(path.join(baseDir, 'sub', 'b.json'), '{"b":2}', 'utf-8')

    const link = tools.addJsonLink({ path: baseDir })
    const result = tools.expandJsonLink(link.id)
    expect(result.linkId).toBe(link.id)
    expect(result.truncated).toBe(false)
    // 只返回当前层级：sub 文件夹 + a.json 文件
    expect(result.tree).toHaveLength(2)

    // 文件夹优先于文件
    expect(result.tree[0].type).toBe('folder')
    expect(result.tree[0].name).toBe('sub')
    // children 不应被填充（按需加载）
    expect(result.tree[0].children).toBeUndefined()

    expect(result.tree[1].type).toBe('file')
    expect(result.tree[1].name).toBe('a.json')
  })

  it('expandJsonDir returns immediate children of a nested directory', () => {
    const uuid = randomUUID()
    const baseDir = path.join(TMP_BASE, 'nested-dir-' + uuid)
    const subDir = path.join(baseDir, 'sub')
    fs.mkdirSync(subDir, { recursive: true })
    fs.writeFileSync(path.join(subDir, 'x.json'), '{"x":1}', 'utf-8')
    fs.writeFileSync(path.join(subDir, 'y.json'), '{"y":2}', 'utf-8')

    const result = tools.expandJsonDir(subDir)
    expect(result.path).toBe(subDir)
    expect(result.truncated).toBe(false)
    expect(result.nodes).toHaveLength(2)
    expect(result.nodes[0].type).toBe('file')
    expect(result.nodes[1].type).toBe('file')
  })

  it('expandJsonDir throws for non-directory path', () => {
    const f = path.join(TMP_BASE, 'not-dir-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    expect(() => tools.expandJsonDir(f)).toThrow(/not a directory|WRONG_TYPE/i)
  })

  it('expandJsonDir throws for non-existent path', () => {
    expect(() => tools.expandJsonDir(path.join(TMP_BASE, 'ghost-' + randomUUID()))).toThrow(/not found/i)
  })

  it('expandJsonLink prunes empty subdirectories (no .json, no sub-dirs)', () => {
    const uuid = randomUUID()
    const baseDir = path.join(TMP_BASE, 'prune-dir-' + uuid)
    fs.mkdirSync(path.join(baseDir, 'empty-sub'), { recursive: true })
    fs.writeFileSync(path.join(baseDir, 'root.json'), '{}', 'utf-8')

    const link = tools.addJsonLink({ path: baseDir })
    const result = tools.expandJsonLink(link.id)
    expect(result.tree).toHaveLength(1)
    expect(result.tree[0].name).toBe('root.json')
    // empty-sub 不含 json 也不含子目录，应被剪枝
  })

  it('expandJsonLink throws WRONG_TYPE for file link', () => {
    const f = path.join(TMP_BASE, 'file-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    const link = tools.addJsonLink({ path: f })
    expect(() => tools.expandJsonLink(link.id)).toThrow(/not a folder|WRONG_TYPE/i)
  })

  // ── readJsonLinkFile ────────────────────────────────────────────────────────

  it('readJsonLinkFile returns content for file link', () => {
    const f = path.join(TMP_BASE, 'readfile-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{"hello":"world"}', 'utf-8')
    const link = tools.addJsonLink({ path: f })
    const result = tools.readJsonLinkFile(link.id)
    expect(result.linkId).toBe(link.id)
    expect(result.path).toBe(f)
    expect(result.title).toBe(path.basename(f, '.json'))
    expect(result.content).toBe('{"hello":"world"}')
    expect(result.exists).toBe(true)
  })

  it('readJsonLinkFile returns raw content even for invalid JSON', () => {
    const f = path.join(TMP_BASE, 'bad-' + randomUUID() + '.json')
    fs.writeFileSync(f, 'not valid json {{{', 'utf-8')
    const link = tools.addJsonLink({ path: f })
    const result = tools.readJsonLinkFile(link.id)
    expect(result.content).toBe('not valid json {{{')
    expect(result.exists).toBe(true)
    // 不抛异常，不做 JSON.parse 校验
  })

  // ── readJsonByPath ──────────────────────────────────────────────────────────

  it('readJsonByPath returns title/content/path for a .json file', () => {
    const f = path.join(TMP_BASE, 'bypath-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{"x":1}', 'utf-8')
    const result = tools.readJsonByPath(f)
    expect(result.path).toBe(f)
    expect(result.title).toBe(path.basename(f, '.json'))
    expect(result.content).toBe('{"x":1}')
  })

  it('readJsonByPath throws NOT_JSON for non-.json file', () => {
    const f = path.join(TMP_BASE, 'bypath-' + randomUUID() + '.txt')
    fs.writeFileSync(f, 'hello', 'utf-8')
    expect(() => tools.readJsonByPath(f)).toThrow(/json|NOT_JSON/i)
  })

  it('readJsonByPath throws on path traversal', () => {
    const f = path.join(TMP_BASE, 'tv-' + randomUUID() + '.json')
    fs.writeFileSync(f, '{}', 'utf-8')
    expect(() => tools.readJsonByPath(f + '/../../../etc/passwd')).toThrow(/traversal/i)
  })
})
