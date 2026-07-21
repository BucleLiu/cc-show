/**
 * Codex mode — single-file SPA.
 * Three modules: Overview (default), History, and Stats.
 * Data comes from state_5.sqlite + session JSONL via /api/cx/* endpoints.
 */
import { NOTES_CSS, NOTES_MODAL_HTML, NOTES_JS, NOTES_MARKED } from './notes-module.js'
import { TOOLS_CSS, TOOLS_NAV_ITEM, TOOLS_MODULE_HTML, TOOLS_JS, CODEMIRROR_BUNDLE } from './tools-module.js'

export const CX_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>cc-show · Codex</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Themes ── */
:root {
  --bg-base:      #f4f5f9;
  --bg-surface:   #ffffff;
  --bg-elevated:  #eceef6;
  --bg-hover:     #e4e8f4;
  --bg-selected:  #d1fae5;
  --border-sub:   #e5e8f0;
  --border-muted: #cdd2e4;
  --border-acc:   #e8c8a8;
  --text-pri:     #1a1c2e;
  --text-sec:     #4a5070;
  --text-muted:   #9098b8;
  /* Codex accent: green instead of blue */
  --accent:       #10b981;
  --accent-dim:   rgba(16,185,129,0.10);
  --accent-glow:  rgba(16,185,129,0.20);
  --purple:       #7c3aed;
  --purple-dim:   rgba(124,58,237,0.10);
  --green:        #16a34a;
  --yellow:       #ca8a04;
  --gray-dot:     #c4cad8;
  --nav-w:        68px;
  --panel-w:      240px;
  --mid-w:        270px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif;
}
[data-theme="dark"] {
  --bg-base:      #0d0e14;
  --bg-surface:   #13141c;
  --bg-elevated:  #1a1b27;
  --bg-hover:     #1e2035;
  --bg-selected:  #0a2a1e;
  --border-sub:   #1a1c2e;
  --border-muted: #252840;
  --border-acc:   #7a5020;
  --text-pri:     #e0e2f0;
  --text-sec:     #8890b0;
  --text-muted:   #454868;
  --accent:       #34d399;
  --accent-dim:   rgba(52,211,153,0.12);
  --accent-glow:  rgba(52,211,153,0.25);
  --purple:       #a78bfa;
  --purple-dim:   rgba(167,139,250,0.12);
  --green:        #34d399;
  --yellow:       #fbbf24;
  --gray-dot:     #374060;
}

html { transition: background 0.2s, color 0.2s; }
html, body { height: 100%; background: var(--bg-base); color: var(--text-pri); overflow: hidden; }
* { transition: background-color 0.15s, border-color 0.15s, color 0.15s; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-muted); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--border-acc); }

/* ── Layout ── */
#app { display: flex; height: 100vh; }

/* ── Nav ── */
#nav {
  width: var(--nav-w);
  background: var(--bg-surface);
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  align-items: center;
  padding: 14px 0 16px; gap: 4px;
  flex-shrink: 0; z-index: 10;
}
.nav-logo {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(16,185,129,0.35);
  letter-spacing: -0.5px; flex-shrink: 0;
}
.nav-divider { width: 32px; height: 1px; background: var(--border-sub); margin: 6px 0; }
.nav-item {
  position: relative;
  width: 52px; height: 52px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  border-radius: 12px; cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  color: var(--text-muted); border: 1px solid transparent;
}
.nav-item:hover { background: var(--bg-hover); color: var(--text-sec); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); border-color: var(--border-acc); }
.nav-item-icon { font-size: 18px; line-height: 1; }
.nav-item-label { font-size: 9px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase; }
.nav-tooltip {
  position: absolute; left: calc(100% + 10px);
  background: var(--bg-elevated); border: 1px solid var(--border-muted);
  color: var(--text-pri); padding: 4px 8px; border-radius: 6px;
  font-size: 11px; white-space: nowrap;
  pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 100;
}
.nav-item:hover .nav-tooltip { opacity: 1; }
.nav-spacer { flex: 1; }

/* ── Mode Dropdown (shared with CC page) ── */
.mode-dd {
  position: relative;
  width: 52px; height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px;
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-muted);
  border: 1px solid var(--border-muted);
  background: var(--bg-elevated);
  flex-shrink: 0;
  user-select: none;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, color 0.15s;
}
.mode-dd:hover {
  border-color: var(--accent);
  color: var(--text-sec);
  background: var(--bg-hover);
}
.mode-dd.open {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--accent);
}
.mode-dd-icon { line-height: 1; flex-shrink: 0; }
.mode-dd-label { font-size: 9px; font-weight: 700; letter-spacing: 0.3px; line-height: 1; }
.mode-dd-caret { font-size: 7px; opacity: 0.5; line-height: 1; }
.mode-dd-menu {
  position: absolute;
  left: calc(100% + 10px);
  bottom: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08);
  padding: 4px;
  min-width: 178px;
  z-index: 200;
  display: none;
}
.mode-dd-menu.open { display: block; }
.mode-dd-menu-title {
  font-size: 9px; font-weight: 700; letter-spacing: 0.8px;
  text-transform: uppercase; color: var(--text-muted);
  padding: 6px 10px 4px;
}
.mode-dd-opt {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 10px; border-radius: 7px;
  cursor: pointer; transition: background 0.12s;
}
.mode-dd-opt:hover { background: var(--bg-hover); }
.mode-dd-opt.current { background: var(--accent-dim); }
.mode-dd-opt-icon {
  width: 26px; height: 26px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mode-dd-opt-icon.cc-icon { background: linear-gradient(135deg, #4070f0, #6d4fc9); }
.mode-dd-opt-icon.cm-icon { background: linear-gradient(135deg, #d97706, #7c3aed); }
.mode-dd-opt-icon.cx-icon { background: linear-gradient(135deg, #10b981, #059669); }
.mode-dd-opt-body { flex: 1; min-width: 0; }
.mode-dd-opt-name { font-size: 12px; font-weight: 600; color: var(--text-pri); }
.mode-dd-opt-desc { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
.mode-dd-check { font-size: 11px; color: var(--accent); flex-shrink: 0; }

/* ── Main ── */
#main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

/* ── Topbar ── */
#topbar {
  height: 52px; background: var(--bg-surface);
  border-bottom: 1px solid var(--border-sub);
  display: flex; align-items: center;
  padding: 0 18px; gap: 12px; flex-shrink: 0;
}
.topbar-title { font-size: 14px; font-weight: 600; color: var(--text-pri); flex-shrink: 0; }
.topbar-badge {
  font-size: 10px; font-weight: 600; letter-spacing: 0.4px;
  background: var(--accent-dim); color: var(--accent);
  border: 1px solid var(--border-acc);
  border-radius: 4px; padding: 2px 7px; flex-shrink: 0;
}
.topbar-stats { font-size: 11px; color: var(--text-muted); display: flex; gap: 10px; }
.stat-chip {
  background: var(--bg-elevated); border: 1px solid var(--border-sub);
  border-radius: 20px; padding: 2px 8px;
  font-size: 11px; color: var(--text-sec);
  display: flex; align-items: center; gap: 4px;
}
.stat-chip b { color: var(--text-pri); }
.topbar-flex { flex: 1; }

/* ── Content ── */
#content { flex: 1; display: flex; overflow: hidden; }
.module { display: none; width: 100%; height: 100%; }
.module.active { display: flex; }

/* ── Panel search ── */
.panel-search-wrap {
  position: relative; padding: 6px 8px;
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
}
.panel-search-wrap::before {
  content: '⌕'; position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); font-size: 14px; pointer-events: none; z-index: 1;
}
.panel-search {
  width: 100%; height: 28px; background: var(--bg-base);
  border: 1px solid var(--border-muted); border-radius: 6px;
  padding: 0 8px 0 26px; color: var(--text-pri); font-size: 11px;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
}
.panel-search:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
.panel-search::placeholder { color: var(--text-muted); }
.session-source-badge { margin-left: 5px; padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 600; color: #047857; background: #d1fae5; vertical-align: 1px; }

/* ── History module ── */
.project-panel {
  width: var(--panel-w); border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  background: var(--bg-surface); flex-shrink: 0; overflow: hidden;
  position: relative; transition: width 0.2s ease;
}
.panel-header {
  padding: 12px 14px 8px; font-size: 10px; font-weight: 700;
  color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase;
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
  position: relative; display: flex; align-items: center;
}
.panel-header-text { flex: 1; }
.panel-toggle-btn {
  flex-shrink: 0; width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; border: none; background: none;
  color: var(--text-muted); font-size: 9px;
  border-radius: 3px; opacity: 0;
  transition: opacity 0.12s, background 0.12s;
  padding: 0; line-height: 1;
}
.panel-header:hover .panel-toggle-btn,
.panel-header .panel-toggle-btn.always-show { opacity: 1; }
.panel-toggle-btn:hover { background: var(--bg-hover); color: var(--text-sec); }

/* ── Panel collapse ── */
.panel-collapsed {
  width: 28px !important; min-width: 28px !important;
}
.panel-collapsed .panel-scroll,
.panel-collapsed .panel-search-wrap,
.panel-collapsed .panel-resize-handle { display: none !important; }
.panel-collapsed .panel-header {
  flex: 1; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 6px 2px; border-bottom: none;
}
.panel-collapsed .panel-header-text { display: none; }
.panel-collapsed .panel-toggle-btn { opacity: 1; }

/* Stats panel collapsed */
.panel-collapsed .stats-panel-header {
  flex: 1; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 6px 2px; border-bottom: none;
}
.panel-collapsed .stats-panel-header-left { display: none; }
.panel-collapsed .stats-panel-header .panel-toggle-btn { opacity: 1; }

/* ── Panel resize handle ── */
.panel-resize-handle {
  position: absolute; right: -2px; top: 0; bottom: 0;
  width: 5px; cursor: col-resize; z-index: 10;
  background: transparent; transition: background 0.12s;
}
.panel-resize-handle:hover,
.panel-resize-handle.active { background: var(--accent); opacity: 0.2; }

/* ── Resizing state ── */
body.resizing,
body.resizing * { cursor: col-resize !important; user-select: none !important; }
.panel-scroll { flex: 1; overflow-y: auto; padding: 6px; }

.project-item {
  padding: 8px 10px; border-radius: 8px; cursor: pointer;
  transition: background 0.12s; display: flex; align-items: center; gap: 9px;
  border: 1px solid transparent;
}
.project-item:hover { background: var(--bg-hover); }
.project-item.selected { background: var(--accent-dim); border-color: var(--border-acc); }
.project-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.dot-active { background: var(--green); box-shadow: 0 0 6px rgba(52,211,153,0.5); }
.dot-recent { background: var(--yellow); }
.dot-old    { background: var(--gray-dot); }
.project-info { flex: 1; min-width: 0; }
.project-name { font-size: 12px; font-weight: 500; color: var(--text-pri); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.project-meta { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
.project-badge {
  font-size: 10px; color: var(--text-sec);
  background: var(--bg-elevated); border: 1px solid var(--border-sub);
  border-radius: 4px; padding: 1px 5px; flex-shrink: 0;
}
.all-item {
  padding: 8px 10px 10px; margin-bottom: 2px; cursor: pointer;
  border-bottom: 1px solid var(--border-sub); transition: background 0.12s; border-radius: 8px;
}
.all-item:hover { background: var(--bg-hover); }
.all-item.selected { background: var(--accent-dim); }
.all-item-label { font-size: 12px; font-weight: 600; color: var(--text-pri); display: flex; align-items: center; gap: 6px; }
.all-item-label span { font-size: 14px; }
.all-item-meta { font-size: 10px; color: var(--text-muted); margin-top: 3px; }

/* ── Session panel ── */
.session-panel {
  width: var(--mid-w); border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  background: var(--bg-base); flex-shrink: 0; overflow: hidden;
  position: relative; transition: width 0.2s ease;
}
.session-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; color: var(--text-muted); font-size: 12px;
}
.session-empty-icon { font-size: 28px; opacity: 0.4; }

.session-card {
  margin: 4px 6px; padding: 10px 12px; border-radius: 9px;
  background: var(--bg-surface); border: 1px solid var(--border-sub);
  cursor: pointer; transition: all 0.12s; position: relative; overflow: hidden;
}
.session-card::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: var(--accent); opacity: 0; transition: opacity 0.12s;
}
.session-card:hover { background: var(--bg-elevated); border-color: var(--border-muted); transform: translateX(1px); }
.session-card:hover::before { opacity: 0.5; }
.session-card.selected { background: var(--accent-dim); border-color: var(--border-acc); }
.session-card.selected::before { opacity: 1; }
.session-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
.session-date { font-size: 11px; color: var(--text-sec); font-weight: 500; }
.session-cost {
  font-size: 10px; font-weight: 600; color: var(--accent);
  background: var(--accent-dim); border-radius: 10px; padding: 1px 6px;
  border: 1px solid var(--border-acc);
}
.session-title {
  font-size: 12px; color: var(--text-pri); font-weight: 500;
  line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  margin-bottom: 4px;
}
.session-slug {
  font-size: 10px; color: var(--text-muted);
  min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  text-align: right;
}
.session-meta {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 5px; gap: 6px;
}
.session-id-chip {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px; color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 5px; padding: 1px 6px;
  cursor: pointer; user-select: none;
  white-space: nowrap; flex-shrink: 0;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
}
.session-id-chip:hover { color: var(--text-sec); border-color: var(--border-muted); }
.session-id-chip.copied {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}

/* ── Message panel ── */
.message-panel {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  background: var(--bg-base); overflow: hidden;
}
.message-panel-header {
  padding: 12px 18px; border-bottom: 1px solid var(--border-sub);
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0; background: var(--bg-surface);
}
.msg-panel-title {
  font-size: 13px; font-weight: 600; color: var(--text-pri);
  flex: 1; min-width: 0; line-height: 1.35;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.msg-panel-cost {
  font-size: 12px; font-weight: 700; color: var(--accent);
  background: var(--accent-dim); border-radius: 6px;
  padding: 3px 9px; border: 1px solid var(--border-acc); flex-shrink: 0;
}
.conv-path-row {
  display: flex; align-items: center; gap: 5px; padding: 4px 16px 2px;
  font-size: 11px; font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--text-muted); cursor: pointer;
  user-select: none; transition: color 0.12s;
}
.conv-path-row:hover { color: var(--text-sec); }
.conv-path-text {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  direction: rtl; text-align: left;
}
.conv-path-copied {
  font-size: 10px; color: var(--green); flex-shrink: 0;
  opacity: 0; transition: opacity 0.15s;
}
.conv-path-copied.show { opacity: 1; }
.message-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; color: var(--text-muted); font-size: 12px;
}
.message-empty-icon { font-size: 32px; opacity: 0.3; }

/* ── Fullscreen Mode ── */
.message-panel.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 90;
  animation: conv-expand 0.22s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes conv-expand {
  from { opacity: 0.75; transform: scale(0.988); }
  to   { opacity: 1;    transform: scale(1); }
}
.message-panel.fullscreen .conv-list {
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
.conv-fullscreen-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-sub);
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.conv-fullscreen-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}
.conv-fullscreen-btn.active {
  color: var(--accent);
  border-color: var(--border-acc);
  background: var(--accent-dim);
}
.conv-fs-hint {
  position: fixed;
  bottom: 18px; right: 22px;
  font-size: 10px; color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 6px;
  padding: 3px 9px;
  z-index: 91;
  letter-spacing: 0.3px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s;
}
.conv-fs-hint.visible { opacity: 1; }

/* Conversation bubbles */
.conv-list {
  flex: 1; overflow-y: auto; padding: 16px 18px;
  display: flex; flex-direction: column; gap: 14px;
}
.conv-turn { display: flex; flex-direction: column; gap: 2px; }
.conv-role-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
  text-transform: uppercase; margin-bottom: 4px;
}
.conv-user .conv-role-label { color: var(--accent); }
.conv-assistant .conv-role-label { color: var(--purple); }
.conv-bubble {
  border-radius: 10px; padding: 10px 14px;
  font-size: 13px; line-height: 1.6;
  max-width: 100%; word-break: break-word;
  border: 1px solid var(--border-sub);
}
.conv-user .conv-bubble { background: var(--accent-dim); border-color: var(--border-acc); color: var(--text-pri); white-space: pre-wrap; }
.conv-assistant .conv-bubble { background: var(--bg-surface); color: var(--text-pri); }
.conv-bubble.collapsed {
  display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden;
}
.conv-meta {
  font-size: 10px; color: var(--text-muted); margin-top: 3px;
  display: flex; align-items: center; gap: 8px;
}
.conv-agent-tag {
  font-size: 9px; font-weight: 600; letter-spacing: 0.3px;
  padding: 1px 5px; border-radius: 4px; text-transform: uppercase;
}
.conv-agent-tag.plan    { background: rgba(16,185,129,0.12); color: var(--accent); }
.conv-agent-tag.explore { background: var(--purple-dim); color: var(--purple); }
.conv-expand { font-size: 11px; color: var(--accent); cursor: pointer; margin-top: 3px; display: inline-block; }
.conv-expand:hover { text-decoration: underline; }
.conv-filter-btn {
  margin-left: auto;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  font-size: 11px; font-weight: 500;
  border-radius: 20px;
  border: 1px solid var(--border-sub);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit; white-space: nowrap; flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  user-select: none;
}
.conv-filter-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-dim);
}
.conv-filter-btn.active {
  border-color: var(--border-acc);
  color: var(--accent);
  background: var(--accent-dim);
  font-weight: 600;
}
.conv-list.user-only .conv-assistant { display: none; }
.conv-loading { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); font-size: 12px; }

mark { background: rgba(251,191,36,0.2); color: var(--yellow); border-radius: 2px; padding: 0 1px; }

/* ── Plans Module ── */
.plans-list-panel {
  width: 320px; border-right: 1px solid var(--border-sub);
  background: var(--bg-surface);
  flex-shrink: 0;
  overflow: hidden;
  display: flex; flex-direction: column;
  position: relative; transition: width 0.2s ease;
}
.plan-card {
  padding: 11px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-sub);
  transition: background 0.12s;
  position: relative;
  overflow: hidden;
}
.plan-card::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: var(--purple); opacity: 0;
  transition: opacity 0.12s;
}
.plan-card:hover { background: var(--bg-hover); }
.plan-card:hover::before { opacity: 0.5; }
.plan-card.selected {
  background: var(--purple-dim);
}
.plan-card.selected::before { opacity: 1; }
.plan-title {
  font-size: 12px; font-weight: 500; color: var(--text-pri);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}
.plan-meta { display: flex; align-items: center; gap: 6px; }
.plan-project { font-size: 10px; color: var(--text-muted); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plan-time { font-size: 9px; color: var(--text-muted); flex-shrink: 0; }
.plan-summary {
  font-size: 11px; color: var(--text-muted);
  margin-top: 4px; line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.plan-status-tag {
  display: inline-block;
  font-size: 9px; font-weight: 600;
  padding: 1px 6px; border-radius: 8px;
  flex-shrink: 0;
}
.plan-status-tag.active {
  background: rgba(22,163,74,0.12); color: var(--green);
}
.plan-status-tag.completed {
  background: rgba(107,114,128,0.12); color: var(--text-muted);
}

/* ── Plan Content ── */
.plan-content-panel {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  background: var(--bg-base);
}
.plan-content-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-sub);
  background: var(--bg-surface);
  flex-shrink: 0;
  display: flex; align-items: center; gap: 10px;
}
.plan-content-title { font-size: 13px; font-weight: 600; color: var(--text-pri); }
.plan-content-meta { font-size: 11px; color: var(--text-muted); }
.plan-path-row {
  display: flex; align-items: center; gap: 5px; margin-top: 3px;
  font-size: 11px; font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--text-muted); cursor: pointer;
  user-select: none; transition: color 0.12s;
}
.plan-path-row:hover { color: var(--text-sec); }
.plan-path-label { font-size: 10px; color: var(--text-muted); flex-shrink: 0; }
.plan-path-text {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  direction: rtl; text-align: left;
}
.plan-path-copied {
  font-size: 10px; color: var(--green); flex-shrink: 0;
  opacity: 0; transition: opacity 0.15s;
}
.plan-path-copied.show { opacity: 1; }
.plan-copy-btn {
  margin-left: auto;
  padding: 5px 12px;
  font-size: 11.5px;
  border-radius: 6px;
  border: 1px solid var(--border-muted);
  background: var(--bg-elevated);
  color: var(--text-sec);
  cursor: pointer;
  flex-shrink: 0;
}
.plan-copy-btn:hover { background: var(--bg-hover); color: var(--text-pri); }
.plan-copy-btn.copied { border-color: var(--green); color: var(--green); background: rgba(22,163,74,0.08); }
.plan-content-scroll { flex: 1; overflow-y: auto; padding: 24px 28px; }

/* ── Markdown body (plan content) ── */
.plan-content-scroll .md-body { max-width: 760px; line-height: 1.65; }
.plan-content-scroll .md-body h1 { font-size: 20px; font-weight: 700; color: var(--text-pri); margin: 0 0 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border-muted); }
.plan-content-scroll .md-body h2 { font-size: 15px; font-weight: 600; color: var(--text-pri); margin: 24px 0 10px; }
.plan-content-scroll .md-body h3 { font-size: 13px; font-weight: 600; color: var(--text-sec); margin: 18px 0 8px; }
.plan-content-scroll .md-body h4 { font-size: 12px; font-weight: 600; color: var(--text-sec); margin: 14px 0 6px; }
.plan-content-scroll .md-body h5 { font-size: 12px; font-weight: 500; color: var(--text-muted); margin: 10px 0 5px; }
.plan-content-scroll .md-body h6 { font-size: 11px; font-weight: 500; color: var(--text-muted); margin: 10px 0 5px; }
.plan-content-scroll .md-body p { font-size: 13px; color: var(--text-sec); margin: 0 0 12px; }
.plan-content-scroll .md-body ul, .plan-content-scroll .md-body ol { font-size: 13px; color: var(--text-sec); margin: 0 0 12px 18px; }
.plan-content-scroll .md-body li { margin: 3px 0; line-height: 1.6; }
.plan-content-scroll .md-body code {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11.5px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-muted);
  border-radius: 4px; padding: 1px 5px;
  color: var(--purple);
}
.plan-content-scroll .md-body pre {
  background: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: 8px; padding: 14px 16px;
  overflow-x: auto; margin: 12px 0;
}
.plan-content-scroll .md-body pre code {
  background: none; border: none; padding: 0;
  color: var(--text-sec); font-size: 12px; line-height: 1.6;
}
.plan-content-scroll .md-body blockquote {
  border-left: 3px solid var(--border-acc);
  margin: 12px 0; padding: 8px 14px;
  background: var(--bg-surface);
  border-radius: 0 6px 6px 0;
}
.plan-content-scroll .md-body blockquote p { margin: 0; color: var(--text-muted); }
.plan-content-scroll .md-body hr { border: none; border-top: 1px solid var(--border-sub); margin: 20px 0; }
.plan-content-scroll .md-body strong { color: var(--text-pri); font-weight: 600; }
.plan-content-scroll .md-body a { color: var(--accent); text-decoration: none; }
.plan-content-scroll .md-body a:hover { text-decoration: underline; }
.plan-content-scroll .md-body table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 12px 0; }
.plan-content-scroll .md-body th {
  text-align: left; padding: 6px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-muted);
  color: var(--text-sec); font-weight: 600; font-size: 11px;
}
.plan-content-scroll .md-body td {
  padding: 6px 12px;
  border: 1px solid var(--border-sub);
  color: var(--text-sec); vertical-align: top;
}
.plan-content-scroll .md-body tr:hover td { background: var(--bg-hover); }

/* ── Markdown inside assistant bubbles ── */
.conv-assistant .conv-bubble { line-height: 1.65; }
.conv-assistant .conv-bubble h1,
.conv-assistant .conv-bubble h2,
.conv-assistant .conv-bubble h3 {
  font-weight: 700; color: var(--text-pri); margin: 12px 0 5px; line-height: 1.3;
}
.conv-assistant .conv-bubble h1 { font-size: 15px; }
.conv-assistant .conv-bubble h2 { font-size: 14px; }
.conv-assistant .conv-bubble h3 { font-size: 13px; }
.conv-assistant .conv-bubble p  { margin: 0 0 8px; }
.conv-assistant .conv-bubble p:last-child { margin-bottom: 0; }
.conv-assistant .conv-bubble ul,
.conv-assistant .conv-bubble ol { padding-left: 1.5em; margin: 4px 0 8px; }
.conv-assistant .conv-bubble li { margin: 2px 0; }
.conv-assistant .conv-bubble code {
  font-family: 'SF Mono','Fira Code','Cascadia Code',monospace;
  font-size: 11.5px; background: var(--bg-elevated);
  border: 1px solid var(--border-sub); border-radius: 4px; padding: 1px 5px;
}
.conv-assistant .conv-bubble pre {
  background: var(--bg-elevated); border: 1px solid var(--border-muted);
  border-radius: 8px; padding: 12px 14px; overflow-x: auto;
  margin: 8px 0; position: relative;
}
.conv-assistant .conv-bubble pre code {
  background: none; border: none; padding: 0; font-size: 12px;
  white-space: pre; display: block; line-height: 1.55;
}
.conv-assistant .conv-bubble .md-lang {
  position: absolute; top: 6px; right: 10px;
  font-size: 9px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px; pointer-events: none;
}
.conv-assistant .conv-bubble hr {
  border: none; border-top: 1px solid var(--border-sub); margin: 10px 0;
}
.conv-assistant .conv-bubble strong { font-weight: 700; color: var(--text-pri); }
.conv-assistant .conv-bubble em { font-style: italic; }
.conv-assistant .conv-bubble blockquote {
  border-left: 3px solid var(--border-acc); padding-left: 10px;
  margin: 6px 0; color: var(--text-sec); font-style: italic;
}

/* ── Stats module ── */
.stats-list-panel {
  width: 300px; border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  background: var(--bg-surface); flex-shrink: 0; overflow: hidden;
  position: relative; transition: width 0.2s ease;
}
.stats-panel-header {
  padding: 10px 14px; border-bottom: 1px solid var(--border-sub);
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  position: relative;
}
.stats-panel-header-left { display: flex; align-items: center; gap: 8px; }
.stats-panel-title { font-size: 10px; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }

.stats-proj-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; cursor: pointer;
  border-bottom: 1px solid var(--border-sub);
  transition: background 0.12s; position: relative;
}
.stats-proj-item:hover { background: var(--bg-hover); }
.stats-proj-item.selected { background: var(--accent-dim); }
.stats-proj-item.selected::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--accent);
}
.stats-proj-rank {
  width: 20px; height: 20px; border-radius: 6px; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border-sub);
}
.stats-proj-rank.top1 { background: rgba(255,196,0,0.15); color: #c47a00; border-color: rgba(196,122,0,0.3); }
.stats-proj-rank.top2 { background: rgba(192,192,192,0.15); color: #707080; border-color: rgba(120,120,140,0.3); }
.stats-proj-rank.top3 { background: rgba(184,115,51,0.12); color: #a0602a; border-color: rgba(160,96,42,0.25); }
.stats-proj-main { flex: 1; min-width: 0; }
.stats-proj-name { font-size: 12px; font-weight: 500; color: var(--text-pri); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1px; }
.stats-proj-path { font-size: 10px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
.stats-proj-bar { height: 3px; background: var(--bg-elevated); border-radius: 2px; overflow: hidden; }
.stats-proj-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--accent), var(--purple)); transition: width 0.3s ease; }
.stats-proj-nums { flex-shrink: 0; text-align: right; }
.stats-proj-cost { font-size: 12px; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
.stats-proj-sessions { font-size: 10px; color: var(--text-muted); margin-top: 1px; }

/* Detail panel */
.stats-detail-panel {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  overflow: hidden; background: var(--bg-base);
}
.stats-detail-head {
  padding: 14px 20px 12px; border-bottom: 1px solid var(--border-sub);
  background: var(--bg-surface); flex-shrink: 0;
}
.stats-detail-title { font-size: 15px; font-weight: 700; color: var(--text-pri); margin-bottom: 2px; }
.stats-detail-path { font-size: 11px; color: var(--text-muted); font-family: 'SF Mono', 'Fira Code', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.stats-detail-meta { font-size: 11px; color: var(--text-muted); }
.stats-detail-scroll { flex: 1; overflow-y: auto; padding: 18px 20px 32px; }

/* Metric cards */
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px; }
.metric-card {
  background: var(--bg-surface); border: 1px solid var(--border-sub);
  border-radius: 12px; padding: 14px 14px 12px; position: relative; overflow: hidden;
}
.metric-card::after {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; border-radius: 12px 12px 0 0;
}
.mc-cost::after   { background: linear-gradient(90deg, var(--accent), var(--yellow)); }
.mc-output::after { background: linear-gradient(90deg, var(--purple), #a78bfa); }
.mc-cache::after  { background: linear-gradient(90deg, var(--green), #34d399); }
.mc-sess::after   { background: linear-gradient(90deg, #64748b, #94a3b8); }
.metric-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
.metric-value { font-size: 20px; font-weight: 700; color: var(--text-pri); line-height: 1; margin: 5px 0 3px; }
.mc-cost .metric-value   { color: var(--accent); }
.mc-output .metric-value { color: var(--purple); }
.mc-cache .metric-value  { color: var(--green); }
.metric-sub { font-size: 10px; color: var(--text-sec); }

/* Section headers */
.stats-section { margin-bottom: 20px; }
.stats-section-title {
  font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
  text-transform: uppercase; color: var(--text-muted);
  margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
}
.stats-section-title::after { content: ''; flex: 1; height: 1px; background: var(--border-sub); }

/* Daily chart */
.daily-chart { display: flex; align-items: flex-end; gap: 3px; height: 60px; margin-bottom: 8px; }
.daily-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; cursor: default; }
.daily-bar-fill { width: 100%; border-radius: 2px 2px 0 0; background: var(--accent); opacity: 0.75; transition: opacity 0.1s; min-height: 2px; }
.daily-bar-col:hover .daily-bar-fill { opacity: 1; }
.daily-chart-labels { display: flex; gap: 3px; margin-bottom: 4px; }
.daily-chart-label-col { flex: 1; text-align: center; font-size: 9px; color: var(--text-muted); overflow: hidden; white-space: nowrap; }

/* Daily table */
.daily-table { width: 100%; font-size: 12px; border-collapse: collapse; margin-top: 8px; }
.daily-table th { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 8px; text-align: left; border-bottom: 1px solid var(--border-sub); }
.daily-table th:not(:first-child) { text-align: right; }
.daily-table td { padding: 5px 8px; color: var(--text-sec); border-bottom: 1px solid var(--border-sub); }
.daily-table td:not(:first-child) { text-align: right; font-variant-numeric: tabular-nums; }
.daily-table td:first-child { color: var(--text-pri); font-weight: 500; }
.daily-table tr:hover td { background: var(--bg-hover); }

/* Session rows in stats */
.session-rows { display: flex; flex-direction: column; gap: 4px; }
.srow {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 10px; border-radius: 7px;
  background: var(--bg-surface); border: 1px solid var(--border-sub);
  font-size: 11px; transition: border-color 0.12s, background 0.12s;
}
.srow:hover { background: var(--bg-elevated); border-color: var(--border-muted); }
.srow-cost { font-size: 12px; font-weight: 700; color: var(--accent); width: 64px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.srow-title { flex: 1; color: var(--text-pri); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.srow-time { font-size: 10px; color: var(--text-muted); flex-shrink: 0; }

/* ── Overview module ── */
.ov-scroll { flex: 1; overflow-y: auto; padding: 24px 28px 48px; display: flex; flex-direction: column; gap: 18px; }

.ov-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.ov-kpi-card {
  background: var(--bg-surface); border: 1px solid var(--border-sub);
  border-radius: 14px; padding: 16px 18px 14px;
  display: flex; flex-direction: column; gap: 8px;
  position: relative; overflow: hidden;
  transition: box-shadow 0.2s, transform 0.15s;
}
.ov-kpi-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09); transform: translateY(-1px); }
.ov-kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0; }
.ov-kpi-card.kc-amber::before { background: linear-gradient(90deg, #10b981, #34d399); }
.ov-kpi-card.kc-green::before  { background: linear-gradient(90deg, #16a34a, #34d399); }
.ov-kpi-card.kc-purple::before { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
.ov-kpi-card.kc-blue::before   { background: linear-gradient(90deg, #2563eb, #60a5fa); }

.ov-kpi-head { display: flex; align-items: center; justify-content: space-between; }
.ov-kpi-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.ov-kpi-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.ov-kpi-card.kc-amber .ov-kpi-icon { background: rgba(16,185,129,0.12); }
.ov-kpi-card.kc-green  .ov-kpi-icon { background: rgba(22,163,74,0.12); }
.ov-kpi-card.kc-purple .ov-kpi-icon { background: rgba(124,58,237,0.12); }
.ov-kpi-card.kc-blue   .ov-kpi-icon { background: rgba(37,99,235,0.12); }
.ov-kpi-value { font-size: 26px; font-weight: 800; color: var(--text-pri); letter-spacing: -0.5px; line-height: 1; font-variant-numeric: tabular-nums; }
.ov-kpi-sub { font-size: 11px; color: var(--text-muted); }
.ov-kpi-sub b { color: var(--text-sec); }

.ov-row { display: grid; gap: 14px; }
.ov-row-2-1 { grid-template-columns: 2fr 1fr; }
.ov-row-1-1  { grid-template-columns: 1fr 1fr; }

.ov-card { background: var(--bg-surface); border: 1px solid var(--border-sub); border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.ov-card-title { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.7px; text-transform: uppercase; display: flex; align-items: center; gap: 7px; }
.ov-card-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

/* Trend chart */
.ov-trend-wrap { position: relative; height: 110px; }
.ov-trend-svg { width: 100%; height: 100%; }
.ov-trend-labels { display: flex; justify-content: space-between; padding: 4px 0 0; }
.ov-trend-lbl { font-size: 10px; color: var(--text-muted); text-align: center; flex: 1; }

/* Recent sessions */
.ov-sess-list { display: flex; flex-direction: column; gap: 4px; }
.ov-sess-item { display: flex; align-items: center; gap: 9px; padding: 7px 9px; border-radius: 8px; cursor: pointer; transition: background 0.12s; border: 1px solid transparent; }
.ov-sess-item:hover { background: var(--bg-hover); border-color: var(--border-sub); }
.ov-sess-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
.ov-sess-body { flex: 1; min-width: 0; }
.ov-sess-title { font-size: 12px; color: var(--text-pri); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ov-sess-meta  { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
.ov-sess-cost  { font-size: 11px; font-weight: 700; color: var(--accent); flex-shrink: 0; }

/* Top projects */
.ov-proj-list { display: flex; flex-direction: column; gap: 9px; }
.ov-proj-item { display: flex; align-items: center; gap: 10px; }
.ov-rank { width: 22px; height: 22px; border-radius: 7px; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ov-rank.r1 { background: rgba(255,196,0,0.15); color: #c47a00; }
.ov-rank.r2 { background: rgba(180,180,180,0.15); color: #808090; }
.ov-rank.r3 { background: rgba(184,115,51,0.12); color: #a0602a; }
.ov-rank.rn { background: var(--bg-elevated); color: var(--text-muted); font-size: 10px; }
.ov-proj-body { flex: 1; min-width: 0; }
.ov-proj-name { font-size: 12px; font-weight: 500; color: var(--text-pri); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ov-proj-bar-wrap { height: 4px; background: var(--bg-elevated); border-radius: 2px; margin-top: 4px; overflow: hidden; }
.ov-proj-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--accent), var(--purple)); transition: width 0.4s ease; }
.ov-proj-cost { font-size: 12px; font-weight: 700; color: var(--accent); flex-shrink: 0; font-variant-numeric: tabular-nums; }

/* Token donut */
.ov-donut-wrap { display: flex; align-items: center; gap: 16px; flex: 1; }
.ov-donut-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.ov-legend-item { display: flex; align-items: center; gap: 8px; }
.ov-legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
.ov-legend-label { font-size: 11px; color: var(--text-sec); flex: 1; }
.ov-legend-pct { font-size: 11px; font-weight: 600; color: var(--text-pri); }

/* ── Shared ── */
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); }
.empty-icon { font-size: 40px; opacity: 0.25; }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-muted); }
.empty-subtitle { font-size: 12px; color: var(--text-muted); opacity: 0.7; }
.loading { flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 12px; gap: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 14px; height: 14px; border: 2px solid var(--border-muted); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
.no-results { padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px; }
${NOTES_CSS}
${TOOLS_CSS}
</style>
<script>${NOTES_MARKED}</script>
<script>${CODEMIRROR_BUNDLE}</script>
</head>
<body>
<div id="app">
  <!-- Nav -->
  <nav id="nav">
    <div class="nav-logo">CX</div>

    <div class="nav-item active" data-module="overview" onclick="switchModule('overview')">
      <div class="nav-item-icon">&#9671;</div>
      <div class="nav-item-label">&#27010;&#35272;</div>
      <div class="nav-tooltip">&#25968;&#25454;&#27010;&#35272;</div>
    </div>
    <div class="nav-item" data-module="history" onclick="switchModule('history')">
      <div class="nav-item-icon">&#9678;</div>
      <div class="nav-item-label">&#21382;&#21490;</div>
      <div class="nav-tooltip">&#20250;&#35805;&#21382;&#21490;</div>
    </div>
    <div class="nav-item" data-module="stats" onclick="switchModule('stats')">
      <div class="nav-item-icon">&#9638;</div>
      <div class="nav-item-label">&#32479;&#35745;</div>
      <div class="nav-tooltip">Token &#32479;&#35745;</div>
    </div>
    <div class="nav-item" data-module="plans" onclick="switchModule('plans')">
      <div class="nav-item-icon">&#9672;</div>
      <div class="nav-item-label">&#35745;&#21010;</div>
      <div class="nav-tooltip">&#35745;&#21010;&#25991;&#20214;</div>
    </div>
${TOOLS_NAV_ITEM}

    <div class="nav-spacer"></div>

    <div class="nav-item" id="theme-btn" onclick="toggleTheme()">
      <div class="nav-item-icon" id="theme-icon">&#9728;</div>
      <div class="nav-item-label" id="theme-label">&#27982;&#33394;</div>
      <div class="nav-tooltip" id="theme-tooltip">&#20999;&#25442;&#28145;&#33394;</div>
    </div>

    <!-- Mode dropdown: CX is active -->
    <div id="mode-switch" class="mode-dd" onclick="toggleModeMenu(event)">
      <div class="mode-dd-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L21.5 9.5l-9.5 12-9.5-12z" fill="currentColor"/>
        </svg>
      </div>
      <div class="mode-dd-label">CX</div>
      <div class="mode-dd-caret">&#9660;</div>
      <div class="mode-dd-menu" id="mode-dd-menu">
        <div class="mode-dd-menu-title">&#20999;&#25442;&#27169;&#24335;</div>
        <div class="mode-dd-opt" data-mode-opt="claude" onclick="event.stopPropagation();location.href='/'">
          <div class="mode-dd-opt-icon cc-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M7.5 6L3 12l4.5 6" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16.5 6L21 12l-4.5 6" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="mode-dd-opt-body">
            <div class="mode-dd-opt-name">Claude Code</div>
            <div class="mode-dd-opt-desc">&#27010;&#35272; &#183; &#21382;&#21490; &#183; &#32479;&#35745;</div>
          </div>
        </div>
        <div class="mode-dd-opt" data-mode-opt="codemaker" onclick="event.stopPropagation();location.href='/cm'">
          <div class="mode-dd-opt-icon cm-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L21.5 9.5l-9.5 12-9.5-12z" fill="white"/>
            </svg>
          </div>
          <div class="mode-dd-opt-body">
            <div class="mode-dd-opt-name">Codemaker</div>
            <div class="mode-dd-opt-desc">&#36153;&#29992; &#183; &#20250;&#35805;&#35760;&#24405;</div>
          </div>
        </div>
        <div class="mode-dd-opt current" data-mode-opt="codex" onclick="event.stopPropagation();location.href='/cx'">
          <div class="mode-dd-opt-icon cx-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L21.5 9.5l-9.5 12-9.5-12z" fill="white"/>
            </svg>
          </div>
          <div class="mode-dd-opt-body">
            <div class="mode-dd-opt-name">Codex</div>
            <div class="mode-dd-opt-desc">&#27010;&#35272; &#183; &#21382;&#21490; &#183; &#32479;&#35745;</div>
          </div>
          <span class="mode-dd-check">&#10003;</span>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main -->
  <div id="main">
    <div id="topbar">
      <div class="topbar-title" id="topbar-title">&#27010;&#35272;</div>
      <div class="topbar-badge">Codex</div>
      <div class="topbar-stats" id="topbar-stats"></div>
      <div class="topbar-flex"></div>
    </div>

    <div id="content">
      <!-- Overview Module -->
      <div id="mod-overview" class="module active">
        <div class="ov-scroll" id="ov-scroll">
          <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
        </div>
      </div>

      <!-- History Module -->
      <div id="mod-history" class="module">
        <div class="project-panel">
          <div class="panel-header"><span class="panel-header-text">&#39033;&#30446;</span><button class="panel-toggle-btn" title="&#25240;&#21472;&#38754;&#26495;" onclick="event.stopPropagation();togglePanelCollapse(this.closest('.project-panel'),'project')">&#9664;</button></div>
          <div class="panel-search-wrap">
            <input type="text" id="project-search" class="panel-search" placeholder="&#25628;&#32034;&#39033;&#30446;..." autocomplete="off">
          </div>
          <div class="panel-scroll" id="project-list">
            <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
          </div>
          <div class="panel-resize-handle"></div>
        </div>
        <div class="session-panel">
          <div class="panel-header"><span class="panel-header-text">&#20250;&#35805;</span><button class="panel-toggle-btn" title="&#25240;&#21472;&#38754;&#26495;" onclick="event.stopPropagation();togglePanelCollapse(this.closest('.session-panel'),'session')">&#9664;</button></div>
          <div class="panel-search-wrap">
            <input type="text" id="session-search" class="panel-search" placeholder="&#25628;&#32034;&#20250;&#35805;..." autocomplete="off">
          </div>
          <div class="panel-scroll" id="session-list" style="flex:1;overflow-y:auto;padding:4px;">
            <div class="session-empty">
              <div class="session-empty-icon">&#9678;</div>
              <div>&#36873;&#25321;&#19968;&#20010;&#39033;&#30446;</div>
            </div>
          </div>
          <div class="panel-resize-handle"></div>
        </div>
        <div class="message-panel">
          <div id="message-panel-content" class="message-empty">
            <div class="message-empty-icon">&#9671;</div>
            <div>&#36873;&#25321;&#19968;&#20010;&#20250;&#35805;&#26597;&#30475;&#23545;&#35805;</div>
          </div>
        </div>
      </div>

      <!-- Stats Module -->
      <div id="mod-stats" class="module" style="flex-direction:column;">
        <div style="display:flex;flex:1;overflow:hidden;min-height:0;">
          <div class="stats-list-panel">
            <div class="stats-panel-header">
              <div class="stats-panel-header-left">
                <div class="stats-panel-title">&#39033;&#30446;&#21015;&#34920;</div>
              </div>
              <button class="panel-toggle-btn always-show" title="&#25240;&#21472;&#38754;&#26495;" onclick="event.stopPropagation();togglePanelCollapse(this.closest('.stats-list-panel'),'stats')">&#9664;</button>
            </div>
            <div class="panel-search-wrap">
              <input type="text" id="stats-search" class="panel-search" placeholder="&#25628;&#32034;&#39033;&#30446;..." autocomplete="off">
            </div>
            <div id="stats-project-list" style="flex:1;overflow-y:auto;">
              <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
            </div>
            <div class="panel-resize-handle"></div>
          </div>
          <div class="stats-detail-panel" id="stats-detail-panel">
            <div class="empty-state">
              <div class="empty-icon" style="font-size:48px;opacity:0.15;">&#128202;</div>
              <div class="empty-title">&#36873;&#25321;&#19968;&#20010;&#39033;&#30446;</div>
              <div class="empty-subtitle">&#26597;&#30475; Token &#32479;&#35745;&#35814;&#24773;</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plans Module -->
      <div id="mod-plans" class="module">
        <div class="plans-list-panel">
          <div class="panel-header"><span class="panel-header-text">&#35745;&#21010;&#21015;&#34920;</span><button class="panel-toggle-btn" title="&#25240;&#21472;&#38754;&#26495;" onclick="event.stopPropagation();togglePanelCollapse(this.closest('.plans-list-panel'),'plans')">&#9664;</button></div>
          <div class="panel-search-wrap">
            <input type="text" id="plans-search" class="panel-search" placeholder="&#25628;&#32034;&#35745;&#21010;..." autocomplete="off">
          </div>
          <div class="panel-scroll" id="plans-list" style="flex:1;overflow-y:auto;padding:0;">
            <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
          </div>
          <div class="panel-resize-handle"></div>
        </div>
        <div class="plan-content-panel" id="plan-content-panel">
          <div class="empty-state">
            <div class="empty-icon">&#9672;</div>
            <div class="empty-title">&#36873;&#25321;&#19968;&#20010;&#35745;&#21010;</div>
            <div class="empty-subtitle">&#22312;&#24038;&#20391;&#21015;&#34920;&#20013;&#28857;&#20987;&#26597;&#30475;&#35814;&#24773;</div>
          </div>
        </div>
      </div>
${TOOLS_MODULE_HTML}
    </div>
  </div>
</div>
${NOTES_MODAL_HTML}

<script>
// ── State ──
const S = {
  activeModule: 'overview',
  overview: {
    data: null,
  },
  history: {
    data: null,
    selectedProject: null,
    selectedSession: null,
    pendingSession: null,  // { id, tokensUsed, title } — set by goToSession()
    projectQuery: '',
    sessionQuery: '',
    userOnly: false,
    fullscreen: false,
    convSession: null,   // { id, tokensUsed, title, msgs }
  },
  stats: {
    data: null,
    selectedProject: null,
    query: '',
  },
  plans: {
    data: null,
    selectedPlan: null,
    query: '',
  },
};

// ── Utils ──
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function highlight(text, q) {
  if (!q) return esc(text);
  const re = new RegExp(q.replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&'), 'gi');
  return esc(text).replace(re, m => '<mark>' + esc(m) + '</mark>');
}
function fmtDate(ms) {
  const d = new Date(ms);
  return (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.toTimeString().slice(0,5);
}
function fmtDateFull(ms) {
  const d = new Date(ms);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function fmtCost(usd) {
  if (usd >= 1) return '$' + usd.toFixed(2);
  return '$' + usd.toFixed(3);
}
function fmtTokens(n) {
  if (!n) return '0';
  if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return String(n);
}
function displayTitle(title) {
  return String(title || '').replace(/\s+/g, ' ').trim();
}
function shortSessionId(id) {
  const s = String(id || '');
  return s.length > 8 ? s.slice(0, 8) : s;
}
function relTime(ms) {
  const d = Math.floor((Date.now() - ms) / 86400000);
  if (d === 0) return '今天';
  if (d === 1) return '昨天';
  if (d < 30) return d + ' 天前';
  return Math.floor(d/30) + ' 个月前';
}
function actLevel(ms) {
  const d = (Date.now() - ms) / 86400000;
  return d < 7 ? 'active' : d < 30 ? 'recent' : 'old';
}
function unixMs(ts) {
  return ts && ts < 1000000000000 ? ts * 1000 : ts;
}

// ── Hash State ──
const VALID_MODULES = ['overview', 'history', 'stats', 'plans', 'tools'];
function parseHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return { module: 'overview', params: {} };
  const idx = raw.indexOf('&');
  if (idx === -1) {
    const m = raw.trim();
    return { module: VALID_MODULES.includes(m) ? m : 'overview', params: {} };
  }
  const m = raw.slice(0, idx).trim();
  const module = VALID_MODULES.includes(m) ? m : 'overview';
  const params = {};
  const pairs = raw.slice(idx + 1).split('&');
  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const key = decodeURIComponent(pair.slice(0, eq));
    const val = decodeURIComponent(pair.slice(eq + 1));
    if (key) params[key] = val;
  }
  return { module, params };
}
function buildHash(module, params) {
  const parts = [module];
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== undefined && v !== '') {
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  }
  return parts.length === 1 ? module : parts.join('&');
}
function updateHash(params) {
  const h = '#' + buildHash(S.activeModule, params);
  if (location.hash !== h) location.hash = h;
}

// ── Module switch ──
function switchModule(id, pushHash) {
  S.activeModule = id;
  if (pushHash !== false) {
    const h = '#' + id;
    if (location.hash !== h) location.hash = h;
  }
  document.querySelectorAll('.nav-item[data-module]').forEach(el => {
    el.classList.toggle('active', el.dataset.module === id);
  });
  document.querySelectorAll('.module').forEach(el => {
    el.classList.toggle('active', el.id === 'mod-' + id);
  });
  if (id === 'overview') {
    document.getElementById('topbar-title').textContent = '概览';
    updateOverviewTopbar();
    if (!S.overview.data) loadCxOverview(); else renderCxOverview();
  } else if (id === 'history') {
    document.getElementById('topbar-title').textContent = '历史';
    updateHistoryTopbar();
    if (!S.history.data) loadHistory();
    else {
      renderProjectList();
      if (S.history.pendingSession) {
        const ps = S.history.pendingSession;
        S.history.pendingSession = null;
        selectSession(ps.id, ps.tokensUsed, ps.title, ps.source);
        requestAnimationFrame(() => {
          const card = document.querySelector('.session-card.selected');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
      if (S.history._pendingHashSession) {
        const sid = S.history._pendingHashSession;
        S.history._pendingHashSession = null;
        const session = S.history.data.sessions.find(s => s.id === sid);
        if (session) {
          selectSession(session.id, session.tokensUsed, session.title, session.source);
          requestAnimationFrame(() => {
            const card = document.querySelector('.session-card.selected');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
      }
    }
  } else if (id === 'stats') {
    document.getElementById('topbar-title').textContent = '统计';
    updateStatsTopbar();
    if (!S.stats.data) loadStats(); else renderStatsProjectList();
  } else if (id === 'plans') {
    document.getElementById('topbar-title').textContent = '计划';
    updatePlansTopbar();
    if (!S.plans.data) loadPlans(); else renderPlansList();
  } else if (id === 'tools') {
    document.getElementById('topbar-title').textContent = '\u5de5\u5177\u7bb1';
    document.getElementById('topbar-stats').innerHTML = '';
  }
}

// Navigate from overview directly to a specific session
function goToSession(id, tokensUsed, title, source) {
  S.history.pendingSession = { id, tokensUsed, title, source };
  S.history.selectedProject = null;
  switchModule('history');
}

// ── Theme ──
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ccs-cx-theme', theme);
  var isDark = theme === 'dark';
  document.getElementById('theme-icon').textContent = isDark ? '☾' : '☀';
  document.getElementById('theme-label').textContent = isDark ? '深色' : '浅色';
  document.getElementById('theme-tooltip').textContent = isDark ? '切换浅色' : '切换深色';
}
function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}
(function initTheme() {
  var saved = localStorage.getItem('ccs-cx-theme');
  applyTheme(saved === 'dark' ? 'dark' : 'light');
})();

// ── Panel Resize ──
function initPanelResize(panel, storageKey, minW, maxW) {
  var handle = panel.querySelector('.panel-resize-handle');
  if (!handle) return;
  var startX, startW;
  function onDown(e) {
    if (panel.classList.contains('panel-collapsed')) return;
    e.preventDefault();
    startX = e.clientX;
    startW = panel.offsetWidth;
    document.body.classList.add('resizing');
    handle.classList.add('active');
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }
  function onMove(e) {
    var delta = e.clientX - startX;
    var newW = Math.max(minW, Math.min(maxW, startW + delta));
    panel.style.width = newW + 'px';
  }
  function onUp() {
    document.body.classList.remove('resizing');
    handle.classList.remove('active');
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    try { localStorage.setItem('ccs-panel-' + storageKey + '-width', panel.offsetWidth); } catch(e) {}
  }
  handle.addEventListener('mousedown', onDown);

  try {
    var saved = localStorage.getItem('ccs-panel-' + storageKey + '-width');
    if (saved) { var w = parseInt(saved, 10); if (w >= minW && w <= maxW) panel.style.width = w + 'px'; }
  } catch(e) {}
}

// ── Panel Collapse ──
function togglePanelCollapse(panel, storageKey) {
  if (!panel) return;
  var isCollapsed = panel.classList.contains('panel-collapsed');
  if (isCollapsed) {
    panel.classList.remove('panel-collapsed');
    try {
      var saved = localStorage.getItem('ccs-panel-' + storageKey + '-width');
      if (saved) { var w = parseInt(saved, 10); if (w >= 60) panel.style.width = w + 'px'; }
    } catch(e) {}
  } else {
    panel.classList.add('panel-collapsed');
  }
  try { localStorage.setItem('ccs-panel-' + storageKey + '-collapsed', isCollapsed ? '0' : '1'); } catch(e) {}
  var btn = panel.querySelector('.panel-toggle-btn');
  if (btn) btn.innerHTML = isCollapsed ? '&#9664;' : '&#9654;';
}

function initPanelCollapse(panel, storageKey) {
  try {
    var saved = localStorage.getItem('ccs-panel-' + storageKey + '-collapsed');
    if (saved === '1') {
      panel.classList.add('panel-collapsed');
      var btn = panel.querySelector('.panel-toggle-btn');
      if (btn) btn.innerHTML = '&#9654;';
    }
  } catch(e) {}
}

// ── Search listeners ──
document.getElementById('project-search').addEventListener('input', e => {
  S.history.projectQuery = e.target.value.trim();
  renderProjectList();
});
document.getElementById('session-search').addEventListener('input', e => {
  S.history.sessionQuery = e.target.value.trim();
  renderSessionList();
});
document.getElementById('stats-search').addEventListener('input', e => {
  S.stats.query = e.target.value.trim();
  renderStatsProjectList();
});
document.getElementById('plans-search').addEventListener('input', function(e) {
  S.plans.query = e.target.value.trim();
  renderPlansList();
});

// ════════════════════════════════════════════════════════════════
// HISTORY
// ════════════════════════════════════════════════════════════════

function updateHistoryTopbar() {
  const el = document.getElementById('topbar-stats');
  if (!S.history.data) { el.innerHTML = ''; return; }
  const d = S.history.data;
  el.innerHTML =
    '<div class="stat-chip">项目 <b>' + d.stats.totalProjects + '</b></div>' +
    '<div class="stat-chip">会话 <b>' + d.stats.totalSessions + '</b></div>' +
    '<div class="stat-chip">总 Token <b>' + fmtTokens(d.stats.totalTokens || 0) + '</b></div>';
}

async function loadHistory() {
  document.getElementById('project-list').innerHTML = '<div class="loading"><div class="spinner"></div> 加载中…</div>';
  try {
    const r = await fetch('/api/cx/history');
    S.history.data = await r.json();
    updateHistoryTopbar();
    renderProjectList();
    if (S.history.pendingSession) {
      const ps = S.history.pendingSession;
      S.history.pendingSession = null;
        selectSession(ps.id, ps.tokensUsed, ps.title, ps.source);
      requestAnimationFrame(() => {
        const card = document.querySelector('.session-card.selected');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    // Handle session restored from URL hash
    if (S.history._pendingHashSession) {
      const sid = S.history._pendingHashSession;
      S.history._pendingHashSession = null;
      const session = S.history.data.sessions.find(s => s.id === sid);
      if (session) {
          selectSession(session.id, session.tokensUsed, session.title, session.source);
        requestAnimationFrame(() => {
          const card = document.querySelector('.session-card.selected');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    }
  } catch(e) {
    document.getElementById('project-list').innerHTML = '<div class="no-results">加载失败</div>';
  }
}

function renderProjectList() {
  const el = document.getElementById('project-list');
  if (!S.history.data) return;
  const q = S.history.projectQuery.toLowerCase();
  const projects = S.history.data.projects.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.directory.toLowerCase().includes(q)
  );

  const allTokens = S.history.data.stats.totalTokens || 0;

  let html = '<div class="all-item' + (!S.history.selectedProject ? ' selected' : '') +
    '" onclick="selectProject(null)">' +
    '<div class="all-item-label"><span>&#9678;</span> 全部</div>' +
    '<div class="all-item-meta">' + S.history.data.stats.totalSessions + ' 个会话 · ' + fmtTokens(allTokens) + ' tokens</div>' +
    '</div>';

  for (const p of projects) {
    const activeMs = unixMs(p.lastActive);
    const level = actLevel(activeMs);
    const dotCls = level === 'active' ? 'dot-active' : level === 'recent' ? 'dot-recent' : 'dot-old';
    const sel = S.history.selectedProject === p.directory;
    html +=
      '<div class="project-item' + (sel ? ' selected' : '') + '" onclick="selectProject(' + esc(JSON.stringify(p.directory)) + ')">' +
        '<div class="project-dot ' + dotCls + '"></div>' +
        '<div class="project-info">' +
          '<div class="project-name">' + highlight(p.name, S.history.projectQuery) + '</div>' +
          '<div class="project-meta">' + relTime(activeMs) + '</div>' +
        '</div>' +
        '<div class="project-badge">' + p.sessionCount + '</div>' +
      '</div>';
  }
  if (!projects.length) html += '<div class="no-results">无匹配项目</div>';
  el.innerHTML = html;
  renderSessionList();
}

function selectProject(dir) {
  S.history.selectedProject = dir;
  S.history.selectedSession = null;
  renderProjectList();
  updateHash(dir ? { project: dir } : {});
}

function renderSessionList() {
  const el = document.getElementById('session-list');
  if (!S.history.data) return;
  const q = S.history.sessionQuery.toLowerCase();
  let sessions = S.history.data.sessions;
  if (S.history.selectedProject) {
    sessions = sessions.filter(s => s.cwd === S.history.selectedProject);
  }
  if (q) {
    sessions = sessions.filter(s =>
      s.title.toLowerCase().includes(q)
      || (s.cwd || '').toLowerCase().includes(q)
      || (s.projectName || '').toLowerCase().includes(q)
      || (s.model || '').toLowerCase().includes(q)
    );
  }

  if (!sessions.length) {
    el.innerHTML = '<div class="session-empty"><div class="session-empty-icon">&#9678;</div><div>无会话</div></div>';
    return;
  }

  let html = '';
  for (const s of sessions) {
    const sessionKey = s.source + ':' + s.id;
    const sel = S.history.selectedSession === sessionKey;
    const tokens = s.tokensUsed || 0;
    const estMsgCount = s.msgCount || Math.round(tokens / 500);
    html +=
      '<div class="session-card' + (sel ? ' selected' : '') + '" onclick="selectSession(' + esc(JSON.stringify(s.id)) + ',' + esc(JSON.stringify(tokens)) + ',' + esc(JSON.stringify(s.title)) + ',' + esc(JSON.stringify(s.source)) + ')">' +
        '<div class="session-top">' +
          '<div class="session-date">' + fmtDate(unixMs(s.timeCreated)) + '</div>' +
          (tokens > 0 ? '<div class="session-cost">' + fmtTokens(tokens) + '</div>' : '') +
        '</div>' +
        '<div class="session-title">' + highlight(s.title, q) + '</div>' +
        '<div class="session-meta">' +
          '<div class="session-id-chip" title="会话 ID: ' + esc(s.id) + '&#10;点击复制" onclick="copySessionId(' + esc(JSON.stringify(s.id)) + ', event)">#' + esc(shortSessionId(s.id)) + '</div>' +
          '<div class="session-slug">' + esc(s.model || s.projectName || '') + (s.source === 'orca' ? '<span class="session-source-badge">Orca</span>' : '') + (estMsgCount > 0 ? ' · ' + estMsgCount + ' 条消息' : '') + '</div>' +
        '</div>' +
      '</div>';
  }
  el.innerHTML = html;
}

function selectSession(id, tokensUsed, title, source) {
  S.history.selectedSession = source + ':' + id;
  renderSessionList();
  loadConversation(id, tokensUsed, title, source);
  const p = {};
  if (S.history.selectedProject) p.project = S.history.selectedProject;
  if (id) p.session = id;
  updateHash(p);
}

function copySessionId(id, event) {
  event.stopPropagation();
  const chip = event.currentTarget;
  const restore = () => chip.classList.remove('copied');
  const showCopied = () => {
    chip.classList.add('copied');
    chip.dataset.origText = chip.textContent;
    chip.textContent = '已复制 ✓';
    clearTimeout(chip._copyTimer);
    chip._copyTimer = setTimeout(() => {
      chip.textContent = chip.dataset.origText;
      restore();
    }, 1300);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(id).then(showCopied).catch(() => {});
  } else {
    try {
      const ta = document.createElement('textarea');
      ta.value = id; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      showCopied();
    } catch(_) {}
  }
}

async function copyConvPath() {
  var el = document.getElementById('conv-path-text');
  var path = el ? el.textContent : '';
  if (!path) return;
  try {
    await navigator.clipboard.writeText(path);
    var copied = document.getElementById('conv-path-copied');
    if (copied) { copied.classList.add('show'); setTimeout(function() { copied.classList.remove('show'); }, 1500); }
  } catch(_) {}
}

function messagePanelClass() {
  return 'message-panel' + (S.history.fullscreen ? ' fullscreen' : '');
}

const ICON_EXPAND = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
const ICON_SHRINK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';

function fullscreenButtonHtml() {
  return '<button id="conv-fullscreen-btn" class="conv-fullscreen-btn' + (S.history.fullscreen ? ' active' : '') + '" onclick="toggleConvFullscreen()" title="' + (S.history.fullscreen ? '退出全屏 (ESC)' : '全屏阅读 (F)') + '">' +
    (S.history.fullscreen ? ICON_SHRINK : ICON_EXPAND) +
    '</button>';
}

async function loadConversation(sessionId, tokensUsed, title, source) {
  const panel = document.getElementById('message-panel-content');
  const tokenHtml = tokensUsed > 0 ? '<div class="msg-panel-cost">' + fmtTokens(tokensUsed) + '</div>' : '';
  const safeTitle = displayTitle(title);
  panel.outerHTML = '<div id="message-panel-content" class="' + messagePanelClass() + '">' +
    '<div class="message-panel-header">' +
      '<div class="msg-panel-title" title="' + esc(safeTitle) + '">' + esc(safeTitle) + '</div>' + tokenHtml +
      fullscreenButtonHtml() +
    '</div>' +
    '<div class="conv-loading"><div class="spinner"></div> 加载对话…</div>' +
    '</div>';

  try {
    const r = await fetch('/api/cx/conversation?sessionId=' + encodeURIComponent(sessionId) + '&source=' + encodeURIComponent(source || 'default'));
    const data = await r.json();
    const msgs = Array.isArray(data) ? data : (data && data.messages ? data.messages : []);
    const convPath = data && data.path ? data.path : '';
    renderConversation(sessionId, tokensUsed, title, msgs, convPath);
  } catch(e) {
    document.getElementById('message-panel-content').innerHTML +=
      '<div class="no-results">加载失败</div>';
  }
}

function renderConversation(sessionId, tokensUsed, title, msgs, convPath) {
  // Store for re-render on filter toggle
  S.history.convSession = { id: sessionId, tokensUsed: tokensUsed, title: title, msgs: msgs, convPath: convPath };

  const tokenHtml = tokensUsed > 0 ? '<div class="msg-panel-cost">' + fmtTokens(tokensUsed) + '</div>' : '';
  const safeTitle = displayTitle(title);
  const filterActive = S.history.userOnly;
  const filterBtn =
    '<button id="conv-filter-btn" class="conv-filter-btn' + (filterActive ? ' active' : '') + '" onclick="toggleUserOnly()" title="只看用户输入">' +
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
      '仅看用户' +
    '</button>';
  const headerControls = '<div style="display:flex;align-items:center;gap:6px">' + filterBtn + fullscreenButtonHtml() + '</div>';
  const pathHtml = convPath ? '<div class="conv-path-row" onclick="copyConvPath()" title="' + esc(convPath) + '"><span>&#128196;</span><span class="conv-path-text" id="conv-path-text">' + esc(convPath) + '</span><span class="conv-path-copied" id="conv-path-copied">&#10003; 已复制</span></div>' : '';

  const panelEl = document.getElementById('message-panel-content');
  if (!msgs || msgs.length === 0) {
    panelEl.outerHTML = '<div id="message-panel-content" class="' + messagePanelClass() + '">' +
      '<div class="message-panel-header"><div class="msg-panel-title" title="' + esc(safeTitle) + '">' + esc(safeTitle) + '</div>' + tokenHtml + headerControls + '</div>' +
      '<div class="message-empty"><div class="message-empty-icon">&#9671;</div><div>无对话内容</div></div>' +
      pathHtml +
      '</div>';
    return;
  }

  let convHtml = '';
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i];
    const roleClass = m.role === 'user' ? 'conv-user' : 'conv-assistant';
    const roleLabel = m.role === 'user' ? 'You' : 'Codex';
    const id = 'cx-msg-' + i;
    const isAssistant = m.role === 'assistant';
    const long = m.text.length > 600;
    const bubbleContent = isAssistant ? renderMarkdown(m.text) : esc(m.text);

    let agentTag = '';
    if (m.agent) {
      agentTag = '<span class="conv-agent-tag ' + esc(m.agent) + '">' + esc(m.agent) + '</span>';
    }
    let msgTokens = '';
    if (m.tokensUsed && m.tokensUsed > 0) {
      msgTokens = '<span>' + fmtTokens(m.tokensUsed) + '</span>';
    }

    convHtml +=
      '<div class="conv-turn ' + roleClass + '">' +
        '<div class="conv-role-label">' + roleLabel + '</div>' +
        '<div class="conv-bubble' + (long ? ' collapsed' : '') + '" id="' + id + '">' +
          bubbleContent +
        '</div>' +
        '<div class="conv-meta">' + agentTag + msgTokens + '</div>' +
        (long ? '<span class="conv-expand" onclick="expandMsg(' + esc(JSON.stringify(id)) + ',this)">展开全文</span>' : '') +
      '</div>';
  }

  document.getElementById('message-panel-content').outerHTML =
    '<div id="message-panel-content" class="' + messagePanelClass() + '">' +
      '<div class="message-panel-header"><div class="msg-panel-title" title="' + esc(safeTitle) + '">' + esc(safeTitle) + '</div>' + tokenHtml + headerControls + '</div>' +
      '<div id="conv-body" class="conv-list' + (filterActive ? ' user-only' : '') + '">' + convHtml + '</div>' +
      pathHtml +
    '</div>';
}

function expandMsg(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('collapsed');
  btn.remove();
}

function toggleUserOnly() {
  S.history.userOnly = !S.history.userOnly;
  const btn = document.getElementById('conv-filter-btn');
  const list = document.getElementById('conv-body');
  if (btn) btn.classList.toggle('active', S.history.userOnly);
  if (list) list.classList.toggle('user-only', S.history.userOnly);
}

let _fsHintTimer = null;

function toggleConvFullscreen() {
  const panel = document.getElementById('message-panel-content');
  const btn   = document.getElementById('conv-fullscreen-btn');
  if (!panel || !panel.classList.contains('message-panel')) return;

  S.history.fullscreen = !S.history.fullscreen;
  panel.classList.toggle('fullscreen', S.history.fullscreen);

  if (btn) {
    btn.classList.toggle('active', S.history.fullscreen);
    btn.title = S.history.fullscreen ? '退出全屏 (ESC)' : '全屏阅读 (F)';
    btn.innerHTML = S.history.fullscreen ? ICON_SHRINK : ICON_EXPAND;
  }

  let hint = document.getElementById('conv-fs-hint');
  if (S.history.fullscreen) {
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'conv-fs-hint';
      hint.className = 'conv-fs-hint';
      hint.textContent = 'ESC 退出全屏';
      document.body.appendChild(hint);
    }
    clearTimeout(_fsHintTimer);
    hint.getBoundingClientRect();
    hint.classList.add('visible');
    _fsHintTimer = setTimeout(() => hint && hint.classList.remove('visible'), 2500);
  } else if (hint) {
    hint.classList.remove('visible');
  }
}

// ── Plans ──
async function loadPlans() {
  document.getElementById('plans-list').innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
  try {
    const r = await fetch('/api/cx/plans');
    S.plans.data = await r.json();
    renderPlansList();
    updatePlansTopbar();
    // If a plan was pre-selected (from hash), render its content
    if (S.plans.selectedPlan) {
      const plan = S.plans.data.plans.find(function(p) { return p.id === S.plans.selectedPlan; });
      if (plan) renderPlanContent(plan);
    }
  } catch(e) {
    document.getElementById('plans-list').innerHTML = '<div class="no-results">\\u52a0\\u8f7d\\u5931\\u8d25</div>';
  }
}

function updatePlansTopbar() {
  const el = document.getElementById('topbar-stats');
  if (!S.plans.data) { el.innerHTML = ''; return; }
  const s = S.plans.data.stats;
  el.innerHTML = [
    '<div class="stat-chip">\\u8ba1\\u5210 <b>' + s.total + '</b> \\u4e2a</div>',
    '<div class="stat-chip">\\u8fdb\\u884c\\u4e2d <b>' + s.active + '</b></div>',
    '<div class="stat-chip">\\u5df2\\u5b8c\\u6210 <b>' + s.completed + '</b></div>'
  ].join('');
}

function getFilteredPlans() {
  if (!S.plans.data) return [];
  const q = S.plans.query.toLowerCase();
  if (!q) return S.plans.data.plans;
  return S.plans.data.plans.filter(function(p) {
    return p.title.toLowerCase().indexOf(q) !== -1 ||
      p.projectName.toLowerCase().indexOf(q) !== -1 ||
      p.summary.toLowerCase().indexOf(q) !== -1 ||
      p.content.toLowerCase().indexOf(q) !== -1
  });
}

function renderPlansList() {
  var plans = getFilteredPlans();
  var sel = S.plans.selectedPlan;
  if (!plans.length) {
    document.getElementById('plans-list').innerHTML = '<div class="no-results">\\u6682\\u65e0\\u5339\\u914d\\u8ba1\\u5212</div>';
    return;
  }
  var q = S.plans.query;
  var html = '';
  for (var i = 0; i < plans.length; i++) {
    var p = plans[i];
    var modDate = relTime(p.timeUpdated * 1000);
    var statusLabel = p.status === 'active' ? '\\u8fdb\\u884c\\u4e2d' : '\\u5df2\\u5b8c\\u6210';
    var statusClass = p.status === 'active' ? 'active' : 'completed';
    html += '<div class="plan-card' + (p.id === sel ? ' selected' : '') + '" data-plan-id="' + esc(p.id) + '" onclick="selectPlan(this.dataset.planId)">';
    html += '<div class="plan-title">' + highlight(p.title, q) + '</div>';
    html += '<div class="plan-meta">';
    html += '<span class="plan-status-tag ' + statusClass + '">' + statusLabel + '</span>';
    html += '<span class="plan-project">' + esc(p.projectName) + '</span>';
    html += '<span class="plan-time">' + modDate + '</span>';
    html += '</div>';
    html += '<div class="plan-summary">' + esc(p.summary) + '</div>';
    html += '</div>';
  }
  document.getElementById('plans-list').innerHTML = html;
}

function selectPlan(planId) {
  S.plans.selectedPlan = planId;
  renderPlansList();
  var plan = S.plans.data.plans.find(function(p) { return p.id === planId; });
  renderPlanContent(plan);
  updateHash(planId ? { plan: planId } : {});
}

function renderPlanContent(plan) {
  var panel = document.getElementById('plan-content-panel');
  if (!plan) {
    panel.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9672;</div><div class="empty-title">\\u9009\\u62e9\\u4e00\\u4e2a\\u8ba1\\u5212</div></div>';
    return;
  }
  var modDate = new Date(plan.timeUpdated * 1000).toLocaleString('zh-CN');
  var statusLabel = plan.status === 'active' ? '\\u8fdb\\u884c\\u4e2d' : '\\u5df2\\u5b8c\\u6210';
  panel.innerHTML = '<div class="plan-content-header">' +
    '<div style="flex:1;min-width:0;">' +
    '<div class="plan-content-title">' + esc(plan.title) + '</div>' +
    '<div class="plan-content-meta">' + esc(plan.projectName) + ' \\u00b7 ' + statusLabel + ' \\u00b7 ' + modDate + '</div>' +
    '<div class="plan-path-row" onclick="copyPlanPath()" title="' + esc(plan.projectPath) + '"' + (plan.isTemp ? ' style="display:none"' : '') + '>' +
    '<span class="plan-path-label">&#128196;</span>' +
    '<span class="plan-path-text" id="plan-path-text">' + esc(plan.projectPath) + '</span>' +
    '<span class="plan-path-copied" id="plan-path-copied">\\u2713 \\u5df2\\u590d\\u5236</span>' +
    '</div>' +
    '</div>' +
    '<button class="plan-copy-btn" id="plan-copy-btn" onclick="copyPlanContent()">\\u590d\\u5236</button>' +
    '</div>' +
    '<div class="plan-content-scroll">' +
    '<div class="md-body">' + renderMarkdown(plan.content) + '</div>' +
    '</div>';
}

async function copyPlanContent() {
  var plan = S.plans.data && S.plans.data.plans.find(function(p) { return p.id === S.plans.selectedPlan; });
  if (!plan) return;
  var btn = document.getElementById('plan-copy-btn');
  var mdBody = document.querySelector('.md-body');
  function showCopied() {
    btn.textContent = '\\u5df2\\u590d\\u5236';
    btn.classList.add('copied');
    setTimeout(function() { btn.textContent = '\\u590d\\u5236'; btn.classList.remove('copied'); }, 1500);
  }
  try {
    if (window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html':  new Blob([mdBody ? mdBody.innerHTML : plan.content], { type: 'text/html' }),
          'text/plain': new Blob([plan.content], { type: 'text/plain' }),
        })
      ]);
    } else {
      await navigator.clipboard.writeText(plan.content);
    }
    showCopied();
  } catch(e) {
    try { await navigator.clipboard.writeText(plan.content); showCopied(); } catch(_) {}
  }
}

async function copyPlanPath() {
  var plan = S.plans.data && S.plans.data.plans.find(function(p) { return p.id === S.plans.selectedPlan; });
  if (!plan || !plan.projectPath) return;
  try {
    await navigator.clipboard.writeText(plan.projectPath);
    var el = document.getElementById('plan-path-copied');
    if (el) { el.classList.add('show'); setTimeout(function() { el.classList.remove('show'); }, 1500); }
  } catch(_) {}
}

// ── Markdown renderer ──
function renderMarkdown(md) {
  const lines = md.split('\\n');
  let html = '';
  let i = 0;
  let inList = false;
  let listType = '';
  let inTable = false;

  function closeList() {
    if (inList) { html += '</' + listType + '>'; inList = false; listType = ''; }
  }
  function closeTable() {
    if (inTable) { html += '</table>'; inTable = false; }
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('\`\`\`')) {
      closeList(); closeTable();
      const lang = line.slice(3).trim();
      let code = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('\`\`\`')) {
        code += esc(lines[i]) + '\\n';
        i++;
      }
      const langLabel = lang ? '<div class="md-lang">' + esc(lang) + '</div>' : '';
      html += '<pre>' + langLabel + '<code>' + code + '</code></pre>';
      i++;
      continue;
    }
    if (/^[-*_]{3,}$/.test(line.trim())) {
      closeList(); closeTable();
      html += '<hr>';
      i++; continue;
    }

    const hm = line.match(/^(#{1,6})\\s+(.+)/);
    if (hm) {
      closeList(); closeTable();
      const level = hm[1].length;
      html += '<h' + level + '>' + inlineMarkdown(hm[2]) + '</h' + level + '>';
      i++; continue;
    }

    if (line.includes('|') && line.trim().startsWith('|')) {
      closeList();
      const cells = line.trim().split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) {
        inTable = true;
        html += '<table>';
        html += '<tr>' + cells.map(c => '<th>' + inlineMarkdown(c.trim()) + '</th>').join('') + '</tr>';
        i++;
        if (i < lines.length && /^\\|?[\\s:|-]+\\|/.test(lines[i])) i++;
        continue;
      } else {
        html += '<tr>' + cells.map(c => '<td>' + inlineMarkdown(c.trim()) + '</td>').join('') + '</tr>';
        i++; continue;
      }
    } else if (inTable) {
      closeTable();
    }

    const ulm = line.match(/^(\\s*)[*\\-+]\\s+(.+)/);
    const olm = line.match(/^(\\s*)\\d+\\.\\s+(.+)/);
    if (ulm) {
      if (!inList || listType !== 'ul') { closeList(); html += '<ul>'; inList = true; listType = 'ul'; }
      html += '<li>' + inlineMarkdown(ulm[2]) + '</li>';
      i++; continue;
    } else if (olm) {
      if (!inList || listType !== 'ol') { closeList(); html += '<ol>'; inList = true; listType = 'ol'; }
      html += '<li>' + inlineMarkdown(olm[2]) + '</li>';
      i++; continue;
    } else {
      closeList();
    }

    if (line.startsWith('> ')) {
      closeTable();
      html += '<blockquote><p>' + inlineMarkdown(line.slice(2)) + '</p></blockquote>';
      i++; continue;
    }

    if (!line.trim()) {
      closeList(); closeTable();
      i++; continue;
    }

    closeTable();
    html += '<p>' + inlineMarkdown(line) + '</p>';
    i++;
  }
  closeList();
  closeTable();
  return html;
}

function inlineMarkdown(text) {
  return esc(text)
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
    .replace(/\`(.+?)\`/g, '<code>$1</code>')
    .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');
}

// ════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════

function updateStatsTopbar() {
  const el = document.getElementById('topbar-stats');
  if (!S.stats.data) { el.innerHTML = ''; return; }
  const s = S.stats.data.summary;
  el.innerHTML =
    '<div class="stat-chip">总 Token <b>' + fmtTokens(s.totalTokens || 0) + '</b></div>' +
    '<div class="stat-chip">项目 <b>' + s.totalProjects + '</b></div>' +
    '<div class="stat-chip">会话 <b>' + s.totalSessions + '</b></div>';
}

async function loadStats() {
  document.getElementById('stats-project-list').innerHTML = '<div class="loading"><div class="spinner"></div> 加载中…</div>';
  try {
    const r = await fetch('/api/cx/stats');
    S.stats.data = await r.json();
    updateStatsTopbar();
    renderStatsProjectList();
    // If a project was pre-selected (from hash), render its detail
    if (S.stats.selectedProject) {
      const p = S.stats.data.projects.find(x => x.directory === S.stats.selectedProject);
      if (p) renderStatsDetail(p);
    }
  } catch(e) {
    document.getElementById('stats-project-list').innerHTML = '<div class="no-results">加载失败</div>';
  }
}

function renderStatsProjectList() {
  const el = document.getElementById('stats-project-list');
  if (!S.stats.data) return;
  const q = S.stats.query.toLowerCase();
  const projects = S.stats.data.projects.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.directory.toLowerCase().includes(q)
  );
  if (!projects.length) {
    el.innerHTML = '<div class="no-results">无匹配项目</div>';
    return;
  }
  const maxTokens = projects[0].totalTokens || 1;
  let html = '';
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const rankCls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const sel = S.stats.selectedProject === p.directory;
    const pct = Math.max(2, Math.round((p.totalTokens / maxTokens) * 100));
    html +=
      '<div class="stats-proj-item' + (sel ? ' selected' : '') + '" onclick="selectStatsProject(' + esc(JSON.stringify(p.directory)) + ')">' +
        '<div class="stats-proj-rank ' + rankCls + '">' + (i+1) + '</div>' +
        '<div class="stats-proj-main">' +
          '<div class="stats-proj-name">' + highlight(p.name, S.stats.query) + '</div>' +
          '<div class="stats-proj-path">' + (p.isTemp ? '—' : esc(p.directory)) + '</div>' +
          '<div class="stats-proj-bar"><div class="stats-proj-bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div class="stats-proj-nums">' +
          '<div class="stats-proj-cost">' + fmtTokens(p.totalTokens) + '</div>' +
          '<div class="stats-proj-sessions">' + p.sessionCount + ' 会话</div>' +
        '</div>' +
      '</div>';
  }
  el.innerHTML = html;
}

function selectStatsProject(dir) {
  S.stats.selectedProject = dir;
  renderStatsProjectList();
  const p = S.stats.data.projects.find(x => x.directory === dir);
  if (p) renderStatsDetail(p);
  updateHash(dir ? { project: dir } : {});
}

function renderStatsDetail(p) {
  const el = document.getElementById('stats-detail-panel');

  // Metric cards (token-based for Codex)
  const cards = [
    { cls: 'mc-cost',   icon: '&#128200;', label: '总 Token', value: fmtTokens(p.totalTokens || 0), sub: p.sessionCount + ' 个会话' },
    { cls: 'mc-sess',   icon: '&#128172;', label: '会话数', value: String(p.sessionCount), sub: '最后活跃 ' + (p.lastActive || '-') },
  ];
  let metricsHtml = '<div class="metric-grid" style="grid-template-columns:repeat(2,1fr);">';
  for (const c of cards) {
    metricsHtml +=
      '<div class="metric-card ' + c.cls + '">' +
        '<div class="metric-label">' + c.label + '</div>' +
        '<div class="metric-value">' + c.value + '</div>' +
        (c.sub ? '<div class="metric-sub">' + esc(c.sub) + '</div>' : '') +
      '</div>';
  }
  metricsHtml += '</div>';

  // Daily chart (token-based)
  const daily = p.daily || [];
  let chartHtml = '';
  if (daily.length > 0) {
    const maxVal = Math.max(...daily.map(d => d.tokensUsed || 0), 1);
    let bars = '', labels = '';
    for (const d of daily) {
      const tok = d.tokensUsed || 0;
      const h = Math.max(2, Math.round((tok / maxVal) * 56));
      bars += '<div class="daily-bar-col" title="' + d.date + ': ' + fmtTokens(tok) + '">' +
        '<div class="daily-bar-fill" style="height:' + h + 'px"></div></div>';
      labels += '<div class="daily-chart-label-col">' + d.date.slice(5) + '</div>';
    }
    chartHtml =
      '<div class="stats-section">' +
        '<div class="stats-section-title">每日 Token 用量</div>' +
        '<div class="daily-chart-labels">' + labels + '</div>' +
        '<div class="daily-chart">' + bars + '</div>' +
        '<table class="daily-table">' +
          '<thead><tr><th>日期</th><th>Token</th><th>会话</th></tr></thead>' +
          '<tbody>' + daily.slice().reverse().map(d =>
            '<tr><td>' + d.date + '</td><td>' + fmtTokens(d.tokensUsed || 0) + '</td><td>' + d.sessions + '</td></tr>'
          ).join('') +
          '</tbody>' +
        '</table>' +
      '</div>';
  }

  // Session rows
  const sessions = (p.sessions || []).slice(0, 30);
  let sessHtml = '';
  if (sessions.length) {
    let rows = '';
    for (const s of sessions) {
      rows +=
        '<div class="srow">' +
          '<div class="srow-cost">' + fmtTokens(s.tokensUsed || 0) + '</div>' +
          '<div class="srow-title" title="' + esc(s.title) + '">' + esc(s.title) + '</div>' +
          '<div class="srow-time">' + (s.date || '') + '</div>' +
        '</div>';
    }
    sessHtml =
      '<div class="stats-section">' +
        '<div class="stats-section-title">会话列表</div>' +
        '<div class="session-rows">' + rows + '</div>' +
      '</div>';
  }

  el.innerHTML =
    '<div class="stats-detail-head">' +
      '<div class="stats-detail-title">' + esc(p.name) + '</div>' +
      '<div class="stats-detail-path">' + (p.isTemp ? '—' : esc(p.directory)) + '</div>' +
      '<div class="stats-detail-meta">最后活跃：' + esc(p.lastActive) + '</div>' +
    '</div>' +
    '<div class="stats-detail-scroll">' +
      metricsHtml + chartHtml + sessHtml +
    '</div>';
}

// ════════════════════════════════════════════════════════════════
// OVERVIEW
// ════════════════════════════════════════════════════════════════

function updateOverviewTopbar() {
  const el = document.getElementById('topbar-stats');
  if (!S.overview.data) { el.innerHTML = ''; return; }
  const k = S.overview.data.kpi;
  el.innerHTML =
    '<div class="stat-chip">总 Token <b>' + fmtTokens(k.totalTokens || 0) + '</b></div>' +
    '<div class="stat-chip">项目 <b>' + k.totalProjects + '</b></div>' +
    '<div class="stat-chip">会话 <b>' + k.totalSessions + '</b></div>';
}

async function loadCxOverview() {
  const el = document.getElementById('ov-scroll');
  el.innerHTML = '<div class="loading"><div class="spinner"></div> 加载中…</div>';
  try {
    const r = await fetch('/api/cx/overview');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    S.overview.data = await r.json();
    updateOverviewTopbar();
    renderCxOverview();
  } catch(e) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9888;</div><div class="empty-title">加载失败</div><div class="empty-subtitle">' + String(e) + '</div></div>';
  }
}

function renderCxOverview() {
  const d = S.overview.data;
  const el = document.getElementById('ov-scroll');
  if (!d || d.noData) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon" style="font-size:48px;opacity:0.15;">&#128202;</div><div class="empty-title">暂无数据</div><div class="empty-subtitle">请先使用 Codex 进行开发</div></div>';
    return;
  }

  const k = d.kpi;

  // ── KPI Cards ──────────────────────────────────────────────────
  const kpiDefs = [
    { cls: 'kc-amber',  icon: '&#128200;', label: '总 Token',
      value: fmtTokens(k.totalTokens || 0),
      sub: '今日 <b>' + fmtTokens(k.todayTokens || 0) + '</b>&nbsp;&nbsp;本周 <b>' + fmtTokens(k.weekTokens || 0) + '</b>' },
    { cls: 'kc-green',  icon: '&#128193;', label: '活跃项目',
      value: String(k.totalProjects),
      sub: '7天内活跃 <b>' + (k.activeProjects7d || 0) + '</b> 个' },
    { cls: 'kc-purple', icon: '&#128172;', label: '总会话数',
      value: String(k.totalSessions),
      sub: '本月 <b>' + (k.monthSessions || 0) + '</b> 次' },
    { cls: 'kc-blue',   icon: '&#9999;&#65039;', label: '使用 Token',
      value: fmtTokens(k.totalTokens || 0),
      sub: '' },
  ];
  let kpiHtml = '<div class="ov-kpi-grid">';
  for (const c of kpiDefs) {
    kpiHtml +=
      '<div class="ov-kpi-card ' + c.cls + '">' +
        '<div class="ov-kpi-head">' +
          '<div class="ov-kpi-label">' + c.label + '</div>' +
          '<div class="ov-kpi-icon">' + c.icon + '</div>' +
        '</div>' +
        '<div class="ov-kpi-value">' + c.value + '</div>' +
        (c.sub ? '<div class="ov-kpi-sub">' + c.sub + '</div>' : '') +
      '</div>';
  }
  kpiHtml += '</div>';

  // ── 7-Day Trend Chart (token-based) ─────────────────────────────
  const trend = d.trend7Days || [];
  let trendHtml = '';
  if (trend.length > 0) {
    const maxTok = Math.max(...trend.map(t => t.tokensUsed || 0), 1);

    // Render as horizontal bars instead of SVG line chart for simplicity
    let barsHtml = '';
    for (const t of trend) {
      const tok = t.tokensUsed || 0;
      const pct = Math.max(2, Math.round((tok / maxTok) * 100));
      barsHtml +=
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
          '<div style="width:46px;font-size:11px;color:var(--text-muted);text-align:right;flex-shrink:0;">' + t.date.slice(5) + '</div>' +
          '<div style="flex:1;height:18px;background:var(--bg-elevated);border-radius:4px;overflow:hidden;">' +
            '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:4px;transition:width 0.3s;"></div>' +
          '</div>' +
          '<div style="width:56px;font-size:11px;font-weight:600;color:var(--text-pri);text-align:right;flex-shrink:0;">' + fmtTokens(tok) + '</div>' +
        '</div>';
    }
    trendHtml =
      '<div class="ov-card">' +
        '<div class="ov-card-title"><div class="ov-card-dot" style="background:var(--accent)"></div>7 日 Token 趋势</div>' +
        '<div>' + barsHtml + '</div>' +
      '</div>';
  }

  // ── Recent Sessions ──────────────────────────────────────────────
  let sessItems = '';
  if (!d.recentSessions || d.recentSessions.length === 0) {
    sessItems = '<div style="color:var(--text-muted);font-size:12px;padding:4px 0;">暂无会话记录</div>';
  } else {
    for (const s of d.recentSessions) {
      const tok = s.tokensUsed || 0;
      sessItems +=
        '<div class="ov-sess-item" onclick="goToSession(' + esc(JSON.stringify(s.id)) + ',' + esc(JSON.stringify(tok)) + ',' + esc(JSON.stringify(s.title)) + ',' + esc(JSON.stringify(s.source)) + ')" style="cursor:pointer">' +
          '<div class="ov-sess-dot"></div>' +
          '<div class="ov-sess-body">' +
            '<div class="ov-sess-title">'+esc(s.title)+'</div>' +
            '<div class="ov-sess-meta">'+esc(s.projectName || '')+' &middot; '+relTime(unixMs(s.timeUpdated))+'</div>' +
          '</div>' +
          '<div class="ov-sess-cost">'+fmtTokens(tok)+'</div>' +
        '</div>';
    }
  }
  const recentHtml =
    '<div class="ov-card">' +
      '<div class="ov-card-title"><div class="ov-card-dot" style="background:var(--purple)"></div>最近会话</div>' +
      '<div class="ov-sess-list">'+sessItems+'</div>' +
    '</div>';

  // ── Top Projects ─────────────────────────────────────────────────
  const maxProjTokens = d.topProjects && d.topProjects.length > 0 ? (d.topProjects[0].totalTokens || 1) : 1;
  const rankCls = ['r1','r2','r3','rn','rn'];
  let projItems = '';
  if (d.topProjects) {
    for (let i = 0; i < d.topProjects.length; i++) {
      const p = d.topProjects[i];
      const pct = maxProjTokens > 0 ? ((p.totalTokens || 0) / maxProjTokens * 100).toFixed(1) : '0';
      projItems +=
        '<div class="ov-proj-item">' +
          '<div class="ov-rank '+(rankCls[i]||'rn')+'">'+(i+1)+'</div>' +
          '<div class="ov-proj-body">' +
            '<div class="ov-proj-name" title="'+(p.isTemp ? '' : esc(p.directory || ''))+'">'+esc(p.name)+'</div>' +
            '<div class="ov-proj-bar-wrap"><div class="ov-proj-bar-fill" style="width:'+pct+'%"></div></div>' +
          '</div>' +
          '<div class="ov-proj-cost">'+fmtTokens(p.totalTokens || 0)+'</div>' +
        '</div>';
    }
  }
  const topProjHtml =
    '<div class="ov-card">' +
      '<div class="ov-card-title"><div class="ov-card-dot" style="background:#34d399"></div>项目 Token 排行</div>' +
      '<div class="ov-proj-list">'+projItems+'</div>' +
    '</div>';

  // ── Assemble (no token donut for cx) ────────────────────────────
  el.innerHTML =
    kpiHtml +
    (trendHtml ? '<div class="ov-row ov-row-2-1">' + trendHtml + recentHtml + '</div>' :
                 '<div class="ov-row ov-row-1-1">' + recentHtml + topProjHtml + '</div>') +
    (trendHtml ? '<div class="ov-row" style="grid-template-columns:1fr;">' + topProjHtml + '</div>' : '');
}

// ── Mode Dropdown ──
function initModeDropdown() {
  const modes = window.CCS_MODES ?? ['claude'];
  document.querySelectorAll('[data-mode-opt]').forEach(el => {
    el.style.display = modes.includes(el.dataset.modeOpt) ? '' : 'none';
  });
  const sw = document.getElementById('mode-switch');
  if (sw) sw.style.display = modes.length > 1 ? 'flex' : 'none';
}
function toggleModeMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('mode-dd-menu');
  const btn  = document.getElementById('mode-switch');
  if (!menu) return;
  const isOpen = !menu.classList.contains('open');
  menu.classList.toggle('open', isOpen);
  if (btn) btn.classList.toggle('open', isOpen);
}
document.addEventListener('click', () => {
  const menu = document.getElementById('mode-dd-menu');
  const btn  = document.getElementById('mode-switch');
  if (menu) menu.classList.remove('open');
  if (btn)  btn.classList.remove('open');
});

// ── Init ──
function moduleFromHash() {
  return parseHash().module;
}
function restoreStateFromHash(module, params) {
  if (module === 'history') {
    if (params.project) {
      S.history.selectedProject = params.project;
      renderProjectList();
    }
    if (params.session) {
      S.history._pendingHashSession = params.session;
    }
    if (params.project || params.session) {
      if (!S.history.data) loadHistory();
    }
  } else if (module === 'stats') {
    if (params.tab) {
      S.stats.activeTab = params.tab;
      document.querySelectorAll('.stats-tab').forEach(function(el) {
        el.classList.toggle('active', el.dataset.tab === params.tab);
      });
      var tokenPanel = document.getElementById('stats-token-panel');
      var skillPanel = document.getElementById('stats-skill-panel');
      if (tokenPanel) tokenPanel.style.display = params.tab === 'tokens' ? 'flex' : 'none';
      if (skillPanel) skillPanel.style.display = params.tab === 'skills' ? 'flex' : 'none';
    }
    if (params.project) {
      S.stats.selectedProject = params.project;
    }
    if (params.skill) {
      S.stats.selectedSkill = params.skill;
    }
  } else if (module === 'plans') {
    if (params.plan) {
      S.plans.selectedPlan = params.plan;
    }
  } else if (module === 'tools') {
    if (params.tool) {
      window._pendingToolSelect = params.tool;
    }
    if (params.note) {
      window._pendingNoteSelect = params.note;
    }
    if (params.link) {
      window._pendingLinkSelect = params.link;
    }
    if (params.file) {
      window._pendingFileSelect = params.file;
    }
    if (params.tab) {
      window._pendingNotesTab = params.tab;
    }
  } else if (module === 'notes') {
    if (params.note) {
      window._pendingNoteSelect = params.note;
    }
    if (params.link) {
      window._pendingLinkSelect = params.link;
    }
    if (params.file) {
      window._pendingFileSelect = params.file;
    }
    if (params.tab) {
      window._pendingNotesTab = params.tab;
    }
  }
}
window.addEventListener('load', () => {
  initModeDropdown();

  // ── Panel init ──
  initPanelCollapse(document.querySelector('.project-panel'), 'project');
  initPanelCollapse(document.querySelector('.session-panel'), 'session');
  initPanelCollapse(document.querySelector('.stats-list-panel'), 'stats');
  initPanelCollapse(document.querySelector('.plans-list-panel'), 'plans');
  initPanelResize(document.querySelector('.project-panel'), 'project', 120, 500);
  initPanelResize(document.querySelector('.session-panel'), 'session', 120, 500);
  initPanelResize(document.querySelector('.stats-list-panel'), 'stats', 120, 500);
  initPanelResize(document.querySelector('.plans-list-panel'), 'plans', 120, 500);

  // Initialize tools module (hooked into switchModule)
  toolsInit();
  toolsHookSwitchModule();

  const { module, params } = parseHash();
  // Restore state BEFORE switchModule so hooks can use pending params
  restoreStateFromHash(module, params);
  switchModule(module, false);
  window.addEventListener('hashchange', () => {
    const { module: m, params: p } = parseHash();
    if (m !== S.activeModule) {
      restoreStateFromHash(m, p);
      switchModule(m, false);
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && S.history.fullscreen) {
      toggleConvFullscreen();
      return;
    }
    if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        if (S.activeModule === 'history' && S.history.selectedSession) {
          toggleConvFullscreen();
        }
      }
    }
  });
});
// ── 通用原生文件选择器（供笔记/JSON模块复用） ──
function pickNativePath(type, callback) {
  fetch('/api/pick-path', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: type })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.path && callback) callback(data.path);
  }).catch(function() {});
}
${NOTES_JS}
${TOOLS_JS}
</script>
</body>
</html>`
