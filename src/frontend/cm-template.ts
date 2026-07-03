/**
 * Codemaker mode — single-file SPA.
 * Two modules: History (default) and Stats.
 * Data comes from opencode.db via /api/cm/* endpoints.
 */
import { NOTES_CSS, NOTES_NAV_ITEM, NOTES_MODULE_HTML, NOTES_MODAL_HTML, NOTES_JS, NOTES_MARKED } from './notes-module.js'

export const CM_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>cc-show · Codemaker</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Themes ── */
:root {
  --bg-base:      #f4f5f9;
  --bg-surface:   #ffffff;
  --bg-elevated:  #eceef6;
  --bg-hover:     #e4e8f4;
  --bg-selected:  #dce5ff;
  --border-sub:   #e5e8f0;
  --border-muted: #cdd2e4;
  --border-acc:   #e8c8a8;
  --text-pri:     #1a1c2e;
  --text-sec:     #4a5070;
  --text-muted:   #9098b8;
  /* Codemaker accent: amber/orange instead of blue */
  --accent:       #d97706;
  --accent-dim:   rgba(217,119,6,0.10);
  --accent-glow:  rgba(217,119,6,0.20);
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
  --bg-selected:  #2a1f0a;
  --border-sub:   #1a1c2e;
  --border-muted: #252840;
  --border-acc:   #7a5020;
  --text-pri:     #e0e2f0;
  --text-sec:     #8890b0;
  --text-muted:   #454868;
  --accent:       #f59e0b;
  --accent-dim:   rgba(245,158,11,0.12);
  --accent-glow:  rgba(245,158,11,0.25);
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
  background: linear-gradient(135deg, #d97706 0%, #7c3aed 100%);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700; color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(217,119,6,0.35);
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
.session-slug { font-size: 10px; color: var(--text-muted); }

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
.msg-panel-title { font-size: 13px; font-weight: 600; color: var(--text-pri); flex: 1; min-width: 0; }
.msg-panel-cost {
  font-size: 12px; font-weight: 700; color: var(--accent);
  background: var(--accent-dim); border-radius: 6px;
  padding: 3px 9px; border: 1px solid var(--border-acc); flex-shrink: 0;
}
.message-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; color: var(--text-muted); font-size: 12px;
}
.message-empty-icon { font-size: 32px; opacity: 0.3; }

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
.conv-agent-tag.plan    { background: rgba(217,119,6,0.12); color: var(--accent); }
.conv-agent-tag.explore { background: var(--purple-dim); color: var(--purple); }
.conv-expand { font-size: 11px; color: var(--accent); cursor: pointer; margin-top: 3px; display: inline-block; }
.conv-expand:hover { text-decoration: underline; }
.msg-filter-btn {
  font-size: 11px; padding: 3px 10px; border-radius: 10px;
  border: 1px solid var(--border-muted); cursor: pointer;
  color: var(--text-sec); background: var(--bg-elevated);
  font-family: inherit; white-space: nowrap; flex-shrink: 0;
  transition: all 0.15s;
}
.msg-filter-btn:hover { border-color: var(--accent); color: var(--accent); }
.msg-filter-btn.active {
  background: var(--accent-dim); border-color: var(--border-acc);
  color: var(--accent); font-weight: 600;
}
.conv-loading { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); font-size: 12px; }

mark { background: rgba(251,191,36,0.2); color: var(--yellow); border-radius: 2px; padding: 0 1px; }

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
.ov-kpi-card.kc-amber::before { background: linear-gradient(90deg, #d97706, #f59e0b); }
.ov-kpi-card.kc-green::before  { background: linear-gradient(90deg, #16a34a, #34d399); }
.ov-kpi-card.kc-purple::before { background: linear-gradient(90deg, #7c3aed, #a78bfa); }
.ov-kpi-card.kc-blue::before   { background: linear-gradient(90deg, #2563eb, #60a5fa); }

.ov-kpi-head { display: flex; align-items: center; justify-content: space-between; }
.ov-kpi-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.ov-kpi-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.ov-kpi-card.kc-amber .ov-kpi-icon { background: rgba(217,119,6,0.12); }
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
</style>
<script>${NOTES_MARKED}</script>
</head>
<body>
<div id="app">
  <!-- Nav -->
  <nav id="nav">
    <div class="nav-logo">CM</div>

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
      <div class="nav-tooltip">Token &#19982;&#36153;&#29992;&#32479;&#35745;</div>
    </div>
${NOTES_NAV_ITEM}

    <div class="nav-spacer"></div>

    <div class="nav-item" id="theme-btn" onclick="toggleTheme()">
      <div class="nav-item-icon" id="theme-icon">&#9728;</div>
      <div class="nav-item-label" id="theme-label">&#27982;&#33394;</div>
      <div class="nav-tooltip" id="theme-tooltip">&#20999;&#25442;&#28145;&#33394;</div>
    </div>

    <!-- Mode dropdown: CM is active -->
    <div id="mode-switch" class="mode-dd" onclick="toggleModeMenu(event)">
      <div class="mode-dd-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L21.5 9.5l-9.5 12-9.5-12z" fill="currentColor"/>
        </svg>
      </div>
      <div class="mode-dd-label">CM</div>
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
        <div class="mode-dd-opt current" data-mode-opt="codemaker" onclick="event.stopPropagation();location.href='/cm'">
          <div class="mode-dd-opt-icon cm-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L21.5 9.5l-9.5 12-9.5-12z" fill="white"/>
            </svg>
          </div>
          <div class="mode-dd-opt-body">
            <div class="mode-dd-opt-name">Codemaker</div>
            <div class="mode-dd-opt-desc">&#36153;&#29992; &#183; &#20250;&#35805;&#35760;&#24405;</div>
          </div>
          <span class="mode-dd-check">&#10003;</span>
        </div>
        <div class="mode-dd-opt" data-mode-opt="codex" onclick="event.stopPropagation();location.href='/cx'">
          <div class="mode-dd-opt-icon cx-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L21.5 9.5l-9.5 12-9.5-12z" fill="white"/>
            </svg>
          </div>
          <div class="mode-dd-opt-body">
            <div class="mode-dd-opt-name">Codex</div>
            <div class="mode-dd-opt-desc">&#27010;&#35272; &#183; &#21382;&#21490; &#183; &#32479;&#35745;</div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main -->
  <div id="main">
    <div id="topbar">
      <div class="topbar-title" id="topbar-title">&#27010;&#35272;</div>
      <div class="topbar-badge">Codemaker</div>
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
              <div class="empty-subtitle">&#26597;&#30475;&#36153;&#29992;&#32479;&#35745;&#35814;&#24773;</div>
            </div>
          </div>
        </div>
      </div>
${NOTES_MODULE_HTML}
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
    pendingSession: null,  // { id, costUsd, title } — set by goToSession()
    projectQuery: '',
    sessionQuery: '',
    userOnly: false,
    convSession: null,   // { id, costUsd, title, msgs }
  },
  stats: {
    data: null,
    selectedProject: null,
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

// ── Hash State ──
const VALID_MODULES = ['overview', 'history', 'stats', 'notes'];
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
    if (!S.overview.data) loadCmOverview(); else renderCmOverview();
  } else if (id === 'history') {
    document.getElementById('topbar-title').textContent = '历史';
    updateHistoryTopbar();
    if (!S.history.data) loadHistory();
    else {
      renderProjectList();
      if (S.history.pendingSession) {
        const ps = S.history.pendingSession;
        S.history.pendingSession = null;
        selectSession(ps.id, ps.costUsd, ps.title);
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
          selectSession(session.id, session.totalCostUsd, session.title);
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
  } else if (id === 'notes') {
    document.getElementById('topbar-title').textContent = '\u7b14\u8bb0';
    document.getElementById('topbar-stats').innerHTML = '';
  }
}

// Navigate from overview directly to a specific session
function goToSession(id, costUsd, title) {
  S.history.pendingSession = { id, costUsd, title };
  S.history.selectedProject = null;
  switchModule('history');
}

// ── Theme ──
function toggleTheme() {
  const html = document.documentElement;
  const dark = html.dataset.theme === 'dark';
  html.dataset.theme = dark ? 'light' : 'dark';
  localStorage.setItem('ccs-cm-theme', html.dataset.theme);
  document.getElementById('theme-icon').textContent = dark ? '☀' : '☾';
  document.getElementById('theme-label').textContent = dark ? '浅色' : '深色';
  document.getElementById('theme-tooltip').textContent = dark ? '切换深色' : '切换浅色';
}
(function initTheme() {
  const saved = localStorage.getItem('ccs-cm-theme');
  if (saved === 'dark') {
    document.documentElement.dataset.theme = 'dark';
    document.getElementById('theme-icon').textContent = '☾';
    document.getElementById('theme-label').textContent = '深色';
    document.getElementById('theme-tooltip').textContent = '切换浅色';
  }
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

  // Restore saved width
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
    '<div class="stat-chip">总花费 <b>' + fmtCost(d.stats.totalCostUsd) + '</b></div>';
}

async function loadHistory() {
  document.getElementById('project-list').innerHTML = '<div class="loading"><div class="spinner"></div> 加载中…</div>';
  try {
    const r = await fetch('/api/cm/history');
    S.history.data = await r.json();
    updateHistoryTopbar();
    renderProjectList();
    if (S.history.pendingSession) {
      const ps = S.history.pendingSession;
      S.history.pendingSession = null;
      selectSession(ps.id, ps.costUsd, ps.title);
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
        selectSession(session.id, session.totalCostUsd, session.title);
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

  const allCost = S.history.data.stats.totalCostUsd;

  let html = '<div class="all-item' + (!S.history.selectedProject ? ' selected' : '') +
    '" onclick="selectProject(null)">' +
    '<div class="all-item-label"><span>&#9678;</span> 全部</div>' +
    '<div class="all-item-meta">' + S.history.data.stats.totalSessions + ' 个会话 · ' + fmtCost(allCost) + '</div>' +
    '</div>';

  for (const p of projects) {
    const level = actLevel(p.lastActive);
    const dotCls = level === 'active' ? 'dot-active' : level === 'recent' ? 'dot-recent' : 'dot-old';
    const sel = S.history.selectedProject === p.directory;
    html +=
      '<div class="project-item' + (sel ? ' selected' : '') + '" onclick="selectProject(' + esc(JSON.stringify(p.directory)) + ')">' +
        '<div class="project-dot ' + dotCls + '"></div>' +
        '<div class="project-info">' +
          '<div class="project-name">' + highlight(p.name, S.history.projectQuery) + '</div>' +
          '<div class="project-meta">' + relTime(p.lastActive) + '</div>' +
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
    sessions = sessions.filter(s => s.directory === S.history.selectedProject);
  }
  if (q) {
    sessions = sessions.filter(s =>
      s.title.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    );
  }

  if (!sessions.length) {
    el.innerHTML = '<div class="session-empty"><div class="session-empty-icon">&#9678;</div><div>无会话</div></div>';
    return;
  }

  let html = '';
  for (const s of sessions) {
    const sel = S.history.selectedSession === s.id;
    html +=
      '<div class="session-card' + (sel ? ' selected' : '') + '" onclick="selectSession(' + esc(JSON.stringify(s.id)) + ',' + esc(JSON.stringify(s.totalCostUsd)) + ',' + esc(JSON.stringify(s.title)) + ')">' +
        '<div class="session-top">' +
          '<div class="session-date">' + fmtDate(s.timeCreated) + '</div>' +
          (s.totalCostUsd > 0 ? '<div class="session-cost">' + fmtCost(s.totalCostUsd) + '</div>' : '') +
        '</div>' +
        '<div class="session-title">' + highlight(s.title, q) + '</div>' +
        '<div class="session-slug">' + esc(s.slug) + (s.msgCount > 0 ? ' · ' + s.msgCount + ' 条消息' : '') + '</div>' +
      '</div>';
  }
  el.innerHTML = html;
}

function selectSession(id, costUsd, title) {
  S.history.selectedSession = id;
  renderSessionList();
  loadConversation(id, costUsd, title);
  const p = {};
  if (S.history.selectedProject) p.project = S.history.selectedProject;
  if (id) p.session = id;
  updateHash(p);
}

async function loadConversation(sessionId, costUsd, title) {
  const panel = document.getElementById('message-panel-content');
  const costHtml = costUsd > 0 ? '<div class="msg-panel-cost">' + fmtCost(costUsd) + '</div>' : '';
  panel.outerHTML = '<div id="message-panel-content" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">' +
    '<div class="message-panel-header">' +
      '<div class="msg-panel-title">' + esc(title) + '</div>' + costHtml +
    '</div>' +
    '<div class="conv-loading"><div class="spinner"></div> 加载对话…</div>' +
    '</div>';

  try {
    const r = await fetch('/api/cm/conversation?sessionId=' + encodeURIComponent(sessionId));
    const msgs = await r.json();
    renderConversation(sessionId, costUsd, title, msgs);
  } catch(e) {
    document.getElementById('message-panel-content').innerHTML +=
      '<div class="no-results">加载失败</div>';
  }
}

function renderConversation(sessionId, costUsd, title, msgs) {
  // Store for re-render on filter toggle
  S.history.convSession = { id: sessionId, costUsd: costUsd, title: title, msgs: msgs };

  const costHtml = costUsd > 0 ? '<div class="msg-panel-cost">' + fmtCost(costUsd) + '</div>' : '';
  const filterActive = S.history.userOnly;
  const filterBtn = '<button class="msg-filter-btn' + (filterActive ? ' active' : '') + '" onclick="toggleUserOnly()">仅用户</button>';

  const panelEl = document.getElementById('message-panel-content');
  if (!msgs || msgs.length === 0) {
    panelEl.outerHTML = '<div id="message-panel-content" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">' +
      '<div class="message-panel-header"><div class="msg-panel-title">' + esc(title) + '</div>' + filterBtn + costHtml + '</div>' +
      '<div class="message-empty"><div class="message-empty-icon">&#9671;</div><div>无对话内容</div></div>' +
      '</div>';
    return;
  }

  // Apply user-only filter
  const displayMsgs = filterActive ? msgs.filter(function(m) { return m.role === 'user'; }) : msgs;

  if (!displayMsgs.length) {
    panelEl.outerHTML = '<div id="message-panel-content" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">' +
      '<div class="message-panel-header"><div class="msg-panel-title">' + esc(title) + '</div>' + filterBtn + costHtml + '</div>' +
      '<div class="message-empty"><div class="message-empty-icon">&#9671;</div><div>无用户消息</div></div>' +
      '</div>';
    return;
  }

  let convHtml = '';
  for (let i = 0; i < displayMsgs.length; i++) {
    const m = displayMsgs[i];
    const roleClass = m.role === 'user' ? 'conv-user' : 'conv-assistant';
    const roleLabel = m.role === 'user' ? 'You' : 'Codemaker';
    const id = 'cm-msg-' + i;
    const isAssistant = m.role === 'assistant';
    const long = m.text.length > 600;
    const bubbleContent = isAssistant ? renderMarkdown(m.text) : esc(m.text);

    let agentTag = '';
    if (m.agent) {
      agentTag = '<span class="conv-agent-tag ' + esc(m.agent) + '">' + esc(m.agent) + '</span>';
    }
    let msgCost = '';
    if (m.costUsd && m.costUsd > 0) {
      msgCost = '<span>' + fmtCost(m.costUsd) + '</span>';
    }

    convHtml +=
      '<div class="conv-turn ' + roleClass + '">' +
        '<div class="conv-role-label">' + roleLabel + '</div>' +
        '<div class="conv-bubble' + (long ? ' collapsed' : '') + '" id="' + id + '">' +
          bubbleContent +
        '</div>' +
        '<div class="conv-meta">' + agentTag + msgCost + '</div>' +
        (long ? '<span class="conv-expand" onclick="expandMsg(' + esc(JSON.stringify(id)) + ',this)">展开全文</span>' : '') +
      '</div>';
  }

  document.getElementById('message-panel-content').outerHTML =
    '<div id="message-panel-content" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">' +
      '<div class="message-panel-header"><div class="msg-panel-title">' + esc(title) + '</div>' + filterBtn + costHtml + '</div>' +
      '<div class="conv-list">' + convHtml + '</div>' +
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
  if (S.history.convSession) {
    const c = S.history.convSession;
    renderConversation(c.id, c.costUsd, c.title, c.msgs);
  }
}

// ── Markdown renderer (assistant messages only, no external deps) ──
function renderMarkdown(raw) {
  // 1. Protect fenced code blocks first (backtick-fenced)
  const TICK3 = '\`\`\`';
  const blocks = [];
  let s = raw.replace(new RegExp(TICK3 + '([\\w.-]*)\\n?([\\s\\S]*?)' + TICK3, 'g'), function(_, lang, code) {
    const idx = blocks.length;
    const langLabel = lang ? '<div class="md-lang">' + esc(lang) + '</div>' : '';
    blocks.push('<pre>' + langLabel + '<code>' + esc(code.replace(/\\n$/, '')) + '</code></pre>');
    return '\\x00CODE' + idx + '\\x00';
  });

  // 2. Inline code
  s = s.replace(/\`([^\`\\n]+)\`/g, function(_, c) { return '<code>' + esc(c) + '</code>'; });

  // 3. Horizontal rules
  s = s.replace(/^[ \\t]*(?:---+|\\*\\*\\*+|___+)[ \\t]*$/gm, '<hr>');

  // 4. Headings
  s = s.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  s = s.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  s = s.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 5. Blockquotes
  s = s.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 6. Bold / italic
  s = s.replace(/\\*\\*\\*(.+?)\\*\\*\\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
  s = s.replace(/\\*(.+?)\\*/g, '<em>$1</em>');
  s = s.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 7. Lists — collect consecutive list lines into <ul>/<ol>
  s = s.replace(/((?:^[ \\t]*[-*+] .+\\n?)+)/gm, function(block) {
    const items = block.trim().split('\\n').map(function(l) { return '<li>' + l.replace(/^[ \\t]*[-*+] /, '') + '</li>'; }).join('');
    return '<ul>' + items + '</ul>';
  });
  s = s.replace(/((?:^[ \\t]*\\d+\\. .+\\n?)+)/gm, function(block) {
    const items = block.trim().split('\\n').map(function(l) { return '<li>' + l.replace(/^[ \\t]*\\d+\\. /, '') + '</li>'; }).join('');
    return '<ol>' + items + '</ol>';
  });

  // 8. Paragraphs: double newlines -> <p>
  const chunks = s.split(/\\n{2,}/);
  s = chunks.map(function(chunk) {
    chunk = chunk.trim();
    if (!chunk) return '';
    if (/^<(h[1-6]|ul|ol|pre|hr|blockquote)/.test(chunk) || chunk.indexOf('\\x00CODE') === 0) return chunk;
    return '<p>' + chunk.replace(/\\n/g, '<br>') + '</p>';
  }).join('');

  // 9. Restore code blocks
  s = s.replace(/\\x00CODE(\\d+)\\x00/g, function(_, i) { return blocks[+i]; });

  return s;
}

// ════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════

function updateStatsTopbar() {
  const el = document.getElementById('topbar-stats');
  if (!S.stats.data) { el.innerHTML = ''; return; }
  const s = S.stats.data.summary;
  el.innerHTML =
    '<div class="stat-chip">总花费 <b>' + fmtCost(s.totalCostUsd) + '</b></div>' +
    '<div class="stat-chip">项目 <b>' + s.totalProjects + '</b></div>' +
    '<div class="stat-chip">会话 <b>' + s.totalSessions + '</b></div>' +
    '<div class="stat-chip">输出 <b>' + fmtTokens(s.totalOutputTokens) + '</b></div>';
}

async function loadStats() {
  document.getElementById('stats-project-list').innerHTML = '<div class="loading"><div class="spinner"></div> 加载中…</div>';
  try {
    const r = await fetch('/api/cm/stats');
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
  const maxCost = projects[0].totalCostUsd || 1;
  let html = '';
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const rankCls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const sel = S.stats.selectedProject === p.directory;
    const pct = Math.max(2, Math.round((p.totalCostUsd / maxCost) * 100));
    html +=
      '<div class="stats-proj-item' + (sel ? ' selected' : '') + '" onclick="selectStatsProject(' + esc(JSON.stringify(p.directory)) + ')">' +
        '<div class="stats-proj-rank ' + rankCls + '">' + (i+1) + '</div>' +
        '<div class="stats-proj-main">' +
          '<div class="stats-proj-name">' + highlight(p.name, S.stats.query) + '</div>' +
          '<div class="stats-proj-path">' + esc(p.directory) + '</div>' +
          '<div class="stats-proj-bar"><div class="stats-proj-bar-fill" style="width:' + pct + '%"></div></div>' +
        '</div>' +
        '<div class="stats-proj-nums">' +
          '<div class="stats-proj-cost">' + fmtCost(p.totalCostUsd) + '</div>' +
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

  // Metric cards
  const cards = [
    { cls: 'mc-cost',   icon: '💰', label: '总花费', value: fmtCost(p.totalCostUsd), sub: p.sessionCount + ' 个会话' },
    { cls: 'mc-output', icon: '✍️', label: '输出 Tokens', value: fmtTokens(p.outputTokens), sub: '' },
    { cls: 'mc-cache',  icon: '⚡', label: 'Cache 读取', value: fmtTokens(p.cacheRead), sub: '节省重复计算' },
    { cls: 'mc-sess',   icon: '💬', label: '会话数', value: String(p.sessionCount), sub: '最后活跃 ' + (p.lastActive || '-') },
  ];
  let metricsHtml = '<div class="metric-grid">';
  for (const c of cards) {
    metricsHtml +=
      '<div class="metric-card ' + c.cls + '">' +
        '<div class="metric-label">' + c.label + '</div>' +
        '<div class="metric-value">' + c.value + '</div>' +
        (c.sub ? '<div class="metric-sub">' + esc(c.sub) + '</div>' : '') +
      '</div>';
  }
  metricsHtml += '</div>';

  // Daily chart
  const daily = p.daily || [];
  let chartHtml = '';
  if (daily.length > 0) {
    const maxVal = Math.max(...daily.map(d => d.costUsd), 0.001);
    let bars = '', labels = '';
    for (const d of daily) {
      const h = Math.max(2, Math.round((d.costUsd / maxVal) * 56));
      bars += '<div class="daily-bar-col" title="' + d.date + ': ' + fmtCost(d.costUsd) + '">' +
        '<div class="daily-bar-fill" style="height:' + h + 'px"></div></div>';
      labels += '<div class="daily-chart-label-col">' + d.date.slice(5) + '</div>';
    }
    chartHtml =
      '<div class="stats-section">' +
        '<div class="stats-section-title">每日花费</div>' +
        '<div class="daily-chart-labels">' + labels + '</div>' +
        '<div class="daily-chart">' + bars + '</div>' +
        '<table class="daily-table">' +
          '<thead><tr><th>日期</th><th>花费</th><th>输出</th><th>会话</th></tr></thead>' +
          '<tbody>' + daily.slice().reverse().map(d =>
            '<tr><td>' + d.date + '</td><td>' + fmtCost(d.costUsd) + '</td><td>' + fmtTokens(d.outputTokens) + '</td><td>' + d.sessions + '</td></tr>'
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
          '<div class="srow-cost">' + fmtCost(s.costUsd) + '</div>' +
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
      '<div class="stats-detail-path">' + esc(p.directory) + '</div>' +
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
    '<div class="stat-chip">总费用 <b>' + fmtCost(k.totalCostUsd) + '</b></div>' +
    '<div class="stat-chip">项目 <b>' + k.totalProjects + '</b></div>' +
    '<div class="stat-chip">会话 <b>' + k.totalSessions + '</b></div>' +
    '<div class="stat-chip">输出 <b>' + fmtTokens(k.totalOutputTokens) + '</b></div>';
}

async function loadCmOverview() {
  const el = document.getElementById('ov-scroll');
  el.innerHTML = '<div class="loading"><div class="spinner"></div> 加载中…</div>';
  try {
    const r = await fetch('/api/cm/overview');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    S.overview.data = await r.json();
    updateOverviewTopbar();
    renderCmOverview();
  } catch(e) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">&#9888;</div><div class="empty-title">加载失败</div><div class="empty-subtitle">' + String(e) + '</div></div>';
  }
}

function renderCmOverview() {
  const d = S.overview.data;
  const el = document.getElementById('ov-scroll');
  if (!d || d.noData) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon" style="font-size:48px;opacity:0.15;">&#128202;</div><div class="empty-title">暂无数据</div><div class="empty-subtitle">请先使用 Codemaker 进行开发</div></div>';
    return;
  }

  const k = d.kpi;

  // ── KPI Cards ──────────────────────────────────────────────────
  const kpiDefs = [
    { cls: 'kc-amber',  icon: '&#128176;', label: '总费用',
      value: fmtCost(k.totalCostUsd),
      sub: '今日 <b>' + fmtCost(k.todayCostUsd) + '</b>&nbsp;&nbsp;本周 <b>' + fmtCost(k.weekCostUsd) + '</b>' },
    { cls: 'kc-green',  icon: '&#128193;', label: '活跃项目',
      value: String(k.totalProjects),
      sub: '7天内活跃 <b>' + k.activeProjects7d + '</b> 个' },
    { cls: 'kc-purple', icon: '&#128172;', label: '总会话数',
      value: String(k.totalSessions),
      sub: '本月 <b>' + k.monthSessions + '</b> 次' },
    { cls: 'kc-blue',   icon: '&#9999;&#65039;', label: '输出 Token',
      value: fmtTokens(k.totalOutputTokens),
      sub: '缓存命中 <b>' + fmtTokens(k.totalCacheRead) + '</b>' },
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
        '<div class="ov-kpi-sub">' + c.sub + '</div>' +
      '</div>';
  }
  kpiHtml += '</div>';

  // ── 7-Day Trend Chart ───────────────────────────────────────────
  const trend = d.trend7Days;
  const maxCost = Math.max(...trend.map(t => t.costUsd), 0.001);
  const W = 400, H = 110, PL = 34, PR = 8, PT = 10, PB = 4;
  const cw = W - PL - PR, ch = H - PT - PB;

  const pts = trend.map((t, i) => ({
    x: PL + (trend.length < 2 ? cw/2 : (i / (trend.length - 1)) * cw),
    y: PT + ch - (t.costUsd / maxCost) * ch,
    cost: t.costUsd,
  }));

  function bezier(points) {
    if (points.length < 2) return points.length === 1 ? 'M'+points[0].x+' '+points[0].y : '';
    let p = 'M '+points[0].x.toFixed(1)+' '+points[0].y.toFixed(1);
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i-1], p1 = points[i];
      const cpx = ((p0.x + p1.x) / 2).toFixed(1);
      p += ' C '+cpx+' '+p0.y.toFixed(1)+' '+cpx+' '+p1.y.toFixed(1)+' '+p1.x.toFixed(1)+' '+p1.y.toFixed(1);
    }
    return p;
  }
  const linePath = bezier(pts);
  const last = pts[pts.length-1], first = pts[0];
  const areaPath = linePath + ' L '+last.x.toFixed(1)+' '+(PT+ch)+' L '+first.x.toFixed(1)+' '+(PT+ch)+' Z';

  let gridSvg = '';
  for (let i = 0; i <= 3; i++) {
    const gy = (PT + ch * i / 3).toFixed(1);
    const val = maxCost * (1 - i/3);
    const label = val < 0.01 ? '$'+val.toFixed(3) : '$'+val.toFixed(2);
    gridSvg += '<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="var(--border-sub)" stroke-width="1"/>';
    if (i < 3) gridSvg += '<text x="'+(PL-3)+'" y="'+(parseFloat(gy)+3.5)+'" font-size="8" fill="var(--text-muted)" text-anchor="end">'+label+'</text>';
  }
  let dotsSvg = '';
  for (const p of pts) {
    dotsSvg += '<circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="3" fill="var(--accent)" stroke="var(--bg-surface)" stroke-width="1.5"><title>'+fmtCost(p.cost)+'</title></circle>';
  }
  let labelsDivs = '';
  for (const t of trend) labelsDivs += '<div class="ov-trend-lbl">'+t.date.slice(5)+'</div>';

  const trendHtml =
    '<div class="ov-card">' +
      '<div class="ov-card-title"><div class="ov-card-dot" style="background:var(--accent)"></div>7 日费用趋势</div>' +
      '<div class="ov-trend-wrap">' +
        '<svg class="ov-trend-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">' +
          '<defs>' +
            '<linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.18"/>' +
              '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>' +
            '</linearGradient>' +
          '</defs>' +
          gridSvg +
          '<path d="'+areaPath+'" fill="url(#ovGrad)"/>' +
          '<path d="'+linePath+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
          dotsSvg +
        '</svg>' +
      '</div>' +
      '<div class="ov-trend-labels">'+labelsDivs+'</div>' +
    '</div>';

  // ── Recent Sessions ──────────────────────────────────────────────
  let sessItems = '';
  if (d.recentSessions.length === 0) {
    sessItems = '<div style="color:var(--text-muted);font-size:12px;padding:4px 0;">暂无会话记录</div>';
  } else {
    for (const s of d.recentSessions) {
      sessItems +=
        '<div class="ov-sess-item" onclick="goToSession(' + esc(JSON.stringify(s.id)) + ',' + esc(JSON.stringify(s.totalCostUsd)) + ',' + esc(JSON.stringify(s.title)) + ')" style="cursor:pointer">' +
          '<div class="ov-sess-dot"></div>' +
          '<div class="ov-sess-body">' +
            '<div class="ov-sess-title">'+esc(s.title)+'</div>' +
            '<div class="ov-sess-meta">'+esc(s.projectName)+' &middot; '+relTime(s.timeUpdated)+'</div>' +
          '</div>' +
          '<div class="ov-sess-cost">'+fmtCost(s.totalCostUsd)+'</div>' +
        '</div>';
    }
  }
  const recentHtml =
    '<div class="ov-card">' +
      '<div class="ov-card-title"><div class="ov-card-dot" style="background:var(--purple)"></div>最近会话</div>' +
      '<div class="ov-sess-list">'+sessItems+'</div>' +
    '</div>';

  // ── Top Projects ─────────────────────────────────────────────────
  const maxProjCost = d.topProjects.length > 0 ? d.topProjects[0].totalCostUsd : 0.001;
  const rankCls = ['r1','r2','r3','rn','rn'];
  let projItems = '';
  for (let i = 0; i < d.topProjects.length; i++) {
    const p = d.topProjects[i];
    const pct = maxProjCost > 0 ? (p.totalCostUsd / maxProjCost * 100).toFixed(1) : '0';
    projItems +=
      '<div class="ov-proj-item">' +
        '<div class="ov-rank '+(rankCls[i]||'rn')+'">'+(i+1)+'</div>' +
        '<div class="ov-proj-body">' +
          '<div class="ov-proj-name" title="'+esc(p.directory)+'">'+esc(p.name)+'</div>' +
          '<div class="ov-proj-bar-wrap"><div class="ov-proj-bar-fill" style="width:'+pct+'%"></div></div>' +
        '</div>' +
        '<div class="ov-proj-cost">'+fmtCost(p.totalCostUsd)+'</div>' +
      '</div>';
  }
  const topProjHtml =
    '<div class="ov-card">' +
      '<div class="ov-card-title"><div class="ov-card-dot" style="background:#f59e0b"></div>项目费用排行</div>' +
      '<div class="ov-proj-list">'+projItems+'</div>' +
    '</div>';

  // ── Token Donut Chart ────────────────────────────────────────────
  const tb = d.tokenBreakdown;
  const totalTok = (tb.input||0) + (tb.output||0) + (tb.cacheRead||0) + (tb.cacheWrite||0) || 1;
  const segs = [
    { label:'输入',   val: tb.input,     color:'#3b82f6' },
    { label:'输出',   val: tb.output,    color:'#d97706' },
    { label:'缓存读', val: tb.cacheRead,  color:'#10b981' },
    { label:'缓存写', val: tb.cacheWrite, color:'#8b5cf6' },
  ].filter(s => s.val > 0);

  const R2 = 48, r2 = 32, ccx = 58, ccy = 58;
  let arcsSvg = '', ang = -Math.PI / 2;
  for (const seg of segs) {
    const sweep = (seg.val / totalTok) * Math.PI * 2;
    const ea = ang + sweep;
    const lf = sweep > Math.PI ? 1 : 0;
    const x1 = ccx + R2 * Math.cos(ang),  y1 = ccy + R2 * Math.sin(ang);
    const x2 = ccx + R2 * Math.cos(ea),   y2 = ccy + R2 * Math.sin(ea);
    const ix1 = ccx + r2 * Math.cos(ang), iy1 = ccy + r2 * Math.sin(ang);
    const ix2 = ccx + r2 * Math.cos(ea),  iy2 = ccy + r2 * Math.sin(ea);
    const arc = 'M '+x1.toFixed(2)+' '+y1.toFixed(2)+
      ' A '+R2+' '+R2+' 0 '+lf+' 1 '+x2.toFixed(2)+' '+y2.toFixed(2)+
      ' L '+ix2.toFixed(2)+' '+iy2.toFixed(2)+
      ' A '+r2+' '+r2+' 0 '+lf+' 0 '+ix1.toFixed(2)+' '+iy1.toFixed(2)+' Z';
    arcsSvg += '<path d="'+arc+'" fill="'+seg.color+'" opacity="0.88"><title>'+seg.label+': '+fmtTokens(seg.val)+' ('+( seg.val/totalTok*100).toFixed(1)+'%)</title></path>';
    ang = ea;
  }
  let legendItems = '';
  for (const seg of segs) {
    legendItems +=
      '<div class="ov-legend-item">' +
        '<div class="ov-legend-dot" style="background:'+seg.color+'"></div>' +
        '<div class="ov-legend-label">'+seg.label+'</div>' +
        '<div class="ov-legend-pct">'+(seg.val/totalTok*100).toFixed(1)+'%</div>' +
      '</div>';
  }
  const donutHtml =
    '<div class="ov-card">' +
      '<div class="ov-card-title"><div class="ov-card-dot" style="background:#3b82f6"></div>Token 使用分布</div>' +
      '<div class="ov-donut-wrap">' +
        '<svg width="116" height="116" viewBox="0 0 116 116" style="flex-shrink:0">' +
          arcsSvg +
          '<text x="58" y="54" font-size="11" font-weight="700" fill="var(--text-pri)" text-anchor="middle">'+fmtTokens(totalTok)+'</text>' +
          '<text x="58" y="68" font-size="9" fill="var(--text-muted)" text-anchor="middle">总 Tokens</text>' +
        '</svg>' +
        '<div class="ov-donut-legend">'+legendItems+'</div>' +
      '</div>' +
    '</div>';

  // ── Assemble ────────────────────────────────────────────────────
  el.innerHTML =
    kpiHtml +
    '<div class="ov-row ov-row-2-1">' + trendHtml + recentHtml + '</div>' +
    '<div class="ov-row ov-row-1-1">' + topProjHtml + donutHtml + '</div>';
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
    if (params.project) {
      S.stats.selectedProject = params.project;
    }
  } else if (module === 'notes') {
    if (params.tab) {
      window._pendingNotesTab = params.tab;
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
  }
}
(function init() {
  initModeDropdown();
  // Notes init must run before switchModule so the hook is in place
  notesInit();
  notesHookSwitchModule();

  // ── Panel init ──
  initPanelCollapse(document.querySelector('.project-panel'), 'project');
  initPanelCollapse(document.querySelector('.session-panel'), 'session');
  initPanelCollapse(document.querySelector('.stats-list-panel'), 'stats');
  initPanelResize(document.querySelector('.project-panel'), 'project', 120, 500);
  initPanelResize(document.querySelector('.session-panel'), 'session', 120, 500);
  initPanelResize(document.querySelector('.stats-list-panel'), 'stats', 120, 500);

  const { module, params } = parseHash();
  switchModule(module, false);
  restoreStateFromHash(module, params);
  window.addEventListener('hashchange', () => {
    const { module: m, params: p } = parseHash();
    if (m !== S.activeModule) {
      switchModule(m, false);
      restoreStateFromHash(m, p);
    }
  });
})();
${NOTES_JS}
</script>
</body>
</html>`
