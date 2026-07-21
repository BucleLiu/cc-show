# 文件预览工具 — 设计文档

日期：2026-07-13

## 概述

在工具模块新增"文件预览"工具，轻量级本地文件浏览器。支持添加文件夹或文件引用，左侧目录树浏览，右侧按文件类型分发不同预览渲染器。

## 支持的文件类型

| 类型 | 扩展名 | 渲染方式 |
|------|--------|----------|
| Markdown | `.md`, `.markdown` | marked.js 渲染 HTML |
| JSON | `.json`, `.jsonc` | CodeMirror 只读 + JSON 语法高亮 |
| 代码 | `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.go`, `.rs`, `.rb`, `.c`, `.cpp`, `.h`, `.swift`, `.kt`, `.scala`, `.php`, `.lua`, `.sh`, `.sql`, `.html`, `.css`, `.xml`, `.yaml`, `.yml`, `.toml` | CodeMirror 只读 + 对应语法高亮 |
| 图片 | `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.bmp`, `.ico` | `<img>` 标签，复用 `/api/notes/file` 图片代理 |
| 纯文本 | `.txt`, `.log`, `.conf`, `.ini`, `.cfg`, `.env` 等 | CodeMirror 只读 + 纯文本 |
| 未知类型 | 其他 | 提示不支持预览，提供"在 Finder 中打开"按钮 |

## 架构

### 数据层（`src/data/tools.ts`）

泛化现有 `JsonLink` 体系：

- 提取通用 CRUD 函数，接受 `linksPath` 参数区分数据源
- JSON 工具继续使用 `~/.ccs/tools/json-links.json`
- 文件预览工具使用 `~/.ccs/tools/file-links.json`
- `validateLinkPath` 新增 `opts?.jsonOnly` 参数控制是否限定 `.json` 扩展名
- 目录树展开不再按扩展名过滤，列全部文件和子目录
- 新增 `readFileLink()` — 读取任意文件内容（文本返回原文，二进制返回空 content + `binary: true`）
- `JsonLink` 类型名保持不变（JSON 工具也用同一类型，语义兼容）

### API 路由（`src/server/routes.ts`）

新增 `/api/tools/file-links/*` 路由组：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tools/file-links` | 列出全部引用 |
| POST | `/api/tools/file-links` | 添加引用 |
| DELETE | `/api/tools/file-links/:id` | 移除引用 |
| GET | `/api/tools/file-links/:id/tree` | 展开目录树 |
| GET | `/api/tools/file-links/:id/content` | 读取文件内容 |
| GET | `/api/tools/file-links/:id/reveal` | Finder 中显示 |
| POST | `/api/tools/file-links/read` | 按绝对路径读取文件 |
| POST | `/api/tools/file-links/expand-dir` | 按路径展开目录 |

所有路由注册在 GET/POST/DELETE 三个 method 分支的 `if (path.startsWith('/api/tools/'))` 块内。

### 前端（`src/frontend/tools-module.ts`）

**工具注册** — `TOOLS` 数组新增 `file-preview` 条目。

**布局** — 左右分栏：左侧引用列表 + 目录树，右侧预览区 + 顶部只读工具栏。

**预览分发** — `toolsPreviewFile(ext, content, path)` 函数：

```
.md/.markdown → marked.parse() 渲染到 <div>
.json/.jsonc  → initCodeMirror() 只读模式 + JSON lang
代码扩展名    → initCodeMirror() 只读 + 对应 StreamLanguage
图片扩展名    → <img src="/api/notes/file?base=...&rel=...">
纯文本/其他   → initCodeMirror() 只读 + plain text
```

**CodeMirror 语言切换** — 新增 `cmSetLanguage(ext)` 函数，按扩展名映射到 CodeMirror StreamLanguage 模式。

**与 JSON 工具的关系** — 独立工具条目，独立引用存储，不共享引用列表。

### 错误处理

| 场景 | 处理 |
|------|------|
| 引用路径不存在 | listLinks 自动清理，前端 toast 提示 |
| 文件读取失败（权限） | 返回 `{error, code:'READ_ERROR'}`，前端提示 |
| 二进制文件 | content 为空 + `binary:true`，前端显示提示 |
| 大文件（>1MB） | 截断 1MB + `truncated:true` |
| 目录过大（>2000条目） | `truncated:true` |
| 路径穿越 | 已有 traversal 校验 |
| 重复添加路径 | 已有去重逻辑 |
| 不支持的类型 | 显示"不支持预览此类型" + Finder 打开按钮 |
| 大图片 | CSS `max-width:100%` + overflow scroll |

## 文件改动

| 文件 | 改动量 | 说明 |
|------|--------|------|
| `src/data/tools.ts` | ~120行 | 泛化 link CRUD，新增 `readFileLink`、目录树不过滤 |
| `src/server/routes.ts` | ~80行 | 新增 8 个 file-links 路由 |
| `src/frontend/tools-module.ts` | ~350行 | CSS、工具注册、工作区渲染、预览分发、目录树 |

## 实现步骤

1. 数据层泛化 — 提取通用函数，新增 `fileLinksPath`、`readFileLink`
2. API 路由 — 新增 file-links 路由组
3. 前端 CSS — 文件预览样式
4. 前端 JS — 工具注册、工作区、目录树、预览分发、CodeMirror 语言切换
5. 构建验证 — `npm run build && npm run typecheck && npm run test`
6. 功能验证 — `ccs start` 手动测试各类文件预览

## 不做什么

- 不支持编辑（只读预览）
- 不支持 PDF 预览
- 不支持 HTML 渲染预览（仅代码高亮）
- 不引入新依赖
- 不影响现有 JSON 格式化和笔记模块功能
