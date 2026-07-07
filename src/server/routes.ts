import type { IncomingMessage, ServerResponse } from 'node:http'
import { URL } from 'node:url'
import { loadHistory, loadSessionConversation, searchSessionsByContent } from '../data/history.js'
import { loadPlans } from '../data/plans.js'
import { loadLatestStats, computeStats } from '../data/stats.js'
import { loadSessionSkills, loadLatestSkillStats, computeSkillStats } from '../data/skills.js'
import { loadOverview } from '../data/overview.js'
import { loadCmHistory, loadCmConversation } from '../data-cm/cm-history.js'
import { loadCmStats } from '../data-cm/cm-stats.js'
import { loadCmOverview } from '../data-cm/cm-overview.js'
import { HTML_TEMPLATE } from '../frontend/template.js'
import { CM_HTML_TEMPLATE } from '../frontend/cm-template.js'
import { loadCxHistory, loadCxConversation } from '../data-cx/cx-history.js'
import { loadCxStats } from '../data-cx/cx-stats.js'
import { loadCxOverview } from '../data-cx/cx-overview.js'
import { loadCxPlans } from '../data-cx/cx-plans.js'
import { CX_HTML_TEMPLATE } from '../frontend/cx-template.js'
import { CLAUDEMD_TEMPLATE } from '../frontend/claudemd-template.js'
import { loadConfig, getEnabledModes } from '../config.js'
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  importNoteFromPath,
  NoteNotFoundError,
  NoteImportError,
  listLinks,
  addLink,
  removeLink,
  expandLink,
  readLinkFile,
  revealLink,
  readMdByPath,
  NoteLinkError,
} from '../data/notes.js'
import {
  loadProxyRequests,
  loadProxyRequestById,
  exportProxyRequest,
  getProxyStatus,
  clearProxyLogs,
} from '../data/proxy.js'
import {
  readClaudeMd,
  writeClaudeMd,
  createClaudeMd,
  ClaudeMdExistsError,
} from '../data/claude-md.js'
import {
  listJsonFiles,
  getJsonFileContent,
  saveJsonFile,
  deleteJsonFile,
  listJsonLinks,
  addJsonLink,
  removeJsonLink,
  expandJsonLink,
  expandJsonDir,
  readJsonLinkFile,
  readJsonByPath,
  revealJsonLink,
  pickNativePath,
  JsonLinkError,
} from '../data/tools.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendJson(res: ServerResponse, data: unknown): void {
  const body = Buffer.from(JSON.stringify(data), 'utf-8')
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
  })
  res.end(body)
}

/** Inject window.CCS_MODES into the HTML so the frontend knows which modes are active. */
function injectModes(html: string, modes: string[]): string {
  const tag = `<script>window.CCS_MODES=${JSON.stringify(modes)};</script>`
  return html.replace('</head>', tag + '</head>')
}

/** Inject window.CCS_NOTE flag so the frontend knows if notes are enabled. */
function injectNoteFlag(html: string, enabled: boolean): string {
  const tag = `<script>window.CCS_NOTE=${enabled};</script>`
  return html.replace('</head>', tag + '</head>')
}

/** Inject window.CCS_PROMPTS flag so the frontend knows if prompts are enabled. */
function injectPromptsFlag(html: string, enabled: boolean): string {
  const tag = `<script>window.CCS_PROMPTS=${enabled};</script>`
  return html.replace('</head>', tag + '</head>')
}

/** Inject window.CCS_TOOLS flag so the frontend knows if tools are enabled. */
function injectToolsFlag(html: string, enabled: boolean): string {
  const tag = `<script>window.CCS_TOOLS=${enabled};</script>`
  return html.replace('</head>', tag + '</head>')
}

/** Apply all server-side HTML injections for a page response. */
function buildPageHtml(template: string, modes: string[], noteEnabled: boolean, promptsEnabled: boolean, toolsEnabled: boolean): string {
  let html = injectModes(template, modes)
  html = injectNoteFlag(html, noteEnabled)
  html = injectPromptsFlag(html, promptsEnabled)
  html = injectToolsFlag(html, toolsEnabled)
  return html
}

function sendHtml(res: ServerResponse, html: string): void {
  const body = Buffer.from(html, 'utf-8')
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': body.length,
  })
  res.end(body)
}

function send404(res: ServerResponse): void {
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
}

function send403(res: ServerResponse, modeName = 'Codemaker'): void {
  res.writeHead(403, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: `${modeName} mode is not enabled. Enable it in ~/.ccs/config.json` }))
}

// ── Request handler ───────────────────────────────────────────────────────────

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  dataDir?: string,
): Promise<void> {
  const base = `http://${req.headers.host ?? 'localhost'}`
  const url = new URL(req.url ?? '/', base)
  const path = url.pathname
  const method = (req.method ?? 'GET').toUpperCase()

  // CORS headers for dev convenience
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Resolve enabled modes once per request (cheap — just reads config file)
  const cfg = loadConfig()
  const enabledModes = getEnabledModes(cfg)
  const codemakerEnabled = enabledModes.includes('codemaker')
  const codexEnabled = enabledModes.includes('codex')
  const toolsEnabled = cfg.tools === true || process.env.CCS_TOOLS === '1'
  const noteEnabled = toolsEnabled
  const promptsEnabled = cfg.prompts !== false

  // ── GET ──────────────────────────────────────────────────────────────────

  if (method === 'GET') {
    // ── Pages ──────────────────────────────────────────────────────────────
    if (path === '/') {
      return sendHtml(res, buildPageHtml(HTML_TEMPLATE, enabledModes, noteEnabled, promptsEnabled, toolsEnabled))
    }
    if (path === '/cm') {
      if (!codemakerEnabled) {
        // Redirect to Claude mode if Codemaker is disabled
        res.writeHead(302, { Location: '/' })
        res.end()
        return
      }
      return sendHtml(res, buildPageHtml(CM_HTML_TEMPLATE, enabledModes, noteEnabled, promptsEnabled, toolsEnabled))
    }
    if (path === '/cx') {
      if (!codexEnabled) {
        res.writeHead(302, { Location: '/' })
        res.end()
        return
      }
      return sendHtml(res, buildPageHtml(CX_HTML_TEMPLATE, enabledModes, noteEnabled, promptsEnabled, toolsEnabled))
    }
    if (path === '/claude-md') {
      return sendHtml(res, CLAUDEMD_TEMPLATE)
    }

    // ── Claude API ──────────────────────────────────────────────────────────
    if (path === '/api/history') return sendJson(res, loadHistory(dataDir))
    if (path === '/api/history/search') {
      const q = url.searchParams.get('q') ?? ''
      const project = url.searchParams.get('project') ?? ''
      const result = await searchSessionsByContent(q, project, dataDir)
      return sendJson(res, result)
    }
    if (path === '/api/conversation') {
      const sessionId = url.searchParams.get('sessionId') ?? ''
      const project   = url.searchParams.get('project')   ?? ''
      if (!sessionId || !project) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'sessionId and project are required' }))
        return
      }
      return sendJson(res, loadSessionConversation(sessionId, project, dataDir))
    }
    if (path === '/api/plans')       return sendJson(res, loadPlans(dataDir))
    if (path === '/api/stats')       return sendJson(res, loadLatestStats(dataDir))
    if (path === '/api/stats/skills') return sendJson(res, loadLatestSkillStats(dataDir))
    if (path === '/api/session/skills') {
      const sessionId = url.searchParams.get('sessionId') ?? ''
      const project   = url.searchParams.get('project')   ?? ''
      if (!sessionId || !project) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'sessionId and project are required' }))
        return
      }
      return sendJson(res, loadSessionSkills(sessionId, project, dataDir))
    }
    if (path === '/api/overview') return sendJson(res, loadOverview(dataDir))

    // ── Codemaker API ───────────────────────────────────────────────────────
    if (path.startsWith('/api/cm/')) {
      if (!codemakerEnabled) return send403(res, 'Codemaker')

      if (path === '/api/cm/history') return sendJson(res, loadCmHistory())
      if (path === '/api/cm/conversation') {
        const sessionId = url.searchParams.get('sessionId') ?? ''
        if (!sessionId) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'sessionId is required' }))
          return
        }
        return sendJson(res, loadCmConversation(sessionId))
      }
      if (path === '/api/cm/stats')    return sendJson(res, loadCmStats())
      if (path === '/api/cm/overview') {
        try {
          return sendJson(res, loadCmOverview())
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }
    }

    // ── Codex API ─────────────────────────────────────────────────────────
    if (path.startsWith('/api/cx/')) {
      if (!codexEnabled) return send403(res, 'Codex')

      if (path === '/api/cx/history') return sendJson(res, loadCxHistory())
      if (path === '/api/cx/conversation') {
        const sessionId = url.searchParams.get('sessionId') ?? ''
        if (!sessionId) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'sessionId is required' }))
          return
        }
        return sendJson(res, loadCxConversation(sessionId))
      }
      if (path === '/api/cx/stats')    return sendJson(res, loadCxStats())
      if (path === '/api/cx/overview') {
        try {
          return sendJson(res, loadCxOverview())
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }
      if (path === '/api/cx/plans') return sendJson(res, loadCxPlans())
    }

    // ── Notes API (GET) ─────────────────────────────────────────────────────
    if (path.startsWith('/api/notes')) {
      if (!noteEnabled) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Notes feature is not enabled' }))
        return
      }

      // GET /api/notes/links — list links (auto-cleanup stale)
      if (path === '/api/notes/links') {
        try {
          return sendJson(res, listLinks())
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/notes/links/:id/tree
      const linkTreeMatch = path.match(/^\/api\/notes\/links\/([^/]+)\/tree$/)
      if (linkTreeMatch) {
        const id = linkTreeMatch[1]
        try {
          return sendJson(res, expandLink(id))
        } catch (err) {
          if (err instanceof NoteLinkError) {
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

      // GET /api/notes/links/:id/content
      const linkContentMatch = path.match(/^\/api\/notes\/links\/([^/]+)\/content$/)
      if (linkContentMatch) {
        const id = linkContentMatch[1]
        try {
          return sendJson(res, readLinkFile(id))
        } catch (err) {
          if (err instanceof NoteLinkError) {
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

      // GET /api/notes/links/:id/reveal
      const linkRevealMatch = path.match(/^\/api\/notes\/links\/([^/]+)\/reveal$/)
      if (linkRevealMatch) {
        const id = linkRevealMatch[1]
        try {
          revealLink(id)
          res.writeHead(204)
          res.end()
          return
        } catch (err) {
          if (err instanceof NoteLinkError) {
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

      // GET /api/notes  — list
      if (path === '/api/notes') {
        try {
          return sendJson(res, listNotes())
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/notes/:id  — single note
      const noteIdMatch = path.match(/^\/api\/notes\/([^/]+)$/)
      if (noteIdMatch) {
        const id = noteIdMatch[1]
        try {
          return sendJson(res, getNote(id))
        } catch (err) {
          if (err instanceof NoteNotFoundError) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Note not found' }))
            return
          }
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }
    }

    // ── Proxy API (GET) ─────────────────────────────────────────────────────
    if (path.startsWith('/api/proxy/')) {
      if (path === '/api/proxy/status') {
        return sendJson(res, getProxyStatus())
      }
      if (path === '/api/proxy/requests') {
        const limit = url.searchParams.get('limit')
        const offset = url.searchParams.get('offset')
        const model = url.searchParams.get('model')
        return sendJson(
          res,
          loadProxyRequests({
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
            model: model ?? undefined,
          }),
        )
      }
      // GET /api/proxy/requests/:id
      const reqIdMatch = path.match(/^\/api\/proxy\/requests\/([^/]+)$/)
      if (reqIdMatch) {
        const id = reqIdMatch[1]
        const record = loadProxyRequestById(id)
        if (!record) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Request not found' }))
          return
        }
        return sendJson(res, record)
      }
    }

    // ── Tools API (GET) ─────────────────────────────────────────────────────
    if (path.startsWith('/api/tools/')) {
      if (!toolsEnabled) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Tools feature is not enabled' }))
        return
      }

      // GET /api/tools/json-format — list saved files
      if (path === '/api/tools/json-format') {
        try {
          return sendJson(res, listJsonFiles())
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/tools/json-format/:name — get single file content
      const toolsFileMatch = path.match(/^\/api\/tools\/json-format\/(.+)$/)
      if (toolsFileMatch) {
        const name = decodeURIComponent(toolsFileMatch[1])
        try {
          const file = getJsonFileContent(name)
          if (!file) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'File not found' }))
            return
          }
          return sendJson(res, file)
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/tools/json-links — list all links
      if (path === '/api/tools/json-links') {
        try {
          return sendJson(res, listJsonLinks())
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }

      // GET /api/tools/json-links/:id/tree
      const jsonLinksTreeMatch = path.match(/^\/api\/tools\/json-links\/([^/]+)\/tree$/)
      if (jsonLinksTreeMatch) {
        const id = jsonLinksTreeMatch[1]
        try {
          return sendJson(res, expandJsonLink(id))
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

      // GET /api/tools/json-links/:id/content
      const jsonLinksContentMatch = path.match(/^\/api\/tools\/json-links\/([^/]+)\/content$/)
      if (jsonLinksContentMatch) {
        const id = jsonLinksContentMatch[1]
        try {
          return sendJson(res, readJsonLinkFile(id))
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

      // GET /api/tools/json-links/:id/reveal
      const jsonLinksRevealMatch = path.match(/^\/api\/tools\/json-links\/([^/]+)\/reveal$/)
      if (jsonLinksRevealMatch) {
        const id = jsonLinksRevealMatch[1]
        try {
          revealJsonLink(id)
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
    }

    // ── CLAUDE.md API (GET) ─────────────────────────────────────────────────
    if (path === '/api/claude-md') {
      const scope = url.searchParams.get('scope')
      const project = url.searchParams.get('project')

      try {
        if (scope === 'global') {
          return sendJson(res, readClaudeMd('global', undefined, dataDir))
        }
        if (project) {
          return sendJson(res, readClaudeMd('project', decodeURIComponent(project), dataDir))
        }
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'scope=global or project=<path> is required' }))
        return
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: String(err) }))
        return
      }
    }

    return send404(res)
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  if (method === 'DELETE') {
    if (path.startsWith('/api/notes/')) {
      if (!noteEnabled) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Notes feature is not enabled' }))
        return
      }
      // DELETE /api/notes/links/:id
      const linkDelMatch = path.match(/^\/api\/notes\/links\/([^/]+)$/)
      if (linkDelMatch) {
        const id = linkDelMatch[1]
        try {
          removeLink(id)
          res.writeHead(204)
          res.end()
          return
        } catch (err) {
          if (err instanceof NoteLinkError) {
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
      const noteIdMatch = path.match(/^\/api\/notes\/([^/]+)$/)
      if (noteIdMatch) {
        const id = noteIdMatch[1]
        try {
          deleteNote(id)
          res.writeHead(204)
          res.end()
          return
        } catch (err) {
          if (err instanceof NoteNotFoundError) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Note not found' }))
            return
          }
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }
    }

    // ── Tools API (DELETE) ─────────────────────────────────────────────────
    if (path.startsWith('/api/tools/')) {
      if (!toolsEnabled) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Tools feature is not enabled' }))
        return
      }
      // DELETE /api/tools/json-format/:name
      const toolsFileMatch = path.match(/^\/api\/tools\/json-format\/(.+)$/)
      if (toolsFileMatch) {
        const name = decodeURIComponent(toolsFileMatch[1])
        try {
          deleteJsonFile(name)
          res.writeHead(204)
          res.end()
          return
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          const status = msg.includes('not found') ? 404 : 400
          res.writeHead(status, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: msg }))
          return
        }
      }

      // DELETE /api/tools/json-links/:id
      const jsonLinksDelMatch = path.match(/^\/api\/tools\/json-links\/([^/]+)$/)
      if (jsonLinksDelMatch) {
        const id = jsonLinksDelMatch[1]
        try {
          removeJsonLink(id)
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
    }
    return send404(res)
  }

  // ── PUT ───────────────────────────────────────────────────────────────────

  if (method === 'PUT') {
    if (path.startsWith('/api/notes/')) {
      if (!noteEnabled) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Notes feature is not enabled' }))
        return
      }
      const noteIdMatch = path.match(/^\/api\/notes\/([^/]+)$/)
      if (noteIdMatch) {
        const id = noteIdMatch[1]
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const input = JSON.parse(body) as { title?: string; content?: string; tags?: string[] }
            const updated = updateNote(id, input)
            sendJson(res, updated)
          } catch (err) {
            if (err instanceof NoteNotFoundError) {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Note not found' }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }
    }
    if (path === '/api/claude-md') {
      const scope = url.searchParams.get('scope')
      const project = url.searchParams.get('project')

      let body = ''
      req.on('data', (chunk: Buffer) => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const input = JSON.parse(body) as { content?: string }
          if (typeof input.content !== 'string') {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'content is required' }))
            return
          }
          let result
          if (scope === 'global') {
            result = writeClaudeMd('global', input.content, undefined, dataDir)
          } else if (project) {
            result = writeClaudeMd('project', input.content, decodeURIComponent(project), dataDir)
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'scope=global or project=<path> is required' }))
            return
          }
          sendJson(res, result)
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
      return
    }
    return send404(res)
  }

  // ── POST ─────────────────────────────────────────────────────────────────

  if (method === 'POST') {
    if (path === '/api/stats/compute') {
      let body = ''
      req.on('data', (chunk: Buffer) => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const result = computeStats(dataDir)
          sendJson(res, result)
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
      return
    }
    if (path === '/api/stats/skills/compute') {
      let body = ''
      req.on('data', (chunk: Buffer) => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const result = computeSkillStats(dataDir)
          sendJson(res, result)
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
      return
    }

    // ── Proxy API (POST) ───────────────────────────────────────────────────
    if (path.startsWith('/api/proxy/')) {
      // POST /api/proxy/requests/:id/export
      const exportMatch = path.match(/^\/api\/proxy\/requests\/([^/]+)\/export$/)
      if (exportMatch) {
        const id = exportMatch[1]
        try {
          const filePath = exportProxyRequest(id)
          return sendJson(res, { path: filePath })
        } catch (err) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
          return
        }
      }
      // POST /api/proxy/clear
      if (path === '/api/proxy/clear') {
        const result = clearProxyLogs()
        return sendJson(res, { cleared: true, ...result })
      }
    }

    // ── CLAUDE.md API (POST) ────────────────────────────────────────────────
    if (path === '/api/claude-md/create') {
      const scope = url.searchParams.get('scope')
      const project = url.searchParams.get('project')

      try {
        let result
        if (scope === 'global') {
          result = createClaudeMd('global', undefined, dataDir)
        } else if (project) {
          result = createClaudeMd('project', decodeURIComponent(project), dataDir)
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'scope=global or project=<path> is required' }))
          return
        }
        const bodyBuf = Buffer.from(JSON.stringify(result), 'utf-8')
        res.writeHead(201, {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': bodyBuf.length,
        })
        res.end(bodyBuf)
      } catch (err) {
        if (err instanceof ClaudeMdExistsError) {
          res.writeHead(409, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'CLAUDE.md already exists' }))
          return
        }
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: String(err) }))
      }
      return
    }

    // ── Notes API (POST) ──────────────────────────────────────────────────
    if (path.startsWith('/api/notes')) {
      if (!noteEnabled) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Notes feature is not enabled' }))
        return
      }

      // POST /api/notes/links — add link
      if (path === '/api/notes/links') {
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
            const link = addLink({ path: input.path, label: input.label })
            const bodyBuf = Buffer.from(JSON.stringify(link), 'utf-8')
            res.writeHead(201, {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': bodyBuf.length,
            })
            res.end(bodyBuf)
          } catch (err) {
            if (err instanceof NoteLinkError) {
              const code = err.code
              const status = code === 'NOT_FOUND' ? 404 : code === 'DUPLICATE' ? 409 : 400
              res.writeHead(status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }

      // POST /api/notes/links/backup — backup referenced file to local notes
      if (path === '/api/notes/links/backup') {
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
            const md = readMdByPath(input.path)
            const note = createNote({ title: md.title, content: md.content })
            const bodyBuf = Buffer.from(JSON.stringify(note), 'utf-8')
            res.writeHead(201, {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': bodyBuf.length,
            })
            res.end(bodyBuf)
          } catch (err) {
            if (err instanceof NoteLinkError) {
              const code = err.code
              const status = code === 'NOT_FOUND' ? 404 : 400
              res.writeHead(status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }

      // POST /api/notes/links/read — read md by path (no persistence), for tree file preview
      if (path === '/api/notes/links/read') {
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
            const result = readMdByPath(input.path)
            return sendJson(res, result)
          } catch (err) {
            if (err instanceof NoteLinkError) {
              const code = err.code
              const status = code === 'NOT_FOUND' ? 404 : 400
              res.writeHead(status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }

      // POST /api/notes  — create note
      if (path === '/api/notes') {
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const input = JSON.parse(body) as { title?: string; content?: string; tags?: string[] }
            if (!input.title) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'title is required' }))
              return
            }
            const note = createNote({
              title:   input.title,
              content: input.content ?? '',
              tags:    input.tags,
            })
            const bodyBuf = Buffer.from(JSON.stringify(note), 'utf-8')
            res.writeHead(201, {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': bodyBuf.length,
            })
            res.end(bodyBuf)
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }

      // POST /api/notes/import-path
      if (path === '/api/notes/import-path') {
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const input = JSON.parse(body) as { filePath?: string }
            if (!input.filePath) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'filePath is required' }))
              return
            }
            const note = importNoteFromPath(input.filePath)
            const bodyBuf = Buffer.from(JSON.stringify(note), 'utf-8')
            res.writeHead(201, {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': bodyBuf.length,
            })
            res.end(bodyBuf)
          } catch (err) {
            if (err instanceof NoteImportError) {
              const statusCode = err.code === 'NOT_FOUND' ? 404 : 400
              res.writeHead(statusCode, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: err.message }))
              return
            }
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }
    }

    // ── Tools API (POST) ───────────────────────────────────────────────────
    if (path.startsWith('/api/tools/')) {
      if (!toolsEnabled) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Tools feature is not enabled' }))
        return
      }
      // POST /api/tools/json-format — save a file
      if (path === '/api/tools/json-format') {
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const input = JSON.parse(body) as { name?: string; content?: string }
            if (!input.name) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'name is required' }))
              return
            }
            if (typeof input.content !== 'string') {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'content is required' }))
              return
            }
            const result = saveJsonFile(input.name, input.content)
            const bodyBuf = Buffer.from(JSON.stringify(result), 'utf-8')
            res.writeHead(201, {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': bodyBuf.length,
            })
            res.end(bodyBuf)
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
        return
      }

      // POST /api/tools/json-links — add link
      if (path === '/api/tools/json-links') {
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
            const link = addJsonLink({ path: input.path, label: input.label })
            const bodyBuf = Buffer.from(JSON.stringify(link), 'utf-8')
            res.writeHead(201, {
              'Content-Type': 'application/json; charset=utf-8',
              'Content-Length': bodyBuf.length,
            })
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

      // POST /api/tools/json-links/read — read JSON by path
      if (path === '/api/tools/json-links/read') {
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
            const result = readJsonByPath(input.path)
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

      // POST /api/tools/json-links/expand-dir — expand an arbitrary directory (lazy)
      if (path === '/api/tools/json-links/expand-dir') {
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
            const result = expandJsonDir(input.path)
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
    }

    // POST /api/pick-path — 调用系统原生文件/文件夹选择器，返回绝对路径
    if (method === 'POST' && path === '/api/pick-path') {
      let body = ''
      req.on('data', (chunk: Buffer) => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const input = JSON.parse(body) as { type?: string }
          const type = input.type === 'folder' ? 'folder' : 'file'
          const result = pickNativePath(type)
          return sendJson(res, { path: result })
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: String(err) }))
        }
      })
      return
    }

    return send404(res)
  }

  send404(res)
}
