import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, existsSync, mkdirSync } from 'node:fs'
import { join, basename } from 'node:path'
import { homedir } from 'node:os'

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
