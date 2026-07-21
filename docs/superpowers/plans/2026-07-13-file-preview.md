# 文件预览工具 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在工具模块新增"文件预览"工具，支持添加文件夹/文件引用，左侧目录树浏览，右侧按文件类型分发预览（Markdown/marked.js、JSON/CodeMirror、图片/img、其他文本/CodeMirror plain）。

**Architecture:** 数据层新增 `fileLinksPath()` + 泛化的 link CRUD 和目录树函数（与现有 JSON link 共享类型，独立存储）；路由层新增 8 个 `/api/tools/file-links/*` 路由平行于现有 `json-links` 路由；前端新增工具注册、工作区渲染、目录树交互、按扩展名预览分发。

**Tech Stack:** TypeScript, Node.js http, CodeMirror 6 (existing JSON-only bundle), marked.js (existing), 零新依赖

## Global Constraints

- 零新依赖 — 不安装任何新 npm 包
- 只读预览 — 不支持编辑
- 不影响现有 JSON 格式化和笔记模块功能
- 所有代码在现有文件中修改，不新建源文件
- 遵循项目现有命名规范和代码风格

---

### Task 1: 数据层 — 泛化 link 函数 + 新增 file-link 函数

**Files:**
- Modify: `src/data/tools.ts` — 重构现有函数 + 末尾追加 ~120 行

**Interfaces:**
- Consumes: 现有 `JsonLink`, `JsonLinksFile`, `JsonLinkTreeNode`, `JsonLinkError`, `genJsonLinkId()`, `ccsHome()`
- Produces:
  - `readLinksFile(p: string): JsonLinksFile` — 参数化的 links 文件读取
  - `writeLinksFile(p: string, file: JsonLinksFile): void` — 参数化的 links 文件写入
  - `fileLinksPath(): string` — 返回 `~/.ccs/tools/file-links.json` 路径
  - `validateLinkPath(rawPath: string, opts?: { jsonOnly?: boolean }): { path: string; isDir: boolean }` — 泛化路径校验
  - `deriveLinkLabel(absPath: string, isDir: boolean): string` — 泛化标签生成
  - `listDirAll(dirPath: string): { nodes: JsonLinkTreeNode[]; truncated: boolean }` — 列出所有文件+子目录
  - `findFileLink(id: string): JsonLink` — 查找 file-link（内部）
  - `listFileLinks(): { links: JsonLink[]; removed: number }` — 列出 file-links
  - `addFileLink(input): JsonLink` — 添加 file-link
  - `removeFileLink(id: string): void` — 移除 file-link
  - `expandFileLink(id): { linkId; truncated; tree }` — 展开顶层目录
  - `expandFileDir(absPath): { path; truncated; nodes }` — 展开任意目录
  - `readFileLinkContent(id): { linkId; path; title; content; ext; exists; binary? }` — 读文件内容
  - `readFileByPath(absPath): { title; content; path; ext; binary? }` — 按路径读文件
  - `revealFileLink(id: string): void` — Finder 中显示

- [ ] **Step 1: 修改现有 `readJsonLinks` / `writeJsonLinks`（第186-213行）为委托到参数化函数**

在 `fileLinksPath()` 之前插入通用读写函数：

```ts
/** 参数化的 links 文件读取 */
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
    try { const bak = p + '.bak'; renameSync(p, bak) } catch { /* ignore */ }
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
```

然后修改现有 `readJsonLinks`（第186行）和 `writeJsonLinks`（第206行）：

```ts
export function readJsonLinks(): JsonLinksFile {
  return readLinksFile(jsonLinksPath())
}

export function writeJsonLinks(file: JsonLinksFile): void {
  writeLinksFile(jsonLinksPath(), file)
}
```

- [ ] **Step 2: 修改现有 `validateJsonLinkPath`（第159行）为委托到泛化函数**

先新增泛化版本：

```ts
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
```

然后修改现有 `validateJsonLinkPath`：

```ts
function validateJsonLinkPath(rawPath: string): { path: string; isDir: boolean } {
  return validateLinkPath(rawPath, { jsonOnly: true })
}
```

- [ ] **Step 3: 新增 `fileLinksPath()` 和 `deriveLinkLabel()`**

```ts
// ── File link (通用文件预览引用) ──────────────────────────────────────────────

function fileLinksPath(): string {
  return join(ccsHome(), 'tools', 'file-links.json')
}

function deriveLinkLabel(absPath: string, isDir: boolean): string {
  const base = absPath.split('/').pop() ?? absPath
  if (isDir) return base
  return base // 保留完整文件名（含扩展名）
}
```

- [ ] **Step 4: 新增 `listDirAll()`**

```ts
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
```

- [ ] **Step 5: 新增 file-link CRUD：`listFileLinks`, `addFileLink`, `removeFileLink`, `findFileLink`**

```ts
export function listFileLinks(): { links: JsonLink[]; removed: number } {
  const file = readLinksFile(fileLinksPath())
  const kept: JsonLink[] = []
  let removed = 0
  for (const l of file.links) {
    if (existsSync(l.path)) { kept.push(l) } else { removed++ }
  }
  if (removed > 0) {
    writeLinksFile(fileLinksPath(), { ...file, links: kept })
  }
  return { links: kept, removed }
}

export function addFileLink(input: { path: string; label?: string }): JsonLink {
  const { path: absPath, isDir } = validateLinkPath(input.path)
  const file = readLinksFile(fileLinksPath())
  if (file.links.some(l => l.path === absPath)) {
    throw new JsonLinkError('Path already linked', 'DUPLICATE')
  }
  const link: JsonLink = {
    id: genJsonLinkId(),
    type: isDir ? 'folder' : 'file',
    path: absPath,
    label: input.label?.trim() || deriveLinkLabel(absPath, isDir),
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

function findFileLink(id: string): JsonLink {
  const file = readLinksFile(fileLinksPath())
  const link = file.links.find(l => l.id === id)
  if (!link) throw new JsonLinkError(`Link not found: ${id}`, 'LINK_NOT_FOUND')
  return link
}
```

- [ ] **Step 6: 新增 tree/content/reveal/expand-dir/read-by-path 函数**

```ts
export function expandFileLink(id: string): { linkId: string; truncated: boolean; tree: JsonLinkTreeNode[] } {
  const link = findFileLink(id)
  if (link.type !== 'folder') throw new JsonLinkError('Link is not a folder', 'WRONG_TYPE')
  if (!existsSync(link.path)) throw new JsonLinkError('Target folder no longer exists', 'TARGET_MISSING')
  const { nodes, truncated } = listDirAll(link.path)
  return { linkId: id, truncated, tree: nodes }
}

export function expandFileDir(absPath: string): { path: string; truncated: boolean; nodes: JsonLinkTreeNode[] } {
  if (!isAbsolute(absPath)) throw new JsonLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  if (absPath.split('/').some(seg => seg === '..')) throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  if (!existsSync(absPath)) throw new JsonLinkError('Directory not found', 'NOT_FOUND')
  if (!statSync(absPath).isDirectory()) throw new JsonLinkError('Path is not a directory', 'WRONG_TYPE')
  const { nodes, truncated } = listDirAll(absPath)
  return { path: absPath, truncated, nodes }
}

const MAX_FILE_READ_BYTES = 1_048_576 // 1 MB

export function readFileLinkContent(id: string): {
  linkId: string; path: string; title: string; content: string; ext: string
  exists: boolean; binary?: boolean
} {
  const link = findFileLink(id)
  if (link.type !== 'file') throw new JsonLinkError('Link is not a file', 'WRONG_TYPE')
  if (!existsSync(link.path)) throw new JsonLinkError('Target file no longer exists', 'TARGET_MISSING')
  const ext = extname(link.path).toLowerCase()
  const stem = link.path.split('/').pop() ?? link.label
  const binaryExts = ['.png','.jpg','.jpeg','.gif','.svg','.webp','.bmp','.ico','.mp4','.webm','.pdf','.zip','.gz','.tar']
  if (binaryExts.includes(ext)) {
    return { linkId: id, path: link.path, title: stem, content: '', ext, exists: true, binary: true }
  }
  try {
    const stat = statSync(link.path)
    let raw: string
    if (stat.size > MAX_FILE_READ_BYTES) {
      const buf = Buffer.alloc(MAX_FILE_READ_BYTES)
      const fd = require('fs').openSync(link.path, 'r')
      require('fs').readSync(fd, buf, 0, MAX_FILE_READ_BYTES, 0)
      require('fs').closeSync(fd)
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
  if (!isAbsolute(absPath)) throw new JsonLinkError('path must be an absolute path', 'NOT_ABSOLUTE')
  if (absPath.split('/').some(seg => seg === '..')) throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  const normalised = normalize(absPath)
  if (normalised.split('/').some(seg => seg === '..')) throw new JsonLinkError('Invalid path (traversal)', 'PATH_TRAVERSAL')
  if (!existsSync(normalised)) throw new JsonLinkError('File not found', 'NOT_FOUND')
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
  if (!existsSync(link.path)) throw new JsonLinkError('Target no longer exists', 'TARGET_MISSING')
  const platform = process.platform
  if (platform === 'darwin') {
    spawnSync('open', ['-R', link.path], { stdio: 'ignore' })
  } else if (platform === 'linux') {
    spawnSync('xdg-open', [dirname(link.path)], { stdio: 'ignore' })
  } else if (platform === 'win32') {
    spawnSync('explorer', ['/select,', link.path], { stdio: 'ignore' })
  }
}
```

- [ ] **Step 7: 类型检查**

```bash
npx tsc --noEmit src/data/tools.ts 2>&1 | head -20
```

Expected: 无新增错误。

- [ ] **Step 8: Commit**

```bash
git add src/data/tools.ts
git commit -m "feat: generalize link functions and add file-link data layer"
```

---

### Task 2: API 路由 — GET 路由组

**Files:**
- Modify: `src/server/routes.ts` — import 行 + GET 块内追加

- [ ] **Step 1: 更新 import，添加 file-link 函数名**

在 import from `'../data/tools.js'` 块（第53-68行）中，末尾追加：

```ts
  listFileLinks,
  addFileLink,
  removeFileLink,
  expandFileLink,
  readFileLinkContent,
  readFileByPath,
  expandFileDir,
  revealFileLink,
```

- [ ] **Step 2: 在 GET `/api/tools/` 块内追加 4 个 file-links 路由**

在 `revealJsonLink` 路由 handler 之后（约第581行）、`if (path.startsWith('/api/tools/'))` 闭合 `}` 之前插入：

```ts
      // GET /api/tools/file-links — list all file links
      if (path === '/api/tools/file-links') {
        try {
          return sendJson(res, listFileLinks())
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/tools/file-links/:id/tree
      const fileLinksTreeMatch = path.match(/^\/api\/tools\/file-links\/([^/]+)\/tree$/)
      if (fileLinksTreeMatch) {
        const id = fileLinksTreeMatch[1]
        try {
          return sendJson(res, expandFileLink(id))
        } catch (err) {
          if (err instanceof JsonLinkError) {
            const code = err.code
            const status = code === 'LINK_NOT_FOUND' || code === 'TARGET_MISSING' ? 404 : 400
            res.writeHead(status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
            return
          }
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/tools/file-links/:id/content
      const fileLinksContentMatch = path.match(/^\/api\/tools\/file-links\/([^/]+)\/content$/)
      if (fileLinksContentMatch) {
        const id = fileLinksContentMatch[1]
        try {
          return sendJson(res, readFileLinkContent(id))
        } catch (err) {
          if (err instanceof JsonLinkError) {
            const code = err.code
            const status = code === 'LINK_NOT_FOUND' || code === 'TARGET_MISSING' ? 404 : 400
            res.writeHead(status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
            return
          }
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/tools/file-links/:id/reveal
      const fileLinksRevealMatch = path.match(/^\/api\/tools\/file-links\/([^/]+)\/reveal$/)
      if (fileLinksRevealMatch) {
        const id = fileLinksRevealMatch[1]
        try {
          revealFileLink(id)
          res.writeHead(204)
          res.end()
          return
        } catch (err) {
          if (err instanceof JsonLinkError) {
            const code = err.code
            const status = code === 'LINK_NOT_FOUND' || code === 'TARGET_MISSING' ? 404 : 400
            res.writeHead(status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
            return
          }
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }
```

**关键约束：** 必须在 `jsonLinksRevealMatch` 之后、`}` 之前。确保 `/api/tools/file-links/` 不与已有 json-links 路由冲突。

- [ ] **Step 3: 类型检查**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 无新增错误。

- [ ] **Step 4: Commit**

```bash
git add src/server/routes.ts
git commit -m "feat: add GET /api/tools/file-links routes"
```

---

### Task 3: API 路由 — POST + DELETE 路由组

**Files:**
- Modify: `src/server/routes.ts` — DELETE 块和 POST 块内追加

- [ ] **Step 1: 在 DELETE `/api/tools/` 块内添加 delete 路由**

在 `jsonLinksDelMatch` 路由 handler 之后、`}` 闭合前插入：

```ts
      // DELETE /api/tools/file-links/:id
      const fileLinksDelMatch = path.match(/^\/api\/tools\/file-links\/([^/]+)$/)
      if (fileLinksDelMatch) {
        const id = fileLinksDelMatch[1]
        try {
          removeFileLink(id)
          res.writeHead(204)
          res.end()
          return
        } catch (err) {
          if (err instanceof JsonLinkError) {
            const status = err.code === 'LINK_NOT_FOUND' ? 404 : 400
            res.writeHead(status, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
            return
          }
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }
```

- [ ] **Step 2: 在 POST `/api/tools/` 块内添加 3 个路由**

在 `expandJsonDir` 路由之后、`}` 闭合前插入：

```ts
      // POST /api/tools/file-links — add file link
      if (path === '/api/tools/file-links') {
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const input = JSON.parse(body) as { path?: string; label?: string }
            if (!input.path) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'path is required' }))
              return
            }
            const link = addFileLink({ path: input.path, label: input.label })
            const bodyBuf = Buffer.from(JSON.stringify(link), 'utf-8')
            res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': bodyBuf.length })
            res.end(bodyBuf)
          } catch (err) {
            if (err instanceof JsonLinkError) {
              const code = err.code
              const status = code === 'NOT_FOUND' ? 404 : code === 'DUPLICATE' ? 409 : 400
              res.writeHead(status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message, code }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }

      // POST /api/tools/file-links/read — read file by absolute path
      if (path === '/api/tools/file-links/read') {
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const input = JSON.parse(body) as { path?: string }
            if (!input.path) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'path is required' }))
              return
            }
            const result = readFileByPath(input.path)
            return sendJson(res, result)
          } catch (err) {
            if (err instanceof JsonLinkError) {
              const code = err.code
              const status = code === 'NOT_FOUND' ? 404 : 400
              res.writeHead(status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message, code }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }

      // POST /api/tools/file-links/expand-dir — expand arbitrary directory (lazy)
      if (path === '/api/tools/file-links/expand-dir') {
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const input = JSON.parse(body) as { path?: string }
            if (!input.path) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'path is required' }))
              return
            }
            const result = expandFileDir(input.path)
            return sendJson(res, result)
          } catch (err) {
            if (err instanceof JsonLinkError) {
              const code = err.code
              const status = code === 'NOT_FOUND' ? 404 : 400
              res.writeHead(status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message, code }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }
```

- [ ] **Step 3: 类型检查**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 无新增错误。

- [ ] **Step 4: Commit**

```bash
git add src/server/routes.ts
git commit -m "feat: add POST/DELETE /api/tools/file-links routes"
```

---

### Task 4: 前端 CSS + 工具注册

**Files:**
- Modify: `src/frontend/tools-module.ts` — `TOOLS_CSS` 末尾 + `TOOLS_JS` 开头

- [ ] **Step 1: 在 `TOOLS_CSS` 末尾追加文件预览样式**

在 `tools-link-tree-node .tools-link-row` 样式之后、闭合 `` ` `` 之前追加：

```css
/* ── File Preview ── */
.fp-preview-bar {
  display:flex; align-items:center; gap:8px; padding:8px 12px;
  background:var(--bg-surface); border-bottom:1px solid var(--border-sub);
  flex-shrink:0; flex-wrap:wrap;
}
.fp-preview-path {
  flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-size:12px; color:var(--text-muted); min-width:150px; font-family:monospace;
}
.fp-preview-content { flex:1; overflow:auto; }
.fp-md-preview { padding:16px 24px; max-width:900px; }
.fp-img-wrap { display:flex; align-items:flex-start; justify-content:center; padding:16px; }
.fp-img-wrap img { max-width:100%; height:auto; border-radius:4px; }
.fp-unsupported {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  flex:1; gap:12px; color:var(--text-muted);
}
.fp-unsupported-icon { font-size:48px; opacity:0.3; }
.fp-unsupported-text { font-size:14px; }
.fp-unsupported-name { font-size:12px; font-family:monospace; color:var(--text-sec); }
.fp-loading {
  display:flex; align-items:center; justify-content:center; flex:1;
  color:var(--text-muted); font-size:13px;
}
```

- [ ] **Step 2: 新增 `ICON_EYE` 图标 + 工具注册**

在 `TOOLS_JS` 内 `ICON_OPEN` 之后追加：

```js
  var ICON_EYE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
```

在 `TOOLS` 数组的 `json-format` 条目后追加：

```js
  TOOLS.push({
    id: 'file-preview',
    icon: ICON_EYE,
    name: '文件预览',
    desc: '浏览本地文件，Markdown、JSON、代码、图片',
  });
```

- [ ] **Step 3: 追加 `fp-` 前缀状态变量**

在 `S.tools` 状态块末尾追加：

```js
  // ── File Preview state ──
  var _fpLinks = null;
  var _fpActivePath = null;
  var _fpExpandedDirs = {};
  var _fpDirCache = {};
  var _fpActiveFile = null;
```

- [ ] **Step 4: 在 `toolsSelectTool` 中添加 file-preview 分支**

在 `else if (toolId === 'json-format')` 块后追加：

```js
    } else if (toolId === 'file-preview') {
      fpRenderSplitLayout(innerEl);
      fpLoadLinks();
    }
```

- [ ] **Step 5: Commit**

```bash
git add src/frontend/tools-module.ts
git commit -m "feat: add file preview CSS, icon, tool registration, and state"
```

---

### Task 5: 前端 JS — 工作区布局 + 引用列表 + 目录树交互

**Files:**
- Modify: `src/frontend/tools-module.ts` — `TOOLS_JS` 内追加

- [ ] **Step 1: 实现 `fpRenderSplitLayout()` — 左右分栏布局**

在 `renderJsonFormatWorkarea` 之后追加：

```js
  // ═══════════════════════════════════════════════════════════════════════
  // File Preview
  // ═══════════════════════════════════════════════════════════════════════

  function fpRenderSplitLayout(container) {
    container.innerHTML = ''
      + '<div style="display:flex;flex:1;overflow:hidden">'
      + '<div style="width:240px;background:var(--bg-surface);border-right:1px solid var(--border-sub);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden">'
      + '<div style="display:flex;align-items:center;gap:6px;padding:8px 10px 6px;border-bottom:1px solid var(--border-sub);flex-shrink:0">'
      + '<span style="font-size:12px;font-weight:700;color:var(--text-pri);flex:1">文件列表</span>'
      + '<button class="tools-btn primary" onclick="fpShowLinkDialog()" style="padding:0 8px;font-size:11px">+ 添加</button>'
      + '</div>'
      + '<div style="flex:1;overflow-y:auto;padding:4px" id="fp-link-list"></div>'
      + '</div>'
      + '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden">'
      + '<div class="fp-preview-bar" id="fp-preview-bar" style="display:none">'
      + '<span class="fp-preview-path" id="fp-preview-path"></span>'
      + '<span class="tools-linked-actions">'
      + '<button class="tools-btn" onclick="fpCopyContent()">复制全部</button>'
      + '<button class="tools-btn" id="fp-btn-reveal" onclick="fpRevealFile()">在 Finder 中显示</button>'
      + '</span></div>'
      + '<div class="fp-preview-content" id="fp-preview-content" style="flex:1;overflow:auto">'
      + '<div class="fp-loading">请从左侧选择一个文件预览</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }
```

- [ ] **Step 2: 实现引用列表加载和渲染**

```js
  // ── File Preview Link List ──

  async function fpLoadLinks() {
    var listEl = document.getElementById('fp-link-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载中...</div></div>';
    try {
      var res = await fetch('/api/tools/file-links');
      if (!res.ok) throw new Error('Failed');
      var data = await res.json();
      _fpLinks = data.links || [];
      if (data.removed > 0) toolsShowToast(data.removed + ' 个失效引用已自动清理');
      fpRenderLinkList();
    } catch (e) {
      listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载引用列表失败</div></div>';
    }
  }

  function fpRenderLinkList() {
    var listEl = document.getElementById('fp-link-list');
    if (!listEl) return;
    var links = _fpLinks;
    if (!links || links.length === 0) {
      listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>暂无引用<br><span style="font-size:11px;color:var(--text-muted)">点击"+ 添加"选择文件夹或文件</span></div></div>';
      return;
    }
    listEl.innerHTML = links.map(function(link) {
      var isFolder = link.type === 'folder';
      var icon = isFolder ? '\u{1F4C1}' : '\u{1F4C4}';
      var arrowHtml = '';
      var treeHtml = '';
      if (isFolder) {
        var expanded = _fpExpandedDirs[link.path];
        arrowHtml = '<span class="tools-link-arrow" onclick="event.stopPropagation();fpToggleLinkFolder(\'' + escAttr(link.id) + '\')">' + (expanded ? '▾' : '▸') + '</span>';
        if (expanded) treeHtml = '<div class="tools-link-tree" id="fp-link-tree-' + link.id + '"></div>';
      }
      var activeClass = (_fpActivePath === link.path) ? ' active' : '';
      var rowClick = isFolder
        ? 'fpToggleLinkFolder(\'' + escAttr(link.id) + '\')'
        : 'fpOpenLinkedFile(\'' + escAttr(link.id) + '\')';
      return '<div class="tools-link-tree-node">'
        + '<div class="tools-link-row' + activeClass + '" onclick="' + rowClick + '">'
        + arrowHtml
        + '<span class="tools-link-icon">' + icon + '</span>'
        + '<span class="tools-link-label">' + escHtml(link.label) + '</span>'
        + '<button class="tools-saved-item-del" title="移除引用" onclick="event.stopPropagation();fpRemoveLink(\'' + escAttr(link.id) + '\')">&times;</button>'
        + '</div>'
        + treeHtml
        + '</div>';
    }).join('');
    links.forEach(function(link) {
      if (link.type === 'folder' && _fpExpandedDirs[link.path]) fpRenderLinkTreeContainer(link.id);
    });
  }
```

- [ ] **Step 3: 实现目录树展开/折叠**

```js
  // ── Folder toggle ──

  window.fpToggleLinkFolder = async function(id) {
    var link = (_fpLinks || []).find(function(l) { return l.id === id; });
    if (!link) return;
    var dirPath = link.path;
    if (_fpExpandedDirs[dirPath]) { delete _fpExpandedDirs[dirPath]; fpRenderLinkList(); return; }
    _fpExpandedDirs[dirPath] = true;
    _fpActivePath = dirPath;
    if (!_fpDirCache[dirPath]) {
      try {
        var res = await fetch('/api/tools/file-links/' + encodeURIComponent(id) + '/tree');
        if (!res.ok) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkList(); return; }
        var data = await res.json();
        _fpDirCache[dirPath] = { nodes: data.tree || [], truncated: data.truncated };
        if (data.truncated) toolsShowToast('目录较大，部分内容已截断');
      } catch (e) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkList(); return; }
    }
    fpRenderLinkList();
  };

  window.fpToggleTreeFolder = async function(linkId, dirPath) {
    if (_fpExpandedDirs[dirPath]) { delete _fpExpandedDirs[dirPath]; fpRenderLinkTreeContainer(linkId); return; }
    _fpExpandedDirs[dirPath] = true;
    _fpActivePath = dirPath;
    if (!_fpDirCache[dirPath]) {
      try {
        var res = await fetch('/api/tools/file-links/expand-dir', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: dirPath }),
        });
        if (!res.ok) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkTreeContainer(linkId); return; }
        var data = await res.json();
        _fpDirCache[dirPath] = { nodes: data.nodes || [], truncated: data.truncated };
        if (data.truncated) toolsShowToast('目录较大，部分内容已截断');
      } catch (e) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkTreeContainer(linkId); return; }
    }
    fpRenderLinkTreeContainer(linkId);
  };

  function fpRenderLinkTreeContainer(linkId) {
    var el = document.getElementById('fp-link-tree-' + linkId);
    if (!el) return;
    var link = (_fpLinks || []).find(function(l) { return l.id === linkId; });
    if (!link) return;
    var cached = _fpDirCache[link.path];
    var nodes = cached ? cached.nodes : [];
    el.innerHTML = fpRenderTreeNodes(nodes, linkId);
  }

  function fpRenderTreeNodes(nodes, linkId) {
    if (!nodes || nodes.length === 0) return '<div style="padding:4px 8px;color:var(--text-muted,#888);font-size:12px;">（空目录）</div>';
    return nodes.map(function(node) {
      var isFolder = node.type === 'folder';
      var icon = isFolder ? '\u{1F4C1}' : '\u{1F4C4}';
      if (isFolder) {
        var expanded = _fpExpandedDirs[node.path];
        var arrow = expanded ? '▾' : '▸';
        var childrenHtml = '';
        if (expanded) { var cached = _fpDirCache[node.path]; var children = cached ? cached.nodes : []; childrenHtml = '<div class="tools-link-tree">' + fpRenderTreeNodes(children, linkId) + '</div>'; }
        return '<div class="tools-link-tree-node">'
          + '<div class="tools-link-row' + (_fpActivePath === node.path ? ' active' : '') + '" onclick="event.stopPropagation();fpToggleTreeFolder(\'' + escAttr(linkId) + '\',\'' + escAttr(node.path) + '\')">'
          + '<span class="tools-link-arrow">' + arrow + '</span>'
          + '<span class="tools-link-icon">' + icon + '</span>'
          + '<span class="tools-link-label">' + escHtml(node.name) + '</span>'
          + '</div>' + childrenHtml + '</div>';
      } else {
        return '<div class="tools-link-tree-node">'
          + '<div class="tools-link-row' + (_fpActivePath === node.path ? ' active' : '') + '" onclick="event.stopPropagation();fpOpenLinkedFileByPath(\'' + escAttr(node.path) + '\')">'
          + '<span class="tools-link-arrow" style="visibility:hidden">▸</span>'
          + '<span class="tools-link-icon">' + icon + '</span>'
          + '<span class="tools-link-label">' + escHtml(node.name) + '</span>'
          + '</div></div>';
      }
    }).join('');
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/frontend/tools-module.ts
git commit -m "feat: add file preview split layout, link list, and tree interaction"
```

---

### Task 6: 前端 JS — 添加弹框 + 文件打开 + 预览分发 + 工具栏操作

**Files:**
- Modify: `src/frontend/tools-module.ts` — `TOOLS_JS` 内继续追加

- [ ] **Step 1: 实现添加引用弹框 + 路径选择**

```js
  // ── Add link dialog ──

  window.fpShowLinkDialog = function() {
    var overlay = document.createElement('div');
    overlay.className = 'tools-save-overlay';
    overlay.id = 'fp-link-overlay';
    overlay.innerHTML = '<div class="tools-save-dialog" style="width:420px">'
      + '<h3>添加文件夹或文件</h3>'
      + '<div class="tools-import-section">'
      + '<div class="tools-import-section-title">选择文件夹或文件</div>'
      + '<div class="tools-import-drop">'
      + '<div class="tools-import-drop-icon">&#128193;</div>'
      + '<div class="tools-import-drop-text">选择文件夹或任意文件</div>'
      + '<div style="display:flex;gap:8px;justify-content:center">'
      + '<button class="tools-file-btn" onclick="event.stopPropagation();fpPickFolder()">&#128193; 文件夹</button>'
      + '<button class="tools-file-btn" onclick="event.stopPropagation();fpPickFile()">&#128196; 文件</button>'
      + '</div></div></div>'
      + '<div class="tools-import-divider"><span>或</span></div>'
      + '<div class="tools-import-section">'
      + '<div class="tools-import-section-title">手动输入路径</div>'
      + '<input type="text" class="tools-save-input" id="fp-link-path" placeholder="绝对路径，如 /path/to/folder" autofocus style="margin-bottom:10px">'
      + '<input type="text" class="tools-save-input" id="fp-link-label" placeholder="显示名（可选，默认取文件名）">'
      + '</div>'
      + '<div class="tools-save-actions" style="margin-top:14px">'
      + '<button class="tools-save-cancel" onclick="fpDismissLinkDialog()">取消</button>'
      + '<button class="tools-save-confirm" onclick="fpConfirmLink()">确认</button>'
      + '</div></div>';
    overlay.addEventListener('click', function(e) { if (e.target === overlay) fpDismissLinkDialog(); });
    document.body.appendChild(overlay);
  };

  window.fpConfirmLink = async function() {
    var pathInput = document.getElementById('fp-link-path');
    var labelInput = document.getElementById('fp-link-label');
    if (!pathInput) return;
    var path = pathInput.value.trim();
    if (!path) { pathInput.focus(); toolsShowToast('请输入目标路径'); return; }
    var label = labelInput ? labelInput.value.trim() : '';
    try {
      var body = { path: path }; if (label) body.label = label;
      var res = await fetch('/api/tools/file-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { var err = await res.json(); toolsShowToast('添加失败: ' + (err.error || 'Unknown')); return; }
      fpDismissLinkDialog();
      toolsShowToast('已添加引用');
      fpLoadLinks();
    } catch (e) { toolsShowToast('添加失败: ' + e.message); }
  };

  window.fpPickFolder = function() {
    pickNativePath('folder', function(p) {
      document.getElementById('fp-link-path').value = p;
      document.getElementById('fp-link-label').value = p.replace(/\/$/, '').split('/').pop();
    });
  };
  window.fpPickFile = function() {
    pickNativePath('file', function(p) {
      document.getElementById('fp-link-path').value = p;
      document.getElementById('fp-link-label').value = p.split('/').pop();
    });
  };
  window.fpDismissLinkDialog = function() { var o = document.getElementById('fp-link-overlay'); if (o) o.remove(); };
  window.fpRemoveLink = async function(id) {
    if (!confirm('确定移除此引用？')) return;
    try {
      var res = await fetch('/api/tools/file-links/' + encodeURIComponent(id), { method: 'DELETE' });
      if (!res.ok) { var err = await res.json(); toolsShowToast('移除失败: ' + (err.error || 'Unknown')); return; }
      toolsShowToast('已移除引用'); fpLoadLinks();
    } catch (e) { toolsShowToast('移除失败: ' + e.message); }
  };
```

- [ ] **Step 2: 实现文件打开 + 预览分发**

```js
  // ── Open linked file ──

  window.fpOpenLinkedFile = async function(id) {
    try {
      var res = await fetch('/api/tools/file-links/' + encodeURIComponent(id) + '/content');
      if (!res.ok) { toolsShowToast('加载失败'); return; }
      var data = await res.json();
      _fpActivePath = data.path;
      _fpActiveFile = { path: data.path, linkId: id };
      fpRenderPreview(data.ext, data.content, data.path, fpDirname(data.path));
      fpShowLinkedReadonlyBar(data.path, id);
      fpRenderLinkList();
    } catch (e) { toolsShowToast('加载失败: ' + e.message); }
  };

  window.fpOpenLinkedFileByPath = async function(absPath) {
    try {
      var res = await fetch('/api/tools/file-links/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: absPath }) });
      if (!res.ok) { toolsShowToast('加载失败'); return; }
      var data = await res.json();
      _fpActivePath = absPath;
      _fpActiveFile = { path: absPath, linkId: null };
      fpRenderPreview(data.ext, data.content, data.path, fpDirname(data.path));
      fpShowLinkedReadonlyBar(absPath, null);
      fpRenderLinkList();
    } catch (e) { toolsShowToast('加载失败: ' + e.message); }
  };

  // ── Preview dispatch ──

  var _fpPreviewContent = '';

  function fpRenderPreview(ext, content, path, baseDir) {
    var area = document.getElementById('fp-preview-content');
    if (!area) return;
    _fpPreviewContent = content || '';

    // Markdown
    if (ext === '.md' || ext === '.markdown') {
      area.className = 'fp-preview-content';
      try {
        area.innerHTML = '<div class="fp-md-preview">' + (window.marked ? marked.parse(content || '') : escHtml(content || '')) + '</div>';
      } catch(e) { area.innerHTML = '<div class="fp-md-preview">' + escHtml(content || '') + '</div>'; }
      if (baseDir) { var pane = area.querySelector('.fp-md-preview'); if (pane) fpRewriteLocalImages(pane, baseDir); }
      return;
    }

    // Images
    var imgExts = ['.png','.jpg','.jpeg','.gif','.svg','.webp','.bmp','.ico'];
    if (imgExts.includes(ext)) {
      area.className = 'fp-preview-content';
      var imgSrc = '/api/notes/file?base=' + encodeURIComponent(baseDir || fpDirname(path)) + '&rel=' + encodeURIComponent(path.split('/').pop());
      area.innerHTML = '<div class="fp-img-wrap"><img src="' + imgSrc + '" alt="' + escHtml(path) + '" onerror="this.parentElement.innerHTML=\'<div class=fp-unsupported><div class=fp-unsupported-icon>🖼</div><div class=fp-unsupported-text>图片加载失败</div></div>\'"></div>';
      return;
    }

    // Unsupported binary
    if (content === '' && ext) {
      area.className = 'fp-preview-content';
      area.innerHTML = '<div class="fp-unsupported"><div class="fp-unsupported-icon">📄</div><div class="fp-unsupported-text">不支持预览此文件类型</div><div class="fp-unsupported-name">' + escHtml(path) + '</div><button class="tools-btn" onclick="fpRevealFile()" style="margin-top:8px">📁 在 Finder 中显示</button></div>';
      return;
    }

    // JSON — CodeMirror readonly with JSON syntax
    if (ext === '.json' || ext === '.jsonc') {
      area.className = 'fp-preview-content';
      area.innerHTML = '<div class="tools-cm-wrap" id="fp-cm-wrap" style="flex:1;height:100%"></div>';
      fpInitCodeMirror(true);
      fpCmSetDoc(content || '');
      return;
    }

    // All other text — CodeMirror readonly plain text
    area.className = 'fp-preview-content';
    area.innerHTML = '<div class="tools-cm-wrap" id="fp-cm-wrap" style="flex:1;height:100%"></div>';
    fpInitCodeMirror(false);
    fpCmSetDoc(content || '');
  }

  function fpRewriteLocalImages(pane, baseDir) {
    if (!baseDir || baseDir[0] !== '/') return;
    var imgs = Array.from(pane.querySelectorAll('img'));
    imgs.forEach(function(img) {
      var src = img.getAttribute('src');
      if (!src) return;
      if (/^(https?:|data:|file:|[/]{2}|\\/api\\/)/i.test(src)) return;
      var decoded = src; try { decoded = decodeURIComponent(src); } catch(_) {}
      img.src = '/api/notes/file?base=' + encodeURIComponent(baseDir) + '&rel=' + encodeURIComponent(decoded);
    });
  }

  function fpDirname(p) { var i = p.lastIndexOf('/'); return i >= 0 ? p.slice(0, i) : p; }
```

- [ ] **Step 3: 实现 CodeMirror（文件预览专用）**

```js
  // ── File Preview CodeMirror ──

  var _fpCmView = null;
  var _fpCmThemeComp = null;

  function fpInitCodeMirror(jsonMode) {
    var S = cmGetSetup();
    if (!S.EditorView) return;
    var container = document.getElementById('fp-cm-wrap');
    if (!container) return;
    if (_fpCmView) {
      if (_fpCmView.dom.parentNode !== container) { _fpCmView.destroy(); _fpCmView = null; _fpCmThemeComp = null; }
      else { _fpCmView.requestMeasure(); return; }
    }
    _fpCmThemeComp = S.Compartment ? new S.Compartment : { of: function() { return []; } };
    var exts = [
      S.lineNumbers ? S.lineNumbers() : null,
      S.foldGutter ? S.foldGutter() : null,
      S.highlightActiveLine ? S.highlightActiveLine() : null,
      S.syntaxHighlighting ? S.syntaxHighlighting(S.defaultHighlightStyle) : null,
      S.search ? S.search({ top: true }) : null,
      S.keymap ? S.keymap.of([(S.defaultKeymap || []), (S.historyKeymap || []), (S.foldKeymap || []), (S.searchKeymap || [])].flat()) : null,
      _fpCmThemeComp.of(fpCmThemeExtension()),
      S.EditorView.editable.of(false),
    ];
    if (jsonMode && S.json) exts.push(S.json());
    _fpCmView = new S.EditorView({ doc: '', extensions: exts.filter(Boolean), parent: container });
  }

  function fpCmThemeExtension() {
    var S = cmGetSetup();
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark && S.oneDark) return S.oneDark;
    return [];
  }

  function fpCmSetDoc(text) {
    if (!_fpCmView) return;
    _fpCmView.dispatch({ changes: { from: 0, to: _fpCmView.state.doc.length, insert: text } });
  }

  function fpCmGetDoc() { return _fpCmView ? _fpCmView.state.doc.toString() : _fpPreviewContent; }
```

- [ ] **Step 4: 实现只读工具栏 + 复制/显示**

```js
  // ── Readonly bar ──

  function fpShowLinkedReadonlyBar(path, linkId) {
    _fpActiveFile = { path: path, linkId: linkId };
    var bar = document.getElementById('fp-preview-bar');
    var pathEl = document.getElementById('fp-preview-path');
    var revealBtn = document.getElementById('fp-btn-reveal');
    if (bar) bar.style.display = '';
    if (pathEl) pathEl.textContent = path;
    if (revealBtn) revealBtn.style.display = linkId ? '' : 'none';
  }

  window.fpCopyContent = async function() {
    var val = fpCmGetDoc();
    if (!val) { toolsShowToast('无可复制内容'); return; }
    try { await navigator.clipboard.writeText(val); toolsShowToast('已复制全部内容'); }
    catch (e) { toolsShowToast('复制失败'); }
  };

  window.fpRevealFile = async function() {
    if (!_fpActiveFile || !_fpActiveFile.linkId) { toolsShowToast('无法定位文件'); return; }
    try {
      var res = await fetch('/api/tools/file-links/' + encodeURIComponent(_fpActiveFile.linkId) + '/reveal');
      if (!res.ok) { toolsShowToast('打开失败'); return; }
    } catch (e) { toolsShowToast('打开失败'); }
  };
```

- [ ] **Step 5: Commit**

```bash
git add src/frontend/tools-module.ts
git commit -m "feat: add file preview dialog, open, dispatch, and toolbar actions"
```

---

### Task 7: 构建、类型检查、测试

- [ ] **Step 1: 构建**

```bash
rm -f dist/cli.js && npm run build
```

Expected: tsup 构建成功。

- [ ] **Step 2: 类型检查**

```bash
npm run typecheck
```

Expected: 无新增错误。

- [ ] **Step 3: 运行测试**

```bash
npm run test
```

Expected: 全部 104 个测试通过。

- [ ] **Step 4: Commit**

```bash
git add dist/cli.js
git commit -m "chore: build with file preview feature"
```

---

## 验证 Checklist

1. `ccs start` 启动，浏览器打开
2. 点击"工具" → 应看到"文件预览"在工具列表中
3. 选中"文件预览"，左侧出现"文件列表"面板
4. 点击"+ 添加"，选文件夹 → 目录列出文件和子目录
5. 点击 .md 文件 → 右侧 Markdown 渲染预览
6. 点击 .json 文件 → CodeMirror + JSON 语法高亮
7. 点击图片文件（.png） → 右侧图片预览
8. 点击代码文件 → CodeMirror plain text + 行号
9. 点击"复制全部" → 内容复制到剪贴板
10. 点击"在 Finder 中显示" → Finder 定位文件
11. 切换回 JSON 格式化 → 原有功能不受影响
12. 切换回笔记 → 原有功能不受影响
