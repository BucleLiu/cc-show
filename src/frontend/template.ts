// Auto-extracted from Python server.py HTML_TEMPLATE
// Single-file SPA with zero external dependencies (no CDN, no npm, no frameworks)
import { NOTES_CSS, NOTES_NAV_ITEM, NOTES_MODULE_HTML, NOTES_MODAL_HTML, NOTES_JS, NOTES_MARKED } from './notes-module.js'
import { PROMPTS_CSS, PROMPTS_NAV_ITEM, PROMPTS_MODULE_HTML, PROMPTS_JS } from './prompts-module.js'

export const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>cc-show</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Light theme (default) ── */
:root {
  --bg-base:      #f4f5f9;
  --bg-surface:   #ffffff;
  --bg-elevated:  #eceef6;
  --bg-hover:     #e4e8f4;
  --bg-selected:  #dce5ff;
  --border-sub:   #e5e8f0;
  --border-muted: #cdd2e4;
  --border-acc:   #a8b8e8;
  --text-pri:     #1a1c2e;
  --text-sec:     #4a5070;
  --text-muted:   #9098b8;
  --accent:       #4070f0;
  --accent-dim:   rgba(64,112,240,0.10);
  --accent-glow:  rgba(64,112,240,0.20);
  --purple:       #6d4fc9;
  --purple-dim:   rgba(109,79,201,0.10);
  --amber:        #c47a00;
  --amber-dim:    rgba(196,122,0,0.10);
  --green:        #16a34a;
  --yellow:       #ca8a04;
  --gray-dot:     #c4cad8;
  --nav-w:        68px;
  --panel-w:      240px;
  --mid-w:        270px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif;
}

/* ── Dark theme ── */
[data-theme="dark"] {
  --bg-base:      #0d0e14;
  --bg-surface:   #13141c;
  --bg-elevated:  #1a1b27;
  --bg-hover:     #1e2035;
  --bg-selected:  #21254a;
  --border-sub:   #1a1c2e;
  --border-muted: #252840;
  --border-acc:   #3a3f70;
  --text-pri:     #e0e2f0;
  --text-sec:     #8890b0;
  --text-muted:   #454868;
  --accent:       #5b8af5;
  --accent-dim:   rgba(91,138,245,0.12);
  --accent-glow:  rgba(91,138,245,0.25);
  --purple:       #a78bfa;
  --purple-dim:   rgba(167,139,250,0.12);
  --amber:        #f59e0b;
  --amber-dim:    rgba(245,158,11,0.12);
  --green:        #34d399;
  --yellow:       #fbbf24;
  --gray-dot:     #374060;
}

html { transition: background 0.2s, color 0.2s; }
html, body { height: 100%; background: var(--bg-base); color: var(--text-pri); overflow: hidden; }
* { transition: background-color 0.15s, border-color 0.15s, color 0.15s; }

/* ── Scrollbar ── */
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 0 16px;
  gap: 4px;
  flex-shrink: 0;
  z-index: 10;
}
.nav-logo {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; color: #fff;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(91,138,245,0.35);
  letter-spacing: -0.5px;
  flex-shrink: 0;
}
.nav-divider { width: 32px; height: 1px; background: var(--border-sub); margin: 6px 0; }
.nav-item {
  position: relative;
  width: 52px; height: 52px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  color: var(--text-muted);
  border: 1px solid transparent;
}
.nav-item:hover { background: var(--bg-hover); color: var(--text-sec); }
.nav-item.active {
  background: var(--accent-dim);
  color: var(--accent);
  border-color: var(--border-acc);
}
.nav-item-icon { font-size: 18px; line-height: 1; }
.nav-item-label { font-size: 9px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase; }
.nav-tooltip {
  position: absolute; left: calc(100% + 10px);
  background: var(--bg-elevated);
  border: 1px solid var(--border-muted);
  color: var(--text-pri);
  padding: 4px 8px; border-radius: 6px;
  font-size: 11px; white-space: nowrap;
  pointer-events: none; opacity: 0;
  transition: opacity 0.15s;
  z-index: 100;
}
.nav-item:hover .nav-tooltip { opacity: 1; }
.nav-spacer { flex: 1; }

/* ── Mode Dropdown ── */
.mode-dd {
  position: relative;
  width: 52px; height: 52px;
  display: none; /* shown via JS when extra modes enabled */
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
  height: 52px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-sub);
  display: flex; align-items: center;
  padding: 0 18px; gap: 12px;
  flex-shrink: 0;
}
.topbar-title { font-size: 14px; font-weight: 600; color: var(--text-pri); flex-shrink: 0; }
.topbar-stats { font-size: 11px; color: var(--text-muted); display: flex; gap: 10px; }
.stat-chip {
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 11px; color: var(--text-sec);
  display: flex; align-items: center; gap: 4px;
}
.stat-chip b { color: var(--text-pri); }
.topbar-flex { flex: 1; }
/* ── Panel inline search ── */
.panel-search-wrap {
  position: relative;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-sub);
  flex-shrink: 0;
}
.panel-search-wrap::before {
  content: '⌕';
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); font-size: 14px; pointer-events: none; z-index: 1;
}
.panel-search {
  width: 100%; height: 28px;
  background: var(--bg-base);
  border: 1px solid var(--border-muted);
  border-radius: 6px;
  padding: 0 8px 0 26px;
  color: var(--text-pri); font-size: 11px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.panel-search:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-dim);
}
.panel-search::placeholder { color: var(--text-muted); }

/* ── Content area ── */
#content { flex: 1; display: flex; overflow: hidden; }

/* ── Module panels ── */
.module { display: none; width: 100%; height: 100%; }
.module.active { display: flex; }

/* ── History Module ── */
.project-panel {
  width: var(--panel-w);
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  background: var(--bg-surface);
  flex-shrink: 0;
  overflow: hidden;
}
.panel-header {
  padding: 12px 14px 8px;
  font-size: 10px; font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px; text-transform: uppercase;
  border-bottom: 1px solid var(--border-sub);
  flex-shrink: 0;
}
.panel-scroll { flex: 1; overflow-y: auto; padding: 6px; }

.project-item {
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
  display: flex; align-items: center; gap: 9px;
  border: 1px solid transparent;
}
.project-item:hover { background: var(--bg-hover); }
.project-item.selected {
  background: var(--accent-dim);
  border-color: var(--border-acc);
}
.project-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-active { background: var(--green); box-shadow: 0 0 6px rgba(52,211,153,0.5); }
.dot-recent { background: var(--yellow); }
.dot-old { background: var(--gray-dot); }
.project-info { flex: 1; min-width: 0; }
.project-name {
  font-size: 12px; font-weight: 500; color: var(--text-pri);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.project-meta { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
.project-badge {
  font-size: 10px; color: var(--text-sec);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 4px; padding: 1px 5px;
  flex-shrink: 0;
}

/* ── CLAUDE.md icon button ── */
.claudemd-icon {
  width: 22px; height: 22px; border-radius: 5px;
  border: none; background: transparent; color: var(--text-muted);
  font-size: 11px; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  opacity: 0.4; transition: opacity 0.12s, background 0.12s, color 0.12s;
  flex-shrink: 0;
}
.claudemd-icon:hover { opacity: 1; background: var(--accent-dim); color: var(--accent); }
.panel-header .claudemd-icon { opacity: 0.5; }
.project-item .claudemd-icon { display: none; }
.project-item:hover .claudemd-icon { display: flex; }

.all-item {
  padding: 8px 10px 10px;
  margin-bottom: 2px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-sub);
  transition: background 0.12s;
  border-radius: 8px;
}
.all-item:hover { background: var(--bg-hover); }
.all-item.selected { background: var(--accent-dim); }
.all-item-label {
  font-size: 12px; font-weight: 600; color: var(--text-pri);
  display: flex; align-items: center; gap: 6px;
}
.all-item-label span { font-size: 14px; }
.all-item-meta { font-size: 10px; color: var(--text-muted); margin-top: 3px; }

/* ── Sessions Panel ── */
.session-panel {
  width: var(--mid-w);
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  background: var(--bg-base);
  flex-shrink: 0;
  overflow: hidden;
}
.session-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; color: var(--text-muted);
  font-size: 12px;
}
.session-empty-icon { font-size: 28px; opacity: 0.4; }

.session-card {
  margin: 4px 6px;
  padding: 10px 12px;
  border-radius: 9px;
  background: var(--bg-surface);
  border: 1px solid var(--border-sub);
  cursor: pointer;
  transition: all 0.12s;
  position: relative;
  overflow: hidden;
}
.session-card::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.12s;
}
.session-card:hover {
  background: var(--bg-elevated);
  border-color: var(--border-muted);
  transform: translateX(1px);
}
.session-card:hover::before { opacity: 0.5; }
.session-card.selected {
  background: var(--accent-dim);
  border-color: var(--border-acc);
  box-shadow: 0 0 0 1px var(--accent-dim);
}
.session-card.selected::before { opacity: 1; }
.session-top {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.session-date { font-size: 11px; color: var(--text-sec); font-weight: 500; }
.session-count {
  font-size: 10px; color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 10px; padding: 1px 6px;
}
.session-summary {
  font-size: 12px; color: var(--text-sec);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.session-project-tag {
  font-size: 10px; color: var(--text-muted);
  margin-top: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.session-meta {
  display: flex; align-items: center;
  justify-content: flex-start;
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
.session-id-chip:hover {
  color: var(--text-sec);
  border-color: var(--border-muted);
}
.session-id-chip.copied {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}
.session-model-chip {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px; color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 5px; padding: 1px 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  min-width: 0; max-width: 120px;
}
.session-token-info {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; white-space: nowrap; flex-shrink: 0;
}
.tok-in  { color: var(--accent); font-weight: 500; }
.tok-out { color: var(--text-muted); }

/* ── Messages Panel ── */
.message-panel {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  background: var(--bg-base);
  overflow: hidden;
}
.message-panel-header {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-sub);
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0;
  background: var(--bg-surface);
}
.msg-panel-title { font-size: 13px; font-weight: 600; color: var(--text-pri); }
.msg-panel-subtitle { font-size: 11px; color: var(--text-muted); }
.conv-path-row {
  display: flex; align-items: center; gap: 5px; margin-top: 3px;
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
.message-list { flex: 1; overflow-y: auto; padding: 12px 18px; display: flex; flex-direction: column; gap: 2px; }
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

.msg-row {
  display: flex; align-items: flex-start;
  gap: 12px; padding: 5px 4px;
  border-radius: 6px;
  transition: background 0.1s;
}
.msg-row:hover { background: var(--bg-hover); }
.msg-time {
  font-size: 10px; color: var(--text-muted);
  width: 34px; flex-shrink: 0;
  padding-top: 2px; text-align: right;
  font-variant-numeric: tabular-nums;
}
.msg-body { flex: 1; min-width: 0; }
.msg-text {
  font-size: 13px; color: var(--text-pri);
  line-height: 1.55; white-space: pre-wrap; word-break: break-word;
}
.msg-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.msg-expand {
  font-size: 11px; color: var(--accent);
  cursor: pointer; margin-top: 3px; display: inline-block;
}
.msg-expand:hover { text-decoration: underline; }

.slash-tag {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--purple-dim);
  border: 1px solid rgba(167,139,250,0.2);
  color: var(--purple);
  border-radius: 6px; padding: 2px 8px;
  font-size: 12px; font-weight: 500; font-family: 'SF Mono', 'Fira Code', monospace;
}
.slash-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--purple); flex-shrink: 0; }

.paste-indicator {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--amber-dim);
  border: 1px solid rgba(245,158,11,0.2);
  color: var(--amber);
  border-radius: 4px; padding: 1px 6px;
  font-size: 10px; margin-top: 3px;
}

/* ── Conversation Bubbles ── */
.conv-list {
  flex: 1; overflow-y: auto;
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 14px;
}
.conv-turn { display: flex; flex-direction: column; gap: 2px; position: relative; }
.conv-role-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
  text-transform: uppercase; margin-bottom: 4px;
}
.conv-user .conv-role-label { color: var(--accent); }
.conv-assistant .conv-role-label { color: var(--purple); }
.conv-bubble {
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px; line-height: 1.6;
  max-width: 100%; word-break: break-word;
  border: 1px solid var(--border-sub);
}
.conv-user .conv-bubble {
  background: var(--accent-dim);
  border-color: var(--border-acc);
  color: var(--text-pri);
  white-space: pre-wrap;
}
.conv-assistant .conv-bubble {
  background: var(--bg-surface);
  color: var(--text-pri);
}
.conv-assistant .conv-bubble.md-body {
  padding: 10px 14px;
  max-width: none;
}
.conv-assistant .conv-bubble.md-body p:last-child { margin-bottom: 0; }
.conv-bubble.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.conv-time {
  font-size: 10px; color: var(--text-muted);
  margin-top: 3px;
  font-variant-numeric: tabular-nums;
}
.conv-loading {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 8px; color: var(--text-muted); font-size: 12px;
}
.conv-copy-btn {
  position: absolute;
  top: 0; right: 0;
  font-size: 10px; padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid var(--border-sub);
  background: var(--bg-elevated);
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, border-color 0.15s, background 0.15s;
  white-space: nowrap;
  line-height: 1.6;
}
.conv-turn:hover .conv-copy-btn { opacity: 1; }
.conv-copy-btn.copied {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}
.conv-fallback-note {
  text-align: center; font-size: 11px; color: var(--text-muted);
  padding: 8px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 8px;
  margin-top: 4px;
}

/* ── Conversation Filter Button ── */
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
  flex-shrink: 0;
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

mark { background: rgba(251,191,36,0.2); color: var(--amber); border-radius: 2px; padding: 0 1px; }

/* ── Plans Module ── */
.plans-list-panel {
  width: 300px;
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  background: var(--bg-surface);
  flex-shrink: 0;
  overflow: hidden;
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
.plan-filename { font-size: 10px; color: var(--text-muted); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plan-size-tag {
  font-size: 9px; color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 4px; padding: 1px 4px;
  flex-shrink: 0;
}
.plan-preview {
  font-size: 11px; color: var(--text-muted);
  margin-top: 4px; line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.plan-session-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px; color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 4px; padding: 1px 5px;
  cursor: pointer; user-select: none;
  white-space: nowrap; flex-shrink: 0;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
  margin-top: 4px;
}
.plan-session-chip:hover {
  color: var(--text-sec);
  border-color: var(--border-muted);
}
.plan-session-chip.copied {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}

/* ── Markdown Render ── */
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
.md-body { max-width: 760px; line-height: 1.65; }
.md-body h1 { font-size: 20px; font-weight: 700; color: var(--text-pri); margin: 0 0 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border-muted); }
.md-body h2 { font-size: 15px; font-weight: 600; color: var(--text-pri); margin: 24px 0 10px; }
.md-body h3 { font-size: 13px; font-weight: 600; color: var(--text-sec); margin: 18px 0 8px; }
.md-body p { font-size: 13px; color: var(--text-sec); margin: 0 0 12px; }
.md-body ul, .md-body ol { font-size: 13px; color: var(--text-sec); margin: 0 0 12px 18px; }
.md-body li { margin: 3px 0; line-height: 1.6; }
.md-body code {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11.5px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-muted);
  border-radius: 4px; padding: 1px 5px;
  color: var(--purple);
}
.md-body pre {
  background: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: 8px; padding: 14px 16px;
  overflow-x: auto; margin: 12px 0;
}
.md-body pre code {
  background: none; border: none; padding: 0;
  color: var(--text-sec); font-size: 12px; line-height: 1.6;
}
.md-body blockquote {
  border-left: 3px solid var(--border-acc);
  margin: 12px 0; padding: 8px 14px;
  background: var(--bg-surface);
  border-radius: 0 6px 6px 0;
}
.md-body blockquote p { margin: 0; color: var(--text-muted); }
.md-body hr { border: none; border-top: 1px solid var(--border-sub); margin: 20px 0; }
.md-body strong { color: var(--text-pri); font-weight: 600; }
.md-body a { color: var(--accent); text-decoration: none; }
.md-body a:hover { text-decoration: underline; }
.md-body table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 12px 0; }
.md-body th {
  text-align: left; padding: 6px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-muted);
  color: var(--text-sec); font-weight: 600; font-size: 11px;
}
.md-body td {
  padding: 6px 12px;
  border: 1px solid var(--border-sub);
  color: var(--text-sec); vertical-align: top;
}
.md-body tr:hover td { background: var(--bg-hover); }

/* ── Overview Module ── */
.ov-scroll {
  flex: 1; overflow-y: auto;
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 20px;
}

/* KPI Cards */
.ov-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.ov-kpi-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-sub);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 6px;
  position: relative; overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ov-kpi-card:hover {
  border-color: var(--border-acc);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.ov-kpi-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--ov-card-color, var(--accent));
  border-radius: 12px 12px 0 0;
}
.ov-kpi-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
  text-transform: uppercase; color: var(--text-muted);
}
.ov-kpi-value {
  font-size: 26px; font-weight: 700; color: var(--text-pri);
  font-variant-numeric: tabular-nums; line-height: 1;
  letter-spacing: -0.5px;
}
.ov-kpi-sub {
  font-size: 11px; color: var(--text-muted);
  display: flex; align-items: center; gap: 4px;
}
.ov-kpi-sub-val {
  color: var(--ov-card-color, var(--accent));
  font-weight: 600;
}

/* Two-column row */
.ov-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.ov-row3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

/* Card base */
.ov-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-sub);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 12px;
}
.ov-card-title {
  font-size: 11px; font-weight: 700; color: var(--text-sec);
  letter-spacing: 0.6px; text-transform: uppercase;
  display: flex; align-items: center; justify-content: space-between;
}
.ov-card-badge {
  font-size: 10px; font-weight: 500; color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border-sub);
  border-radius: 10px; padding: 1px 7px;
  letter-spacing: 0;
}

/* SVG Chart */
.ov-chart-wrap {
  display: flex; flex-direction: column; gap: 4px;
}
.ov-chart-svg {
  width: 100%; overflow: visible;
}
.ov-chart-labels {
  display: flex; justify-content: space-between;
  font-size: 9px; color: var(--text-muted);
  padding: 0 2px;
}

/* Bar chart */
.ov-bar-chart {
  display: flex; align-items: flex-end; gap: 4px; height: 52px;
}
.ov-bar-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  height: 100%;
}
.ov-bar-fill {
  width: 100%; border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, var(--accent) 0%, var(--purple) 100%);
  opacity: 0.75; min-height: 2px;
  transition: opacity 0.15s;
  cursor: default;
}
.ov-bar-col:hover .ov-bar-fill { opacity: 1; }

/* Session list */
.ov-session-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border-sub);
  cursor: pointer;
  transition: background 0.1s;
}
.ov-session-item:last-child { border-bottom: none; }
.ov-session-item:hover .ov-session-summary { color: var(--accent); }
.ov-session-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent); flex-shrink: 0; margin-top: 5px;
}
.ov-session-body { flex: 1; min-width: 0; }
.ov-session-proj {
  font-size: 10px; color: var(--text-muted); margin-bottom: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ov-session-summary {
  font-size: 12px; color: var(--text-pri); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.1s;
}
.ov-session-time {
  font-size: 10px; color: var(--text-muted); flex-shrink: 0; margin-top: 3px;
}

/* Top projects */
.ov-proj-item {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--border-sub);
}
.ov-proj-item:last-child { border-bottom: none; }
.ov-proj-rank {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--bg-elevated); border: 1px solid var(--border-muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; color: var(--text-muted);
  flex-shrink: 0;
}
.ov-proj-rank.r1 { background: rgba(255,180,0,0.15); border-color: rgba(255,180,0,0.4); color: #c47a00; }
.ov-proj-rank.r2 { background: rgba(120,130,160,0.15); border-color: rgba(120,130,160,0.4); color: var(--text-sec); }
.ov-proj-rank.r3 { background: rgba(180,100,60,0.12); border-color: rgba(180,100,60,0.3); color: #c47a00; }
.ov-proj-info { flex: 1; min-width: 0; }
.ov-proj-name {
  font-size: 12px; font-weight: 500; color: var(--text-pri);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ov-proj-path {
  font-size: 10px; color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ov-proj-tokens {
  font-size: 12px; font-weight: 600; color: var(--accent);
  font-variant-numeric: tabular-nums; flex-shrink: 0;
}
.ov-proj-bar-wrap {
  width: 100%; height: 3px; background: var(--bg-elevated);
  border-radius: 2px; overflow: hidden; margin-top: 3px;
}
.ov-proj-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--purple));
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* Model share */
.ov-model-item {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
}
.ov-model-item:last-child { margin-bottom: 0; }
.ov-model-name {
  font-size: 11px; color: var(--text-sec);
  font-family: 'SF Mono', 'Fira Code', monospace;
  width: 140px; flex-shrink: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ov-model-track {
  flex: 1; height: 6px; background: var(--bg-elevated);
  border-radius: 3px; overflow: hidden;
}
.ov-model-fill {
  height: 100%; border-radius: 3px;
  transition: width 0.4s ease;
}
.ov-model-pct {
  font-size: 11px; color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  width: 30px; text-align: right; flex-shrink: 0;
}

/* Plans list */
.ov-plan-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--border-sub);
  cursor: pointer;
}
.ov-plan-item:last-child { border-bottom: none; }
.ov-plan-item:hover .ov-plan-title { color: var(--accent); }
.ov-plan-icon {
  font-size: 14px; flex-shrink: 0; margin-top: 2px;
  color: var(--amber);
}
.ov-plan-body { flex: 1; min-width: 0; }
.ov-plan-title {
  font-size: 12px; font-weight: 500; color: var(--text-pri);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: color 0.1s;
}
.ov-plan-preview {
  font-size: 10px; color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 2px;
}
.ov-plan-time { font-size: 10px; color: var(--text-muted); flex-shrink: 0; margin-top: 3px; }

/* Memory entries */
.ov-mem-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--border-sub);
}
.ov-mem-item:last-child { border-bottom: none; }
.ov-mem-icon { font-size: 13px; flex-shrink: 0; margin-top: 2px; color: var(--purple); }
.ov-mem-body { flex: 1; min-width: 0; }
.ov-mem-proj {
  font-size: 10px; color: var(--text-muted); margin-bottom: 2px;
}
.ov-mem-snippet {
  font-size: 12px; color: var(--text-sec);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ov-mem-time { font-size: 10px; color: var(--text-muted); flex-shrink: 0; margin-top: 3px; }

/* Pie chart (SVG) */
.ov-pie-wrap {
  display: flex; align-items: center; gap: 16px;
}
.ov-pie-legend {
  flex: 1; display: flex; flex-direction: column; gap: 6px;
}
.ov-pie-legend-item {
  display: flex; align-items: center; gap: 7px; font-size: 11px;
}
.ov-pie-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.ov-pie-legend-name {
  color: var(--text-sec);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px;
  flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ov-pie-legend-pct {
  color: var(--text-muted); font-size: 10px;
  font-variant-numeric: tabular-nums;
}

/* Empty state in ov card */
.ov-empty {
  padding: 16px 0; text-align: center;
  color: var(--text-muted); font-size: 12px; opacity: 0.7;
}

/* ── Empty States ── */
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; color: var(--text-muted);
}
.empty-icon { font-size: 40px; opacity: 0.25; }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-muted); }
.empty-subtitle { font-size: 12px; color: var(--text-muted); opacity: 0.7; }

/* ── Loading ── */
.loading {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); font-size: 12px; gap: 8px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 14px; height: 14px;
  border: 2px solid var(--border-muted);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── No results ── */
.no-results {
  padding: 24px; text-align: center;
  color: var(--text-muted); font-size: 12px;
}

/* ── Stats Module ── */
.stats-list-panel {
  width: 300px;
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  background: var(--bg-surface);
  flex-shrink: 0;
  overflow: hidden;
}
.stats-panel-header {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-sub);
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.stats-panel-title {
  font-size: 10px; font-weight: 700;
  color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase;
}
.compute-btn {
  font-size: 11px; font-weight: 500;
  padding: 4px 10px; border-radius: 6px;
  border: 1px solid var(--border-muted);
  background: var(--accent); color: #fff;
  cursor: pointer; letter-spacing: 0.2px;
  transition: opacity 0.15s, transform 0.1s;
  display: flex; align-items: center; gap: 4px;
}
.compute-btn:hover { opacity: 0.85; }
.compute-btn:active { transform: scale(0.97); }
.compute-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.compute-btn-icon { font-size: 12px; }

/* Project List Items */
.stats-proj-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-sub);
  transition: background 0.12s;
  position: relative;
}
.stats-proj-item:hover { background: var(--bg-hover); }
.stats-proj-item.selected { background: var(--accent-dim); }
.stats-proj-item.selected::after {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: var(--accent);
}
.stats-proj-rank {
  width: 20px; height: 20px;
  border-radius: 6px;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: var(--bg-elevated);
  color: var(--text-muted);
  border: 1px solid var(--border-sub);
}
.stats-proj-rank.top1 { background: rgba(255,196,0,0.15); color: #c47a00; border-color: rgba(196,122,0,0.3); }
.stats-proj-rank.top2 { background: rgba(192,192,192,0.15); color: #707080; border-color: rgba(120,120,140,0.3); }
.stats-proj-rank.top3 { background: rgba(184,115,51,0.12); color: #a0602a; border-color: rgba(160,96,42,0.25); }
.stats-proj-main { flex: 1; min-width: 0; }
.stats-proj-name {
  font-size: 12px; font-weight: 500; color: var(--text-pri);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 1px;
}
.stats-proj-path {
  font-size: 10px; color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 5px;
}
.stats-proj-bar {
  height: 3px; background: var(--bg-elevated);
  border-radius: 2px; overflow: hidden;
}
.stats-proj-bar-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, var(--accent), var(--purple));
  transition: width 0.3s ease;
}
.stats-proj-nums {
  flex-shrink: 0; text-align: right;
}
.stats-proj-tokens {
  font-size: 12px; font-weight: 600; color: var(--text-pri);
  font-variant-numeric: tabular-nums;
}
.stats-proj-sessions {
  font-size: 10px; color: var(--text-muted); margin-top: 1px;
}

/* Detail Panel */
.stats-detail-panel {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  overflow: hidden;
  background: var(--bg-base);
}
.stats-detail-head {
  padding: 14px 20px 12px;
  border-bottom: 1px solid var(--border-sub);
  background: var(--bg-surface);
  flex-shrink: 0;
}
.stats-detail-title {
  font-size: 15px; font-weight: 700; color: var(--text-pri);
  margin-bottom: 2px;
}
.stats-detail-path {
  font-size: 11px; color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 3px;
}
.stats-detail-meta {
  font-size: 11px; color: var(--text-muted);
}
.stats-detail-scroll {
  flex: 1; overflow-y: auto;
  padding: 18px 20px 32px;
}

/* Metric Cards */
.metric-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 10px; margin-bottom: 22px;
}
@media (max-width: 900px) {
  .metric-grid { grid-template-columns: repeat(2, 1fr); }
}
.metric-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-sub);
  border-radius: 10px;
  padding: 12px 14px;
  position: relative; overflow: hidden;
}
.metric-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
}
.metric-card.mc-total::before { background: linear-gradient(90deg, var(--accent), var(--purple)); }
.metric-card.mc-input::before { background: var(--purple); }
.metric-card.mc-output::before { background: var(--green); }
.metric-card.mc-cache::before { background: var(--amber); }
.metric-label {
  font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
  text-transform: uppercase; color: var(--text-muted);
  margin-bottom: 6px;
}
.metric-value {
  font-size: 20px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}
.metric-card.mc-total .metric-value { color: var(--accent); }
.metric-card.mc-input .metric-value { color: var(--purple); }
.metric-card.mc-output .metric-value { color: var(--green); }
.metric-card.mc-cache .metric-value { color: var(--amber); }
.metric-sub {
  font-size: 10px; color: var(--text-muted); margin-top: 3px;
}

/* Section Headers */
.stats-section {
  margin-bottom: 20px;
}
.stats-section-title {
  font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
  text-transform: uppercase; color: var(--text-muted);
  margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.stats-section-title::after {
  content: ''; flex: 1; height: 1px;
  background: var(--border-sub);
}

/* Model Distribution Bars */
.model-bar-item {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 8px;
}
.model-bar-name {
  font-size: 11px; color: var(--text-sec);
  font-family: 'SF Mono', 'Fira Code', monospace;
  width: 160px; flex-shrink: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.model-bar-track {
  flex: 1; height: 6px;
  background: var(--bg-elevated);
  border-radius: 3px; overflow: hidden;
}
.model-bar-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), var(--purple));
  transition: width 0.4s ease;
}
.model-bar-val {
  font-size: 11px; color: var(--text-sec);
  font-variant-numeric: tabular-nums;
  width: 100px; flex-shrink: 0; text-align: right;
}

/* Daily Mini Bar Chart */
.daily-chart {
  display: flex; align-items: flex-end;
  gap: 3px; height: 60px;
  margin-bottom: 8px;
}
.daily-bar-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  height: 100%; cursor: default;
}
.daily-bar-fill {
  width: 100%; border-radius: 2px 2px 0 0;
  background: var(--accent);
  opacity: 0.75;
  transition: opacity 0.1s;
  min-height: 2px;
}
.daily-bar-col:hover .daily-bar-fill { opacity: 1; }
.daily-chart-labels {
  display: flex; gap: 3px;
  margin-bottom: 4px;
}
.daily-chart-label-col {
  flex: 1; text-align: center;
  font-size: 9px; color: var(--text-muted);
  overflow: hidden; white-space: nowrap;
}

/* Daily Table (compact) */
.daily-table {
  width: 100%; font-size: 12px;
  border-collapse: collapse;
  margin-top: 8px;
}
.daily-table th {
  font-size: 10px; font-weight: 600; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.5px;
  padding: 4px 8px; text-align: left;
  border-bottom: 1px solid var(--border-sub);
}
.daily-table th:not(:first-child) { text-align: right; }
.daily-table td {
  padding: 5px 8px; color: var(--text-sec);
  border-bottom: 1px solid var(--border-sub);
}
.daily-table td:not(:first-child) { text-align: right; font-variant-numeric: tabular-nums; }
.daily-table td:first-child { color: var(--text-pri); font-weight: 500; }
.daily-table tr:hover td { background: var(--bg-hover); }

/* Session Rows */
.session-rows {
  display: flex; flex-direction: column; gap: 4px;
}
.srow {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 10px;
  border-radius: 7px;
  background: var(--bg-surface);
  border: 1px solid var(--border-sub);
  font-size: 11px;
  transition: border-color 0.12s, background 0.12s;
}
.srow:hover { background: var(--bg-elevated); border-color: var(--border-muted); }
.srow-id {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px; color: var(--text-muted);
  width: 72px; flex-shrink: 0;
}
.srow-total {
  font-size: 12px; font-weight: 600; color: var(--accent);
  width: 56px; flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.srow-breakdown {
  flex: 1; display: flex; gap: 6px;
  color: var(--text-muted); font-size: 10px;
}
.srow-breakdown span { white-space: nowrap; }
.srow-time {
  font-size: 10px; color: var(--text-muted);
  flex-shrink: 0; font-variant-numeric: tabular-nums;
}

/* ── Stats Tab Bar ── */
.stats-tab-bar {
  display: flex; gap: 0; padding: 0 14px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-sub);
  flex-shrink: 0;
}
.stats-tab {
  padding: 11px 18px; border: none; background: transparent;
  color: var(--text-muted); font-size: 13px; font-weight: 500;
  cursor: pointer; border-bottom: 2px solid transparent;
  margin-bottom: -1px; transition: color 0.15s, border-color 0.15s, background 0.15s;
  border-radius: 0;
}
.stats-tab:hover { color: var(--text-sec); background: var(--bg-hover); }
.stats-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
#mod-stats { flex-direction: column; }
.stats-sub-panel { display: flex; flex: 1; overflow: hidden; min-height: 0; }

/* ── Metric Cards (upgraded) ── */
.metric-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  padding: 16px 18px;
}
.metric-card {
  padding: 14px 14px 12px; border-radius: 12px;
  border: 1px solid var(--border-sub);
  background: var(--bg-elevated);
  position: relative; overflow: hidden;
}
.metric-card::after {
  content: ''; position: absolute;
  top: 0; left: 0; width: 100%; height: 3px;
  border-radius: 12px 12px 0 0;
}
.mc-total::after { background: linear-gradient(90deg, var(--accent), var(--purple)); }
.mc-input::after  { background: linear-gradient(90deg, var(--green), #22c55e); }
.mc-output::after { background: linear-gradient(90deg, var(--purple), #a78bfa); }
.mc-cache::after  { background: linear-gradient(90deg, var(--amber), #f59e0b); }
.metric-icon { font-size: 20px; margin-bottom: 6px; }
.metric-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; }
.metric-value { font-size: 22px; font-weight: 700; color: var(--text-pri); margin: 5px 0 3px; line-height: 1; }
.metric-sub { font-size: 11px; color: var(--text-sec); }

/* ── Skill Leaderboard (left panel) ── */
.skill-rank-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; cursor: pointer;
  border-radius: 8px; margin: 0 6px 2px;
  transition: background 0.12s;
}
.skill-rank-item:hover { background: var(--bg-hover); }
.skill-rank-item.selected { background: var(--bg-selected); }
.skill-rank-badge {
  width: 22px; height: 22px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
  background: var(--bg-elevated); color: var(--text-muted);
}
.skill-rank-badge.r1 { background: #fbbf24; color: #78350f; }
.skill-rank-badge.r2 { background: #94a3b8; color: #1e293b; }
.skill-rank-badge.r3 { background: #cd7f32; color: #fff; }
.skill-rank-main { flex: 1; min-width: 0; }
.skill-rank-name {
  font-size: 12px; font-weight: 600; color: var(--text-pri);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.skill-rank-bar-wrap { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.skill-rank-bar { flex: 1; height: 3px; background: var(--border-sub); border-radius: 2px; overflow: hidden; }
.skill-rank-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--purple)); border-radius: 2px; }
.skill-rank-count { font-size: 11px; font-weight: 600; color: var(--accent); flex-shrink: 0; min-width: 24px; text-align: right; }

/* ── Skill Detail / Overview Panel ── */
.skill-detail-head {
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border-sub);
  flex-shrink: 0;
}
.skill-detail-name {
  font-size: 17px; font-weight: 700; color: var(--text-pri);
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.skill-detail-name-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  font-size: 14px; flex-shrink: 0;
}
.skill-meta-row { display: flex; gap: 8px; flex-wrap: wrap; }
.skill-meta-pill {
  font-size: 11px; color: var(--text-sec);
  background: var(--bg-elevated); border-radius: 20px;
  padding: 3px 10px; border: 1px solid var(--border-sub);
}
.skill-meta-pill b { color: var(--text-pri); }

/* ── Skill KPI Overview ── */
.skill-overview-kpis {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
  padding: 16px 18px;
}
.skill-kpi-card {
  padding: 13px 14px; border-radius: 10px;
  background: var(--bg-elevated); border: 1px solid var(--border-sub);
}
.skill-kpi-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.skill-kpi-value { font-size: 22px; font-weight: 700; color: var(--text-pri); }
.skill-kpi-sub { font-size: 10px; color: var(--text-sec); margin-top: 2px; }

/* ── Skill Project Bars ── */
.skill-proj-rows { display: flex; flex-direction: column; gap: 9px; }
.skill-proj-row { display: flex; align-items: center; gap: 8px; }
.skill-proj-name {
  font-size: 11px; color: var(--text-sec);
  width: 130px; flex-shrink: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.skill-proj-bar-wrap { flex: 1; height: 6px; background: var(--border-sub); border-radius: 3px; overflow: hidden; }
.skill-proj-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--purple)); border-radius: 3px; }
.skill-proj-count { font-size: 11px; font-weight: 600; color: var(--accent); width: 28px; text-align: right; flex-shrink: 0; }

/* ── Skill Modal ── */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.2s;
}
.modal-backdrop.open { opacity: 1; pointer-events: all; }
.modal-dialog {
  background: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: 16px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.28);
  width: 500px; max-width: calc(100vw - 40px);
  max-height: 78vh;
  display: flex; flex-direction: column;
  transform: translateY(14px) scale(0.96);
  transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
  overflow: hidden;
}
.modal-backdrop.open .modal-dialog { transform: translateY(0) scale(1); }
.modal-header {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--border-sub);
  flex-shrink: 0;
}
.modal-header-icon {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.modal-title { flex: 1; font-size: 15px; font-weight: 700; color: var(--text-pri); }
.modal-subtitle { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
.modal-close {
  width: 28px; height: 28px; border: none; background: var(--bg-elevated);
  color: var(--text-muted); border-radius: 7px; cursor: pointer;
  font-size: 16px; display: flex; align-items: center; justify-content: center;
  transition: background 0.12s, color 0.12s; flex-shrink: 0;
}
.modal-close:hover { background: var(--bg-hover); color: var(--text-pri); }
.modal-body { flex: 1; overflow-y: auto; padding: 14px 16px; }
.modal-empty {
  text-align: center; padding: 40px 20px;
  color: var(--text-muted); font-size: 13px;
}
.modal-empty-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.35; }
.modal-empty-text { font-size: 13px; color: var(--text-muted); }

/* Skill Card (modal) */
.skill-modal-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 13px; border-radius: 10px;
  border: 1px solid var(--border-sub);
  background: var(--bg-elevated);
  margin-bottom: 8px; transition: border-color 0.12s;
}
.skill-modal-card:hover { border-color: var(--border-acc); }
.skill-modal-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.skill-modal-info { flex: 1; min-width: 0; }
.skill-modal-name { font-size: 13px; font-weight: 600; color: var(--text-pri); }
.skill-modal-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.skill-modal-count {
  font-size: 12px; font-weight: 700; color: var(--accent);
  background: var(--accent-dim); border-radius: 20px;
  padding: 4px 11px; flex-shrink: 0;
}

/* Skills button in conversation header */
.conv-skills-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 11px; border: 1px solid var(--border-muted);
  border-radius: 7px; background: transparent;
  color: var(--text-sec); font-size: 11px; font-weight: 500;
  cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.conv-skills-btn:hover {
  border-color: var(--accent); color: var(--accent);
  background: var(--accent-dim);
}
${NOTES_CSS}
${PROMPTS_CSS}
</style>
<script>${NOTES_MARKED}</script>
</head>
<body>
<div id="app">
  <!-- Navigation -->
  <nav id="nav">
    <div class="nav-logo">CC</div>
    <div class="nav-item active" data-module="overview" onclick="switchModule('overview')">
      <div class="nav-item-icon">&#9671;</div>
      <div class="nav-item-label">&#27010;&#35272;</div>
      <div class="nav-tooltip">&#25098;&#35266;&#20195;&#30475;&#26495;</div>
    </div>
    <div class="nav-item" data-module="history" onclick="switchModule('history')">
      <div class="nav-item-icon">&#9678;</div>
      <div class="nav-item-label">&#21382;&#21490;</div>
      <div class="nav-tooltip">&#21382;&#21490;&#23545;&#35805;</div>
    </div>
    <div class="nav-item" data-module="plans" onclick="switchModule('plans')">
      <div class="nav-item-icon">&#9672;</div>
      <div class="nav-item-label">&#35745;&#21010;</div>
      <div class="nav-tooltip">&#35745;&#21010;&#25991;&#20214;</div>
    </div>
    <div class="nav-item" data-module="stats" onclick="switchModule('stats')">
      <div class="nav-item-icon">&#9638;</div>
      <div class="nav-item-label">&#32479;&#35745;</div>
      <div class="nav-tooltip">&#20351;&#29992;&#25968;&#25454;&#32479;&#35745;</div>
    </div>
${PROMPTS_NAV_ITEM}
${NOTES_NAV_ITEM}
    <div class="nav-spacer"></div>
    <div class="nav-item" id="theme-btn" onclick="toggleTheme()">
      <div class="nav-item-icon" id="theme-icon">&#9728;</div>
      <div class="nav-item-label" id="theme-label">&#27982;&#33394;</div>
      <div class="nav-tooltip" id="theme-tooltip">&#20999;&#25442;&#28145;&#33394;</div>
    </div>
    <!-- Mode dropdown: hidden by default, shown via JS when codemaker is enabled -->
    <div id="mode-switch" class="mode-dd" onclick="toggleModeMenu(event)">
      <div class="mode-dd-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M7.5 6L3 12l4.5 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.5 6L21 12l-4.5 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="mode-dd-label">CC</div>
      <div class="mode-dd-caret">&#9660;</div>
      <div class="mode-dd-menu" id="mode-dd-menu">
        <div class="mode-dd-menu-title">&#20999;&#25442;&#27169;&#24335;</div>
        <div class="mode-dd-opt current" data-mode-opt="claude" onclick="event.stopPropagation();location.href='/'">
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
          <span class="mode-dd-check">&#10003;</span>
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
    <!-- Topbar -->
    <div id="topbar">
      <div class="topbar-title" id="topbar-title">&#27010;&#35272;</div>
      <div class="topbar-stats" id="topbar-stats"></div>
      <div class="topbar-flex"></div>
    </div>

    <!-- Content -->
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
          <div class="panel-header" style="display:flex;align-items:center;"><span style="flex:1">&#39033;&#30446;</span><button class="claudemd-icon" onclick="openClaudeMd('global')" title="&#20840;&#23616; CLAUDE.md">&#128196;</button></div>
          <div class="panel-search-wrap">
            <input type="text" id="project-search" class="panel-search" placeholder="&#25628;&#32034;&#39033;&#30446;..." autocomplete="off">
          </div>
          <div class="panel-scroll" id="project-list">
            <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
          </div>
        </div>
        <div class="session-panel">
          <div class="panel-header">&#20250;&#35805;</div>
          <div class="panel-search-wrap">
            <input type="text" id="session-search" class="panel-search" placeholder="&#25628;&#32034;&#20250;&#35805;..." autocomplete="off">
          </div>
          <div class="panel-scroll" id="session-list" style="flex:1;overflow-y:auto;padding:4px;">
            <div class="session-empty">
              <div class="session-empty-icon">&#9678;</div>
              <div>&#36873;&#25321;&#19968;&#20010;&#39033;&#30446;&#26597;&#30475;&#20250;&#35805;</div>
            </div>
          </div>
        </div>
        <div class="message-panel">
          <div id="message-panel-content" class="message-empty">
            <div class="message-empty-icon">&#9671;</div>
            <div>&#36873;&#25321;&#19968;&#20010;&#20250;&#35805;&#26597;&#30475;&#28040;&#24687;</div>
          </div>
        </div>
      </div>

      <!-- Stats Module -->
      <div id="mod-stats" class="module">
        <!-- Tab Bar -->
        <div class="stats-tab-bar">
          <button class="stats-tab active" data-tab="tokens" onclick="switchStatTab('tokens')">&#128202; Token &#32479;&#35745;</button>
          <button class="stats-tab" data-tab="skills" onclick="switchStatTab('skills')">&#9889; Skill &#32479;&#35745;</button>
        </div>

        <!-- Token Sub-Panel -->
        <div id="stats-token-panel" class="stats-sub-panel">
          <div class="stats-list-panel">
            <div class="stats-panel-header">
              <div class="stats-panel-title">&#39033;&#30446;&#21015;&#34920;</div>
              <button id="stats-compute-btn" class="compute-btn" onclick="triggerCompute()">
                <span class="compute-btn-icon">&#10227;</span> &#31435;&#21363;&#32479;&#35745;
              </button>
            </div>
            <div class="panel-search-wrap">
              <input type="text" id="stats-search" class="panel-search" placeholder="&#25628;&#32034;&#39033;&#30446;..." autocomplete="off">
            </div>
            <div id="stats-project-list" style="flex:1;overflow-y:auto;">
              <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
            </div>
          </div>
          <div class="stats-detail-panel" id="stats-detail-panel">
            <div class="empty-state">
              <div class="empty-icon" style="font-size:48px;opacity:0.15;">&#128202;</div>
              <div class="empty-title">&#36873;&#25321;&#19968;&#20010;&#39033;&#30446;</div>
              <div class="empty-subtitle">&#26597;&#30475; Token &#32479;&#35745;&#35814;&#24773;</div>
            </div>
          </div>
        </div>

        <!-- Skill Sub-Panel -->
        <div id="stats-skill-panel" class="stats-sub-panel" style="display:none">
          <div class="stats-list-panel">
            <div class="stats-panel-header">
              <div class="stats-panel-title">Skill &#25490;&#34892;</div>
              <button id="skill-compute-btn" class="compute-btn" onclick="triggerSkillCompute()">
                <span class="compute-btn-icon">&#10227;</span> &#31435;&#21363;&#32479;&#35745;
              </button>
            </div>
            <div class="panel-search-wrap">
              <input type="text" id="skill-search" class="panel-search" placeholder="&#25628;&#32034; Skill..." autocomplete="off">
            </div>
            <div id="skill-project-list" style="flex:1;overflow-y:auto;padding:6px 0;">
              <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
            </div>
          </div>
          <div class="stats-detail-panel" id="skill-detail-panel">
            <div class="empty-state">
              <div class="empty-icon" style="font-size:48px;opacity:0.15;">&#9889;</div>
              <div class="empty-title">&#36873;&#25321;&#19968;&#20010; Skill</div>
              <div class="empty-subtitle">&#26597;&#30475; Skill &#20351;&#29992;&#35814;&#24773;</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plans Module -->
      <div id="mod-plans" class="module">
        <div class="plans-list-panel">
          <div class="panel-header">&#35745;&#21010;&#25991;&#20214;</div>
          <div class="panel-search-wrap">
            <input type="text" id="plans-search" class="panel-search" placeholder="&#25628;&#32034;&#35745;&#21010;..." autocomplete="off">
          </div>
          <div class="panel-scroll" id="plans-list" style="flex:1;overflow-y:auto;padding:0;">
            <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
          </div>
        </div>
        <div class="plan-content-panel" id="plan-content-panel">
          <div class="empty-state">
            <div class="empty-icon">&#9672;</div>
            <div class="empty-title">&#36873;&#25321;&#19968;&#20010;&#35745;&#21010;&#25991;&#20214;</div>
            <div class="empty-subtitle">&#22312;&#24038;&#20391;&#21015;&#34920;&#20013;&#28857;&#20987;&#26597;&#30475;&#35814;&#24773;</div>
          </div>
        </div>
      </div>
${PROMPTS_MODULE_HTML}
${NOTES_MODULE_HTML}
    </div>
  </div>
</div>

<!-- Skill Modal -->
<div id="skill-modal" class="modal-backdrop" onclick="closeSkillModal(event)">
  <div class="modal-dialog">
    <div class="modal-header">
      <div class="modal-header-icon">&#9889;</div>
      <div>
        <div class="modal-title">&#26412;&#36755;&#23545;&#35805;&#20351;&#29992;&#30340; Skills</div>
        <div class="modal-subtitle" id="skill-modal-subtitle"></div>
      </div>
      <button class="modal-close" onclick="closeSkillModalBtn()">&#215;</button>
    </div>
    <div id="skill-modal-body" class="modal-body">
      <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
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
    statsMap: null,
    selectedProject: null,
    selectedSession: null,
    pendingSessionId: null,
    query: '',
    projectQuery: '',
    userOnly: false,
    convMessages: null,
    fullscreen: false,
    matchedIds: null,
    searchFallback: false,
    searchTimer: null,
    searchSeq: 0
  },
  plans: {
    data: null,
    selectedPlan: null,
    query: ''
  },
  stats: {
    data: null,
    selectedProject: null,
    query: '',
    activeTab: 'tokens',
    skillData: null,
    selectedSkill: null,
    skillQuery: ''
  }
};

// ── Utils ──
function relativeTime(ms) {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return '\\u521a\\u521a';
  const m = Math.floor(s / 60);
  if (m < 60) return m + '\\u5206\\u949f\\u524d';
  const h = Math.floor(m / 60);
  if (h < 24) return h + '\\u5c0f\\u65f6\\u524d';
  const d = Math.floor(h / 24);
  if (d < 30) return d + '\\u5929\\u524d';
  const mo = Math.floor(d / 30);
  if (mo < 12) return mo + '\\u4e2a\\u6708\\u524d';
  return Math.floor(mo / 12) + '\\u5e74\\u524d';
}

function fmtTime(ms) {
  const d = new Date(ms);
  return d.toTimeString().slice(0, 5);
}

function fmtDate(ms) {
  const d = new Date(ms);
  return \`\${d.getMonth()+1}/\${d.getDate()} \${d.toTimeString().slice(0,5)}\`;
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + 'K';
  return (bytes/1024/1024).toFixed(1) + 'M';
}

function fmtDateFull(ms) {
  const d = new Date(ms);
  return \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function highlight(text, query) {
  if (!query) return esc(text);
  const escaped = query.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
  return esc(text).replace(new RegExp(escaped, 'gi'), m => \`<mark>\${esc(m)}</mark>\`);
}

// ── Module Switch ──
function switchModule(id, pushHash = true) {
  S.activeModule = id;
  if (pushHash && location.hash !== '#' + id) {
    location.hash = id;
  }
  document.querySelectorAll('.nav-item[data-module]').forEach(el => {
    el.classList.toggle('active', el.dataset.module === id);
  });
  document.querySelectorAll('.module').forEach(el => {
    el.classList.toggle('active', el.id === 'mod-' + id);
  });
  document.getElementById('project-search').value = '';
  document.getElementById('session-search').value = '';
  document.getElementById('stats-search').value = '';
  document.getElementById('plans-search').value = '';
  if (id === 'overview') {
    document.getElementById('topbar-title').textContent = '\\u6982\\u89c8';
    updateOverviewTopbar();
    if (!S.overview.data) loadOverview();
  } else if (id === 'stats') {
    S.stats.query = '';
    document.getElementById('topbar-title').textContent = '\\u7edf\\u8ba1';
    updateStatsTopbar();
    if (S.stats.activeTab === 'tokens') {
      if (!S.stats.data) loadStats();
      else renderStatsProjectList();
    } else {
      if (!S.stats.skillData) loadSkillStats();
      else renderSkillLeaderboard();
    }
  } else if (id === 'history') {
    resetSessionSearch();
    S.history.projectQuery = '';
    document.getElementById('topbar-title').textContent = '\\u5386\\u53f2\\u5bf9\\u8bdd';
    updateHistoryStats();
    if (!S.history.data) loadHistory();
    else {
      renderSessions();
      if (S.history.pendingSessionId) {
        const pid = S.history.pendingSessionId;
        S.history.pendingSessionId = null;
        selectSession(pid);
        requestAnimationFrame(() => {
          const card = document.querySelector('.session-card[data-sid="' + pid + '"]');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    }
  } else if (id === 'plans') {
    S.plans.query = '';
    document.getElementById('topbar-title').textContent = '\\u8ba1\\u5212\\u6587\\u4ef6';
    updatePlansStats();
    if (!S.plans.data) loadPlans();
    else renderPlansList();
  } else if (id === 'prompts') {
    document.getElementById('topbar-title').textContent = 'Prompts';
    document.getElementById('topbar-stats').innerHTML = '';
    if (!S.prompts.data) loadPrompts();
  } else if (id === 'notes') {
    document.getElementById('topbar-title').textContent = '\u7b14\u8bb0';
    document.getElementById('topbar-stats').innerHTML = '';
  }
}

// Navigate from overview directly to a specific session
function goToSession(id) {
  S.history.pendingSessionId = id;
  S.history.selectedProject = null;
  switchModule('history');
}

function refreshData() {
  if (S.activeModule === 'overview') { S.overview.data = null; loadOverview(); }
  else if (S.activeModule === 'history') { S.history.data = null; loadHistory(); }
  else if (S.activeModule === 'plans') { S.plans.data = null; loadPlans(); }
  else if (S.activeModule === 'prompts') { S.prompts.data = null; loadPrompts(); }
  else if (S.activeModule === 'stats') {
    if (S.stats.activeTab === 'tokens') { S.stats.data = null; loadStats(); }
    else { S.stats.skillData = null; loadSkillStats(); }
  }
}

function resetSessionSearch() {
  S.history.query = '';
  S.history.matchedIds = null;
  S.history.searchFallback = false;
  S.history.searchSeq += 1;
  clearTimeout(S.history.searchTimer);
  const input = document.getElementById('session-search');
  if (input) input.value = '';
}

// ── Search ──
document.getElementById('project-search').addEventListener('input', e => {
  S.history.projectQuery = e.target.value.trim();
  renderProjectList();
});
document.getElementById('session-search').addEventListener('input', e => {
  S.history.query = e.target.value.trim();
  S.history.searchSeq += 1;
  clearTimeout(S.history.searchTimer);
  const seq = S.history.searchSeq;
  S.history.searchTimer = setTimeout(() => runSessionSearch(seq), 250);
});

async function runSessionSearch(seq) {
  const q = S.history.query;
  if (!q) {
    S.history.matchedIds = null;
    S.history.searchFallback = false;
    renderSessions();
    return;
  }
  try {
    const url = '/api/history/search?q=' + encodeURIComponent(q) +
      '&project=' + encodeURIComponent(S.history.selectedProject || '');
    const r = await fetch(url);
    const data = await r.json();
    if (seq !== S.history.searchSeq || q !== S.history.query) return;
    if (data.fallback) {
      S.history.matchedIds = null;
      S.history.searchFallback = true;
    } else {
      S.history.matchedIds = new Set(data.sessionIds || []);
      S.history.searchFallback = false;
    }
  } catch (err) {
    if (seq !== S.history.searchSeq || q !== S.history.query) return;
    console.warn('session search failed, fallback to display search', err);
    S.history.matchedIds = null;
    S.history.searchFallback = true;
  }
  renderSessions();
}
document.getElementById('stats-search').addEventListener('input', e => {
  S.stats.query = e.target.value.trim();
  renderStatsProjectList();
});
document.getElementById('skill-search').addEventListener('input', e => {
  S.stats.skillQuery = e.target.value.trim();
  renderSkillLeaderboard();
});
document.getElementById('plans-search').addEventListener('input', e => {
  S.plans.query = e.target.value.trim();
  renderPlansList();
});

// ── Overview ──

const OV_COLORS = [
  '#4070f0','#6d4fc9','#16a34a','#c47a00','#e85a4f','#0ea5e9'
];

function updateOverviewTopbar() {
  const el = document.getElementById('topbar-stats');
  if (!S.overview.data) { el.innerHTML = ''; return; }
  const k = S.overview.data.kpi;
  el.innerHTML = \`
    <div class="stat-chip">\\u603b Token <b>\${fmtT(k.totalTokens)}</b></div>
    <div class="stat-chip">\\u9879\\u76ee <b>\${k.totalProjects}</b></div>
    <div class="stat-chip">\\u4f1a\\u8bdd <b>\${k.totalSessions}</b></div>
    <div class="stat-chip">\\u8ba1\\u5212 <b>\${k.totalPlans}</b></div>
  \`;
}

async function loadOverview() {
  const el = document.getElementById('ov-scroll');
  el.innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
  try {
    const r = await fetch('/api/overview');
    S.overview.data = await r.json();
    renderOverview();
    updateOverviewTopbar();
  } catch(e) {
    el.innerHTML = '<div class="no-results">\\u52a0\\u8f7d\\u5931\\u8d25</div>';
  }
}

function renderOverview() {
  const el = document.getElementById('ov-scroll');
  const d = S.overview.data;
  if (!d) return;

  // ── KPI cards ──────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: '\\u603b Token \\u6d88\\u8017', value: fmtT(d.kpi.totalTokens),
      sub: '\\u4eca\\u65e5: ', subVal: fmtT(d.kpi.todayTokens),
      color: 'var(--accent)'
    },
    {
      label: '\\u6d3b\\u8dc3\\u9879\\u76ee', value: d.kpi.totalProjects,
      sub: '7 \\u5929\\u5185: ', subVal: d.kpi.activeProjectsLast7Days + ' \\u4e2a',
      color: 'var(--green)'
    },
    {
      label: '\\u603b\\u4f1a\\u8bdd\\u6570', value: d.kpi.totalSessions,
      sub: '\\u672c\\u6708: ', subVal: d.kpi.sessionsThisMonth + ' \\u6b21',
      color: 'var(--purple)'
    },
    {
      label: '\\u8ba1\\u5212\\u6587\\u4ef6', value: d.kpi.totalPlans,
      sub: '\\u8ba1\\u5212\\u6587\\u4ef6\\u603b\\u6570', subVal: '',
      color: 'var(--amber)'
    },
  ];

  const kpiHtml = \`
    <div class="ov-kpi-row">
      \${kpiCards.map(c => \`
        <div class="ov-kpi-card" style="--ov-card-color:\${c.color}">
          <div class="ov-kpi-label">\${c.label}</div>
          <div class="ov-kpi-value">\${c.value}</div>
          <div class="ov-kpi-sub">\${c.sub}<span class="ov-kpi-sub-val">\${c.subVal}</span></div>
        </div>
      \`).join('')}
    </div>
  \`;

  // ── 7-day trend (line chart + bar chart) ──────────────────────────────
  const trend = d.trend7Days;
  const maxTotal = Math.max(...trend.map(t => t.total), 1);

  // Line chart (SVG)
  const W = 400, H = 70;
  const pts = trend.map((t, i) => {
    const x = i === 0 ? 4 : i === trend.length - 1 ? W - 4 : (i / (trend.length - 1)) * (W - 8) + 4;
    const y = H - 6 - ((t.total / maxTotal) * (H - 12));
    return [x, y];
  });
  const linePts = pts.map(p => p.join(',')).join(' ');
  const areaPath = \`M\${pts[0][0]},\${H} \` + pts.map(p => \`L\${p[0]},\${p[1]}\`).join(' ') + \` L\${pts[pts.length-1][0]},\${H} Z\`;

  const lineChart = \`
    <svg class="ov-chart-svg" viewBox="0 0 \${W} \${H}" height="\${H}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ov-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="\${areaPath}" fill="url(#ov-area-grad)"/>
      <polyline points="\${linePts}" fill="none"
        stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      \${pts.map((p, i) => \`
        <circle cx="\${p[0]}" cy="\${p[1]}" r="3" fill="var(--accent)" opacity="\${d.trend7Days[i].total > 0 ? '1' : '0.3'}">
          <title>\${trend[i].date}: \${fmtT(trend[i].total)}</title>
        </circle>
      \`).join('')}
    </svg>
    <div class="ov-chart-labels">
      \${trend.map(t => {
        const parts = t.date.split('-');
        return \`<span>\${parts[1]}\\u002F\${parts[2]}</span>\`;
      }).join('')}
    </div>
  \`;

  // Bar chart (input vs output)
  const barChart = \`
    <div class="ov-bar-chart">
      \${trend.map(t => {
        const pct = Math.max(2, Math.round((t.total / maxTotal) * 100));
        return \`
          <div class="ov-bar-col" title="\${t.date}: \${fmtT(t.total)}">
            <div class="ov-bar-fill" style="height:\${pct}%"></div>
          </div>
        \`;
      }).join('')}
    </div>
    <div class="ov-chart-labels">
      \${trend.map(t => {
        const parts = t.date.split('-');
        return \`<span>\${parts[1]}\\u002F\${parts[2]}</span>\`;
      }).join('')}
    </div>
  \`;

  const trendHtml = \`
    <div class="ov-row2">
      <div class="ov-card">
        <div class="ov-card-title">
          7 \\u5929 Token \\u8d8b\\u52bf
          <span class="ov-card-badge">\\u6298\\u7ebf\\u56fe</span>
        </div>
        <div class="ov-chart-wrap">\${lineChart}</div>
      </div>
      <div class="ov-card">
        <div class="ov-card-title">
          \\u6bcf\\u65e5 Token \\u5bf9\\u6bd4
          <span class="ov-card-badge">\\u67f1\\u72b6\\u56fe</span>
        </div>
        <div class="ov-chart-wrap">\${barChart}</div>
      </div>
    </div>
  \`;

  // ── Recent sessions ────────────────────────────────────────────────────
  const sessionsHtml = d.recentSessions.length ? d.recentSessions.map(s => \`
    <div class="ov-session-item" onclick="goToSession('\${esc(s.id)}')" style="cursor:pointer">
      <div class="ov-session-dot"></div>
      <div class="ov-session-body">
        <div class="ov-session-proj">\${esc(s.projectName)}</div>
        <div class="ov-session-summary">\${esc(s.summary)}</div>
      </div>
      <div class="ov-session-time">\${esc(s.relativeTime)}</div>
    </div>
  \`).join('') : '<div class="ov-empty">\\u6682\\u65e0\\u4f1a\\u8bdd\\u8bb0\\u5f55</div>';

  // ── Top projects ───────────────────────────────────────────────────────
  const maxProjTok = d.topProjects.length ? d.topProjects[0].tokens : 1;
  const rankClass = i => ['r1','r2','r3','',''][i] || '';
  const projHtml = d.topProjects.length ? d.topProjects.map((p, i) => \`
    <div class="ov-proj-item">
      <div class="ov-proj-rank \${rankClass(i)}">\${i+1}</div>
      <div class="ov-proj-info">
        <div class="ov-proj-name" title="\${esc(p.path)}">\${esc(p.name)}</div>
        <div class="ov-proj-bar-wrap">
          <div class="ov-proj-bar-fill" style="width:\${Math.max(4,Math.round((p.tokens/maxProjTok)*100))}%"></div>
        </div>
      </div>
      <div class="ov-proj-tokens">\${fmtT(p.tokens)}</div>
    </div>
  \`).join('') : '<div class="ov-empty">\\u6682\\u65e0\\u6570\\u636e</div>';

  // ── Model shares ───────────────────────────────────────────────────────
  const modelHtml = d.modelShares.length ? d.modelShares.map((m, i) => {
    const color = OV_COLORS[i % OV_COLORS.length];
    const shortName = m.model.replace(/^claude-/, '').replace(/-\d{8}$/, '');
    return \`
      <div class="ov-model-item">
        <div class="ov-model-name" title="\${esc(m.model)}">\${esc(shortName)}</div>
        <div class="ov-model-track">
          <div class="ov-model-fill" style="width:\${m.percent}%;background:\${color}"></div>
        </div>
        <div class="ov-model-pct">\${m.percent}%</div>
      </div>
    \`;
  }).join('') : '<div class="ov-empty">\\u6682\\u65e0\\u6570\\u636e</div>';

  // ── Pie chart (SVG) ────────────────────────────────────────────────────
  let pieHtml = '<div class="ov-empty">\\u6682\\u65e0\\u6570\\u636e</div>';
  if (d.modelShares.length) {
    const R = 44, cx = 50, cy = 50;
    let cumAngle = -Math.PI / 2;
    const slices = d.modelShares.map((m, i) => {
      const angle = (m.percent / 100) * 2 * Math.PI;
      const x1 = cx + R * Math.cos(cumAngle);
      const y1 = cy + R * Math.sin(cumAngle);
      cumAngle += angle;
      const x2 = cx + R * Math.cos(cumAngle);
      const y2 = cy + R * Math.sin(cumAngle);
      const large = angle > Math.PI ? 1 : 0;
      const color = OV_COLORS[i % OV_COLORS.length];
      const shortName = m.model.replace(/^claude-/, '').replace(/-\d{8}$/, '');
      return { x1, y1, x2, y2, large, color, percent: m.percent, name: shortName };
    });
    const pieSvg = slices.length === 1
      ? \`<circle cx="\${cx}" cy="\${cy}" r="\${R}" fill="\${slices[0].color}"/>\`
      : slices.map(s => \`
          <path d="M\${cx},\${cy} L\${s.x1.toFixed(2)},\${s.y1.toFixed(2)} A\${R},\${R} 0 \${s.large} 1 \${s.x2.toFixed(2)},\${s.y2.toFixed(2)} Z"
            fill="\${s.color}" opacity="0.85">
            <title>\${esc(s.name)}: \${s.percent}%</title>
          </path>
        \`).join('');
    const legend = d.modelShares.slice(0, 6).map((m, i) => {
      const color = OV_COLORS[i % OV_COLORS.length];
      const shortName = m.model.replace(/^claude-/, '').replace(/-\d{8}$/, '');
      return \`
        <div class="ov-pie-legend-item">
          <div class="ov-pie-dot" style="background:\${color}"></div>
          <div class="ov-pie-legend-name" title="\${esc(m.model)}">\${esc(shortName)}</div>
          <div class="ov-pie-legend-pct">\${m.percent}%</div>
        </div>
      \`;
    }).join('');
    pieHtml = \`
      <div class="ov-pie-wrap">
        <svg viewBox="0 0 100 100" width="90" height="90" style="flex-shrink:0;">
          <circle cx="\${cx}" cy="\${cy}" r="\${R}" fill="var(--bg-elevated)"/>
          \${pieSvg}
          <circle cx="\${cx}" cy="\${cy}" r="26" fill="var(--bg-surface)"/>
        </svg>
        <div class="ov-pie-legend">\${legend}</div>
      </div>
    \`;
  }

  // ── Plans ──────────────────────────────────────────────────────────────
  const plansHtml = d.recentPlans.length ? d.recentPlans.map(p => {
    const ts = new Date(p.modified * 1000);
    const rel = relativeTime(p.modified * 1000);
    return \`
      <div class="ov-plan-item" onclick="switchModule('plans')">
        <div class="ov-plan-icon">&#9672;</div>
        <div class="ov-plan-body">
          <div class="ov-plan-title">\${esc(p.title)}</div>
          <div class="ov-plan-preview">\${esc(p.preview || '\\u65e0\\u9884\\u89c8')}</div>
        </div>
        <div class="ov-plan-time">\${rel}</div>
      </div>
    \`;
  }).join('') : '<div class="ov-empty">\\u6682\\u65e0\\u8ba1\\u5212\\u6587\\u4ef6</div>';

  // ── Memory ─────────────────────────────────────────────────────────────
  const memHtml = d.memoryEntries.length ? d.memoryEntries.map(m => {
    const rel = relativeTime(m.modified * 1000);
    return \`
      <div class="ov-mem-item">
        <div class="ov-mem-icon">&#9670;</div>
        <div class="ov-mem-body">
          <div class="ov-mem-proj">\${esc(m.projectName)}</div>
          <div class="ov-mem-snippet">\${esc(m.snippet)}</div>
        </div>
        <div class="ov-mem-time">\${rel}</div>
      </div>
    \`;
  }).join('') : '<div class="ov-empty">\\u6682\\u65e0\\u9879\\u76ee\\u8bb0\\u5fc6</div>';

  // ── Assemble ───────────────────────────────────────────────────────────
  el.innerHTML = \`
    \${kpiHtml}
    \${trendHtml}
    <div class="ov-row2">
      <div class="ov-card">
        <div class="ov-card-title">\\u6700\\u8fd1\\u4f1a\\u8bdd</div>
        \${sessionsHtml}
      </div>
      <div class="ov-card">
        <div class="ov-card-title">
          Token \\u6d88\\u8017 Top 5
          <span class="ov-card-badge">\\u6309\\u9879\\u76ee</span>
        </div>
        \${projHtml}
      </div>
    </div>
    <div class="ov-row3">
      <div class="ov-card">
        <div class="ov-card-title">\\u6a21\\u578b\\u4f7f\\u7528\\u5206\\u5e03</div>
        \${modelHtml}
      </div>
      <div class="ov-card">
        <div class="ov-card-title">\\u6a21\\u578b\\u5360\\u6bd4</div>
        \${pieHtml}
      </div>
      <div class="ov-card">
        <div class="ov-card-title">\\u8ba1\\u5212\\u6587\\u4ef6</div>
        \${plansHtml}
      </div>
    </div>
    \${d.memoryEntries.length ? \`
    <div class="ov-card">
      <div class="ov-card-title">
        \\u9879\\u76ee\\u8bb0\\u5fc6 (Auto Memory)
        <span class="ov-card-badge">\\u6700\\u8fd1\\u66f4\\u65b0</span>
      </div>
      \${memHtml}
    </div>\` : ''}
  \`;
}

// ── Stats ──
function fmtT(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtModelName(model) {
  return String(model || '')
    .replace(/^claude-/, '')
    .replace(/-\d{8}$/, '');
}

async function loadStats() {
  const el = document.getElementById('stats-project-list');
  el.innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
  try {
    const r = await fetch('/api/stats');
    S.stats.data = await r.json();
    renderStatsProjectList();
    updateStatsTopbar();
  } catch(e) {
    el.innerHTML = '<div class="no-results">\\u52a0\\u8f7d\\u5931\\u8d25</div>';
  }
}

async function triggerCompute() {
  const btn = document.getElementById('stats-compute-btn');
  const el = document.getElementById('stats-project-list');
  btn.disabled = true;
  btn.innerHTML = '<span class="compute-btn-icon">&#10227;</span> \\u7edf\\u8ba1\\u4e2d\\u2026';
  el.innerHTML = '<div class="loading"><div class="spinner"></div> \\u6b63\\u5728\\u626b\\u63cf\\u6240\\u6709\\u4f1a\\u8bdd\\u6570\\u636e\\u2026</div>';
  document.getElementById('stats-detail-panel').innerHTML =
    '<div class="empty-state"><div class="empty-icon" style="font-size:48px;opacity:0.15;">&#9672;</div><div class="empty-title">\\u7edf\\u8ba1\\u4e2d\\u2026</div></div>';
  try {
    const r = await fetch('/api/stats/compute', { method: 'POST' });
    S.stats.data = await r.json();
    renderStatsProjectList();
    updateStatsTopbar();
  } catch(e) {
    el.innerHTML = '<div class="no-results">\\u7edf\\u8ba1\\u5931\\u8d25\\uff0c\\u8bf7\\u91cd\\u8bd5</div>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="compute-btn-icon">&#10227;</span> \\u7acb\\u5373\\u7edf\\u8ba1';
  }
}

function updateStatsTopbar() {
  const el = document.getElementById('topbar-stats');
  if (S.stats.activeTab === 'skills') {
    if (!S.stats.skillData || S.stats.skillData.noData) { el.innerHTML = ''; return; }
    const s = S.stats.skillData.summary;
    const ts = S.stats.skillData.computedAt || '';
    el.innerHTML = \`
      <div class="stat-chip">&#21508;&#31181; Skill <b>\${s.uniqueSkills}</b></div>
      <div class="stat-chip">&#24635;&#35843;&#29992; <b>\${s.totalCalls}</b></div>
      <div class="stat-chip">&#39033;&#30446; <b>\${s.projectCount}</b></div>
      \${ts ? \`<div class="stat-chip" style="color:var(--text-sec)">&#32479;&#35745;&#20110; \${ts}</div>\` : ''}
    \`;
    return;
  }
  if (!S.stats.data || S.stats.data.noData) { el.innerHTML = ''; return; }
  const s = S.stats.data.summary;
  const ts = S.stats.data.computedAt || '';
  el.innerHTML = \`
    <div class="stat-chip">\\u603b\\u6d88\\u8017 <b>\${fmtT(s.totalTokens)}</b></div>
    <div class="stat-chip">\\u9879\\u76ee <b>\${s.totalProjects}</b></div>
    <div class="stat-chip">\\u4f1a\\u8bdd <b>\${s.totalSessions}</b></div>
    \${ts ? \`<div class="stat-chip" style="color:var(--text-sec)">\\u7edf\\u8ba1\\u4e8e \${ts}</div>\` : ''}
  \`;
}

function getFilteredStatsProjects() {
  if (!S.stats.data || !S.stats.data.projects) return [];
  const q = S.stats.query.toLowerCase();
  if (!q) return S.stats.data.projects;
  return S.stats.data.projects.filter(p =>
    p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
  );
}

function renderStatsProjectList() {
  const el = document.getElementById('stats-project-list');
  if (S.stats.data && S.stats.data.noData) {
    el.innerHTML = \`
      <div class="empty-state" style="padding:40px 20px;">
        <div class="empty-icon" style="font-size:36px;opacity:0.2;">&#9672;</div>
        <div class="empty-title" style="margin-top:4px;">\\u6682\\u65e0\\u7edf\\u8ba1\\u6570\\u636e</div>
        <div class="empty-subtitle">\\u70b9\\u51fb\\u300c\\u7acb\\u5373\\u7edf\\u8ba1\\u300d\\u751f\\u6210\\u6570\\u636e</div>
      </div>\`;
    return;
  }
  const projects = getFilteredStatsProjects();
  if (!projects.length) {
    el.innerHTML = '<div class="no-results">\\u65e0\\u5339\\u914d\\u9879\\u76ee</div>';
    return;
  }
  const maxT = projects[0].totalTokens;
  const rankClass = i => i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
  el.innerHTML = projects.map((p, i) => \`
    <div class="stats-proj-item \${p.path === S.stats.selectedProject ? 'selected' : ''}"
         data-path="\${esc(p.path)}" onclick="selectStatsProject(this.dataset.path)">
      <div class="stats-proj-rank \${rankClass(i)}">\${i + 1}</div>
      <div class="stats-proj-main">
        <div class="stats-proj-name" title="\${esc(p.path)}">\${esc(p.name)}</div>
        <div class="stats-proj-path">\${esc(p.path)}</div>
        <div class="stats-proj-bar">
          <div class="stats-proj-bar-fill" style="width:\${Math.max(3, Math.round((p.totalTokens/maxT)*100))}%"></div>
        </div>
      </div>
      <div class="stats-proj-nums">
        <div class="stats-proj-tokens">\${fmtT(p.totalTokens)}</div>
        <div class="stats-proj-sessions">\${p.sessionCount} \\u4f1a\\u8bdd</div>
      </div>
    </div>
  \`).join('');
}

function selectStatsProject(path) {
  S.stats.selectedProject = path;
  renderStatsProjectList();
  const project = S.stats.data.projects.find(p => p.path === path);
  renderStatsDetail(project);
}

function renderStatsDetail(project) {
  const panel = document.getElementById('stats-detail-panel');
  if (!project) {
    panel.innerHTML = '<div class="empty-state"><div class="empty-icon" style="font-size:48px;opacity:0.15;">&#9672;</div><div class="empty-title">\\u9009\\u62e9\\u4e00\\u4e2a\\u9879\\u76ee</div></div>';
    return;
  }

  const cacheTotal = project.cacheRead + project.cacheWrite;
  const metrics = \`
    <div class="metric-grid">
      <div class="metric-card mc-total">
        <div class="metric-icon">&#128202;</div>
        <div class="metric-label">\\u603b Token</div>
        <div class="metric-value">\${fmtT(project.totalTokens)}</div>
        <div class="metric-sub">\${project.sessionCount} \\u4e2a\\u4f1a\\u8bdd</div>
      </div>
      <div class="metric-card mc-input">
        <div class="metric-icon">&#8679;</div>
        <div class="metric-label">\\u8f93\\u5165</div>
        <div class="metric-value">\${fmtT(project.inputTokens)}</div>
        <div class="metric-sub">\${((project.inputTokens/project.totalTokens)*100).toFixed(1)}%</div>
      </div>
      <div class="metric-card mc-output">
        <div class="metric-icon">&#8681;</div>
        <div class="metric-label">\\u8f93\\u51fa</div>
        <div class="metric-value">\${fmtT(project.outputTokens)}</div>
        <div class="metric-sub">\${((project.outputTokens/project.totalTokens)*100).toFixed(1)}%</div>
      </div>
      <div class="metric-card mc-cache">
        <div class="metric-icon">&#9889;</div>
        <div class="metric-label">\\u7f13\\u5b58</div>
        <div class="metric-value">\${fmtT(cacheTotal)}</div>
        <div class="metric-sub">\\u547d\\u4e2d \${fmtT(project.cacheRead)}</div>
      </div>
    </div>\`;

  const modelEntries = Object.entries(project.models).sort((a,b) => b[1]-a[1]);
  const maxModel = modelEntries[0]?.[1] || 1;
  const modelBars = modelEntries.map(([m, t]) => \`
    <div class="model-bar-item">
      <div class="model-bar-name" title="\${esc(m)}">\${esc(m.replace('claude-',''))}</div>
      <div class="model-bar-track">
        <div class="model-bar-fill" style="width:\${Math.round((t/maxModel)*100)}%"></div>
      </div>
      <div class="model-bar-val">\${fmtT(t)} · \${((t/project.totalTokens)*100).toFixed(1)}%</div>
    </div>\`).join('');

  const daily30 = project.daily.slice(0, 30).reverse();
  const maxDaily = Math.max(...daily30.map(d => d.total), 1);
  const chartBars = daily30.map(d => {
    const pct = Math.max(4, Math.round((d.total / maxDaily) * 100));
    return \`<div class="daily-bar-col" title="\${esc(d.date)}: \${fmtT(d.total)}">
      <div class="daily-bar-fill" style="height:\${pct}%"></div>
    </div>\`;
  }).join('');
  const labelCols = daily30.map((d, i) => {
    const show = i === 0 || i === Math.floor(daily30.length/2) || i === daily30.length - 1;
    return \`<div class="daily-chart-label-col">\${show ? d.date.slice(5) : ''}</div>\`;
  }).join('');

  const dailyRows = project.daily.slice(0, 30).map(d => \`
    <tr>
      <td>\${esc(d.date)}</td>
      <td><b>\${fmtT(d.total)}</b></td>
      <td>\${fmtT(d.input)}</td>
      <td>\${fmtT(d.output)}</td>
      <td>\${fmtT(d.cacheRead + (d.cacheWrite||0))}</td>
    </tr>\`).join('');

  const sessionRows = project.sessions.map(s => \`
    <div class="srow">
      <span class="srow-id">\${esc(s.id.slice(0,8))}\\u2026</span>
      <span class="srow-total">\${fmtT(s.totalTokens)}</span>
      <span class="srow-breakdown">
        <span>\\u2191\${fmtT(s.inputTokens)}</span>
        <span>\\u2193\${fmtT(s.outputTokens)}</span>
        <span style="color:var(--amber)">\\u26a1\${fmtT(s.cacheRead)}</span>
      </span>
      <span class="srow-time">\${esc(s.lastTime)}</span>
    </div>\`).join('');

  panel.innerHTML = \`
    <div class="stats-detail-head">
      <div class="stats-detail-title">\${esc(project.name)}</div>
      <div class="stats-detail-path">\${esc(project.path)}</div>
      <div class="stats-detail-meta">\\u6700\\u540e\\u6d3b\\u8dc3 \${esc(project.lastActive)}</div>
    </div>
    <div class="stats-detail-scroll">
      \${metrics}
      <div class="stats-section">
        <div class="stats-section-title">\\u6a21\\u578b\\u5206\\u5e03</div>
        \${modelBars}
      </div>
      <div class="stats-section">
        <div class="stats-section-title">\\u6bcf\\u65e5\\u8d8b\\u52bf\\uff08\\u6700\\u8fd1 \${daily30.length} \\u5929\\uff09</div>
        <div class="daily-chart">\${chartBars}</div>
        <div class="daily-chart-labels">\${labelCols}</div>
        <table class="daily-table">
          <tr><th>\\u65e5\\u671f</th><th>\\u603b\\u8ba1</th><th>\\u8f93\\u5165</th><th>\\u8f93\\u51fa</th><th>\\u7f13\\u5b58</th></tr>
          \${dailyRows}
        </table>
      </div>
      <div class="stats-section">
        <div class="stats-section-title">\\u4f1a\\u8bdd\\u660e\\u7ec6\\uff08\\u5171 \${project.sessionCount} \\u4e2a\\uff09</div>
        <div class="session-rows">\${sessionRows}</div>
      </div>
    </div>\`;
}

// ── Skill Stats Tab ──
function switchStatTab(tab) {
  S.stats.activeTab = tab;
  document.querySelectorAll('.stats-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  const tokenPanel = document.getElementById('stats-token-panel');
  const skillPanel = document.getElementById('stats-skill-panel');
  tokenPanel.style.display = tab === 'tokens' ? 'flex' : 'none';
  skillPanel.style.display  = tab === 'skills'  ? 'flex' : 'none';
  updateStatsTopbar();
  if (tab === 'skills') {
    if (!S.stats.skillData) loadSkillStats();
    else { renderSkillLeaderboard(); renderSkillOverview(); }
  }
}

async function loadSkillStats() {
  const el = document.getElementById('skill-project-list');
  el.innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
  try {
    const r = await fetch('/api/stats/skills');
    S.stats.skillData = await r.json();
    renderSkillLeaderboard();
    renderSkillOverview();
    updateStatsTopbar();
  } catch(e) {
    el.innerHTML = '<div class="no-results">\\u52a0\\u8f7d\\u5931\\u8d25</div>';
  }
}

async function triggerSkillCompute() {
  const btn = document.getElementById('skill-compute-btn');
  const el  = document.getElementById('skill-project-list');
  btn.disabled = true;
  btn.innerHTML = '<span class="compute-btn-icon">&#10227;</span> \\u7edf\\u8ba1\\u4e2d\\u2026';
  el.innerHTML = '<div class="loading"><div class="spinner"></div> \\u6b63\\u5728\\u626b\\u63cf\\u6240\\u6709\\u4f1a\\u8bdd\\u6570\\u636e\\u2026</div>';
  document.getElementById('skill-detail-panel').innerHTML =
    '<div class="empty-state"><div class="empty-icon" style="font-size:48px;opacity:0.15;">&#9889;</div><div class="empty-title">\\u7edf\\u8ba1\\u4e2d\\u2026</div></div>';
  try {
    const r = await fetch('/api/stats/skills/compute', { method: 'POST' });
    S.stats.skillData = await r.json();
    S.stats.selectedSkill = null;
    renderSkillLeaderboard();
    renderSkillOverview();
    updateStatsTopbar();
  } catch(e) {
    el.innerHTML = '<div class="no-results">\\u7edf\\u8ba1\\u5931\\u8d25\\uff0c\\u8bf7\\u91cd\\u8bd5</div>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="compute-btn-icon">&#10227;</span> \\u7acb\\u5373\\u7edf\\u8ba1';
  }
}

function renderSkillLeaderboard() {
  const el = document.getElementById('skill-project-list');
  if (!S.stats.skillData || S.stats.skillData.noData) {
    el.innerHTML = \`
      <div class="empty-state" style="padding:40px 20px;">
        <div class="empty-icon" style="font-size:36px;opacity:0.2;">&#9889;</div>
        <div class="empty-title" style="margin-top:4px;">\\u6682\\u65e0 Skill \\u6570\\u636e</div>
        <div class="empty-subtitle">\\u70b9\\u51fb\\u300c\\u7acb\\u5373\\u7edf\\u8ba1\\u300d\\u751f\\u6210\\u6570\\u636e</div>
      </div>\`;
    return;
  }
  const skills = S.stats.skillData.skills;
  const q = (S.stats.skillQuery || '').toLowerCase();
  const filtered = q ? skills.filter(s => s.name.toLowerCase().includes(q)) : skills;
  if (!filtered.length) {
    el.innerHTML = '<div class="no-results">\\u65e0\\u5339\\u914d Skill</div>';
    return;
  }
  const maxCalls = filtered[0].totalCalls || 1;
  const rankBadge = i => i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
  el.innerHTML = filtered.map((s, i) => \`
    <div class="skill-rank-item \${s.name === S.stats.selectedSkill ? 'selected' : ''}"
         data-name="\${esc(s.name)}" onclick="selectSkill(this.dataset.name)">
      <div class="skill-rank-badge \${rankBadge(i)}">\${i + 1}</div>
      <div class="skill-rank-main">
        <div class="skill-rank-name" title="\${esc(s.name)}">\${esc(s.name)}</div>
        <div class="skill-rank-bar-wrap">
          <div class="skill-rank-bar">
            <div class="skill-rank-bar-fill" style="width:\${Math.round((s.totalCalls / maxCalls) * 100)}%"></div>
          </div>
          <span class="skill-rank-count">\${s.totalCalls}</span>
        </div>
      </div>
    </div>
  \`).join('');
}

function selectSkill(name) {
  S.stats.selectedSkill = name;
  renderSkillLeaderboard();
  const skill = S.stats.skillData.skills.find(s => s.name === name);
  renderSkillDetail(skill);
}

function _buildTrend30(dailyCounts) {
  const today = new Date();
  const days30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days30.push(d.toISOString().slice(0, 10));
  }
  const maxDay = Math.max(...days30.map(d => (dailyCounts[d] || 0)), 1);
  const bars = days30.map((day, i) => {
    const count = dailyCounts[day] || 0;
    const pct = count > 0 ? Math.max(4, Math.round((count / maxDay) * 100)) : 0;
    return \`<div class="daily-bar-col" title="\${esc(day)}: \${count}\\u6b21">
      <div class="daily-bar-fill" style="height:\${pct}%"></div>
    </div>\`;
  }).join('');
  const labels = days30.map((d, i) => \`<div class="daily-chart-label-col">\${(i === 0 || i === 14 || i === 29) ? d.slice(5) : ''}</div>\`).join('');
  return { bars, labels };
}

function renderSkillOverview() {
  const panel = document.getElementById('skill-detail-panel');
  if (!S.stats.skillData || S.stats.skillData.noData) {
    panel.innerHTML = \`
      <div class="empty-state">
        <div class="empty-icon" style="font-size:48px;opacity:0.15;">&#9889;</div>
        <div class="empty-title">\\u6682\\u65e0 Skill \\u6570\\u636e</div>
        <div class="empty-subtitle">\\u70b9\\u51fb\\u300c\\u7acb\\u5373\\u7edf\\u8ba1\\u300d\\u5f00\\u59cb\\u5206\\u6790</div>
      </div>\`;
    return;
  }
  const d = S.stats.skillData;
  const topSkills = d.skills.slice(0, 8);
  const maxCalls = topSkills[0]?.totalCalls || 1;
  const skillBars = topSkills.map(s => \`
    <div class="skill-proj-row" style="cursor:pointer" onclick="selectSkill('\${esc(s.name)}')">
      <div class="skill-proj-name" title="\${esc(s.name)}">\${esc(s.name)}</div>
      <div class="skill-proj-bar-wrap">
        <div class="skill-proj-bar-fill" style="width:\${Math.round((s.totalCalls / maxCalls) * 100)}%"></div>
      </div>
      <div class="skill-proj-count">\${s.totalCalls}</div>
    </div>
  \`).join('');

  // Build aggregated 30-day trend
  const aggDaily = {};
  for (const s of d.skills) {
    for (const [day, count] of Object.entries(s.dailyCounts || {})) {
      aggDaily[day] = (aggDaily[day] || 0) + count;
    }
  }
  const trend = _buildTrend30(aggDaily);

  panel.innerHTML = \`
    <div class="stats-detail-scroll">
      <div style="padding:18px 20px 10px">
        <div style="font-size:16px;font-weight:700;color:var(--text-pri);margin-bottom:2px">&#9889; Skill \\u4f7f\\u7528\\u6982\\u89c8</div>
        <div style="font-size:11px;color:var(--text-muted)">\\u70b9\\u51fb\\u5de6\\u4fa7\\u6392\\u884c\\u8868\\u67e5\\u770b\\u5355\\u4e2a Skill \\u8be6\\u60c5</div>
      </div>
      <div class="skill-overview-kpis">
        <div class="skill-kpi-card">
          <div class="skill-kpi-label">\\u552f\\u4e00 Skill</div>
          <div class="skill-kpi-value">\${d.summary.uniqueSkills}</div>
          <div class="skill-kpi-sub">\\u79cd\\u4e0d\\u540c\\u7684 Skill</div>
        </div>
        <div class="skill-kpi-card">
          <div class="skill-kpi-label">\\u603b\\u8c03\\u7528\\u6b21\\u6570</div>
          <div class="skill-kpi-value">\${d.summary.totalCalls}</div>
          <div class="skill-kpi-sub">\\u6b21 Skill \\u8c03\\u7528</div>
        </div>
        <div class="skill-kpi-card">
          <div class="skill-kpi-label">\\u6d89\\u53ca\\u9879\\u76ee</div>
          <div class="skill-kpi-value">\${d.summary.projectCount}</div>
          <div class="skill-kpi-sub">\\u4e2a\\u9879\\u76ee\\u4f7f\\u7528\\u4e86 Skill</div>
        </div>
        <div class="skill-kpi-card">
          <div class="skill-kpi-label">\\u6700\\u5e38\\u7528</div>
          <div class="skill-kpi-value" style="font-size:13px;word-break:break-all">\${esc(d.summary.topSkill || '\\u2014')}</div>
          <div class="skill-kpi-sub">\\u8c03\\u7528\\u6b21\\u6570\\u6700\\u591a</div>
        </div>
      </div>
      <div class="stats-section">
        <div class="stats-section-title">Top Skill \\u8c03\\u7528\\u6392\\u884c</div>
        <div class="skill-proj-rows">\${skillBars}</div>
      </div>
      <div class="stats-section">
        <div class="stats-section-title">\\u8fd1 30 \\u5929\\u8c03\\u7528\\u8d8b\\u52bf</div>
        <div class="daily-chart">\${trend.bars}</div>
        <div class="daily-chart-labels">\${trend.labels}</div>
      </div>
    </div>\`;
}

function renderSkillDetail(skill) {
  const panel = document.getElementById('skill-detail-panel');
  if (!skill) { renderSkillOverview(); return; }

  const maxProj = skill.projects[0]?.calls || 1;
  const projBars = skill.projects.slice(0, 10).map(p => \`
    <div class="skill-proj-row">
      <div class="skill-proj-name" title="\${esc(p.displayName)}">\${esc(p.displayName)}</div>
      <div class="skill-proj-bar-wrap">
        <div class="skill-proj-bar-fill" style="width:\${Math.round((p.calls / maxProj) * 100)}%"></div>
      </div>
      <div class="skill-proj-count">\${p.calls}</div>
    </div>
  \`).join('');

  const trend = _buildTrend30(skill.dailyCounts || {});

  panel.innerHTML = \`
    <div class="skill-detail-head">
      <div class="skill-detail-name">
        <span class="skill-detail-name-badge">&#9889;</span>
        \${esc(skill.name)}
      </div>
      <div class="skill-meta-row">
        <span class="skill-meta-pill"><b>\${skill.totalCalls}</b> \\u6b21\\u8c03\\u7528</span>
        \${skill.firstUsed ? \`<span class="skill-meta-pill">\\u9996\\u6b21: <b>\${esc(skill.firstUsed)}</b></span>\` : ''}
        \${skill.lastUsed  ? \`<span class="skill-meta-pill">\\u6700\\u8fd1: <b>\${esc(skill.lastUsed)}</b></span>\` : ''}
        <span class="skill-meta-pill"><b>\${skill.projects.length}</b> \\u4e2a\\u9879\\u76ee</span>
      </div>
    </div>
    <div class="stats-detail-scroll">
      \${skill.projects.length ? \`
      <div class="stats-section">
        <div class="stats-section-title">\\u4f7f\\u7528\\u9879\\u76ee (\${skill.projects.length} \\u4e2a)</div>
        <div class="skill-proj-rows">\${projBars}</div>
      </div>\` : ''}
      <div class="stats-section">
        <div class="stats-section-title">\\u8fd1 30 \\u5929\\u8c03\\u7528\\u8d8b\\u52bf</div>
        <div class="daily-chart">\${trend.bars}</div>
        <div class="daily-chart-labels">\${trend.labels}</div>
      </div>
    </div>\`;
}

// ── History ──
async function loadHistory() {
  document.getElementById('project-list').innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
  document.getElementById('session-list').innerHTML = '<div class="session-empty"><div class="session-empty-icon">&#9678;</div><div>\\u52a0\\u8f7d\\u4e2d\\u2026</div></div>';
  try {
    const r = await fetch('/api/history');
    S.history.data = await r.json();
    renderProjectList();
    renderSessions();
    updateHistoryStats();
    if (S.history.pendingSessionId) {
      const pid = S.history.pendingSessionId;
      S.history.pendingSessionId = null;
      selectSession(pid);
      requestAnimationFrame(() => {
        const card = document.querySelector('.session-card[data-sid="' + pid + '"]');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    // 非阻塞地加载 token 统计（有数据后自动更新卡片）
    loadHistoryStats();
  } catch(e) {
    document.getElementById('project-list').innerHTML = '<div class="no-results">\\u52a0\\u8f7d\\u5931\\u8d25</div>';
  }
}

async function loadHistoryStats() {
  try {
    // 优先复用已加载的 stats 数据，避免重复请求
    let statsData = S.stats.data;
    if (!statsData || statsData.noData) {
      const r = await fetch('/api/stats');
      if (!r.ok) return;
      statsData = await r.json();
    }
    // 若从未计算过，自动触发一次计算（后台静默完成）
    if (!statsData || statsData.noData) {
      const r2 = await fetch('/api/stats/compute', { method: 'POST' });
      if (!r2.ok) return;
      statsData = await r2.json();
      // 同步到 S.stats.data，让 Stats 页面也能复用
      S.stats.data = statsData;
    }
    if (!statsData || !statsData.projects) return;
    // 构建 sessionId → stat 快速查找表
    const map = new Map();
    for (const proj of statsData.projects) {
      for (const sess of (proj.sessions || [])) {
        map.set(sess.id, sess);
      }
    }
    S.history.statsMap = map;
    renderSessions(); // 有 token 数据后重渲染卡片
  } catch(e) {
    // 静默失败：token 信息不显示，不影响核心功能
  }
}

function updateHistoryStats() {
  const el = document.getElementById('topbar-stats');
  if (!S.history.data) { el.innerHTML = ''; return; }
  const s = S.history.data.stats;
  el.innerHTML = \`
    <div class="stat-chip">\\u6d88\\u606f <b>\${s.totalMessages.toLocaleString()}</b></div>
    <div class="stat-chip">\\u4f1a\\u8bdd <b>\${s.totalSessions}</b></div>
    <div class="stat-chip">\\u9879\\u76ee <b>\${s.totalProjects}</b></div>
  \`;
}

function renderProjectList() {
  const d = S.history.data;
  if (!d) return;
  const sel = S.history.selectedProject;
  const pq = S.history.projectQuery.toLowerCase();
  const filteredProjects = pq
    ? d.projects.filter(p => p.name.toLowerCase().includes(pq) || p.path.toLowerCase().includes(pq))
    : d.projects;
  let html = '';
  if (!pq) {
    html += \`
    <div class="all-item \${sel === null ? 'selected' : ''}" onclick="selectProject(null)">
      <div class="all-item-label"><span>&#9678;</span> \\u5168\\u90e8\\u9879\\u76ee</div>
      <div class="all-item-meta">\${d.stats.totalMessages.toLocaleString()} \\u6761\\u6d88\\u606f &#183; \${d.stats.totalSessions} \\u4e2a\\u4f1a\\u8bdd</div>
    </div>
  \`;
  }
  if (!filteredProjects.length && pq) {
    html += '<div class="no-results">\\u6682\\u65e0\\u5339\\u914d\\u9879\\u76ee</div>';
  }
  for (const p of filteredProjects) {
    const dotClass = \`dot-\${p.activityLevel}\`;
    html += \`
      <div class="project-item \${p.path === sel ? 'selected' : ''}" data-path="\${esc(p.path)}" onclick="selectProject(this.dataset.path)">
        <div class="project-dot \${dotClass}"></div>
        <div class="project-info">
          <div class="project-name" title="\${esc(p.path)}">\${esc(p.name)}</div>
          <div class="project-meta">\${p.sessionCount} \\u4f1a\\u8bdd &#183; \${relativeTime(p.lastActive)}</div>
        </div>
        <div class="project-badge">\${p.messageCount}</div>
        <button class="claudemd-icon" onclick="event.stopPropagation();openClaudeMd('project','\${esc(p.path)}')" title="CLAUDE.md">&#128196;</button>
      </div>
    \`;
  }
  document.getElementById('project-list').innerHTML = html;
}

function selectProject(path) {
  S.history.selectedProject = path;
  S.history.selectedSession = null;
  resetSessionSearch();
  renderProjectList();
  renderSessions();
  renderMessages(null);
}

function openClaudeMd(scope, projectPath) {
  let url = '/claude-md';
  if (scope === 'global') url += '?scope=global';
  else if (projectPath) url += '?project=' + encodeURIComponent(projectPath);
  window.open(url, '_blank');
}

function getFilteredSessions() {
  if (!S.history.data) return [];
  let sessions = S.history.data.sessions;
  if (S.history.selectedProject !== null) {
    sessions = sessions.filter(s => s.project === S.history.selectedProject);
  }
  const q = S.history.query.toLowerCase();
  if (q) {
    if (S.history.matchedIds !== null) {
      sessions = sessions.filter(s => S.history.matchedIds.has(s.id));
    } else {
      sessions = sessions.filter(s =>
        s.messages.some(m => m.display.toLowerCase().includes(q)) ||
        s.projectName.toLowerCase().includes(q)
      );
    }
  }
  return sessions;
}

function renderSessions() {
  const sessions = getFilteredSessions();
  const sel = S.history.selectedSession;
  const showProject = S.history.selectedProject === null;

  if (!sessions.length) {
    document.getElementById('session-list').innerHTML =
      '<div class="session-empty"><div class="session-empty-icon">&#9671;</div><div>\\u6682\\u65e0\\u5339\\u914d\\u4f1a\\u8bdd</div></div>';
    return;
  }

  let html = '';
  for (const s of sessions) {
    const summary = s.summary || '\\uff08\\u65e0\\u5185\\u5bb9\\uff09';
    const shortId = s.id.replace(/-/g, '').slice(0, 8);
    const stat = S.history.statsMap ? S.history.statsMap.get(s.id) : null;
    const modelHtml = stat && stat.model && stat.model !== 'unknown'
      ? \`<div class="session-model-chip" title="\\u6a21\\u578b: \${esc(stat.model)}">\${esc(fmtModelName(stat.model))}</div>\`
      : '';
    const tokenHtml = stat
      ? \`<div class="session-token-info" title="\\u8f93\\u5165: \${stat.inputTokens.toLocaleString()} | \\u8f93\\u51fa: \${stat.outputTokens.toLocaleString()} | \\u7f13\\u5b58\\u547d\\u4e2d: \${(stat.cacheRead||0).toLocaleString()}">
           <span class="tok-in">\\u2191\${fmtT(stat.inputTokens)}</span>
           <span class="tok-out">\\u2193\${fmtT(stat.outputTokens)}</span>
         </div>\`
      : '';
    html += \`
      <div class="session-card \${s.id === sel ? 'selected' : ''}" data-sid="\${esc(s.id)}" onclick="selectSession(this.dataset.sid)">
        <div class="session-top">
          <div class="session-date">\${fmtDate(s.lastTime)}</div>
          \${tokenHtml}
          <div class="session-count">\${s.messageCount} \\u6761</div>
        </div>
        <div class="session-summary">\${esc(summary)}</div>
        <div class="session-meta">
          <div class="session-id-chip" title="\\u4f1a\\u8bdd ID: \${esc(s.id)}&#10;\\u70b9\\u51fb\\u590d\\u5236" onclick="copySessionId('\${esc(s.id)}', event)">#\${shortId}</div>
          \${modelHtml}
        </div>
        \${showProject ? \`<div class="session-project-tag">&#128193; \${esc(s.projectName)}</div>\` : ''}
      </div>
    \`;
  }
  document.getElementById('session-list').innerHTML = html;
}

function selectSession(id) {
  S.history.selectedSession = id;
  renderSessions();
  const session = S.history.data.sessions.find(s => s.id === id);
  renderMessages(session);
}

function copyConvMsg(idx, btn) {
  const msgs = S.history.convMessages;
  if (!msgs || !msgs[idx]) return;
  const text = msgs[idx].text;
  const showCopied = () => {
    btn.classList.add('copied');
    btn.textContent = '\\u5df2\\u590d\\u5236 \\u2713';
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => {
      btn.textContent = '\\u590d\\u5236';
      btn.classList.remove('copied');
    }, 1500);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(showCopied).catch(() => {});
  } else {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      showCopied();
    } catch(_) {}
  }
}

function copySessionId(id, event) {
  event.stopPropagation();
  const chip = event.currentTarget;
  const restore = () => chip.classList.remove('copied');
  const showCopied = () => {
    chip.classList.add('copied');
    chip.dataset.origText = chip.textContent;
    chip.textContent = '\\u5df2\\u590d\\u5236 \\u2713';
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

async function loadConversation(sessionId, project) {
  const url = '/api/conversation?sessionId=' + encodeURIComponent(sessionId) + '&project=' + encodeURIComponent(project);
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return await r.json();
  } catch(e) {
    return null;
  }
}

// ── Skill Modal ──
async function openSkillModal(sessionId, project) {
  const modal    = document.getElementById('skill-modal');
  const body     = document.getElementById('skill-modal-body');
  const subtitle = document.getElementById('skill-modal-subtitle');
  modal.classList.add('open');
  body.innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
  subtitle.textContent = '';

  const url = '/api/session/skills?sessionId=' + encodeURIComponent(sessionId) + '&project=' + encodeURIComponent(project);
  try {
    const r = await fetch(url);
    const data = await r.json();
    const skills = data.skills || [];

    if (!skills.length) {
      body.innerHTML = \`
        <div class="modal-empty">
          <div class="modal-empty-icon">&#9889;</div>
          <div class="modal-empty-text">\\u672c\\u6b21\\u5bf9\\u8bdd\\u672a\\u4f7f\\u7528\\u4efb\\u4f55 Skill</div>
        </div>\`;
      return;
    }

    // Group by skill name and count calls
    const grouped = {};
    for (const s of skills) {
      grouped[s.skill] = (grouped[s.skill] || 0) + 1;
    }
    const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    subtitle.textContent = '\\u5171 ' + entries.length + ' \\u79cd Skill\\uff0c\\u8c03\\u7528 ' + skills.length + ' \\u6b21';

    body.innerHTML = entries.map(([name, count]) => \`
      <div class="skill-modal-card">
        <div class="skill-modal-icon">&#9889;</div>
        <div class="skill-modal-info">
          <div class="skill-modal-name">\${esc(name)}</div>
          <div class="skill-modal-sub">Skill</div>
        </div>
        <div class="skill-modal-count">\${count} \\u6b21</div>
      </div>
    \`).join('');
  } catch(e) {
    body.innerHTML = '<div class="modal-empty">\\u52a0\\u8f7d\\u5931\\u8d25</div>';
  }
}

function closeSkillModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('skill-modal').classList.remove('open');
}

function closeSkillModalBtn() {
  document.getElementById('skill-modal').classList.remove('open');
}

function renderMessages(session) {
  const container = document.getElementById('message-panel-content');
  if (!session) {
    container.className = 'message-empty';
    container.innerHTML = '<div class="message-empty-icon">&#9671;</div><div>\\u9009\\u62e9\\u4e00\\u4e2a\\u4f1a\\u8bdd\\u67e5\\u770b\\u5bf9\\u8bdd</div>';
    return;
  }

  // Show header + loading spinner while fetching
  container.className = 'message-panel';
  container.innerHTML = \`
    <div class="message-panel-header">
      <div>
        <div class="msg-panel-title">\${esc(session.projectName)}</div>
        <div class="msg-panel-subtitle">\${fmtDateFull(session.firstTime)} &#183; \${session.messageCount} \\u6761\\u7528\\u6237\\u8f93\\u5165</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="conv-skills-btn" onclick="openSkillModal('\${esc(session.id)}', '\${esc(session.project)}')">
          &#9889; Skills
        </button>
        <button id="conv-filter-btn" class="conv-filter-btn\${S.history.userOnly ? ' active' : ''}" onclick="toggleUserOnly()" title="\\u53ea\\u770b\\u7528\\u6237\\u8f93\\u5165">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          \\u4ec5\\u770b\\u7528\\u6237
        </button>
        <button id="conv-fullscreen-btn" class="conv-fullscreen-btn\${S.history.fullscreen ? ' active' : ''}" onclick="toggleConvFullscreen()" title="\${S.history.fullscreen ? '\\u9000\\u51fa\\u5168\\u5c4f (ESC)' : '\\u5168\\u5c4f\\u9605\\u8bfb (F)'}">
          \${S.history.fullscreen
            ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>'
            : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'
          }
        </button>
      </div>
    </div>
    <div class="conv-loading" id="conv-body">
      <div class="spinner"></div> \\u52a0\\u8f7d\\u5bf9\\u8bdd\\u4e2d\\u2026
    </div>
  \`;

  loadConversation(session.id, session.project).then(data => {
    const body = document.getElementById('conv-body');
    if (!body) return;

    const msgs = data && data.messages ? data.messages : (Array.isArray(data) ? data : []);
    const convPath = data && data.path ? data.path : '';
    if (msgs.length > 0) {
      S.history.convMessages = msgs;
      body.className = 'conv-list';
      if (S.history.userOnly) body.classList.add('user-only');
      body.innerHTML = msgs.map((m, i) => {
        const isUser = m.role === 'user';
        const roleLabel = isUser ? '\\u7528\\u6237' : 'AI';
        const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}) : '';
        const isLong = m.text.length > 600;
        const msgId = 'conv-msg-' + i;
        if (isUser) {
          return \`
            <div class="conv-turn conv-user">
              <div class="conv-role-label">\${roleLabel}</div>
              <div class="conv-bubble\${isLong ? ' collapsed' : ''}" id="\${msgId}">\${esc(m.text)}</div>
              \${isLong ? \`<span class="msg-expand" onclick="toggleExpand('\${msgId}', this)">\\u5c55\\u5f00\\u5168\\u6587</span>\` : ''}
              \${timeStr ? \`<div class="conv-time">\${timeStr}</div>\` : ''}
              <button class="conv-copy-btn" onclick="copyConvMsg(\${i}, this)">\\u590d\\u5236</button>
            </div>
          \`;
        } else {
          return \`
            <div class="conv-turn conv-assistant">
              <div class="conv-role-label">\${roleLabel}</div>
              <div class="conv-bubble md-body\${isLong ? ' collapsed' : ''}" id="\${msgId}">\${renderMarkdown(m.text)}</div>
              \${isLong ? \`<span class="msg-expand" onclick="toggleExpand('\${msgId}', this)">\\u5c55\\u5f00\\u5168\\u6587</span>\` : ''}
              \${timeStr ? \`<div class="conv-time">\${timeStr}</div>\` : ''}
              <button class="conv-copy-btn" onclick="copyConvMsg(\${i}, this)">\\u590d\\u5236</button>
            </div>
          \`;
        }
      }).join('');
    } else {
      // Fallback: show user messages from history.jsonl — hide filter btn (all turns are user)
      const filterBtn = document.getElementById('conv-filter-btn');
      if (filterBtn) filterBtn.style.display = 'none';
      body.className = 'conv-list';
      const q = S.history.query;
      let fallbackHtml = '<div class="conv-fallback-note">\\u672a\\u627e\\u5230\\u5b8c\\u6574\\u5bf9\\u8bdd\\u6587\\u4ef6\\uff0c\\u4ec5\\u663e\\u793a\\u7528\\u6237\\u8f93\\u5165\\u8bb0\\u5f55</div>';
      for (const m of session.messages) {
        const timeStr = fmtTime(m.timestamp);
        if (m.isSlash) {
          fallbackHtml += \`
            <div class="conv-turn conv-user">
              <div class="conv-role-label">\\u7528\\u6237</div>
              <span class="slash-tag"><span class="slash-dot"></span>\${esc(m.display.trim())}</span>
              <div class="conv-time">\${timeStr}</div>
            </div>
          \`;
        } else {
          const isLong = m.display.length > 300;
          const msgId = 'msg-' + Math.random().toString(36).slice(2);
          fallbackHtml += \`
            <div class="conv-turn conv-user">
              <div class="conv-role-label">\\u7528\\u6237</div>
              <div class="conv-bubble \${isLong ? 'collapsed' : ''}" id="\${msgId}">\${highlight(m.display, q)}</div>
              \${isLong ? \`<span class="msg-expand" onclick="toggleExpand('\${msgId}', this)">\\u5c55\\u5f00\\u5168\\u6587</span>\` : ''}
              \${m.hasPaste ? '<div class="paste-indicator">&#128206; \\u542b\\u7c98\\u8d34\\u5185\\u5bb9</div>' : ''}
              <div class="conv-time">\${timeStr}</div>
            </div>
          \`;
        }
      }
      body.innerHTML = fallbackHtml;
    }
    // Inject file path after conv-body
    if (convPath) {
      const oldPathRow = document.getElementById('conv-path-row');
      if (oldPathRow) oldPathRow.remove();
      const pathHtml = '<div class="conv-path-row" id="conv-path-row" onclick="copyConvPath()" title="' + esc(convPath) + '"><span>&#128196;</span><span class="conv-path-text" id="conv-path-text">' + esc(convPath) + '</span><span class="conv-path-copied" id="conv-path-copied">&#10003; 已复制</span></div>';
      body.insertAdjacentHTML('afterend', pathHtml);
    }
  });
}

function toggleExpand(id, btn) {
  const el = document.getElementById(id);
  const collapsed = el.classList.contains('collapsed');
  el.classList.toggle('collapsed', !collapsed);
  btn.textContent = collapsed ? '\\u6536\\u8d77' : '\\u5c55\\u5f00\\u5168\\u6587';
}

function toggleUserOnly() {
  S.history.userOnly = !S.history.userOnly;
  const btn = document.getElementById('conv-filter-btn');
  const list = document.getElementById('conv-body');
  if (btn) btn.classList.toggle('active', S.history.userOnly);
  if (list) list.classList.toggle('user-only', S.history.userOnly);
}

const ICON_EXPAND = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
const ICON_SHRINK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';

let _fsHintTimer = null;

function toggleConvFullscreen() {
  const panel = document.getElementById('message-panel-content');
  const btn   = document.getElementById('conv-fullscreen-btn');
  if (!panel || !panel.classList.contains('message-panel')) return;

  S.history.fullscreen = !S.history.fullscreen;
  panel.classList.toggle('fullscreen', S.history.fullscreen);

  if (btn) {
    btn.classList.toggle('active', S.history.fullscreen);
    if (S.history.fullscreen) {
      btn.title     = '\\u9000\\u51fa\\u5168\\u5c4f (ESC)';
      btn.innerHTML = ICON_SHRINK;
    } else {
      btn.title     = '\\u5168\\u5c4f\\u9605\\u8bfb (F)';
      btn.innerHTML = ICON_EXPAND;
    }
  }

  // Show/hide the ESC hint
  let hint = document.getElementById('conv-fs-hint');
  if (S.history.fullscreen) {
    if (!hint) {
      hint = document.createElement('div');
      hint.id        = 'conv-fs-hint';
      hint.className = 'conv-fs-hint';
      hint.textContent = 'ESC \\u9000\\u51fa\\u5168\\u5c4f';
      document.body.appendChild(hint);
    }
    clearTimeout(_fsHintTimer);
    // Trigger reflow so the transition plays
    hint.getBoundingClientRect();
    hint.classList.add('visible');
    _fsHintTimer = setTimeout(() => hint && hint.classList.remove('visible'), 2500);
  } else {
    if (hint) {
      hint.classList.remove('visible');
      clearTimeout(_fsHintTimer);
    }
  }
}

// ── Plans ──
async function loadPlans() {
  document.getElementById('plans-list').innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
  try {
    const r = await fetch('/api/plans');
    S.plans.data = await r.json();
    renderPlansList();
    updatePlansStats();
  } catch(e) {
    document.getElementById('plans-list').innerHTML = '<div class="no-results">\\u52a0\\u8f7d\\u5931\\u8d25</div>';
  }
}

function updatePlansStats() {
  const el = document.getElementById('topbar-stats');
  if (!S.plans.data) { el.innerHTML = ''; return; }
  const s = S.plans.data.stats;
  el.innerHTML = \`
    <div class="stat-chip">\\u8ba1\\u5212 <b>\${s.total}</b> \\u4e2a</div>
    <div class="stat-chip">\\u603b\\u5927\\u5c0f <b>\${fmtSize(s.totalSize)}</b></div>
  \`;
}

function getFilteredPlans() {
  if (!S.plans.data) return [];
  const q = S.plans.query.toLowerCase();
  if (!q) return S.plans.data.plans;
  return S.plans.data.plans.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.filename.toLowerCase().includes(q) ||
    p.content.toLowerCase().includes(q) ||
    p.preview.toLowerCase().includes(q)
  );
}

function renderPlansList() {
  const plans = getFilteredPlans();
  const sel = S.plans.selectedPlan;
  if (!plans.length) {
    document.getElementById('plans-list').innerHTML = '<div class="no-results">\\u6682\\u65e0\\u5339\\u914d\\u8ba1\\u5212</div>';
    return;
  }
  const q = S.plans.query;
  let html = '';
  for (const p of plans) {
    const modDate = relativeTime(p.modified * 1000);
    const sidChip = p.sessionId ? \`<div class="plan-session-chip" onclick="copyPlanSessionId(event, '\${esc(p.sessionId)}')" title="\\u4f1a\\u8bdd ID: \${esc(p.sessionId)}">&#128279; \${esc(p.sessionId.slice(0, 12))}\\u2026</div>\` : '';
    html += \`
      <div class="plan-card \${p.filename === sel ? 'selected' : ''}" data-filename="\${esc(p.filename)}" onclick="selectPlan(this.dataset.filename)">
        <div class="plan-title">\${highlight(p.title, q)}</div>
        <div class="plan-meta">
          <div class="plan-filename">\${esc(p.filename.replace('.md',''))}</div>
          <div class="plan-size-tag">\${fmtSize(p.size)}</div>
        </div>
        <div class="plan-preview">\${esc(p.preview)}</div>
        \${sidChip}
        <div class="plan-meta" style="margin-top:4px">
          <div class="plan-filename" style="color:var(--text-muted)">\${modDate}</div>
        </div>
      </div>
    \`;
  }
  document.getElementById('plans-list').innerHTML = html;
}

function selectPlan(filename) {
  S.plans.selectedPlan = filename;
  renderPlansList();
  const plan = S.plans.data.plans.find(p => p.filename === filename);
  renderPlanContent(plan);
}

function copyPlanSessionId(event, sid) {
  event.stopPropagation();
  navigator.clipboard.writeText(sid).then(() => {
    const chip = event.currentTarget;
    chip.classList.add('copied');
    chip.textContent = '已复制';
    setTimeout(() => {
      chip.classList.remove('copied');
      chip.textContent = '🔗 ' + sid.slice(0, 12) + '…';
    }, 1500);
  }).catch(() => {});
}

function renderPlanContent(plan) {
  const panel = document.getElementById('plan-content-panel');
  if (!plan) {
    panel.innerHTML = \`<div class="empty-state"><div class="empty-icon">&#9672;</div><div class="empty-title">\\u9009\\u62e9\\u4e00\\u4e2a\\u8ba1\\u5212\\u6587\\u4ef6</div></div>\`;
    return;
  }
  const modDate = new Date(plan.modified * 1000).toLocaleString('zh-CN');
  panel.innerHTML = \`
    <div class="plan-content-header">
      <div style="flex:1;min-width:0;">
        <div class="plan-content-title">\${esc(plan.title)}</div>
        <div class="plan-content-meta">\${esc(plan.filename)} &#183; \${modDate} &#183; \${fmtSize(plan.size)}</div>
        <div class="plan-path-row" onclick="copyPlanPath()" title="\${esc(plan.path)}">
          <span class="plan-path-label">&#128196;</span>
          <span class="plan-path-text" id="plan-path-text">\${esc(plan.path)}</span>
          <span class="plan-path-copied" id="plan-path-copied">&#10003; 已复制</span>
        </div>
      </div>
      <button class="plan-copy-btn" id="plan-copy-btn" onclick="copyPlanContent()">复制</button>
    </div>
    <div class="plan-content-scroll">
      <div class="md-body">\${renderMarkdown(plan.content)}</div>
    </div>
  \`;
}

async function copyPlanContent() {
  const plan = S.plans.data && S.plans.data.plans.find(p => p.filename === S.plans.selectedPlan);
  if (!plan) return;
  const btn = document.getElementById('plan-copy-btn');
  const mdBody = document.querySelector('.md-body');
  function showCopied() {
    btn.textContent = '已复制';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 1500);
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
  const plan = S.plans.data && S.plans.data.plans.find(function(p) { return p.filename === S.plans.selectedPlan; });
  if (!plan || !plan.path) return;
  try {
    await navigator.clipboard.writeText(plan.path);
    var el = document.getElementById('plan-path-copied');
    if (el) { el.classList.add('show'); setTimeout(function() { el.classList.remove('show'); }, 1500); }
  } catch(_) {}
}

// ── Markdown Renderer ──
function renderMarkdown(md) {
  const lines = md.split('\\n');
  let html = '';
  let i = 0;
  let inList = false;
  let listType = '';
  let inTable = false;

  function closeList() {
    if (inList) { html += \`</\${listType}>\`; inList = false; listType = ''; }
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
      html += \`<pre><code class="lang-\${esc(lang)}">\${code}</code></pre>\`;
      i++;
      continue;
    }

    if (/^[-*_]{3,}\$/.test(line.trim())) {
      closeList(); closeTable();
      html += '<hr>';
      i++; continue;
    }

    const hm = line.match(/^(#{1,6})\\s+(.+)/);
    if (hm) {
      closeList(); closeTable();
      const level = hm[1].length;
      html += \`<h\${level}>\${inlineMarkdown(hm[2])}</h\${level}>\`;
      i++; continue;
    }

    if (line.includes('|') && line.trim().startsWith('|')) {
      closeList();
      const cells = line.trim().split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) {
        inTable = true;
        html += '<table>';
        html += '<tr>' + cells.map(c => \`<th>\${inlineMarkdown(c.trim())}</th>\`).join('') + '</tr>';
        i++;
        if (i < lines.length && /^\\|?[\\s:|-]+\\|/.test(lines[i])) i++;
        continue;
      } else {
        html += '<tr>' + cells.map(c => \`<td>\${inlineMarkdown(c.trim())}</td>\`).join('') + '</tr>';
        i++; continue;
      }
    } else if (inTable) {
      closeTable();
    }

    const ulm = line.match(/^(\\s*)[*\\-+]\\s+(.+)/);
    const olm = line.match(/^(\\s*)\\d+\\.\\s+(.+)/);
    if (ulm) {
      if (!inList || listType !== 'ul') { closeList(); html += '<ul>'; inList = true; listType = 'ul'; }
      html += \`<li>\${inlineMarkdown(ulm[2])}</li>\`;
      i++; continue;
    } else if (olm) {
      if (!inList || listType !== 'ol') { closeList(); html += '<ol>'; inList = true; listType = 'ol'; }
      html += \`<li>\${inlineMarkdown(olm[2])}</li>\`;
      i++; continue;
    } else {
      closeList();
    }

    if (line.startsWith('> ')) {
      closeTable();
      html += \`<blockquote><p>\${inlineMarkdown(line.slice(2))}</p></blockquote>\`;
      i++; continue;
    }

    if (!line.trim()) {
      closeList(); closeTable();
      i++; continue;
    }

    closeTable();
    html += \`<p>\${inlineMarkdown(line)}</p>\`;
    i++;
  }
  closeList();
  closeTable();
  return html;
}

function inlineMarkdown(text) {
  return esc(text)
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>\$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>\$1</em>')
    .replace(/\`(.+?)\`/g, '<code>\$1</code>')
    .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="\$2" target="_blank">\$1</a>')
    .replace(/~~(.+?)~~/g, '<del>\$1</del>');
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

// ── Theme ──
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cc-show-theme', theme);
  const isDark = theme === 'dark';
  document.getElementById('theme-icon').textContent = isDark ? '\\u263e' : '\\u2600';
  document.getElementById('theme-label').textContent = isDark ? '\\u6df1\\u8272' : '\\u6d45\\u8272';
  document.getElementById('theme-tooltip').textContent = isDark ? '\\u5207\\u6362\\u6d45\\u8272' : '\\u5207\\u6362\\u6df1\\u8272';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── Init ──
const VALID_MODULES = ['overview', 'stats', 'history', 'plans', 'prompts', 'notes'];
function moduleFromHash() {
  const h = location.hash.replace(/^#/, '');
  return VALID_MODULES.includes(h) ? h : 'overview';
}
window.addEventListener('hashchange', () => {
  switchModule(moduleFromHash(), false);
});
window.addEventListener('load', () => {
  const saved = localStorage.getItem('cc-show-theme') || 'light';
  applyTheme(saved);

  // ── Notes init (must run before switchModule so the hook is in place) ──
  notesInit();
  notesHookSwitchModule();
  promptsInit();

  const initial = moduleFromHash();
  if (initial === 'overview') {
    loadOverview();
  } else {
    // always pre-load overview data silently, then switch to target
    loadOverview();
    switchModule(initial, false);
  }
  initModeDropdown();

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    // ESC: exit fullscreen
    if (e.key === 'Escape' && S.history.fullscreen) {
      toggleConvFullscreen();
      return;
    }
    // F: toggle fullscreen (only when history is active, a session is selected, and no input focused)
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
${PROMPTS_JS}
${NOTES_JS}
</script>
</body>
</html>`
