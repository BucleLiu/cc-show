# cc-show

Claude Code 数据文件本地可视化仪表板，TypeScript CLI 工具，主命令 `ccs`。

以 Web 界面展示 Claude Code 的历史对话、计划文件与 Token 用量统计。

**默认地址**：`http://localhost:8765`

---

## 快速开始

### 首次初始化

```bash
cd cc-show

# 安装依赖
npm install

# 编译源码
npm run build

# 注册全局 ccs 命令（本地开发专用，不发布 npm）
npm link
```

完成后 `ccs` 即为全局命令，可在任意目录使用。

---

## 日常开发：修改源码后重新生效

```bash
cd cc-show

# 重新编译（每次改完代码执行这一条就够了）
npm run build
```

**改完立即生效，不需要重新 `npm link`。**

---

## 原理

`npm link` 在全局 bin 目录创建了一个软链接：

```
~/.nvm/versions/node/<version>/bin/ccs
  → /path/to/skill-vault/cc-show/dist/cli.js
```

`ccs` 命令实际执行的就是本地的 `dist/cli.js`。  
每次 `npm run build` 都会重新生成 `dist/cli.js`，软链接不变，所以改动立即生效。

---

## 取消全局注册

```bash
npm unlink -g cc-show
```

---

## CLI 命令

```bash
ccs                        # 等同于 ccs start
ccs start                  # 启动 Web 服务（默认端口 8765，被占用自动递增）
ccs start --port 9000      # 指定端口
ccs stop                   # 停止后台守护进程
ccs stats                  # 终端输出 Token 用量统计
ccs stats --compute        # 重新扫描 ~/.claude/projects/ 并刷新统计
ccs stats --json           # 输出原始 JSON
ccs config                 # 查看所有配置
ccs config get port        # 读取单个配置项
ccs config set port 9000   # 写入配置项
ccs --version
ccs --help
```

配置文件保存在 `~/.ccs/config.json`（旧版 `~/.ccs.json` 首次启动时自动迁移），可配置项：

| 配置键    | 默认值      | 说明                        |
|-----------|-------------|---------------------------|
| `port`    | `8765`      | 服务器端口                  |
| `lang`    | `zh`        | CLI 输出语言（zh \| en）    |
| `dataDir` | `~/.claude` | Claude 数据目录路径         |
| `modes`   | `{ claude: { enabled: true } }` | 模式开关（见下文） |

### 模式（Modes）

cc-show 支持多模式，可在配置文件中按需开启：

```json
{
  "modes": {
    "claude":    { "enabled": true },
    "codemaker": { "enabled": true }
  }
}
```

| 模式名        | 默认  | 说明                                      |
|---------------|-------|-------------------------------------------|
| `claude`      | 开启  | Claude Code 仪表板（`/`）                 |
| `codemaker`   | 关闭  | Codemaker 仪表板（`/cm`），需 Node ≥ 22  |

开启 Codemaker 模式：

```bash
# 手动编辑 ~/.ccs/config.json，添加 codemaker 配置
# 或直接修改：
node -e "
const fs = require('fs'), p = require('os').homedir() + '/.ccs/config.json';
const c = JSON.parse(fs.readFileSync(p, 'utf8'));
c.modes = { ...c.modes, codemaker: { enabled: true } };
fs.writeFileSync(p, JSON.stringify(c, null, 2));
"
```

> **注意**：Codemaker 模式使用 Node.js 内置 `node:sqlite`（Node v22+ 才有），请确保 Node 版本 ≥ 22。

---

## 数据来源

### Claude Code 数据

| 模块     | 路径                              |
|----------|-----------------------------------|
| 历史对话 | `~/.claude/history.jsonl`         |
| 计划文件 | `~/.claude/plans/*.md`            |
| Token 统计（缓存）| `~/.claude/stat-log/stats-*.json` |
| Token 统计（计算）| `~/.claude/projects/*/*.jsonl`    |

### Codemaker 数据（需开启 codemaker 模式）

| 模块     | 路径                                          |
|----------|-----------------------------------------------|
| 全部数据 | `~/.local/share/codemaker/opencode.db`（SQLite）|

---

## 项目结构

```
cc-show/
├── src/
│   ├── cli.ts                # 主入口，commander.js 命令树
│   ├── config.ts             # ~/.ccs/config.json 读写，模式管理
│   ├── commands/
│   │   ├── start.ts          # ccs start（含守护进程逻辑）
│   │   ├── stop.ts           # ccs stop
│   │   ├── stats.ts          # ccs stats
│   │   └── config.ts         # ccs config
│   ├── data/                 # Claude Code 数据模块
│   │   ├── history.ts        # 历史对话数据加载
│   │   ├── plans.ts          # 计划文件数据加载
│   │   ├── stats.ts          # Token 统计数据加载与计算
│   │   ├── skills.ts         # Skill 调用统计
│   │   └── overview.ts       # 仪表板聚合数据
│   ├── data-cm/              # Codemaker 数据模块（读 opencode.db）
│   │   ├── cm-history.ts     # Codemaker 会话与对话加载
│   │   └── cm-stats.ts       # Codemaker Token/费用统计
│   ├── server/
│   │   ├── index.ts          # HTTP server + 端口自动递增
│   │   └── routes.ts         # API 路由（含 /api/cm/* 路由）
│   └── frontend/
│       ├── template.ts       # Claude Code SPA（内嵌 HTML/CSS/JS）
│       └── cm-template.ts    # Codemaker SPA（内嵌 HTML/CSS/JS）
├── dist/
│   └── cli.js                # 编译产物（单文件 CJS，含 shebang）
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## 扩展开发

新增数据模块的步骤：

1. `src/data/my-module.ts` — 实现数据加载函数
2. `src/server/routes.ts` — 注册 API 路由
3. `src/frontend/template.ts` — 添加导航项和前端 JS 模块
4. `npm run build` — 重新编译生效

---

## 技术实现详解

### 整体架构

cc-show 是一个 **TypeScript + Node.js** 本地 CLI 工具，以 npm 包形式分发。整体架构分为四层：

```
┌─────────────────────────────────────────────────────────┐
│  CLI 入口层  src/cli.ts                                  │
│  Commander.js 命令解析 → 动态 import 对应命令模块         │
├─────────────────────────────────────────────────────────┤
│  命令层  src/commands/                                    │
│  start / stop / stats / config                          │
├──────────────────┬──────────────────────────────────────┤
│  HTTP 服务层      │  数据解析层  src/data/                │
│  src/server/     │  history / stats / plans /           │
│  Node.js 原生    │  skills / overview                   │
│  http.createServer│  (纯函数，无副作用)                  │
├──────────────────┴──────────────────────────────────────┤
│  前端 SPA 层  src/frontend/template.ts                   │
│  单文件 HTML + 内联 CSS + 内联 JS，零外部依赖             │
└─────────────────────────────────────────────────────────┘
```

### 构建系统

使用 **tsup**（基于 esbuild）打包，核心配置（`tsup.config.ts`）：

| 配置项 | 值 | 作用 |
|--------|-----|------|
| `entry` | `src/cli.ts` | 单入口，一切从 CLI 开始 |
| `format` | `cjs` | CommonJS 格式，与 Node.js 原生模块互操作 |
| `bundle` | `true` | 所有依赖打包进 `dist/cli.js` 单文件 |
| `noExternal` | `commander, picocolors` | 运行时依赖内联，无需用户安装 |
| `banner.js` | `#!/usr/bin/env node` | shebang 注入，使文件可直接执行 |
| `define` | `__PACKAGE_VERSION__` | 版本号在编译期注入，运行时无需读取 package.json |
| `target` | `node18` | 最低 Node.js 版本 18 |

最终产物：**单个可执行 CJS 文件** `dist/cli.js`，`npm publish` 仅包含 `dist/` 目录。

### 进程模型（Daemon 架构）

`ccs start` 采用**双进程守护模式**，使终端可以立即返回：

```
ccs start（前台父进程）
    │
    ├─ 1. findFreePort()：探测空闲端口
    ├─ 2. spawn(node, [script, 'start', '--foreground', '--port', N])
    │       detached: true  stdio: 'ignore'
    ├─ 3. child.unref()：父进程脱离子进程控制
    ├─ 4. 写 ~/.ccs.pid
    ├─ 5. 打印 URL 信息
    └─ 6. 父进程退出

ccs start --foreground（后台守护子进程）
    │
    ├─ 覆写 ~/.ccs.pid 为自身 PID
    ├�� 注册 SIGINT/SIGTERM → cleanup + exit
    └─ startServer() → 永久阻塞 (await new Promise<void>(() => {}))
```

`ccs stop` 通过读取 `~/.ccs.pid`，对目标 PID 发送 `SIGTERM` 信号，同时删除 PID 文件。存活性检测使用 `process.kill(pid, 0)`（信号 0 不终止进程，仅检测进程是否存在）。

端口冲突处理：`findFreePort()` 从期望端口开始依次尝试，通过临时 `createServer` 探测可用性，找到第一个空闲端口。

### HTTP 服务层

使用 Node.js 内置 `http.createServer`（无 Express 等框架），监听 `127.0.0.1`（仅本机可访问）。

**REST API 路由表：**

| Method | Path | 数据来源 | 说明 |
|--------|------|---------|------|
| `GET` | `/` | `frontend/template.ts` | 返回 Claude Code SPA HTML |
| `GET` | `/cm` | `frontend/cm-template.ts` | 返回 Codemaker SPA HTML（需开启 codemaker 模式） |
| `GET` | `/api/history` | `history.jsonl` | 所有项目与会话列表 |
| `GET` | `/api/conversation` | `projects/<path>/<sid>.jsonl` | 单会话完整对话内容 |
| `GET` | `/api/plans` | `plans/*.md` | 计划文件列表与内容 |
| `GET` | `/api/stats` | `stat-log/stats-*.json` | 最新 Token 统计快照 |
| `GET` | `/api/stats/skills` | `stat-log/skills-*.json` | 最新 Skill 统计快照 |
| `GET` | `/api/session/skills` | `projects/<path>/<sid>.jsonl` | 单会话 Skill 调用记录 |
| `GET` | `/api/overview` | 聚合三个模块 | 仪表板 KPI 数据 |
| `POST` | `/api/stats/compute` | 扫描所有 `.jsonl` | 触发重新计算并写快照 |
| `POST` | `/api/stats/skills/compute` | 扫描所有 `.jsonl` | 触发 Skill 统计重算 |
| `GET` | `/api/cm/history` | `opencode.db` | Codemaker 项目与会话列表 |
| `GET` | `/api/cm/conversation` | `opencode.db` | Codemaker 单会话对话内容 |
| `GET` | `/api/cm/stats` | `opencode.db` | Codemaker Token/费用统计 |

### 数据解析层

所有数据模块均为**纯函数**（无副作用，直接读文件），供 HTTP 路由调用。

#### Claude 数据文件格式

Claude Code 在本地写入以下文件，cc-show 只读不写（`stat-log/` 除外）：

```
~/.claude/
├── history.jsonl                      ← 全局输入历史（每条一行 JSON）
├── plans/
│   └── *.md                           ← 计划文件（Markdown）
├── projects/
│   └── <encoded-path>/                ← 路径编码：'/' → '-'
│       ├── <session-id>.jsonl         ← 单会话完整对话记录
│       └── memory/
│           └── MEMORY.md             ← 项目记忆文件
└── stat-log/                          ← cc-show 写入的统计快照
    ├── stats-YYYYMMDDHHMMSS.json
    └── skills-YYYYMMDDHHMMSS.json
```

**路径编码规则**：Claude 把项目绝对路径中的所有 `/` 替换为 `-` 作为目录名，例如 `/Users/admin/my-project` → `-Users-admin-my-project`。解码时做逆变换，并从第一条 `user` 记录的 `cwd` 字段还原真实路径。

#### history.ts — 历史对话解析

读取 `history.jsonl`，每行格式：

```json
{ "sessionId": "...", "project": "/path/to/project",
  "timestamp": 1710000000000, "display": "用户输入文字",
  "pastedContents": [...] }
```

解析逻辑：
1. 按 `sessionId` 分组，每组为一个会话
2. 按 `project` 聚合，统计每个项目的会话数与消息数
3. 根据 `lastActive` 时间计算活跃度（7 天内 `active`，30 天内 `recent`，更早 `old`）
4. 从 `display` 字段提取会话摘要（跳过 `/` 开头的斜杠命令）

读取单会话对话内容（`loadSessionConversation`）：直接读 `projects/<encoded-path>/<sessionId>.jsonl`，从中提取 `type === "user"` 和 `type === "assistant"` 的记录，过滤掉 `<local-command-caveat>`、`<command-name>` 等系统内部消息。

#### stats.ts — Token 用量统计

扫描 `projects/<encoded-path>/<session-id>.jsonl`，每行格式（关键字段）：

```json
{ "type": "assistant", "timestamp": "2024-01-01T00:00:00Z", "cwd": "/path",
  "message": { "model": "claude-sonnet-4-5", "usage": {
    "input_tokens": 100, "output_tokens": 50,
    "cache_read_input_tokens": 200,
    "cache_creation_input_tokens": 300 }}}
```

计算逻辑：
- 只读 `type === "assistant"` 的记录（`user` 记录不含 `usage`）
- 四类 token 全部累加：`input + output + cache_read + cache_creation`
- 按 `model` 字段聚合，取 token 最多的作为会话主模型
- 按日期（`timestamp.slice(0,10)`）汇总 `daily` 趋势
- 计算结果写入 `~/.claude/stat-log/stats-<timestamp>.json` 快照

读取（`loadLatestStats`）：取 `stat-log/` 下按 mtime 最新的 `stats-*.json` 文件，避免每次都重扫。

#### plans.ts — 计划文件读取

读取 `~/.claude/plans/*.md`，解析逻辑：
- 提取第一个 `# 标题` 作为 title，无则用文件名（`-` 转空格、首字母大写）
- 跳过代码块与标题行，取第一行有效文本作为 preview（最多 120 字符）
- 按文件 mtime 降序排列

#### skills.ts — Skill 调用统计

Skill 调用在会话 JSONL 中以 `tool_use` 块形式存在：

```json
{ "type": "assistant", "message": { "content": [
  { "type": "tool_use", "name": "Skill",
    "input": { "skill": "cc-sticky-notify", "args": "..." }}
]}}
```

按 Skill 名称聚合，统计每个 Skill 在哪些项目中被调用了多少次，并记录每日调用量趋势。快照写入 `stat-log/skills-<timestamp>.json`。

#### overview.ts — 仪表板聚合

同时调用 `loadLatestStats` + `loadHistory` + `loadPlans` 三个模块，聚合出：

- **KPI 卡片**：总 Token、项目数、会话数、计划数、今日 Token、近 7 天活跃项目数、本月会话数
- **7 日趋势**：跨所有项目汇总每日四类 Token 消耗
- **最近会话**（Top 5）：按 lastTime 排序，计算相对时间字符串（"3 分钟前"等）
- **Token 最多项目**（Top 5）与**模型份额**（按模型汇总占比）
- **最近计划**（Top 5）
- **项目记忆**：读取各项目 `memory/MEMORY.md` 首行有效文本（Top 5，跳过标题/分隔线/注释）

#### cm-stats.ts — Codemaker Token/费用统计

数据源：`~/.local/share/codemaker/opencode.db`（Node v22+ 内置 `node:sqlite`，零依赖）。

涉及的表：

| 表名      | 关键字段                                    |
|-----------|---------------------------------------------|
| `session` | `id`, `title`, `slug`, `directory`, `time_created`, `time_updated` |
| `message` | `session_id`, `data`（JSON，含 `role`、`cost`、`tokens.input/output/cache.*`）|

计算逻辑：
- 只聚合 `role = 'assistant'` 的消息（用户消息无费用/Token 字段）
- 用 `json_extract` 从 `data` 列中提取 `cost`、`tokens.input`、`tokens.output`、`tokens.cache.read`、`tokens.cache.write`
- 按 `directory` 分组为"项目"，同时计算每会话统计与每日趋势
- 不写快照文件，每次请求实时从 DB 读取

导出接口：`CmStatsData`（含 `summary`、`projects[]`、`computedAt`、`noData`）。

#### cm-history.ts — Codemaker 会话与对话

在 `cm-stats.ts` 基础上额外读取 `part` 表还原对话内容：

| 表名   | 关键字段                                         |
|--------|--------------------------------------------------|
| `part` | `message_id`, `session_id`, `data`（JSON，含 `type`、`text`）|

会话列表（`loadCmHistory`）：
- 查 `session` 表全量 + `message` 表聚合（`msg_count`、`total_cost`）
- 按 `directory` 聚合项目，返回 `CmHistoryData`

对话内容（`loadCmConversation(sessionId)`）：
- 联表 `part` + `message`，过滤 `type = 'text'` 且文本非空的部分
- 同一 `message_id` 的多条 part 合并为一条消息（`\n` 拼接）
- 跳过以 `<local-command` / `<command-name` 开头的系统噪音
- 返回 `CmConversationMessage[]`（`role`、`text`、`timeCreated`、`agent?`、`costUsd?`）

### 前端 SPA 实现

前端包含**两个零外部依赖的单文件 SPA**，分别内联在 `src/frontend/template.ts`（Claude Code 仪表板）和 `src/frontend/cm-template.ts`（Codemaker 仪表板）中，通过 `GET /` 和 `GET /cm` 分别返回。

设计原则：
- **无 CDN**：不引用任何外部 JS/CSS 库，离线可用
- **无独立构建步骤**：前端随服务端 `npm run build` 一起打包，无 webpack/vite
- **CSS 变量主题**：通过 `[data-theme="dark"]` 选择器切换深浅色，状态存储在 `<html>` 属性上
- **模式感知**：服务端在 `</head>` 前注入 `window.CCS_MODES`，前端据此决定导航项的可见性

**Claude Code 仪表板（`template.ts`）— 4 个功能模块：**

| 模块 | API | 主要功能 |
|------|-----|---------|
| 概览 | `/api/overview` | KPI 卡片、7 日趋势柱状图（SVG）、最近会话、Token 排行、模型份额饼图 |
| 历史 | `/api/history` + `/api/conversation` | 三栏布局：项目列表 → 会话列表 → 对话气泡 |
| 计划 | `/api/plans` | 两栏布局：计划列表 + Markdown 渲染（自实现解析器）|
| 统计 | `/api/stats` + `/api/stats/skills` | Token 统计 + Skill 统计，含"重新计算"按钮（`POST` 触发） |

**Codemaker 仪表板（`cm-template.ts`）— 3 个功能模块：**

| 模块 | API | 主要功能 |
|------|-----|---------|
| 概览 | `/api/cm/stats` | KPI 卡片（总费用、Sessions、Projects、Tokens）、日趋势图、项目费用排行 |
| 历史 | `/api/cm/history` + `/api/cm/conversation` | 三栏布局：项目 → 会话 → 对话气泡（含费用标注）|
| 统计 | `/api/cm/stats` | 按项目展开的 Token/费用明细表格 |

**对话视图特性**：长消息折叠展开（`-webkit-line-clamp`）、"仅看用户"过滤（CSS `display:none`）、会话 Skill 弹窗（调用 `/api/session/skills`）。

**Markdown 渲染**：前端内置轻量级 Markdown 解析器，支持标题、段落、代码块、行内代码、粗体、链接、列表、引用块、水平线、表格。

### 依赖关系

**运行时依赖（打包内联，用户无需安装）：**
- `commander` ^12：CLI 命令/选项解析
- `picocolors` ^1：终端彩色输出

**开发依赖：**
- `tsup` ^8：基于 esbuild 的打包器
- `typescript` ^5：类型检查
- `@types/node` ^22：Node.js 类型定义

Node.js 内置模块（零额外安装）：`fs`、`os`、`path`、`http`、`child_process`、`url`

> Codemaker 模式额外使用 `node:sqlite`（Node v22 内置），使用该模式须确保 `node --version` ≥ v22。
