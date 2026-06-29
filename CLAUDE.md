# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

`cc-show` 是一个 TypeScript CLI 工具（npm 包 `@bucle/cc-show`），主命令 `ccs`。它以本地 Web 仪表板形式可视化 Claude Code 的数据文件（历史对话、计划、Token 统计），并支持 Codemaker 和 Codex 模式。

## 常用命令

```bash
npm run build          # tsup 打包 → dist/cli.js（单文件 CJS + shebang）
npm run dev            # tsup --watch 开发模式
npm run typecheck      # tsc --noEmit 类型检查
npm run test           # vitest run（单次运行）
npm run test:watch     # vitest（watch 模式）
npm link               # 本地开发：注册全局 ccs 命令
```

`npm link` 后 `ccs` 即为全局命令，每次 `npm run build` 改动立即生效，无需重新 link。

## 架构

四层结构，从入口到前端：

```
src/cli.ts              ← 入口，commander.js 命令树，各命令用动态 import
src/commands/           ← start / stop / stats / config / proxy
src/server/             ← Node.js 原生 http.createServer + 路由
src/data/  src/data-cm/ src/data-cx/
                        ← 纯函数数据加载（读文件系统/SQLite），供路由调用
src/frontend/           ← 内联 SPA 模板（HTML/CSS/JS 零外部依赖）
```

### 守护进程模型

`ccs start` 使用双进程模式：父进程 `spawn` 一个 `--foreground` 子进程后退出，子进程运行 HTTP server 并永久阻塞。PID 写入 `~/.ccs/config.json` 同目录下的 `server.pid`。`ccs stop` 读 PID 发 SIGTERM。端口冲突时 `findFreePort()` 自动递增。

### 多模式架构

通过 `~/.ccs/config.json` 的 `modes` 字段控制模式开关（`claude` / `codemaker` / `codex`）。服务端在每个页面 HTML 的 `</head>` 前注入 `window.CCS_MODES` 数组，前端据此显示/隐藏导航项。未开启的模式对应 API 返回 403。

### 构建系统

`tsup`（基于 esbuild）单入口打包 → `dist/cli.js`。关键配置：
- `noExternal: ['commander', 'picocolors']` — 运行时依赖内联，用户无需安装
- `define.__PACKAGE_VERSION__` — 版本号编译期注入
- `define.__MARKED_MIN_JS__` — `marked.min.js` 编译期内联到前端模板
- `external: ['node:sqlite']` — Node.js 内置模块不打包
- `target: 'node18'` — 最低支持 Node 18

### HTTP 路由

所有路由集中在 `src/server/routes.ts` 的 `handleRequest()` 中，按 method + path 分发。页面路由返回内联 HTML 模板，API 路由返回 JSON。数据来源：
- Claude: `~/.claude/history.jsonl`、`projects/<encoded-path>/*.jsonl`、`plans/*.md`、`stat-log/*.json`
- Codemaker: `~/.local/share/codemaker/opencode.db`（SQLite，需 Node ≥ 22）
- Codex: 类似 Codemaker 的数据路径

### 前端 SPA

三个零外部依赖的单文件 SPA（`template.ts` / `cm-template.ts` / `cx-template.ts`），内联 HTML + CSS + JS。CSS 变量主题切换（`[data-theme="dark"]`），Markdown 自实现轻量解析器。各模块通过 `fetch` 调用自身 `/api/*` 接口渲染。

### 配置

配置文件 `~/.ccs/config.json`，支持 `port`、`lang`、`dataDir`、`modes`、`note`、`prompts`、`proxy`。旧版 `~/.ccs.json` 首次加载时自动迁移。`CCS_HOME` 环境变量可覆盖配置目录（测试用）。

## 注意事项

- 测试文件位于 `src/**/__tests__/*.test.ts`，vitest 配置在 `vitest.config.ts` 中注入了 `__MARKED_MIN_JS__` 和 `__PACKAGE_VERSION__` 构建常量。
- `data/` 下各模块为纯函数（读文件系统），无副作用；`stats.ts` 和 `skills.ts` 额外承担写快照职责。
- Codemaker/Codex 模块依赖 `node:sqlite`（Node v22+ 内置），claude 模式只需 Node ≥ 18。
- 不要在前端模板中引入 CDN 或外部依赖。
