/**
 * Codex Plans — extracts <proposed_plan> from plan-mode rollout sessions.
 * Plan sessions have collaboration_mode_kind: "plan" in task_started events.
 */
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { CX_DB_PATH } from './cx-stats.js'
import { isPlanHandoffTitle, resolveProject } from './cx-rollout.js'

const _sqliteMod = 'node:sqlite'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require(_sqliteMod) as { DatabaseSync: typeof DatabaseSyncType }

type DbInstance = InstanceType<typeof DatabaseSyncType>

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CxPlan {
  id: string
  title: string
  status: 'active' | 'completed'
  summary: string
  content: string
  projectName: string
  projectPath: string
  timeCreated: number
  timeUpdated: number
  isTemp?: boolean
}

export interface CxPlansData {
  plans: CxPlan[]
  stats: {
    total: number
    active: number
    completed: number
  }
}

// ── SQL row types ─────────────────────────────────────────────────────────────

interface ThreadRow {
  id: string
  rollout_path: string
  cwd: string
  title: string
  tokens_used: number
  created_at: number
  updated_at: number
  archived: number
}

// ── DB helper ─────────────────────────────────────────────────────────────────

function withDb<T>(fn: (db: DbInstance) => T): T {
  const db = new DatabaseSync(CX_DB_PATH, { open: true })
  try {
    return fn(db)
  } finally {
    db.close()
  }
}

// ── Extract <proposed_plan> from rollout content ──────────────────────────────

/** Unescape JSON string escapes (\n, \t, \\, \", etc.) — the plan content
 *  inside JSONL files uses JSON string escaping. */
function unescapeJsonString(s: string): string {
  return s
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"')
}

function extractProposedPlan(text: string): string {
  const startTag = '<proposed_plan>'
  const endTag = '</proposed_plan>'
  // Use lastIndexOf to get the final <proposed_plan> block — earlier ones
  // are system instruction templates, only the last block is the real plan.
  const startIdx = text.lastIndexOf(startTag)
  if (startIdx === -1) return ''
  const endIdx = text.indexOf(endTag, startIdx + startTag.length)
  if (endIdx === -1) return ''
  return unescapeJsonString(text.slice(startIdx + startTag.length, endIdx)).trim()
}

function extractTitle(planContent: string): string {
  for (const line of planContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) return trimmed.slice(2).trim()
  }
  return '未命名计划'
}

function extractSummary(planContent: string): string {
  let inSummary = false
  let summaryLines: string[] = []
  for (const line of planContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('## Summary') || trimmed.startsWith('## 概述')) {
      inSummary = true
      continue
    }
    if (!inSummary) continue
    if (trimmed.startsWith('## ')) break
    if (trimmed) summaryLines.push(trimmed)
  }
  if (summaryLines.length > 0) {
    return summaryLines.join(' ').slice(0, 200)
  }
  // fallback: first non-heading paragraph
  let inHeading = false
  for (const line of planContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('#')) { inHeading = true; continue }
    if (inHeading && trimmed) return trimmed.slice(0, 200)
  }
  return planContent.slice(0, 200).trim()
}

function hasCollaborationModePlan(rolloutContent: string): boolean {
  return rolloutContent.includes('"collaboration_mode_kind":"plan"')
}

function hasTaskComplete(rolloutContent: string): boolean {
  // Check for task_complete event type in the JSONL
  return /"type":"task_complete"/.test(rolloutContent)
}

// ── Main export ───────────────────────────────────────────────────────────────

export function loadCxPlans(): CxPlansData {
  const empty: CxPlansData = {
    plans: [],
    stats: { total: 0, active: 0, completed: 0 },
  }

  if (!existsSync(CX_DB_PATH)) return empty

  try {
    return withDb(db => {
      const threads = db.prepare(`
        SELECT id, rollout_path, cwd, title, tokens_used,
               created_at, updated_at, archived
        FROM threads
        WHERE archived = 0
        ORDER BY updated_at DESC
      `).all() as unknown as ThreadRow[]

      if (threads.length === 0) return empty

      const plans: CxPlan[] = []

      for (const t of threads) {
        // Skip plan-handoff threads
        if (isPlanHandoffTitle(t.title)) continue

        const rolloutPath = t.rollout_path
        if (!rolloutPath || !existsSync(rolloutPath)) continue

        let rolloutContent: string
        try {
          rolloutContent = readFileSync(rolloutPath, 'utf-8')
        } catch {
          continue
        }

        // Quick check: does this rollout have plan mode?
        if (!hasCollaborationModePlan(rolloutContent)) continue

        // Extract proposed_plan content
        const planContent = extractProposedPlan(rolloutContent)
        if (!planContent) continue

        const status = hasTaskComplete(rolloutContent) ? 'completed' : 'active'
        const title = extractTitle(planContent)
        const summary = extractSummary(planContent)

        const rp = resolveProject(t.cwd)
        plans.push({
          id: t.id,
          title,
          status,
          summary,
          content: planContent,
          projectName: rp.name,
          projectPath: rp.directory,
          isTemp: rp.isTemp,
          timeCreated: t.created_at,
          timeUpdated: t.updated_at,
        })
      }

      const active = plans.filter(p => p.status === 'active').length

      return {
        plans,
        stats: {
          total: plans.length,
          active,
          completed: plans.length - active,
        },
      }
    })
  } catch {
    return empty
  }
}
