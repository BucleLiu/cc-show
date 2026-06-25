import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ClaudeMdResult {
  exists: boolean
  content: string | null
  path: string
}

export interface ClaudeMdSaveResult {
  ok: boolean
  path: string
}

export interface ClaudeMdCreateResult {
  ok: boolean
  content: string
  path: string
}

// ── Templates ─────────────────────────────────────────────────────────────────

const PROJECT_TEMPLATE = `# CLAUDE.md

本文件为 Claude Code 在此项目中工作时提供指导。

## 项目说明



## 代码规范



## 注意事项

`

const GLOBAL_TEMPLATE = `# CLAUDE.md

本文件为 Claude Code 提供全局指导，适用于所有项目。

## 通用规范



## 偏好设置

`

// ── Path Resolution ───────────────────────────────────────────────────────────

function getGlobalPath(): string {
  return join(homedir(), '.claude', 'CLAUDE.md')
}

function getProjectPath(projectPath: string): string {
  return join(projectPath, 'CLAUDE.md')
}

/**
 * Validate that a project path is a known Claude Code project.
 * Projects are stored under ~/.claude/projects/ with '/' replaced by '-'.
 */
export function isKnownProject(projectPath: string, dataDir?: string): boolean {
  const base = dataDir ?? join(homedir(), '.claude')
  const encoded = projectPath.replace(/[/\\:]/g, '-')
  const projectDir = join(base, 'projects', encoded)
  return existsSync(projectDir)
}

// ── Read ──────────────────────────────────────────────────────────────────────

export function readClaudeMd(scope: 'global' | 'project', projectPath?: string, dataDir?: string): ClaudeMdResult {
  let filePath: string

  if (scope === 'global') {
    filePath = getGlobalPath()
  } else {
    if (!projectPath) throw new Error('projectPath is required for project scope')
    if (!isKnownProject(projectPath, dataDir)) throw new Error('Unknown project path')
    filePath = getProjectPath(projectPath)
  }

  if (!existsSync(filePath)) {
    return { exists: false, content: null, path: filePath }
  }

  const content = readFileSync(filePath, 'utf-8')
  return { exists: true, content, path: filePath }
}

// ── Write ─────────────────────────────────────────────────────────────────────

export function writeClaudeMd(scope: 'global' | 'project', content: string, projectPath?: string, dataDir?: string): ClaudeMdSaveResult {
  let filePath: string

  if (scope === 'global') {
    filePath = getGlobalPath()
  } else {
    if (!projectPath) throw new Error('projectPath is required for project scope')
    if (!isKnownProject(projectPath, dataDir)) throw new Error('Unknown project path')
    filePath = getProjectPath(projectPath)
  }

  // Ensure parent directory exists
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(filePath, content, 'utf-8')
  return { ok: true, path: filePath }
}

// ── Create ────────────────────────────────────────────────────────────────────

export function createClaudeMd(scope: 'global' | 'project', projectPath?: string, dataDir?: string): ClaudeMdCreateResult {
  let filePath: string
  let template: string

  if (scope === 'global') {
    filePath = getGlobalPath()
    template = GLOBAL_TEMPLATE
  } else {
    if (!projectPath) throw new Error('projectPath is required for project scope')
    if (!isKnownProject(projectPath, dataDir)) throw new Error('Unknown project path')
    filePath = getProjectPath(projectPath)
    template = PROJECT_TEMPLATE
  }

  if (existsSync(filePath)) {
    throw new ClaudeMdExistsError(filePath)
  }

  // Ensure parent directory exists
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(filePath, template, 'utf-8')
  return { ok: true, content: template, path: filePath }
}

// ── Errors ────────────────────────────────────────────────────────────────────

export class ClaudeMdExistsError extends Error {
  constructor(path: string) {
    super(`CLAUDE.md already exists: ${path}`)
    this.name = 'ClaudeMdExistsError'
  }
}
