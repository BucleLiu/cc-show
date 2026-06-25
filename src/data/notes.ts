import {
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  existsSync,
  mkdirSync,
  statSync,
  renameSync,
} from 'node:fs'
import { join, extname, isAbsolute, normalize, dirname } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID, randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'

// ── Paths ─────────────────────────────────────────────────────────────────────

export const NOTES_DIR = join(homedir(), '.ccs', 'note')

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NoteData {
  id:        string
  title:     string
  tags:      string[]
  content:   string
  createdAt: string
  updatedAt: string
  path:      string
}

export interface NoteListItem {
  id:        string
  title:     string
  tags:      string[]
  updatedAt: string
  preview:   string
}

export interface CreateNoteInput {
  title:    string
  content:  string
  tags?:    string[]
}

export interface UpdateNoteInput {
  title?:   string
  content?: string
  tags?:    string[]
}

// ── Errors ────────────────────────────────────────────────────────────────────

export class NoteNotFoundError extends Error {
  constructor(id: string) {
    super(`Note not found: ${id}`)
    this.name = 'NoteNotFoundError'
  }
}

// ── 2.1  Directory init ───────────────────────────────────────────────────────

export function ensureNotesDir(): void {
  if (!existsSync(NOTES_DIR)) {
    mkdirSync(NOTES_DIR, { recursive: true })
  }
}

// ── 2.2  Frontmatter parser ───────────────────────────────────────────────────

interface ParsedNote {
  title:     string
  tags:      string[]
  createdAt: string
  updatedAt: string
  content:   string
}

export function parseFrontmatter(raw: string, fallbackId?: string): ParsedNote {
  const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

  const match = FM_RE.exec(raw)
  if (!match) {
    // No frontmatter — treat entire file as content
    return {
      title:     fallbackId ?? 'Untitled',
      tags:      [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content:   raw,
    }
  }

  const fm = match[1]
  const content = match[2] ?? ''

  function fmGet(key: string): string {
    const re = new RegExp(`^${key}:\\s*(.*)$`, 'm')
    return (re.exec(fm)?.[1] ?? '').trim()
  }

  const title     = fmGet('title')     || fallbackId || 'Untitled'
  const tagsRaw   = fmGet('tags')
  const createdAt = fmGet('createdAt') || new Date().toISOString()
  const updatedAt = fmGet('updatedAt') || new Date().toISOString()
  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  return { title, tags, createdAt, updatedAt, content }
}

// ── 2.3  Frontmatter serializer ───────────────────────────────────────────────

export function serializeNote(note: NoteData): string {
  const tagsStr = note.tags.join(', ')
  return [
    '---',
    `title: ${note.title}`,
    `tags: ${tagsStr}`,
    '---',
    '',
    note.content,
  ].join('\n')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function notePath(id: string): string {
  return join(NOTES_DIR, `${id}.md`)
}

function idFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '')
}

// ── 2.4  List notes ───────────────────────────────────────────────────────────

export function listNotes(): NoteListItem[] {
  ensureNotesDir()

  const files = readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'))

  const items: NoteListItem[] = files.map(filename => {
    const id   = idFromFilename(filename)
    const path = join(NOTES_DIR, filename)
    const raw  = readFileSync(path, 'utf-8')
    const stat = statSync(path)
    const parsed = parseFrontmatter(raw, id)
    const preview = parsed.content.slice(0, 100).replace(/\n/g, ' ')
    return {
      id,
      title:     parsed.title,
      tags:      parsed.tags,
      updatedAt: stat.mtime.toISOString(),
      preview,
    }
  })

  // Sort by updatedAt descending
  items.sort((a, b) => {
    const ta = new Date(a.updatedAt).getTime()
    const tb = new Date(b.updatedAt).getTime()
    return tb - ta
  })

  return items
}

// ── 2.5  Get single note ──────────────────────────────────────────────────────

export function getNote(id: string): NoteData {
  ensureNotesDir()
  const p = notePath(id)
  if (!existsSync(p)) throw new NoteNotFoundError(id)
  const raw    = readFileSync(p, 'utf-8')
  const stat   = statSync(p)
  const parsed = parseFrontmatter(raw, id)
  return {
    id,
    title:     parsed.title,
    tags:      parsed.tags,
    content:   parsed.content,
    createdAt: stat.birthtime?.toISOString() ?? stat.mtime.toISOString(),
    updatedAt: stat.mtime.toISOString(),
    path:      p,
  }
}

// ── 2.6  Create note ──────────────────────────────────────────────────────────

export function createNote(input: CreateNoteInput): NoteData {
  ensureNotesDir()
  const id  = randomUUID()
  const now = new Date().toISOString()
  const note: NoteData = {
    id,
    title:     input.title,
    tags:      input.tags ?? [],
    content:   input.content,
    createdAt: now,
    updatedAt: now,
    path:      notePath(id),
  }
  writeFileSync(notePath(id), serializeNote(note), 'utf-8')
  return note
}

// ── 2.7  Update note ──────────────────────────────────────────────────────────

export function updateNote(id: string, input: UpdateNoteInput): NoteData {
  const existing = getNote(id)   // throws NoteNotFoundError if missing
  const updated: NoteData = {
    ...existing,
    ...(input.title   !== undefined && { title:   input.title }),
    ...(input.content !== undefined && { content: input.content }),
    ...(input.tags    !== undefined && { tags:    input.tags }),
    updatedAt: new Date().toISOString(),
  }
  writeFileSync(notePath(id), serializeNote(updated), 'utf-8')
  // Return with actual file mtime (set by writeFileSync)
  const stat = statSync(notePath(id))
  return { ...updated, updatedAt: stat.mtime.toISOString() }
}

// ── 2.8  Delete note ──────────────────────────────────────────────────────────

export function deleteNote(id: string): void {
  ensureNotesDir()
  const p = notePath(id)
  if (!existsSync(p)) throw new NoteNotFoundError(id)
  unlinkSync(p)
}

// ── 2.9  Import from local path ───────────────────────────────────────────────

export class NoteImportError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_ABSOLUTE' | 'NOT_MD' | 'PATH_TRAVERSAL' | 'NOT_FOUND',
  ) {
    super(message)
    this.name = 'NoteImportError'
  }
}

export function importNoteFromPath(filePath: string): NoteData {
  // 1. Must be absolute
  if (!isAbsolute(filePath)) {
    throw new NoteImportError(
      'filePath must be an absolute path',
      'NOT_ABSOLUTE',
    )
  }

  // 2. Must be .md
  if (extname(filePath).toLowerCase() !== '.md') {
    throw new NoteImportError(
      'Only .md files are supported',
      'NOT_MD',
    )
  }

  // 3. No path traversal
  const normalised = normalize(filePath)
  if (normalised.split('/').some(seg => seg === '..')) {
    throw new NoteImportError(
      'Invalid file path',
      'PATH_TRAVERSAL',
    )
  }

  // 4. File must exist
  if (!existsSync(normalised)) {
    throw new NoteImportError(
      'File not found',
      'NOT_FOUND',
    )
  }

  const raw    = readFileSync(normalised, 'utf-8')
  const stat   = statSync(normalised)

  // Derive title: frontmatter > filename stem
  const FM_RE  = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
  const hasFm  = FM_RE.test(raw)
  const stem   = normalised.split('/').pop()?.replace(/\.md$/i, '') ?? 'Imported'

  const parsed = parseFrontmatter(raw, stem)
  // If no frontmatter, use file mtime for timestamps
  if (!hasFm) {
    parsed.createdAt = stat.mtime.toISOString()
    parsed.updatedAt = stat.mtime.toISOString()
  }

  return createNote({
    title:   parsed.title,
    content: parsed.content,
    tags:    parsed.tags,
  })
}

// ── 3.  Note links (引用) ─────────────────────────────────────────────────────

export type NoteLinkType = 'file' | 'folder'

export interface NoteLinksFile {
  version: number
  links: NoteLink[]
}

export interface NoteLink {
  id:        string          // 'lk_' + 短随机串
  type:      NoteLinkType
  path:      string          // 目标绝对路径
  label:     string          // 显示名（文件夹名 / 文件名去 .md）
  addedAt:   string          // ISO 时间戳
}

export interface NoteLinkTreeNode {
  name:       string
  path:       string
  type:       'folder' | 'file'
  children?:  NoteLinkTreeNode[]
  truncated?: boolean
}

export interface NoteLinkContent {
  linkId:  string
  path:    string
  title:   string
  content: string
  exists:  boolean
}

// 清单文件路径。优先用 CCS_HOME 环境变量（测试用），否则 ~/.ccs/note-links.json
function ccsHome(): string {
  return process.env.CCS_HOME ?? join(homedir(), '.ccs')
}
export const NOTE_LINKS_PATH = join(ccsHome(), 'note-links.json')

export function readLinks(): NoteLinksFile {
  const dir = ccsHome()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(NOTE_LINKS_PATH)) return { version: 1, links: [] }
  try {
    const raw = readFileSync(NOTE_LINKS_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as NoteLinksFile
    if (!parsed || !Array.isArray(parsed.links)) return { version: 1, links: [] }
    return parsed
  } catch {
    // 清单损坏：备份后返回空
    try {
      const bak = NOTE_LINKS_PATH + '.bak'
      renameSync(NOTE_LINKS_PATH, bak)
    } catch { /* ignore */ }
    return { version: 1, links: [] }
  }
}

export function writeLinks(file: NoteLinksFile): void {
  const dir = ccsHome()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const tmp = NOTE_LINKS_PATH + '.tmp'
  writeFileSync(tmp, JSON.stringify(file, null, 2), 'utf-8')
  renameSync(tmp, NOTE_LINKS_PATH)   // 原子写
}

// ── 3b.  Note link errors ────────────────────────────────────────────────────

export class NoteLinkError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NOT_ABSOLUTE'
      | 'PATH_TRAVERSAL'
      | 'NOT_FOUND'
      | 'NOT_MD_NOR_DIR'
      | 'NOT_MD'
      | 'DUPLICATE'
      | 'LINK_NOT_FOUND'
      | 'WRONG_TYPE'
      | 'TARGET_MISSING',
  ) {
    super(message)
    this.name = 'NoteLinkError'
  }
}

// 生成 'lk_' + 12 位 base36 随机串
function genLinkId(): string {
  const bytes = randomBytes(8)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(36).padStart(2, '0')
  return 'lk_' + s.slice(0, 12)
}

function validateLinkPath(rawPath: string): { path: string; isDir: boolean } {
  if (!isAbsolute(rawPath)) {
    throw new NoteLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  }
  const normalised = normalize(rawPath)
  if (normalised.split('/').some(seg => seg === '..')) {
    throw new NoteLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  if (!existsSync(normalised)) {
    throw new NoteLinkError('Path not found', 'NOT_FOUND')
  }
  const stat = statSync(normalised)
  const isDir = stat.isDirectory()
  if (!isDir && extname(normalised).toLowerCase() !== '.md') {
    throw new NoteLinkError('Only .md files or directories are supported', 'NOT_MD_NOR_DIR')
  }
  return { path: normalised, isDir }
}

function deriveLabel(absPath: string, isDir: boolean): string {
  const base = absPath.split('/').pop() ?? absPath
  if (isDir) return base
  return base.replace(/\.md$/i, '')
}

export function addLink(input: { path: string; label?: string }): NoteLink {
  const { path: absPath, isDir } = validateLinkPath(input.path)

  const file = readLinks()
  // 去重
  if (file.links.some(l => l.path === absPath)) {
    throw new NoteLinkError('Path already linked', 'DUPLICATE')
  }

  const link: NoteLink = {
    id:      genLinkId(),
    type:    isDir ? 'folder' : 'file',
    path:    absPath,
    label:   input.label?.trim() || deriveLabel(absPath, isDir),
    addedAt: new Date().toISOString(),
  }
  file.links.push(link)
  writeLinks(file)
  return link
}

export function removeLink(id: string): void {
  const file = readLinks()
  const before = file.links.length
  file.links = file.links.filter(l => l.id !== id)
  if (file.links.length === before) {
    throw new NoteLinkError(`Link not found: ${id}`, 'LINK_NOT_FOUND')
  }
  writeLinks(file)
}

export function listLinks(): { links: NoteLink[]; removed: number } {
  const file = readLinks()
  const kept: NoteLink[] = []
  let removed = 0
  for (const l of file.links) {
    if (existsSync(l.path)) {
      kept.push(l)
    } else {
      removed++
    }
  }
  if (removed > 0) {
    writeLinks({ ...file, links: kept })
  }
  return { links: kept, removed }
}

// ── 3c.  Expand folder / read file / reveal ──────────────────────────────────

const LINK_MAX_DEPTH = 10
const LINK_MAX_FILES_PER_DIR = 2000

function findLink(id: string): NoteLink {
  const file = readLinks()
  const link = file.links.find(l => l.id === id)
  if (!link) throw new NoteLinkError(`Link not found: ${id}`, 'LINK_NOT_FOUND')
  return link
}

function buildTree(dirPath: string, depth: number): { nodes: NoteLinkTreeNode[]; truncated: boolean } {
  if (depth > LINK_MAX_DEPTH) return { nodes: [], truncated: true }
  let entries
  try {
    entries = readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return { nodes: [], truncated: false }
  }
  const nodes: NoteLinkTreeNode[] = []
  let truncated = false
  let count = 0
  for (const ent of entries) {
    // 跳过指向目录的 symlink，避免无限递归
    if (ent.isSymbolicLink()) continue
    if (!ent.isDirectory() && !ent.isFile()) continue
    const full = join(dirPath, ent.name)
    if (ent.isDirectory()) {
      const sub = buildTree(full, depth + 1)
      if (sub.truncated) truncated = true
      // 剪枝：子文件夹不含任何 md 文件（自身或后代）则不展示
      if (sub.nodes.length > 0) {
        nodes.push({ name: ent.name, path: full, type: 'folder', children: sub.nodes })
      }
    } else if (ent.name.toLowerCase().endsWith('.md')) {
      count++
      if (count > LINK_MAX_FILES_PER_DIR) { truncated = true; continue }
      nodes.push({ name: ent.name, path: full, type: 'file' })
    }
    // 非 md 文件忽略
  }
  // 文件夹优先，文件按名字排序
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return { nodes, truncated }
}

export function expandLink(id: string): { linkId: string; truncated: boolean; tree: NoteLinkTreeNode[] } {
  const link = findLink(id)
  if (link.type !== 'folder') {
    throw new NoteLinkError('Link is not a folder', 'WRONG_TYPE')
  }
  if (!existsSync(link.path)) {
    throw new NoteLinkError('Target folder no longer exists', 'TARGET_MISSING')
  }
  const { nodes, truncated } = buildTree(link.path, 0)
  return { linkId: id, truncated, tree: nodes }
}

export function readLinkFile(id: string): NoteLinkContent {
  const link = findLink(id)
  if (link.type !== 'file') {
    throw new NoteLinkError('Link is not a file', 'WRONG_TYPE')
  }
  if (!existsSync(link.path)) {
    throw new NoteLinkError('Target file no longer exists', 'TARGET_MISSING')
  }
  const raw = readFileSync(link.path, 'utf-8')
  const stem = link.path.split('/').pop()?.replace(/\.md$/i, '') ?? 'Untitled'
  const parsed = parseFrontmatter(raw, stem)
  return {
    linkId:  id,
    path:    link.path,
    title:   parsed.title,
    content: parsed.content,
    exists:  true,
  }
}

export function revealLink(id: string): void {
  const link = findLink(id)
  if (!existsSync(link.path)) {
    throw new NoteLinkError('Target no longer exists', 'TARGET_MISSING')
  }
  const platform = process.platform
  if (platform === 'darwin') {
    spawnSync('open', ['-R', link.path], { stdio: 'ignore' })
  } else if (platform === 'linux') {
    // xdg-open 无法定位单个文件，打开所在目录
    spawnSync('xdg-open', [dirname(link.path)], { stdio: 'ignore' })
  } else if (platform === 'win32') {
    spawnSync('explorer', ['/select,', link.path], { stdio: 'ignore' })
  }
  // 其他平台静默忽略
}

// 按绝对路径直接读 md 内容（不查清单，不持久化），用于树内文件预览
export function readMdByPath(absPath: string): { title: string; content: string; path: string } {
  if (!isAbsolute(absPath)) {
    throw new NoteLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  }
  const normalised = normalize(absPath)
  if (normalised.split('/').some(seg => seg === '..')) {
    throw new NoteLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  if (extname(normalised).toLowerCase() !== '.md') {
    throw new NoteLinkError('Only .md files are supported', 'NOT_MD')
  }
  if (!existsSync(normalised)) {
    throw new NoteLinkError('File not found', 'NOT_FOUND')
  }
  const raw = readFileSync(normalised, 'utf-8')
  const stem = normalised.split('/').pop()?.replace(/\.md$/i, '') ?? 'Untitled'
  const parsed = parseFrontmatter(raw, stem)
  return { title: parsed.title, content: parsed.content, path: normalised }
}
