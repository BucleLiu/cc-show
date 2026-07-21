import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, existsSync, mkdirSync, renameSync } from 'node:fs'
import { join, basename, isAbsolute, normalize, extname, dirname } from 'node:path'
import { homedir } from 'node:os'
import { randomBytes } from 'node:crypto'
import { spawnSync, execSync } from 'node:child_process'

function ccsHome(): string {
  return process.env.CCS_HOME ?? join(homedir(), '.ccs')
}

const TOOLS_DIR = join(ccsHome(), 'tools', 'json-format')

function ensureDir(): void {
  if (!existsSync(TOOLS_DIR)) {
    mkdirSync(TOOLS_DIR, { recursive: true })
  }
}

// ── Types ───────────────────────────────────────────────────────────────────────

export interface JsonFileInfo {
  name: string
  size: number
  mtime: string
}

// ── Name sanitization ───────────────────────────────────────────────────────────

function sanitizeName(name: string): string {
  // Reject path traversal and absolute paths
  if (name.includes('..') || name.startsWith('/') || name.includes('\0')) {
    throw new Error(
      `Invalid name: "${name}". Use letters, numbers, hyphens, underscores, and dots only (max 128 chars).`,
    )
  }
  const base = basename(name)
  if (!/^[\w\-.]{1,128}$/.test(base) || base === '..' || base === '.') {
    throw new Error(
      `Invalid name: "${name}". Use letters, numbers, hyphens, underscores, and dots only (max 128 chars).`,
    )
  }
  return base.endsWith('.json') ? base : base + '.json'
}

// ── CRUD ────────────────────────────────────────────────────────────────────────

export function listJsonFiles(): JsonFileInfo[] {
  if (!existsSync(TOOLS_DIR)) return []
  try {
    const entries = readdirSync(TOOLS_DIR)
    return entries
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const stat = statSync(join(TOOLS_DIR, f))
        return {
          name: f,
          size: stat.size,
          mtime: stat.mtime.toISOString(),
        }
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime))
  } catch {
    return []
  }
}

export function getJsonFileContent(
  name: string,
): { name: string; content: string; size: number; mtime: string } | null {
  const safe = sanitizeName(name)
  const filepath = join(TOOLS_DIR, safe)
  if (!existsSync(filepath)) return null
  try {
    const content = readFileSync(filepath, 'utf-8')
    const stat = statSync(filepath)
    return { name: safe, content, size: stat.size, mtime: stat.mtime.toISOString() }
  } catch {
    return null
  }
}

export function saveJsonFile(name: string, content: string): JsonFileInfo {
  // Validate JSON
  try {
    JSON.parse(content)
  } catch {
    throw new Error('Invalid JSON: content must be valid JSON')
  }
  const safe = sanitizeName(name)
  ensureDir()
  const filepath = join(TOOLS_DIR, safe)
  writeFileSync(filepath, content, 'utf-8')
  const stat = statSync(filepath)
  return { name: safe, size: stat.size, mtime: stat.mtime.toISOString() }
}

export function deleteJsonFile(name: string): void {
  const safe = sanitizeName(name)
  const filepath = join(TOOLS_DIR, safe)
  if (!existsSync(filepath)) {
    throw new Error(`File not found: ${safe}`)
  }
  unlinkSync(filepath)
}

// ── JSON link 引用 ─────────────────────────────────────────────────────────────

export type JsonLinkType = 'file' | 'folder'

export interface JsonLinksFile {
  version: number
  links: JsonLink[]
}

export interface JsonLink {
  id:        string          // 'jl_' + 短随机串
  type:      JsonLinkType
  path:      string          // 目标绝对路径
  label:     string          // 显示名（文件夹名 / 文件名去 .json）
  addedAt:   string          // ISO 时间戳
}

// ── Path ────────────────────────────────────────────────────────────────────────

function jsonLinksPath(): string {
  return join(ccsHome(), 'tools', 'json-links.json')
}

// ── Errors ──────────────────────────────────────────────────────────────────────

export class JsonLinkError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'NOT_ABSOLUTE'
      | 'PATH_TRAVERSAL'
      | 'NOT_FOUND'
      | 'NOT_JSON_NOR_DIR'
      | 'DUPLICATE'
      | 'LINK_NOT_FOUND'
      | 'WRONG_TYPE'
      | 'TARGET_MISSING'
      | 'NOT_JSON',
  ) {
    super(message)
    this.name = 'JsonLinkError'
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function genJsonLinkId(): string {
  const bytes = randomBytes(8)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(36).padStart(2, '0')
  return 'jl_' + s.slice(0, 12)
}

function validateLinkPath(
  rawPath: string,
  opts?: { jsonOnly?: boolean },
): { path: string; isDir: boolean } {
  if (!isAbsolute(rawPath)) {
    throw new JsonLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  }
  const normalised = normalize(rawPath)
  if (normalised.split('/').some(seg => seg === '..')) {
    throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  if (!existsSync(normalised)) {
    throw new JsonLinkError('Path not found', 'NOT_FOUND')
  }
  const stat = statSync(normalised)
  const isDir = stat.isDirectory()
  if (!isDir && opts?.jsonOnly && extname(normalised).toLowerCase() !== '.json') {
    throw new JsonLinkError('Only .json files or directories are supported', 'NOT_JSON_NOR_DIR')
  }
  return { path: normalised, isDir }
}

function validateJsonLinkPath(rawPath: string): { path: string; isDir: boolean } {
  return validateLinkPath(rawPath, { jsonOnly: true })
}

function deriveJsonLinkLabel(absPath: string, isDir: boolean): string {
  const base = absPath.split('/').pop() ?? absPath
  if (isDir) return base
  return base.replace(/\.json$/i, '')
}

// ── CRUD ────────────────────────────────────────────────────────────────────────

/** 参数化的 links 文件读取（复用 JsonLink 类型，独立存储路径） */
function readLinksFile(p: string): JsonLinksFile {
  const dir = join(ccsHome(), 'tools')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(p)) return { version: 1, links: [] }
  try {
    const raw = readFileSync(p, 'utf-8')
    const parsed = JSON.parse(raw) as JsonLinksFile
    if (!parsed || !Array.isArray(parsed.links)) return { version: 1, links: [] }
    return parsed
  } catch {
    // 清单损坏：备份后返回空
    try {
      const bak = p + '.bak'
      renameSync(p, bak)
    } catch { /* ignore */ }
    return { version: 1, links: [] }
  }
}

/** 参数化的 links 文件写入（原子写） */
function writeLinksFile(p: string, file: JsonLinksFile): void {
  const dir = join(ccsHome(), 'tools')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const tmp = p + '.tmp'
  writeFileSync(tmp, JSON.stringify(file, null, 2), 'utf-8')
  renameSync(tmp, p)
}

export function readJsonLinks(): JsonLinksFile {
  return readLinksFile(jsonLinksPath())
}

export function writeJsonLinks(file: JsonLinksFile): void {
  writeLinksFile(jsonLinksPath(), file)
}

export function addJsonLink(input: { path: string; label?: string }): JsonLink {
  const { path: absPath, isDir } = validateJsonLinkPath(input.path)

  const file = readJsonLinks()
  // 去重
  if (file.links.some(l => l.path === absPath)) {
    throw new JsonLinkError('Path already linked', 'DUPLICATE')
  }

  const link: JsonLink = {
    id:      genJsonLinkId(),
    type:    isDir ? 'folder' : 'file',
    path:    absPath,
    label:   input.label?.trim() || deriveJsonLinkLabel(absPath, isDir),
    addedAt: new Date().toISOString(),
  }
  file.links.push(link)
  writeJsonLinks(file)
  return link
}

export function removeJsonLink(id: string): void {
  const file = readJsonLinks()
  const before = file.links.length
  file.links = file.links.filter(l => l.id !== id)
  if (file.links.length === before) {
    throw new JsonLinkError(`Link not found: ${id}`, 'LINK_NOT_FOUND')
  }
  writeJsonLinks(file)
}

export function listJsonLinks(): { links: JsonLink[]; removed: number } {
  const file = readJsonLinks()
  const kept: JsonLink[] = []
  let removed = 0
  for (const l of file.links) {
    if (existsSync(l.path)) {
      kept.push(l)
    } else {
      removed++
    }
  }
  if (removed > 0) {
    writeJsonLinks({ ...file, links: kept })
  }
  return { links: kept, removed }
}

// ── JSON link tree / read / reveal ───────────────────────────────────────────

const LINK_MAX_FILES_PER_DIR = 2000

export interface JsonLinkTreeNode {
  name: string
  path: string
  type: 'folder' | 'file'
  children?: JsonLinkTreeNode[]
  truncated?: boolean
}

export interface JsonLinkContent {
  linkId: string
  path: string
  title: string
  content: string
  exists: boolean
}

function findJsonLink(id: string): JsonLink {
  const file = readJsonLinks()
  const link = file.links.find(l => l.id === id)
  if (!link) throw new JsonLinkError(`Link not found: ${id}`, 'LINK_NOT_FOUND')
  return link
}

/** 列出一个目录下的直接子项（json 文件和子文件夹），非递归。 */
function listJsonDir(dirPath: string): { nodes: JsonLinkTreeNode[]; truncated: boolean } {
  let entries
  try {
    entries = readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return { nodes: [], truncated: false }
  }
  const nodes: JsonLinkTreeNode[] = []
  let truncated = false
  let jsonCount = 0
  for (const ent of entries) {
    // 跳过 symlink，避免循环
    if (ent.isSymbolicLink()) continue
    if (!ent.isDirectory() && !ent.isFile()) continue
    const full = join(dirPath, ent.name)
    if (ent.isDirectory()) {
      // 只做快速检查：目录下直接有 .json 或有子目录（可能深层有 .json）才展示
      if (dirMayContainJson(full)) {
        nodes.push({ name: ent.name, path: full, type: 'folder' })
      }
    } else if (ent.name.toLowerCase().endsWith('.json')) {
      jsonCount++
      if (jsonCount > LINK_MAX_FILES_PER_DIR) { truncated = true; continue }
      nodes.push({ name: ent.name, path: full, type: 'file' })
    }
    // 非 json 文件忽略
  }
  // 文件夹优先，文件按名字排序
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return { nodes, truncated }
}

/** 快速检查目录是否可能包含 .json（自身直接包含或子目录可能包含）。 */
function dirMayContainJson(dirPath: string): boolean {
  let subEntries
  try {
    subEntries = readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return false
  }
  for (const ent of subEntries) {
    if (ent.isSymbolicLink()) continue
    if (ent.name.toLowerCase().endsWith('.json')) return true
    if (ent.isDirectory()) return true // 有子目录，可能深层有 .json
  }
  return false
}

export function expandJsonLink(id: string): { linkId: string; truncated: boolean; tree: JsonLinkTreeNode[] } {
  const link = findJsonLink(id)
  if (link.type !== 'folder') {
    throw new JsonLinkError('Link is not a folder', 'WRONG_TYPE')
  }
  if (!existsSync(link.path)) {
    throw new JsonLinkError('Target folder no longer exists', 'TARGET_MISSING')
  }
  const { nodes, truncated } = listJsonDir(link.path)
  return { linkId: id, truncated, tree: nodes }
}

/** 按需展开任意目录（非递归，仅返回直接子项）。 */
export function expandJsonDir(absPath: string): { path: string; truncated: boolean; nodes: JsonLinkTreeNode[] } {
  if (!isAbsolute(absPath)) {
    throw new JsonLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  }
  if (absPath.split('/').some(seg => seg === '..')) {
    throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  if (!existsSync(absPath)) {
    throw new JsonLinkError('Directory not found', 'NOT_FOUND')
  }
  if (!statSync(absPath).isDirectory()) {
    throw new JsonLinkError('Path is not a directory', 'WRONG_TYPE')
  }
  const { nodes, truncated } = listJsonDir(absPath)
  return { path: absPath, truncated, nodes }
}

export function readJsonLinkFile(id: string): JsonLinkContent {
  const link = findJsonLink(id)
  if (link.type !== 'file') {
    throw new JsonLinkError('Link is not a file', 'WRONG_TYPE')
  }
  if (!existsSync(link.path)) {
    throw new JsonLinkError('Target file no longer exists', 'TARGET_MISSING')
  }
  const raw = readFileSync(link.path, 'utf-8')
  const stem = link.path.split('/').pop()?.replace(/\.json$/i, '') ?? link.label
  return {
    linkId: id,
    path: link.path,
    title: stem,
    content: raw,
    exists: true,
  }
}

export function readJsonByPath(absPath: string): { title: string; content: string; path: string } {
  if (!isAbsolute(absPath)) {
    throw new JsonLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  }
  // 在 normalize 之前检查 raw path 中的 traversal（normalize 会把绝对路径的 .. 都消解掉）
  if (absPath.split('/').some(seg => seg === '..')) {
    throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  const normalised = normalize(absPath)
  if (normalised.split('/').some(seg => seg === '..')) {
    throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  if (extname(normalised).toLowerCase() !== '.json') {
    throw new JsonLinkError('Only .json files are supported', 'NOT_JSON')
  }
  if (!existsSync(normalised)) {
    throw new JsonLinkError('File not found', 'NOT_FOUND')
  }
  const raw = readFileSync(normalised, 'utf-8')
  const stem = normalised.split('/').pop()?.replace(/\.json$/i, '') ?? 'Untitled'
  return { title: stem, content: raw, path: normalised }
}

export function revealJsonLink(id: string): void {
  const link = findJsonLink(id)
  if (!existsSync(link.path)) {
    throw new JsonLinkError('Target no longer exists', 'TARGET_MISSING')
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

/** 调用系统原生文件/文件夹选择器，返回绝对路径（仅 macOS 支持） */
export function pickNativePath(type: 'folder' | 'file'): string {
  if (process.platform !== 'darwin') {
    throw new Error('原生文件选择器仅支持 macOS')
  }
  if (type === 'folder') {
    return execSync("osascript -e 'POSIX path of (choose folder)'", { encoding: 'utf8' }).trim()
  }
  // 通用文件选择（不限制类型，笔记 .md 和 JSON .json 都能用）
  return execSync("osascript -e 'POSIX path of (choose file)'", { encoding: 'utf8' }).trim()
}

// ── File link (通用文件预览引用) ──────────────────────────────────────────────

function fileLinksPath(): string {
  return join(ccsHome(), 'tools', 'file-links.json')
}

function deriveLinkLabel(absPath: string, isDir: boolean): string {
  const base = absPath.split('/').pop() ?? absPath
  if (isDir) return base
  return base // 保留完整文件名（含扩展名）
}

/** 列出目录下所有文件和子目录（不过滤扩展名，跳过隐藏文件和 symlink） */
function listDirAll(dirPath: string): { nodes: JsonLinkTreeNode[]; truncated: boolean } {
  let entries
  try {
    entries = readdirSync(dirPath, { withFileTypes: true })
  } catch {
    return { nodes: [], truncated: false }
  }
  const nodes: JsonLinkTreeNode[] = []
  let truncated = false
  let fileCount = 0
  for (const ent of entries) {
    if (ent.isSymbolicLink()) continue
    if (!ent.isDirectory() && !ent.isFile()) continue
    if (ent.name.startsWith('.')) continue
    const full = join(dirPath, ent.name)
    if (ent.isDirectory()) {
      nodes.push({ name: ent.name, path: full, type: 'folder' })
    } else {
      fileCount++
      if (fileCount > LINK_MAX_FILES_PER_DIR) { truncated = true; continue }
      nodes.push({ name: ent.name, path: full, type: 'file' })
    }
  }
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return { nodes, truncated }
}

function findFileLink(id: string): JsonLink {
  const file = readLinksFile(fileLinksPath())
  const link = file.links.find(l => l.id === id)
  if (!link) throw new JsonLinkError(`Link not found: ${id}`, 'LINK_NOT_FOUND')
  return link
}

// ── File link 引用 CRUD ──────────────────────────────────────────────────────

export function listFileLinks(): { links: JsonLink[]; removed: number } {
  const file = readLinksFile(fileLinksPath())
  const kept: JsonLink[] = []
  let removed = 0
  for (const l of file.links) {
    if (existsSync(l.path)) {
      kept.push(l)
    } else {
      removed++
    }
  }
  if (removed > 0) {
    writeLinksFile(fileLinksPath(), { ...file, links: kept })
  }
  return { links: kept, removed }
}

export function addFileLink(input: { path: string; label?: string }): JsonLink {
  const { path: absPath, isDir } = validateLinkPath(input.path)

  const file = readLinksFile(fileLinksPath())
  // 去重
  if (file.links.some(l => l.path === absPath)) {
    throw new JsonLinkError('Path already linked', 'DUPLICATE')
  }

  const link: JsonLink = {
    id:      genJsonLinkId(),
    type:    isDir ? 'folder' : 'file',
    path:    absPath,
    label:   input.label?.trim() || deriveLinkLabel(absPath, isDir),
    addedAt: new Date().toISOString(),
  }
  file.links.push(link)
  writeLinksFile(fileLinksPath(), file)
  return link
}

export function removeFileLink(id: string): void {
  const file = readLinksFile(fileLinksPath())
  const before = file.links.length
  file.links = file.links.filter(l => l.id !== id)
  if (file.links.length === before) {
    throw new JsonLinkError(`Link not found: ${id}`, 'LINK_NOT_FOUND')
  }
  writeLinksFile(fileLinksPath(), file)
}

// ── File link tree / read / reveal ─────────────────────────────────────────────

export function expandFileLink(id: string): { linkId: string; truncated: boolean; tree: JsonLinkTreeNode[] } {
  const link = findFileLink(id)
  if (link.type !== 'folder') {
    throw new JsonLinkError('Link is not a folder', 'WRONG_TYPE')
  }
  if (!existsSync(link.path)) {
    throw new JsonLinkError('Target folder no longer exists', 'TARGET_MISSING')
  }
  const { nodes, truncated } = listDirAll(link.path)
  return { linkId: id, truncated, tree: nodes }
}

export function expandFileDir(absPath: string): { path: string; truncated: boolean; nodes: JsonLinkTreeNode[] } {
  if (!isAbsolute(absPath)) {
    throw new JsonLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  }
  if (absPath.split('/').some(seg => seg === '..')) {
    throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  if (!existsSync(absPath)) {
    throw new JsonLinkError('Directory not found', 'NOT_FOUND')
  }
  if (!statSync(absPath).isDirectory()) {
    throw new JsonLinkError('Path is not a directory', 'WRONG_TYPE')
  }
  const { nodes, truncated } = listDirAll(absPath)
  return { path: absPath, truncated, nodes }
}

const MAX_FILE_READ_BYTES = 1_048_576 // 1 MB

export function readFileLinkContent(id: string): {
  linkId: string; path: string; title: string; content: string; ext: string
  exists: boolean; binary?: boolean
} {
  const link = findFileLink(id)
  if (link.type !== 'file') {
    throw new JsonLinkError('Link is not a file', 'WRONG_TYPE')
  }
  if (!existsSync(link.path)) {
    throw new JsonLinkError('Target file no longer exists', 'TARGET_MISSING')
  }
  const ext = extname(link.path).toLowerCase()
  const stem = link.path.split('/').pop() ?? link.label
  // Check for binary files by extension
  const binaryExts = ['.png','.jpg','.jpeg','.gif','.svg','.webp','.bmp','.ico','.mp4','.webm','.pdf','.zip','.gz','.tar']
  if (binaryExts.includes(ext)) {
    return { linkId: id, path: link.path, title: stem, content: '', ext, exists: true, binary: true }
  }
  try {
    const stat = statSync(link.path)
    let raw: string
    if (stat.size > MAX_FILE_READ_BYTES) {
      const { openSync, readSync, closeSync } = require('fs') as typeof import('fs')
      const buf = Buffer.alloc(MAX_FILE_READ_BYTES)
      const fd = openSync(link.path, 'r')
      readSync(fd, buf, 0, MAX_FILE_READ_BYTES, 0)
      closeSync(fd)
      raw = buf.toString('utf-8')
    } else {
      raw = readFileSync(link.path, 'utf-8')
    }
    return { linkId: id, path: link.path, title: stem, content: raw, ext, exists: true }
  } catch {
    return { linkId: id, path: link.path, title: stem, content: '', ext, exists: true, binary: true }
  }
}

export function readFileByPath(absPath: string): {
  title: string; content: string; path: string; ext: string; binary?: boolean
} {
  if (!isAbsolute(absPath)) {
    throw new JsonLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  }
  if (absPath.split('/').some(seg => seg === '..')) {
    throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  const normalised = normalize(absPath)
  if (normalised.split('/').some(seg => seg === '..')) {
    throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  }
  if (!existsSync(normalised)) {
    throw new JsonLinkError('File not found', 'NOT_FOUND')
  }
  const ext = extname(normalised).toLowerCase()
  const stem = normalised.split('/').pop() ?? 'Untitled'
  const binaryExts = ['.png','.jpg','.jpeg','.gif','.svg','.webp','.bmp','.ico','.mp4','.webm','.pdf','.zip','.gz','.tar']
  if (binaryExts.includes(ext)) {
    return { title: stem, content: '', path: normalised, ext, binary: true }
  }
  try {
    const stat = statSync(normalised)
    let raw: string
    if (stat.size > MAX_FILE_READ_BYTES) {
      const buf = Buffer.alloc(MAX_FILE_READ_BYTES)
      const fd = require('fs').openSync(normalised, 'r')
      require('fs').readSync(fd, buf, 0, MAX_FILE_READ_BYTES, 0)
      require('fs').closeSync(fd)
      raw = buf.toString('utf-8')
    } else {
      raw = readFileSync(normalised, 'utf-8')
    }
    return { title: stem, content: raw, path: normalised, ext }
  } catch {
    return { title: stem, content: '', path: normalised, ext, binary: true }
  }
}

export function revealFileLink(id: string): void {
  const link = findFileLink(id)
  if (!existsSync(link.path)) {
    throw new JsonLinkError('Target no longer exists', 'TARGET_MISSING')
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
