import { describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import type { NoteLinksFile } from '../notes.js'

// 测试用临时清单目录，避免污染真实 ~/.ccs/note-links.json
const TMP_BASE = join(homedir(), '.ccs-test-' + randomUUID())
const TMP_CCS_DIR = join(TMP_BASE, '.ccs')

// 简写：writeFileSync
const wf = writeFileSync

// 通过环境变量让被测模块使用临时路径（见 Step 3 的实现）
// 必须在 import notes 之前设置，因此用动态 import + beforeAll
let notes: typeof import('../notes.js')

describe('note-links manifest read/write', () => {
  beforeAll(async () => {
    process.env.CCS_HOME = TMP_BASE
    notes = await import('../notes.js')
  })
  beforeEach(() => {
    mkdirSync(TMP_CCS_DIR, { recursive: true })
  })
  afterEach(() => {
    rmSync(TMP_BASE, { recursive: true, force: true })
  })

  it('readLinks returns empty structure when manifest absent', () => {
    const file = notes.readLinks()
    expect(file).toEqual({ version: 1, links: [] })
  })

  it('writeLinks then readLinks round-trips', () => {
    const data: NoteLinksFile = {
      version: 1,
      links: [
        { id: 'lk_abc', type: 'folder', path: '/tmp/x', label: 'x', addedAt: '2026-06-22T00:00:00.000Z' },
      ],
    }
    notes.writeLinks(data)
    expect(notes.readLinks()).toEqual(data)
  })
})

describe('note-links add/remove/list', () => {
  const tmpDocs = join(TMP_BASE, 'docs')
  const mdFile = join(tmpDocs, 'a.md')
  const subDir = join(tmpDocs, 'sub')

  beforeEach(() => {
    mkdirSync(TMP_CCS_DIR, { recursive: true })
    mkdirSync(tmpDocs, { recursive: true })
    mkdirSync(subDir, { recursive: true })
    writeFileSync(mdFile, '# A\n\ncontent', 'utf-8')
  })
  afterEach(() => {
    rmSync(TMP_BASE, { recursive: true, force: true })
  })

  it('addLink rejects non-absolute path', () => {
    expect(() => notes.addLink({ path: 'relative/x.md' })).toThrow(/absolute/)
  })

  it('addLink rejects path traversal', () => {
    // 相对路径以 .. 开头，normalize 后仍含 ..（无法解析为绝对路径内合法段）
    expect(() => notes.addLink({ path: '/etc/../etc/../etc/passwd.md' })).toThrow()
  })

  it('addLink rejects non-existent path', () => {
    expect(() => notes.addLink({ path: '/tmp/does-not-exist-xyz.md' })).toThrow(/not found/i)
  })

  it('addLink accepts a .md file and derives label', () => {
    const link = notes.addLink({ path: mdFile })
    expect(link.type).toBe('file')
    expect(link.label).toBe('a')
    expect(link.id).toMatch(/^lk_/)
    expect(notes.readLinks().links).toHaveLength(1)
  })

  it('addLink accepts a folder', () => {
    const link = notes.addLink({ path: tmpDocs })
    expect(link.type).toBe('folder')
    expect(link.label).toBe('docs')
  })

  it('addLink rejects non-md file', () => {
    const txt = join(tmpDocs, 'b.txt')
    writeFileSync(txt, 'x', 'utf-8')
    expect(() => notes.addLink({ path: txt })).toThrow(/\.md/i)
  })

  it('addLink dedupes same path (409)', () => {
    notes.addLink({ path: mdFile })
    expect(() => notes.addLink({ path: mdFile })).toThrow(/already/)
  })

  it('removeLink deletes by id', () => {
    const link = notes.addLink({ path: mdFile })
    notes.removeLink(link.id)
    expect(notes.readLinks().links).toHaveLength(0)
  })

  it('removeLink throws on non-existent id', () => {
    expect(() => notes.removeLink('lk_nonexistent')).toThrow(/not found/i)
  })

  it('listLinks auto-removes stale links', () => {
    const link = notes.addLink({ path: mdFile })
    // 删除原文件
    rmSync(mdFile, { force: true })
    const result = notes.listLinks()
    expect(result.links).toHaveLength(0)
    expect(result.removed).toBe(1)
    // 清单也已清理
    expect(notes.readLinks().links).toHaveLength(0)
  })
})

describe('note-links expand/read/reveal', () => {
  const tmpDocs = join(TMP_BASE, 'docs')
  const mdA = join(tmpDocs, 'a.md')
  const subDir = join(tmpDocs, 'sub')
  const mdB = join(subDir, 'b.md')
  const linkMd = join(tmpDocs, 'link.md')

  beforeEach(() => {
    mkdirSync(TMP_CCS_DIR, { recursive: true })
    mkdirSync(subDir, { recursive: true })
    wf(mdA, '# A\n\ncontent', 'utf-8')
    wf(mdB, '# B', 'utf-8')
    wf(linkMd, '---\ntitle: My Title\n---\n\n# Body', 'utf-8')
  })
  afterEach(() => {
    rmSync(TMP_BASE, { recursive: true, force: true })
  })

  it('expandLink returns recursive md tree', () => {
    const link = notes.addLink({ path: tmpDocs })
    const result = notes.expandLink(link.id)
    expect(result.linkId).toBe(link.id)
    expect(result.truncated).toBe(false)
    // 顶层应有 a.md, link.md, sub/
    const names = result.tree.map(n => n.name).sort()
    expect(names).toEqual(['a.md', 'link.md', 'sub'])
    const subNode = result.tree.find(n => n.name === 'sub')
    expect(subNode?.type).toBe('folder')
    expect(subNode?.children?.map(c => c.name)).toEqual(['b.md'])
  })

  it('expandLink ignores non-md files', () => {
    wf(join(tmpDocs, 'ignore.txt'), 'x', 'utf-8')
    const link = notes.addLink({ path: tmpDocs })
    const result = notes.expandLink(link.id)
    expect(result.tree.find(n => n.name === 'ignore.txt')).toBeUndefined()
  })

  it('expandLink prunes folders without any md file', () => {
    // empty/：空文件夹
    mkdirSync(join(tmpDocs, 'empty'), { recursive: true })
    // assets/：只含非 md 文件
    mkdirSync(join(tmpDocs, 'assets'), { recursive: true })
    wf(join(tmpDocs, 'assets', 'logo.png'), 'x', 'utf-8')
    // deep/：多层嵌套但最深层无 md
    mkdirSync(join(tmpDocs, 'deep', 'inner'), { recursive: true })
    wf(join(tmpDocs, 'deep', 'inner', 'data.csv'), 'x', 'utf-8')
    // withmd/：含 md，应保留
    mkdirSync(join(tmpDocs, 'withmd'), { recursive: true })
    wf(join(tmpDocs, 'withmd', 'note.md'), '# N', 'utf-8')

    const link = notes.addLink({ path: tmpDocs })
    const result = notes.expandLink(link.id)
    const names = result.tree.map(n => n.name)
    // 含 md 的文件夹保留
    expect(names).toContain('withmd')
    // 不含任何 md 的文件夹（含嵌套）被剪枝
    expect(names).not.toContain('empty')
    expect(names).not.toContain('assets')
    expect(names).not.toContain('deep')
    // 原有 md 文件仍保留
    expect(names).toContain('a.md')
  })

  it('expandLink rejects file-type link', () => {
    const link = notes.addLink({ path: mdA })
    expect(() => notes.expandLink(link.id)).toThrow()
  })

  it('expandLink returns 404 when folder gone', () => {
    const link = notes.addLink({ path: tmpDocs })
    rmSync(tmpDocs, { recursive: true, force: true })
    expect(() => notes.expandLink(link.id)).toThrow()
  })

  it('readLinkFile returns content with frontmatter title', () => {
    const link = notes.addLink({ path: linkMd })
    const c = notes.readLinkFile(link.id)
    expect(c.title).toBe('My Title')
    expect(c.content).toContain('# Body')
    expect(c.exists).toBe(true)
  })

  it('readLinkFile falls back to filename when no frontmatter', () => {
    const link = notes.addLink({ path: mdA })
    const c = notes.readLinkFile(link.id)
    expect(c.title).toBe('a')
  })

  it('readLinkFile rejects folder-type link', () => {
    const link = notes.addLink({ path: tmpDocs })
    expect(() => notes.readLinkFile(link.id)).toThrow()
  })
})
