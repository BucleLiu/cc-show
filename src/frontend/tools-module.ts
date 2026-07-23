// ── 0. CodeMirror bundle (build-time injected by tsup define) ─────────────────

declare const __CODEMIRROR_MIN_JS__: string
export const CODEMIRROR_BUNDLE: string = __CODEMIRROR_MIN_JS__

// ── 1. CSS ────────────────────────────────────────────────────────────────────

export const TOOLS_CSS = `
/* ── Tools Module ─────────────────────────────────────────────────── */
#mod-tools { overflow: hidden; }

/* Tool list panel */
.tools-list-panel {
  width: 200px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  flex-shrink: 0; overflow: hidden;
  position: relative; transition: width 0.2s ease;
}
.tools-list-header {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px 6px; flex-shrink: 0;
  border-bottom: 1px solid var(--border-sub);
  position: relative;
}
.tools-list-title {
  font-size: 12px; font-weight: 700; color: var(--text-pri);
  flex: 1;
}
.tools-list-scroll { flex: 1; overflow-y: auto; padding: 4px; }

/* Tool item in list */
.tool-entry {
  padding: 10px 12px; margin: 2px 4px;
  border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  border: 1px solid transparent;
  transition: background 0.12s, border-color 0.12s;
}
.tool-entry:hover { background: var(--bg-hover); }
.tool-entry.active {
  background: var(--accent-dim);
  border-color: var(--border-acc);
}
.tool-entry-icon-wrap {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: var(--bg-elevated);
  color: var(--text-muted);
  transition: background 0.12s, color 0.12s;
}
.tool-entry:hover .tool-entry-icon-wrap {
  background: var(--bg-hover);
  color: var(--text-sec);
}
.tool-entry.active .tool-entry-icon-wrap {
  background: var(--accent-dim);
  color: var(--accent);
}
.tool-entry-body { flex: 1; min-width: 0; }
.tool-entry-name {
  font-size: 12px; font-weight: 600; color: var(--text-pri);
}
.tool-entry-desc {
  font-size: 10px; color: var(--text-muted); margin-top: 1px;
}

/* Workarea */
.tools-workarea {
  flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;
  background: var(--bg-base);
}
.tools-workarea-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--text-muted); gap: 12px;
}
.tools-workarea-empty svg { opacity: 0.25; }
.tools-workarea-empty-text { font-size: 13px; }

/* Sub-tabs (Edit / Saved) */
.tools-subtabs {
  display: flex; gap: 2px; padding: 6px 12px 0;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
}
.tools-subtab {
  padding: 5px 14px; font-size: 12px; font-weight: 600;
  border: none; border-bottom: 2px solid transparent;
  background: transparent; color: var(--text-muted); cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
}
.tools-subtab:hover { color: var(--text-pri); background: var(--bg-hover); }
.tools-subtab.active { color: var(--accent); border-bottom-color: var(--accent); }

/* Toolbar */
.tools-toolbar {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; background: var(--bg-surface);
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
}
.tools-btn {
  height: 28px; padding: 0 12px; border-radius: 7px;
  border: 1px solid var(--border-muted); background: var(--bg-elevated);
  color: var(--text-sec); font-size: 11px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 5px;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.tools-btn:hover { background: var(--bg-hover); border-color: var(--border-acc); color: var(--text-pri); }
.tools-btn svg { flex-shrink: 0; }
.tools-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.tools-btn.primary:hover { opacity: 0.9; }
.tools-btn.danger { color: var(--text-muted); }
.tools-btn.danger:hover { color: #dc2626; border-color: #dc2626; background: rgba(220,38,38,0.08); }
.tools-btn-success { color: var(--green); border-color: var(--green); }
.tools-btn-success:hover { background: rgba(22,163,74,0.1); color: var(--green); border-color: var(--green); }
.tools-toolbar-spacer { flex: 1; }

/* CodeMirror editor container */
.tools-cm-wrap { flex: 1; overflow: hidden; }
.tools-cm-wrap .cm-editor { height: 100%; outline: none; }
.tools-cm-wrap .cm-editor .cm-scroller {
  overflow: auto;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace;
  font-size: 13px; line-height: 1.7;
}
.tools-cm-wrap .cm-editor .cm-content {
  padding: 12px 0;
}
.tools-cm-wrap .cm-editor .cm-gutters {
  border-right: 1px solid var(--border-sub);
  background: var(--bg-surface);
  color: var(--text-muted);
  border: none;
}
.tools-cm-wrap .cm-editor .cm-activeLineGutter {
  background: var(--bg-hover);
}
.tools-cm-wrap .cm-editor .cm-activeLine {
  background: var(--bg-hover);
}
.tools-cm-wrap .cm-editor .cm-foldPlaceholder {
  background: var(--bg-elevated);
  border-color: var(--border-muted);
  color: var(--text-muted);
}
.tools-cm-wrap .cm-editor .cm-tooltip {
  background: var(--bg-surface);
  border-color: var(--border-muted);
  color: var(--text-pri);
}
.tools-cm-wrap .cm-editor .cm-tooltip-autocomplete {
  background: var(--bg-surface);
  border-color: var(--border-muted);
}
.tools-cm-wrap .cm-editor .cm-tooltip-autocomplete > ul > li[aria-selected] {
  background: var(--accent-dim);
  color: var(--text-pri);
}
/* Lint (error diagnostics) */
.tools-cm-wrap .cm-editor .cm-lintRange-error {
  background-image: none;
  border-bottom: 2px wavy #dc2626;
}
.tools-cm-wrap .cm-editor .cm-lint-marker-error {
  color: #dc2626;
  cursor: pointer;
}
.tools-cm-wrap .cm-editor .cm-lintRange-error:hover {
  text-decoration: underline;
  text-decoration-color: #dc2626;
  text-decoration-style: wavy;
}

	/* Search panel */
	.tools-cm-wrap .cm-editor .cm-panel.cm-search {
	  background: var(--bg-surface);
	  border-bottom: 1px solid var(--border-sub);
	  padding: 6px 10px;
	  display: flex;
	  align-items: center;
	  gap: 6px;
	  flex-wrap: wrap;
	  font-size: 12px;
	  color: var(--text-sec);
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search .cm-textfield {
	  height: 26px;
	  padding: 0 8px;
	  border: 1px solid var(--border-muted);
	  border-radius: 6px;
	  background: var(--bg-elevated);
	  color: var(--text-pri);
	  font-size: 12px;
	  font-family: inherit;
	  outline: none;
	  min-width: 140px;
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search .cm-textfield:focus {
	  border-color: var(--accent);
	  box-shadow: 0 0 0 2px var(--accent-dim);
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search .cm-textfield::placeholder {
	  color: var(--text-muted);
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search button,
	.tools-cm-wrap .cm-editor .cm-panel.cm-search .cm-button {
	  height: 26px;
	  padding: 0 8px;
	  border: 1px solid var(--border-muted);
	  border-radius: 6px;
	  background: var(--bg-elevated);
	  color: var(--text-sec);
	  font-size: 11px;
	  font-weight: 600;
	  cursor: pointer;
	  display: inline-flex;
	  align-items: center;
	  gap: 3px;
	  transition: background 0.12s, border-color 0.12s, color 0.12s;
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search button:hover,
	.tools-cm-wrap .cm-editor .cm-panel.cm-search .cm-button:hover {
	  background: var(--bg-hover);
	  border-color: var(--border-acc);
	  color: var(--text-pri);
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search button[name="close"] {
	  margin-left: auto;
	  border: none;
	  background: transparent;
	  font-size: 16px;
	  color: var(--text-muted);
	  padding: 0 4px;
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search button[name="close"]:hover {
	  color: #dc2626;
	  background: rgba(220,38,38,0.08);
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search label {
	  display: inline-flex;
	  align-items: center;
	  gap: 3px;
	  font-size: 11px;
	  cursor: pointer;
	  color: var(--text-muted);
	}
	.tools-cm-wrap .cm-editor .cm-panel.cm-search input[type="checkbox"] {
	  accent-color: var(--accent);
	  width: 13px;
	  height: 13px;
	}
	/* Search match highlight */
	.tools-cm-wrap .cm-editor .cm-searchMatch {
	  background: var(--accent-glow);
	  border-bottom: 2px solid var(--accent);
	}
	.tools-cm-wrap .cm-editor .cm-searchMatch.cm-searchMatch-selected {
	  background: rgba(255,180,40,0.35);
	  border-bottom-color: #e6a000;
	}

/* Saved list */
.tools-saved-list { flex: 1; overflow-y: auto; padding: 4px; }
.tools-saved-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; margin: 2px 8px;
  border-radius: 8px; border: 1px solid transparent;
  transition: background 0.12s, border-color 0.12s;
}
.tools-saved-item:hover { background: var(--bg-hover); }
.tools-saved-item-info { flex: 1; min-width: 0; cursor: pointer; }
.tools-saved-item-name {
  font-size: 13px; font-weight: 600; color: var(--text-pri);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tools-saved-item-meta {
  font-size: 10px; color: var(--text-muted); margin-top: 2px;
}
.tools-saved-item-del {
  width: 26px; height: 26px; border-radius: 6px; border: none;
  background: transparent; color: var(--text-muted); font-size: 14px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.12s, color 0.12s;
}
.tools-saved-item-del:hover { background: rgba(220,38,38,0.12); color: #dc2626; }
.tools-saved-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; gap: 10px; color: var(--text-muted); font-size: 13px;
}
.tools-saved-empty svg { opacity: 0.25; }

/* Save dialog */
.tools-save-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.tools-save-dialog {
  background: var(--bg-surface); border: 1px solid var(--border-sub);
  border-radius: 12px; padding: 20px 24px; width: 380px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.tools-save-dialog h3 {
  font-size: 15px; font-weight: 700; margin: 0 0 12px; color: var(--text-pri);
}
.tools-save-input {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid var(--border-muted); border-radius: 7px;
  background: var(--bg-elevated); color: var(--text-pri);
  font-size: 13px; outline: none; margin-bottom: 14px;
}
.tools-save-input:focus { border-color: var(--accent); }
.tools-save-actions { display: flex; gap: 8px; justify-content: flex-end; }
.tools-save-cancel {
  height: 30px; padding: 0 14px; border-radius: 7px;
  border: 1px solid var(--border-muted); background: var(--bg-elevated);
  color: var(--text-sec); font-size: 12px; font-weight: 600; cursor: pointer;
}
.tools-save-confirm {
  height: 30px; padding: 0 14px; border-radius: 7px;
  border: 1px solid var(--accent); background: var(--accent);
  color: #fff; font-size: 12px; font-weight: 600; cursor: pointer;
}

/* ── Linked panel ── */
.tools-linked-panel { flex:1; display:flex; flex-direction:column; overflow:hidden; padding:12px; }
.tools-linked-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.tools-linked-hint { color: var(--tools-muted, #888); font-size:12px; }
.tools-linked-list { flex:1; overflow-y:auto; }
.tools-link-row { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:6px; cursor:pointer; }
.tools-link-row:hover { background: var(--tools-hover, rgba(0,0,0,0.05)); }
.tools-link-row.active { background: var(--tools-active, rgba(0,0,0,0.08)); }
.tools-link-arrow { width:14px; text-align:center; color:var(--tools-muted,#888); cursor:pointer; }
.tools-link-icon { font-size:16px; }
.tools-link-label { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.tools-link-tree { margin-left:22px; }
.tools-link-type-row { display:flex; gap:16px; margin-bottom:12px; font-size:14px; }
.tools-link-type-row label { display:flex; align-items:center; gap:4px; cursor:pointer; }

/* 引用导入弹框布局 */
.tools-import-section { margin-bottom: 10px; }
.tools-import-section-title {
  font-size: 11px; font-weight: 600; color: var(--text-sec); margin-bottom: 6px;
}
.tools-import-divider {
  display: flex; align-items: center; gap: 10px; margin: 12px 0;
  color: var(--text-muted); font-size: 11px;
}
.tools-import-divider::before,
.tools-import-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border-muted);
}
.tools-import-drop {
  border: 2px dashed var(--border-muted); border-radius: 10px;
  padding: 16px 12px; text-align: center; color: var(--text-muted);
  transition: border-color 0.15s, background 0.15s;
}
.tools-import-drop-icon { font-size: 22px; margin-bottom: 6px; }
.tools-import-drop-text { font-size: 11px; margin-bottom: 10px; }
.tools-file-btn {
  padding: 5px 14px; border-radius: 7px; border: 1px solid var(--border-muted);
  background: var(--bg-elevated); color: var(--text-sec); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.tools-file-btn:hover { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

/* ── Linked readonly bar ── */
.tools-linked-readonly-bar { display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-surface); border-bottom:1px solid var(--border-sub); flex-wrap:wrap; }
.tools-linked-path { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; color:var(--tools-muted,#888); min-width:200px; }
.tools-linked-actions { display:flex; gap:6px; flex-wrap:wrap; }
.tools-link-tree-node .tools-link-row { padding:4px 8px; }

/* ── File Preview ── */
.fp-preview-bar {
  display:flex; align-items:center; gap:8px; padding:8px 12px;
  background:var(--bg-surface); border-bottom:1px solid var(--border-sub);
  flex-shrink:0; flex-wrap:wrap;
}
.fp-preview-path {
  flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-size:12px; color:var(--text-muted); min-width:150px; font-family:monospace;
}
.fp-preview-content { flex:1; overflow:auto; }
.fp-img-wrap { display:flex; align-items:flex-start; justify-content:center; padding:16px; }
.fp-img-wrap img { max-width:100%; height:auto; border-radius:4px; }
.fp-unsupported {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  flex:1; gap:12px; color:var(--text-muted);
}
.fp-unsupported-icon { font-size:48px; opacity:0.3; }
.fp-unsupported-text { font-size:14px; }
.fp-unsupported-name { font-size:12px; font-family:monospace; color:var(--text-sec); }
.fp-loading {
  display:flex; align-items:center; justify-content:center; flex:1;
  color:var(--text-muted); font-size:13px;
}
`

// ── 2. Nav item (wrench icon SVG) ──────────────────────────────────────────────

export const TOOLS_NAV_ITEM = `
    <div class="nav-item" id="nav-tools" data-module="tools" onclick="switchModule('tools')" style="display:none">
      <div class="nav-item-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <div class="nav-item-label">工具</div>
      <div class="nav-tooltip">工具箱</div>
    </div>`

// ── 3. Module HTML ─────────────────────────────────────────────────────────────

export const TOOLS_MODULE_HTML = `
      <!-- Tools Module -->
      <div id="mod-tools" class="module">
        <!-- Tool list panel -->
        <div class="tools-list-panel">
          <div class="tools-list-header">
            <span class="tools-list-title">工具箱</span>
            <button class="panel-toggle-btn always-show" title="折叠面板" onclick="event.stopPropagation();togglePanelCollapse(this.closest('.tools-list-panel'),'tools')" style="flex:0;">&#9664;</button>
          </div>
          <div class="tools-list-scroll" id="tools-list-scroll">
          </div>
          <div class="panel-resize-handle"></div>
        </div>

        <!-- Workarea -->
        <div class="tools-workarea" id="tools-workarea">
          <div class="tools-workarea-empty" id="tools-workarea-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <div class="tools-workarea-empty-text">请从左侧选择一个工具</div>
          </div>
          <div class="tools-workarea-inner" id="tools-workarea-inner" style="display:none; flex-direction:column; flex:1; overflow:hidden">
          </div>
        </div>
      </div>`

// ── 4. JavaScript ──────────────────────────────────────────────────────────────

export const TOOLS_JS = `
// ── Tools Module ───────────────────────────────────────────────────────────

(function() {
  // ── Inline SVG icons (used in tool registry and UI) ──

  var ICON_JSON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3C5 3 4 5 4 7v3c0 1-1 2-2 2 1 0 2 1 2 2v3c0 2 1 4 4 4"/><path d="M16 3c3 0 4 2 4 4v3c0 1 1 2 2 2-1 0-2 1-2 2v3c0 2-1 4-4 4"/></svg>';

  var ICON_NOTE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';

  var ICON_FOLDER = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/></svg>';

  var ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  var ICON_COMPRESS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 8 10 12 14"/><polyline points="20 10 16 14 12 10"/><line x1="12" y1="4" x2="12" y2="14"/></svg>';

  var ICON_COPY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  var ICON_SAVE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  var ICON_TRASH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

  var ICON_OPEN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  var ICON_EYE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

  // ── Tool registry (extensible — add entries here for new tools) ──
  var TOOLS = [];
  if (window.CCS_NOTE) {
    TOOLS.push({
      id: 'markdown-notes',
      icon: ICON_NOTE,
      name: 'Markdown笔记',
      desc: '编辑、预览、管理 Markdown 笔记',
    });
  }
  TOOLS.push({
    id: 'json-format',
    icon: ICON_JSON,
    name: 'JSON 格式化',
    desc: '编辑、格式化、压缩 JSON',
  });
  TOOLS.push({
    id: 'file-preview',
    icon: ICON_EYE,
    name: '文件预览',
    desc: '浏览本地文件，Markdown、JSON、代码、图片',
  });
  // Future tools: add entries here

  // ── State ──
  S.tools = {
    activeToolId: null,
    activeSubtab: 'edit', // 'edit' | 'saved' | 'linked'
    savedFiles: null,
    saveDirty: false,
  };

  // ── Link list state ──
  var _linkListCache = null;
  var _activeLinkedFile = null;
  var _activePath = null;  // 当前聚焦项的绝对路径（文件夹或文件），用于高亮
  // 按需加载缓存：absPath → { nodes: [...], truncated: bool }
  var _dirCache = {};
  // 展开状态：absPath → true
  var _expandedDirs = {};

  // ── File Preview state ──
  var _fpLinks = null;
  var _fpActivePath = null;
  var _fpExpandedDirs = {};
  var _fpDirCache = {};
  var _fpActiveFile = null;

  // ── Init ──
  function toolsInit() {
    if (!window.CCS_TOOLS) return;
    var navEl = document.getElementById('nav-tools');
    if (navEl) navEl.style.display = '';
    // Render tool list
    renderToolList();
    // Panel collapse + resize
    var panel = document.querySelector('.tools-list-panel');
    if (panel) {
      if (typeof initPanelCollapse === 'function') initPanelCollapse(panel, 'tools');
      if (typeof initPanelResize === 'function') initPanelResize(panel, 'tools', 120, 500);
    }
    // Hook theme toggle to sync CodeMirror theme
    toolsHookTheme();
  }

  // ── Theme sync for CodeMirror ──
  var _toolsThemeHooked = false;
  function toolsHookTheme() {
    if (_toolsThemeHooked) return;
    _toolsThemeHooked = true;
    if (typeof window.applyTheme === 'function') {
      var orig = window.applyTheme;
      window.applyTheme = function(theme) {
        orig(theme);
        if (_cmView && _cmThemeComp) {
          var S = cmGetSetup();
          var isDark = theme === 'dark';
          var ext = isDark && S.oneDark ? S.oneDark : [];
          _cmView.dispatch({
            effects: _cmThemeComp.reconfigure(ext),
          });
        }
      };
    }
  }

  // ── Tool list ──
  function renderToolList() {
    var listEl = document.getElementById('tools-list-scroll');
    if (!listEl) return;
    listEl.innerHTML = TOOLS.map(function(t) {
      var active = S.tools.activeToolId === t.id ? ' active' : '';
      return '<div class="tool-entry' + active + '" data-tool="' + t.id + '" onclick="toolsSelectTool(\\'' + t.id + '\\')">'
        + '<div class="tool-entry-icon-wrap">' + t.icon + '</div>'
        + '<div class="tool-entry-body">'
        + '<div class="tool-entry-name">' + t.name + '</div>'
        + '<div class="tool-entry-desc">' + t.desc + '</div>'
        + '</div></div>';
    }).join('');
  }

  // ── Switch module hook ──
  var _toolsHooked = false;
  function toolsHookSwitchModule() {
    if (_toolsHooked) return;
    _toolsHooked = true;
    var orig = window.switchModule;
    window.switchModule = function(id, pushState) {
      orig(id, pushState);
      if (id === 'tools' && !S.tools.activeToolId) {
        // Use pending tool from hash, or default to first tool
        var toolId = window._pendingToolSelect || (TOOLS.length > 0 ? TOOLS[0].id : null);
        window._pendingToolSelect = null;
        if (toolId) toolsSelectTool(toolId, true);
      }
    };
  }

  // ── Select tool ──
  window.toolsSelectTool = function(toolId, silent) {
    S.tools.activeToolId = toolId;
    S.tools.activeSubtab = 'edit';
    renderToolList();

    var emptyEl = document.getElementById('tools-workarea-empty');
    var innerEl = document.getElementById('tools-workarea-inner');
    if (emptyEl) emptyEl.style.display = 'none';
    if (innerEl) innerEl.style.display = 'flex';

    if (toolId === 'markdown-notes') {
      renderMarkdownNotesWorkarea(innerEl);
      initNotesInTools();
    } else if (toolId === 'json-format') {
      renderJsonFormatWorkarea(innerEl);
      initCodeMirror();
    } else if (toolId === 'file-preview') {
      fpRenderSplitLayout(innerEl);
      fpLoadLinks();
    }
    if (!silent) updateHash({ tool: toolId });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // Markdown Notes
  // ═══════════════════════════════════════════════════════════════════════

  var _notesToolInited = false;

  function initNotesInTools() {
    if (_notesToolInited) {
      // Re-render list from cached state
      if (typeof notesRenderList === 'function') notesRenderList();
      return;
    }
    _notesToolInited = true;

    // Init panel collapse + resize
    var panel = document.querySelector('#tools-workarea-inner .notes-list-panel');
    if (panel) {
      if (typeof initPanelCollapse === 'function') initPanelCollapse(panel, 'tools-notes');
      if (typeof initPanelResize === 'function') initPanelResize(panel, 'tools-notes', 120, 500);
    }

    // Esc to close import modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && typeof notesCloseImport === 'function') notesCloseImport();
    });

    // Restore tab from localStorage
    if (typeof notesRestoreTab === 'function') notesRestoreTab();

    // Load data
    if (!_notesLoaded) {
      _notesLoaded = true;
      if (typeof loadNotesList === 'function') loadNotesList();
      if (typeof loadNoteLinksList === 'function') loadNoteLinksList();
    }
  }

  function renderMarkdownNotesWorkarea(container) {
    container.innerHTML = ''
      + '<div class="tools-notes-wrap">'
      // List panel
      + '<div class="notes-list-panel">'
      + '<div class="notes-list-header">'
      + '<button class="notes-new-btn" onclick="notesNewNote()">&#43; &#26032;&#24314;</button>'
      + '<button class="notes-import-btn" onclick="notesOpenImport()">&#8593; &#23548;&#20837;</button>'
      + '<button class="panel-toggle-btn always-show" title="&#25240;&#21472;&#38754;&#26495;" onclick="event.stopPropagation();togglePanelCollapse(this.closest(\\'.notes-list-panel\\'),\\'tools-notes\\')" style="flex:0;">&#9664;</button>'
      + '</div>'
      + '<div class="notes-tabs">'
      + '<button class="notes-tab" id="notes-tab-local" onclick="notesSwitchTab(\\'local\\')"><span>&#26412;&#22320;&#31508;&#35760;</span><span class="notes-tab-count" id="notes-tab-local-count">0</span></button>'
      + '<button class="notes-tab" id="notes-tab-links" onclick="notesSwitchTab(\\'links\\')"><span>&#24341;&#29992;&#31508;&#35760;</span><span class="notes-tab-count" id="notes-tab-links-count">0</span></button>'
      + '</div>'
      + '<div class="notes-search-wrap">'
      + '<input type="text" id="notes-search" class="notes-search" placeholder="&#25628;&#32034;&#26631;&#39064;&#12289;&#20869;&#23481;&#12289;&#26631;&#31614;..." autocomplete="off" oninput="notesOnSearch(this.value)">'
      + '</div>'
      + '<div class="notes-list-scroll" id="notes-list-scroll">'
      + '<div class="note-empty-state">'
      + '<div class="note-empty-state-icon">&#9636;</div>'
      + '<div>&#26082;&#26080;&#31508;&#35760;</div>'
      + '</div>'
      + '</div>'
      + '<div class="panel-resize-handle"></div>'
      + '</div>'
      // Editor panel
      + '<div class="notes-editor-panel" id="notes-editor-panel">'
      + '<div class="notes-editor-empty" id="notes-editor-empty">'
      + '<div class="notes-editor-empty-icon">&#9636;</div>'
      + '<div class="notes-editor-empty-text">&#36873;&#25321;&#19968;&#26465;&#31508;&#35760;&#65292;&#25110;&#26032;&#24314;</div>'
      + '</div>'
      + '<div class="notes-editor-inner" id="notes-editor-inner" style="display:none;flex-direction:column;flex:1;overflow:hidden">'
      + '<div class="notes-title-bar">'
      + '<div style="display:flex; align-items:center; gap:8px">'
      + '<input type="text" id="notes-title-input" class="notes-title-input" placeholder="&#31508;&#35760;&#26631;&#39064;" oninput="notesOnTitleChange(this.value)" style="flex:1; margin-bottom:0">'
      + '<button class="note-backup-btn" id="note-backup-btn" onclick="notesBackupLink()" style="display:none">&#128190; &#22791;&#20221;</button>'
      + '</div>'
      + '<div class="notes-tags-row" id="notes-tags-row">'
      + '<button class="note-add-tag-btn" id="notes-add-tag-btn" onclick="notesShowTagInput()">&#43; &#26631;&#31614;</button>'
      + '</div>'
      + '</div>'
      + '<div class="notes-view-toolbar">'
      + '<button class="notes-view-btn" id="notes-btn-preview" onclick="notesSwitchView(\\'preview\\')">&#9711; &#39044;&#35272;</button>'
      + '<button class="notes-view-btn" id="notes-btn-edit" onclick="notesSwitchView(\\'edit\\')">&#9998; &#32534;&#36753;</button>'
      + '<button class="notes-view-btn" id="notes-btn-split" onclick="notesSwitchView(\\'split\\')">&#9633; &#20998;&#23631;</button>'
      + '</div>'
      + '<div class="notes-content-area" id="notes-content-area">'
      + '<textarea id="notes-editor-textarea" class="notes-editor-textarea" placeholder="&#24320;&#22987;&#20889;&#20316;..." oninput="notesOnContentChange(this.value)"></textarea>'
      + '<div id="notes-preview-shell" class="notes-preview-shell no-toc">'
      + '<div id="notes-preview-pane" class="notes-preview-pane"></div>'
      + '<nav id="notes-preview-toc" class="notes-preview-toc" aria-label="Markdown heading navigation"></nav>'
      + '</div>'
      + '</div>'
      + '<div class="notes-status-bar">'
      + '<span class="notes-save-status saved" id="notes-save-status">&#10003; &#24050;&#20445;&#23384;</span>'
      + '<span class="note-path-row" id="note-path-row" onclick="notesCopyPath()" title="">'
      + '<span class="note-path-icon">&#9636;</span>'
      + '<span class="note-path-text" id="note-path-text"></span>'
      + '<span class="note-path-copied" id="note-path-copied">&#10003; &#24050;&#22797;&#21046;</span>'
      + '</span>'
      + '<span id="notes-word-count">&#23383;&#25968;: 0</span>'
      + '<span id="notes-line-count">&#34892;&#25968;: 0</span>'
      + '<span class="note-reveal-btn" id="note-reveal-btn" onclick="notesRevealLink()" style="display:none">&#128193; &#22312; Finder &#20013;&#26174;&#31034;</span>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // JSON Formatter
  // ═══════════════════════════════════════════════════════════════════════

  function renderJsonFormatWorkarea(container) {
    container.innerHTML = ''
      // Sub-tabs
      + '<div class="tools-subtabs">'
      + '<button class="tools-subtab active" id="tools-subtab-edit" onclick="toolsSwitchSubtab(\\'edit\\')">编辑</button>'
      + '<button class="tools-subtab" id="tools-subtab-saved" onclick="toolsSwitchSubtab(\\'saved\\')">已保存</button>'
      + '<button class="tools-subtab" id="tools-subtab-linked" onclick="toolsSwitchSubtab(\\'linked\\')">已引用</button>'
      + '</div>'
      // Readonly linked file bar (hidden by default)
      + '<div class="tools-linked-readonly-bar" id="tools-linked-readonly-bar" style="display:none">'
      + '<span class="tools-linked-path"></span>'
      + '<span class="tools-linked-actions">'
      + '<button class="tools-btn" onclick="toolsCopyLinked()">复制全部</button>'
      + '<button class="tools-btn" onclick="toolsLoadLinkedToEditor()">加载到编辑器</button>'
      + '<button class="tools-btn" id="tools-btn-reveal" onclick="toolsRevealLinked()">在 Finder 中显示</button>'
      + '<button class="tools-btn danger" onclick="toolsExitLinkedReadonly()">退出只读</button>'
      + '</span></div>'
      // Toolbar
      + '<div class="tools-toolbar" id="tools-toolbar">'
      + '<button class="tools-btn primary" onclick="toolsFormatJson()">' + ICON_CHECK + ' 格式化</button>'
      + '<button class="tools-btn" onclick="toolsCompressJson()">' + ICON_COMPRESS + ' 压缩</button>'
      + '<button class="tools-btn" onclick="toolsCopyJson()">' + ICON_COPY + ' 复制</button>'
      + '<button class="tools-btn" onclick="toolsOpenFile()">' + ICON_OPEN + ' 打开</button>'
      + '<span class="tools-toolbar-spacer"></span>'
      + '<button class="tools-btn danger" onclick="toolsClearJson()" title="清空">' + ICON_TRASH + ' 清空</button>'
      + '<button class="tools-btn tools-btn-success" onclick="toolsSaveJson()">' + ICON_SAVE + ' 保存</button>'
      + '</div>'
      // Hidden file input for opening local files
      + '<input type="file" id="tools-file-input" accept=".json,.jsonc,.txt" style="display:none" onchange="toolsHandleFileOpen(event)" />'
      // CodeMirror editor container
      + '<div class="tools-cm-wrap" id="tools-cm-wrap"></div>'
      // Saved list (hidden by default)
      + '<div class="tools-saved-list" id="tools-saved-list" style="display:none">'
      + '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载中...</div></div>'
      + '</div>'
      // Linked panel (hidden by default)
      + '<div class="tools-linked-panel" id="tools-linked-panel" style="display:none">'
      + '<div class="tools-linked-toolbar">'
      + '<button class="tools-btn primary" onclick="toolsShowLinkDialog()">+ 添加引用</button>'
      + '<span class="tools-linked-hint">仅做关联引用,不拷贝文件;只读查看</span>'
      + '</div>'
      + '<div class="tools-linked-list" id="tools-linked-list"></div>'
      + '</div>';
  }

  // ── CodeMirror ──
  var _cmView = null;
  var _cmThemeComp = null;
  var _cmEditableComp = null;

  function cmGetSetup() {
    return window.CodeMirrorSetup || {};
  }

  function cmThemeExtension() {
    var S = cmGetSetup();
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark && S.oneDark) return S.oneDark;
    return [];
  }

  function initCodeMirror() {
    var S = cmGetSetup();
    if (!S.EditorView) return;
    var container = document.getElementById('tools-cm-wrap');
    if (!container) return;

    if (_cmView) {
      // Check if the view is still attached to the current container.
      // If renderJsonFormatWorkarea was called again, the old DOM is destroyed
      // but _cmView still references the detached editor. Destroy and recreate.
      if (_cmView.dom.parentNode !== container) {
        _cmView.destroy();
        _cmView = null;
        _cmThemeComp = null;
        _cmEditableComp = null;
      } else {
        // Already initialized — request a remeasure (handles display:none → display:'' transition)
        _cmView.requestMeasure();
        return _cmView;
      }
    }

    _cmThemeComp = S.Compartment ? new S.Compartment : { of: function() { return []; } };
    _cmEditableComp = S.Compartment ? new S.Compartment : { of: function(x) { return x || []; } };

    _cmView = new S.EditorView({
      doc: '',
      extensions: [
        S.lineNumbers ? S.lineNumbers() : null,
        S.foldGutter ? S.foldGutter() : null,
        S.highlightActiveLine ? S.highlightActiveLine() : null,
        S.history ? S.history() : null,
        S.json ? S.json() : null,
        S.linter && S.jsonParseLinter ? S.linter(S.jsonParseLinter()) : null,
        S.syntaxHighlighting ? S.syntaxHighlighting(S.defaultHighlightStyle) : null,
        S.search ? S.search({ top: true }) : null,
        S.keymap ? S.keymap.of([
          (S.defaultKeymap || []),
          (S.historyKeymap || []),
          (S.foldKeymap || []),
          (S.searchKeymap || []),
        ].flat()) : null,
        _cmThemeComp.of(cmThemeExtension()),
        _cmEditableComp.of(S.EditorView.editable.of(true)),
      ].filter(Boolean),
      parent: container,
    });
    return _cmView;
  }

  function cmGetDoc() {
    return _cmView ? _cmView.state.doc.toString() : '';
  }

  function cmSetDoc(text) {
    if (!_cmView) return;
    _cmView.dispatch({
      changes: { from: 0, to: _cmView.state.doc.length, insert: text },
    });
  }

  // ── Subtab ──
  window.toolsSwitchSubtab = function(tab) {
    S.tools.activeSubtab = tab;
    document.querySelectorAll('.tools-subtab').forEach(function(el) {
      el.classList.toggle('active', el.id === 'tools-subtab-' + tab);
    });
    var toolbar = document.getElementById('tools-toolbar');
    var cmWrap = document.getElementById('tools-cm-wrap');
    var savedList = document.getElementById('tools-saved-list');
    var linkedPanel = document.getElementById('tools-linked-panel');
    if (tab === 'edit') {
      if (toolbar) toolbar.style.display = '';
      if (cmWrap) cmWrap.style.display = '';
      if (savedList) savedList.style.display = 'none';
      if (linkedPanel) linkedPanel.style.display = 'none';
      initCodeMirror();
      if (typeof toolsSetEditable === 'function') toolsSetEditable(true);
    } else if (tab === 'saved') {
      if (toolbar) toolbar.style.display = 'none';
      if (cmWrap) cmWrap.style.display = 'none';
      if (savedList) savedList.style.display = '';
      if (linkedPanel) linkedPanel.style.display = 'none';
      toolsHideLinkedReadonlyBar();
      _activeLinkedFile = null;
      toolsLoadSavedList();
    } else {
      // linked
      if (toolbar) toolbar.style.display = 'none';
      if (cmWrap) cmWrap.style.display = 'none';
      if (savedList) savedList.style.display = 'none';
      if (linkedPanel) linkedPanel.style.display = '';
      toolsHideLinkedReadonlyBar();
      _activeLinkedFile = null;
      toolsLoadLinkList();
    }
  };

  // ── JSON Format ──
  function cmErrPos(err, text) {
    var pos = 0;
    var m = err.message.match(/position (\\d+)/);
    if (m) pos = parseInt(m[1], 10);
    var line = 1, col = 1;
    for (var i = 0; i < pos && i < text.length; i++) {
      if (text.charCodeAt(i) === 10) { line++; col = 1; }
      else { col++; }
    }
    return '第 ' + line + ' 行, 第 ' + col + ' 列';
  }

  window.toolsFormatJson = function(silent) {
    var val = cmGetDoc().trim();
    if (!val) return;
    try {
      var obj = JSON.parse(val);
      var formatted = JSON.stringify(obj, null, 2);
      if (cmGetDoc() !== formatted) {
        cmSetDoc(formatted);
      }
      S.tools.saveDirty = true;
    } catch (e) {
      toolsShowToast('JSON 无效 — ' + cmErrPos(e, val) + ': ' + e.message.replace(/ in JSON at position \\d+/, ''));
    }
  };

  window.toolsCompressJson = function() {
    var val = cmGetDoc().trim();
    if (!val) return;
    try {
      var obj = JSON.parse(val);
      cmSetDoc(JSON.stringify(obj));
      S.tools.saveDirty = true;
    } catch (e) {
      toolsShowToast('JSON 无效 — ' + cmErrPos(e, val) + ': ' + e.message.replace(/ in JSON at position \\d+/, ''));
    }
  };

  window.toolsCopyJson = function() {
    var val = cmGetDoc().trim();
    if (!val) return;
    navigator.clipboard.writeText(val).then(function() {
      toolsShowToast('已复制到剪贴板');
    }).catch(function() {
      toolsShowToast('复制失败');
    });
  };

  window.toolsClearJson = function() {
    cmSetDoc('');
    if (_cmView) _cmView.focus();
    S.tools.saveDirty = false;
  };

  // ── Open local file ──
  window.toolsOpenFile = function() {
    var input = document.getElementById('tools-file-input');
    if (input) input.click();
  };

  window.toolsHandleFileOpen = function(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      initCodeMirror();
      cmSetDoc(reader.result);
      S.tools.saveDirty = false;
      toolsShowToast('已加载: ' + file.name);
    };
    reader.onerror = function() {
      toolsShowToast('读取文件失败');
    };
    reader.readAsText(file, 'UTF-8');
    // Reset input so the same file can be re-opened
    event.target.value = '';
  };

  // ── JSON Save ──
  window.toolsSaveJson = function() {
    var val = cmGetDoc().trim();
    if (!val) return;
    try {
      JSON.parse(val);
    } catch (e) {
      toolsShowToast('JSON 无效，无法保存');
      return;
    }
    toolsShowSaveDialog(val);
  };

  function toolsShowSaveDialog(content) {
    var overlay = document.createElement('div');
    overlay.className = 'tools-save-overlay';
    overlay.id = 'tools-save-overlay';
    overlay.innerHTML = '<div class="tools-save-dialog">'
      + '<h3>保存 JSON</h3>'
      + '<input type="text" class="tools-save-input" id="tools-save-name" placeholder="文件名（不需 .json 后缀）" autofocus>'
      + '<div class="tools-save-actions">'
      + '<button class="tools-save-cancel" onclick="toolsDismissSaveDialog()">取消</button>'
      + '<button class="tools-save-confirm" onclick="toolsConfirmSave()">保存</button>'
      + '</div></div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) toolsDismissSaveDialog();
    });
    document.body.appendChild(overlay);
    setTimeout(function() {
      var input = document.getElementById('tools-save-name');
      if (input) input.focus();
    }, 50);
    S.tools._pendingSaveContent = content;
  }

  window.toolsDismissSaveDialog = function() {
    var overlay = document.getElementById('tools-save-overlay');
    if (overlay) overlay.remove();
    S.tools._pendingSaveContent = null;
  };

  window.toolsConfirmSave = async function() {
    var nameInput = document.getElementById('tools-save-name');
    if (!nameInput) return;
    var name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    try {
      var res = await fetch('/api/tools/json-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, content: S.tools._pendingSaveContent }),
      });
      if (!res.ok) {
        var err = await res.json();
        toolsShowToast('保存失败: ' + (err.error || 'Unknown'));
        return;
      }
      toolsDismissSaveDialog();
      toolsShowToast('已保存');
      S.tools.saveDirty = false;
    } catch (e) {
      toolsShowToast('保存失败: ' + e.message);
    }
  };

  // ── Helpers ──

  function formatRelativeTime(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return '\\u521a\\u521a';
    if (mins < 60) return mins + '\\u5206\\u949f\\u524d';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + '\\u5c0f\\u65f6\\u524d';
    var days = Math.floor(hrs / 24);
    return days + '\\u5929\\u524d';
  }

  // ── Saved list ──
  async function toolsLoadSavedList() {
    var listEl = document.getElementById('tools-saved-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载中...</div></div>';
    try {
      var res = await fetch('/api/tools/json-format');
      if (!res.ok) throw new Error('Failed');
      var files = await res.json();
      S.tools.savedFiles = files;
      if (!files || files.length === 0) {
        listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>暂无保存的文件</div></div>';
        return;
      }
      listEl.innerHTML = files.map(function(f) {
        var sizeStr = f.size < 1024 ? f.size + ' B' : (f.size / 1024).toFixed(1) + ' KB';
        var timeStr = formatRelativeTime(new Date(f.mtime).getTime());
        return '<div class="tools-saved-item">'
          + '<div class="tools-saved-item-info" onclick="toolsLoadSavedFile(\\'' + escAttr(f.name) + '\\')">'
          + '<div class="tools-saved-item-name">' + escHtml(f.name) + '</div>'
          + '<div class="tools-saved-item-meta">' + sizeStr + ' &middot; ' + timeStr + '</div>'
          + '</div>'
          + '<button class="tools-saved-item-del" title="删除" onclick="event.stopPropagation();toolsDeleteSavedFile(\\'' + escAttr(f.name) + '\\')">&times;</button>'
          + '</div>';
      }).join('');
    } catch (e) {
      listEl.innerHTML = '<div class="tools-saved-empty"><div>加载文件列表失败</div></div>';
    }
  }

  window.toolsLoadSavedFile = async function(name) {
    try {
      var res = await fetch('/api/tools/json-format/' + encodeURIComponent(name));
      if (!res.ok) throw new Error('Failed');
      var data = await res.json();
      toolsSwitchSubtab('edit');
      initCodeMirror();
      cmSetDoc(data.content);
      toolsShowToast('已加载: ' + name);
    } catch (e) {
      toolsShowToast('加载失败');
    }
  };

  window.toolsDeleteSavedFile = async function(name) {
    if (!confirm('确定删除 ' + name + ' ？')) return;
    try {
      var res = await fetch('/api/tools/json-format/' + encodeURIComponent(name), { method: 'DELETE' });
      if (!res.ok) {
        var err = await res.json();
        toolsShowToast('删除失败: ' + (err.error || 'Unknown'));
        return;
      }
      toolsShowToast('已删除');
      toolsLoadSavedList();
    } catch (e) {
      toolsShowToast('删除失败: ' + e.message);
    }
  };

  // ── Linked list ──
  async function toolsLoadLinkList() {
    var listEl = document.getElementById('tools-linked-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载中...</div></div>';
    try {
      var res = await fetch('/api/tools/json-links');
      if (!res.ok) throw new Error('Failed');
      var data = await res.json();
      _linkListCache = data.links || [];
      toolsRenderLinkList();
    } catch (e) {
      listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载引用列表失败</div></div>';
    }
  }

  function toolsRenderLinkList() {
    var listEl = document.getElementById('tools-linked-list');
    if (!listEl) return;
    var links = _linkListCache;
    if (!links || links.length === 0) {
      listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>暂无引用</div></div>';
      return;
    }
    listEl.innerHTML = links.map(function(link) {
      var isFolder = link.type === 'folder';
      var icon = isFolder ? '\u{1F4C1}' : '\u{1F4C4}';
      var arrowHtml = '';
      var treeHtml = '';
      if (isFolder) {
        var expanded = _expandedDirs[link.path];
        arrowHtml = '<span class="tools-link-arrow" onclick="event.stopPropagation();toolsToggleLinkFolder(\\'' + escAttr(link.id) + '\\')">' + (expanded ? '\\u25BE' : '\\u25B8') + '</span>';
        if (expanded) {
          treeHtml = '<div class="tools-link-tree" id="tools-link-tree-' + link.id + '"></div>';
        }
      }
      var activeClass = (_activePath === link.path) ? ' active' : '';
      var rowClick = isFolder
        ? 'toolsToggleLinkFolder(\\'' + escAttr(link.id) + '\\')'
        : 'toolsOpenLinkedFile(\\'' + escAttr(link.id) + '\\')';
      return '<div class="tools-link-row' + activeClass + '" onclick="' + rowClick + '">'
        + arrowHtml
        + '<span class="tools-link-icon">' + icon + '</span>'
        + '<span class="tools-link-label">' + escHtml(link.label) + '</span>'
        + '<button class="tools-saved-item-del" title="移除引用" onclick="event.stopPropagation();toolsRemoveLink(\\'' + escAttr(link.id) + '\\')">&times;</button>'
        + '</div>'
        + treeHtml;
    }).join('');
    // Render tree content for expanded folders
    links.forEach(function(link) {
      if (link.type === 'folder' && _expandedDirs[link.path]) {
        toolsRenderLinkTreeContainer(link.id);
      }
    });
  }

  // ── Add link dialog ──
  window.toolsShowLinkDialog = function() {
    var overlay = document.createElement('div');
    overlay.className = 'tools-save-overlay';
    overlay.id = 'tools-link-overlay';
    overlay.innerHTML = '<div class="tools-save-dialog" style="width:420px">'
      + '<h3>添加引用</h3>'
      + '<div class="tools-import-section">'
      + '<div class="tools-import-section-title">选择文件夹或文件</div>'
      + '<div class="tools-import-drop">'
      + '<div class="tools-import-drop-icon">&#128193;</div>'
      + '<div class="tools-import-drop-text">选择文件夹或 .json 文件，路径自动填入下方输入框</div>'
      + '<div style="display:flex;gap:8px;justify-content:center">'
      + '<button class="tools-file-btn" onclick="event.stopPropagation();toolsPickLinkFolder()">&#128193; 文件夹</button>'
      + '<button class="tools-file-btn" onclick="event.stopPropagation();toolsPickLinkFile()">&#128196; 文件</button>'
      + '</div></div>'
      + '</div>'
      + '<div class="tools-import-divider"><span>或</span></div>'
      + '<div class="tools-import-section">'
      + '<div class="tools-import-section-title">输入路径</div>'
      + '<input type="text" class="tools-save-input" id="tools-link-path" placeholder="绝对路径，如 /path/to/data.json 或 /path/to/folder" autofocus style="margin-bottom:10px">'
      + '<input type="text" class="tools-save-input" id="tools-link-label" placeholder="显示名（可选，默认取文件名）">'
      + '</div>'
      + '<div class="tools-save-actions" style="margin-top:14px">'
      + '<button class="tools-save-cancel" onclick="toolsDismissLinkDialog()">取消</button>'
      + '<button class="tools-save-confirm" onclick="toolsConfirmLink()">确认</button>'
      + '</div></div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) toolsDismissLinkDialog();
    });
    document.body.appendChild(overlay);
  };

  window.toolsConfirmLink = async function() {
    var pathInput = document.getElementById('tools-link-path');
    var labelInput = document.getElementById('tools-link-label');
    if (!pathInput) return;
    var path = pathInput.value.trim();
    if (!path) { pathInput.focus(); toolsShowToast('请输入目标路径'); return; }
    var label = labelInput ? labelInput.value.trim() : '';
    try {
      var body = { path: path };
      if (label) body.label = label;
      var res = await fetch('/api/tools/json-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        var err = await res.json();
        toolsShowToast('添加失败: ' + (err.error || 'Unknown'));
        return;
      }
      toolsDismissLinkDialog();
      toolsShowToast('已添加引用');
      toolsLoadLinkList();
    } catch (e) {
      toolsShowToast('添加失败: ' + e.message);
    }
  };

  window.toolsPickLinkFolder = function() {
    pickNativePath('folder', function(p) {
      document.getElementById('tools-link-path').value = p;
      var name = p.replace(/\\/$/, '').split('/').pop();
      document.getElementById('tools-link-label').value = name;
    });
  };
  window.toolsPickLinkFile = function() {
    pickNativePath('file', function(p) {
      document.getElementById('tools-link-path').value = p;
      var name = p.replace(/\\.json$/i, '').split('/').pop();
      document.getElementById('tools-link-label').value = name;
    });
  };

  window.toolsDismissLinkDialog = function() {
    var overlay = document.getElementById('tools-link-overlay');
    if (overlay) overlay.remove();
  };

  window.toolsRemoveLink = async function(id) {
    if (!confirm('确定移除此引用？')) return;
    try {
      var res = await fetch('/api/tools/json-links/' + encodeURIComponent(id), { method: 'DELETE' });
      if (!res.ok) {
        var err = await res.json();
        toolsShowToast('移除失败: ' + (err.error || 'Unknown'));
        return;
      }
      toolsShowToast('已移除引用');
      toolsLoadLinkList();
    } catch (e) {
      toolsShowToast('移除失败: ' + e.message);
    }
  };

  // ── toolsSetEditable — toggle CodeMirror editable state ──
  window.toolsSetEditable = function(editable) {
    var S = cmGetSetup();
    if (!_cmView) return;
    if (_cmEditableComp && _cmEditableComp.reconfigure && S.EditorView) {
      _cmView.dispatch({
        effects: _cmEditableComp.reconfigure(S.EditorView.editable.of(!!editable)),
      });
    }
  };

  // ── toolsOpenLinkedFile — open a file-type link in read-only view ──
  window.toolsOpenLinkedFile = async function(id) {
    try {
      var res = await fetch('/api/tools/json-links/' + encodeURIComponent(id) + '/content');
      if (!res.ok) { toolsShowToast('加载失败'); return; }
      var data = await res.json();
      _activePath = data.path;
      toolsSwitchSubtab('edit');
      toolsSetEditable(false);
      initCodeMirror();
      cmSetDoc(data.content);
      toolsShowLinkedReadonlyView(data.path, id);
      toolsRenderLinkList();
    } catch (e) {
      toolsShowToast('加载失败: ' + e.message);
    }
  };

  // ── toolsOpenLinkedFileByPath — open a tree file by absolute path ──
  window.toolsOpenLinkedFileByPath = async function(absPath) {
    try {
      var res = await fetch('/api/tools/json-links/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: absPath }),
      });
      if (!res.ok) { toolsShowToast('加载失败'); return; }
      var data = await res.json();
      _activePath = absPath;
      toolsSwitchSubtab('edit');
      toolsSetEditable(false);
      initCodeMirror();
      cmSetDoc(data.content);
      toolsShowLinkedReadonlyView(absPath, null);
      toolsRenderLinkList();
    } catch (e) {
      toolsShowToast('加载失败: ' + e.message);
    }
  };

  // ── toolsToggleLinkFolder — expand/collapse top-level folder link ──
  window.toolsToggleLinkFolder = async function(id) {
    // Find the link to get its absolute path
    var link = (_linkListCache || []).find(function(l) { return l.id === id; });
    if (!link) return;
    var dirPath = link.path;

    if (_expandedDirs[dirPath]) {
      // Collapse
      delete _expandedDirs[dirPath];
      toolsRenderLinkList();
      return;
    }
    // Expand — fetch only if not cached
    _expandedDirs[dirPath] = true;
    _activePath = dirPath;
    if (!_dirCache[dirPath]) {
      try {
        var res = await fetch('/api/tools/json-links/' + encodeURIComponent(id) + '/tree');
        if (!res.ok) { toolsShowToast('加载目录失败'); delete _expandedDirs[dirPath]; toolsRenderLinkList(); return; }
        var data = await res.json();
        _dirCache[dirPath] = { nodes: data.tree || [], truncated: data.truncated };
        if (data.truncated) {
          toolsShowToast('目录较大，部分内容已截断');
        }
      } catch (e) {
        toolsShowToast('加载目录失败'); delete _expandedDirs[dirPath]; toolsRenderLinkList(); return;
      }
    }
    toolsRenderLinkList();
  };

  // ── toolsToggleTreeFolder — expand/collapse nested tree folder (lazy fetch) ──
  window.toolsToggleTreeFolder = async function(linkId, dirPath) {
    if (_expandedDirs[dirPath]) {
      // Collapse
      delete _expandedDirs[dirPath];
      toolsRenderLinkTreeContainer(linkId);
      return;
    }
    // Expand — fetch children on demand
    _expandedDirs[dirPath] = true;
    _activePath = dirPath;
    if (!_dirCache[dirPath]) {
      try {
        var res = await fetch('/api/tools/json-links/expand-dir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: dirPath }),
        });
        if (!res.ok) { toolsShowToast('加载目录失败'); delete _expandedDirs[dirPath]; toolsRenderLinkTreeContainer(linkId); return; }
        var data = await res.json();
        _dirCache[dirPath] = { nodes: data.nodes || [], truncated: data.truncated };
        if (data.truncated) {
          toolsShowToast('目录较大，部分内容已截断');
        }
      } catch (e) {
        toolsShowToast('加载目录失败'); delete _expandedDirs[dirPath]; toolsRenderLinkTreeContainer(linkId); return;
      }
    }
    toolsRenderLinkTreeContainer(linkId);
  };

  // ── toolsRenderLinkTreeContainer — render cached tree nodes for a top-level link ──
  function toolsRenderLinkTreeContainer(linkId) {
    var el = document.getElementById('tools-link-tree-' + linkId);
    if (!el) return;
    var link = (_linkListCache || []).find(function(l) { return l.id === linkId; });
    if (!link) return;
    var cached = _dirCache[link.path];
    var nodes = cached ? cached.nodes : [];
    el.innerHTML = toolsRenderTreeNodes(nodes, linkId);
  }

  // ── toolsRenderTreeNodes — recursive tree node rendering (children from _dirCache) ──
  function toolsRenderTreeNodes(nodes, linkId) {
    if (!nodes || nodes.length === 0) {
      return '<div style="padding:4px 8px;color:var(--tools-muted,#888);font-size:12px;">（空目录）</div>';
    }
    return nodes.map(function(node) {
      var isFolder = node.type === 'folder';
      var icon = isFolder ? '\u{1F4C1}' : '\u{1F4C4}';
      if (isFolder) {
        var expanded = _expandedDirs[node.path];
        var arrow = expanded ? '▾' : '▸';
        var childrenHtml = '';
        if (expanded) {
          var cached = _dirCache[node.path];
          var children = cached ? cached.nodes : [];
          childrenHtml = '<div class="tools-link-tree">' + toolsRenderTreeNodes(children, linkId) + '</div>';
        }
        var activeClass = (_activePath === node.path) ? ' active' : '';
        return '<div class="tools-link-tree-node">'
          + '<div class="tools-link-row' + activeClass + '" onclick="event.stopPropagation();toolsToggleTreeFolder(\\'' + escAttr(linkId) + '\\',\\'' + escAttr(node.path) + '\\')">'
          + '<span class="tools-link-arrow">' + arrow + '</span>'
          + '<span class="tools-link-icon">' + icon + '</span>'
          + '<span class="tools-link-label">' + escHtml(node.name) + '</span>'
          + '</div>'
          + childrenHtml
          + '</div>';
      } else {
        // File node
        var fileActiveClass = (_activePath === node.path) ? ' active' : '';
        return '<div class="tools-link-tree-node">'
          + '<div class="tools-link-row' + fileActiveClass + '" onclick="event.stopPropagation();toolsOpenLinkedFileByPath(\\'' + escAttr(node.path) + '\\')">'
          + '<span class="tools-link-arrow" style="visibility:hidden">▸</span>'
          + '<span class="tools-link-icon">' + icon + '</span>'
          + '<span class="tools-link-label">' + escHtml(node.name) + '</span>'
          + '</div>'
          + '</div>';
      }
    }).join('');
  }

  // ── Readonly linked file bar ──
  function toolsShowLinkedReadonlyView(path, linkId) {
    _activeLinkedFile = { linkId: linkId, path: path };
    var bar = document.getElementById('tools-linked-readonly-bar');
    if (bar) {
      bar.querySelector('.tools-linked-path').innerHTML = '🔗 ' + escHtml(path);
      bar.style.display = '';
    }
    // Show Finder button only for file links (not tree files without linkId)
    var revealBtn = document.getElementById('tools-btn-reveal');
    if (revealBtn) revealBtn.style.display = linkId ? '' : 'none';
  }

  function toolsHideLinkedReadonlyBar() {
    _activeLinkedFile = null;
    var bar = document.getElementById('tools-linked-readonly-bar');
    if (bar) bar.style.display = 'none';
  }

  // ── Readonly bar actions ──
  window.toolsCopyLinked = async function() {
    var val = cmGetDoc();
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      toolsShowToast('已复制全部内容');
    } catch (e) {
      toolsShowToast('复制失败');
    }
  };

  window.toolsLoadLinkedToEditor = function() {
    toolsSetEditable(true);
    toolsHideLinkedReadonlyBar();
  };

  window.toolsRevealLinked = async function() {
    if (!_activeLinkedFile || !_activeLinkedFile.linkId) {
      toolsShowToast('无法定位文件');
      return;
    }
    try {
      var res = await fetch('/api/tools/json-links/' + encodeURIComponent(_activeLinkedFile.linkId) + '/reveal');
      if (!res.ok) { toolsShowToast('打开失败'); return; }
    } catch (e) {
      toolsShowToast('打开失败');
    }
  };

  window.toolsExitLinkedReadonly = function() {
    toolsSetEditable(true);
    toolsHideLinkedReadonlyBar();
    _activePath = null;
    toolsRenderLinkList();
  };

  // ── Toast ──
  function toolsShowToast(msg) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);padding:8px 20px;background:var(--bg-elevated);color:var(--text-pri);border:1px solid var(--border-acc);border-radius:8px;font-size:12px;font-weight:600;z-index:300;box-shadow:0 4px 16px rgba(0,0,0,0.15);pointer-events:none;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function() { toast.remove(); }, 300);
    }, 1500);
  }

  // ── Helper: escAttr (for use inside onclick attributes) ──
  function escAttr(s) {
    return s.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'").replace(/"/g, '\\\\"');
  }

  // ── Helper: escHtml ──
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // File Preview
  // ═══════════════════════════════════════════════════════════════════════

  function fpRenderSplitLayout(container) {
    container.innerHTML = ''
      + '<div style="display:flex;flex:1;overflow:hidden">'
      + '<div style="width:240px;background:var(--bg-surface);border-right:1px solid var(--border-sub);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden">'
      + '<div style="display:flex;align-items:center;gap:6px;padding:8px 10px 6px;border-bottom:1px solid var(--border-sub);flex-shrink:0">'
      + '<span style="font-size:12px;font-weight:700;color:var(--text-pri);flex:1">文件列表</span>'
      + '<button class="tools-btn primary" onclick="fpShowLinkDialog()" style="padding:0 8px;font-size:11px">+ 添加</button>'
      + '</div>'
      + '<div style="flex:1;overflow-y:auto;padding:4px" id="fp-link-list"></div>'
      + '</div>'
      + '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden">'
      + '<div class="fp-preview-bar" id="fp-preview-bar" style="display:none">'
      + '<span class="fp-preview-path" id="fp-preview-path"></span>'
      + '<span class="tools-linked-actions">'
      + '<button class="tools-btn" onclick="fpCopyContent()">复制全部</button>'
      + '<button class="tools-btn" id="fp-btn-reveal" onclick="fpRevealFile()">在 Finder 中显示</button>'
      + '</span></div>'
      + '<div class="fp-preview-content" id="fp-preview-content" style="flex:1;overflow:auto">'
      + '<div class="fp-loading">请从左侧选择一个文件预览</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  // ── File Preview Link List ──

  async function fpLoadLinks() {
    var listEl = document.getElementById('fp-link-list');
    if (!listEl) return;
    listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载中...</div></div>';
    try {
      var res = await fetch('/api/tools/file-links');
      if (!res.ok) throw new Error('Failed');
      var data = await res.json();
      _fpLinks = data.links || [];
      if (data.removed > 0) toolsShowToast(data.removed + ' 个失效引用已自动清理');
      fpRenderLinkList();
    } catch (e) {
      listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>加载引用列表失败</div></div>';
    }
  }

  function fpRenderLinkList() {
    var listEl = document.getElementById('fp-link-list');
    if (!listEl) return;
    var links = _fpLinks;
    if (!links || links.length === 0) {
      listEl.innerHTML = '<div class="tools-saved-empty"><div>' + ICON_FOLDER + '</div><div>暂无引用<br><span style="font-size:11px;color:var(--text-muted)">点击"+ 添加"选择文件夹或文件</span></div></div>';
      return;
    }
    listEl.innerHTML = links.map(function(link) {
      var isFolder = link.type === 'folder';
      var icon = isFolder ? '\u{1F4C1}' : '\u{1F4C4}';
      var arrowHtml = '';
      var treeHtml = '';
      if (isFolder) {
        var expanded = _fpExpandedDirs[link.path];
        arrowHtml = '<span class="tools-link-arrow" onclick="event.stopPropagation();fpToggleLinkFolder(\\'' + escAttr(link.id) + '\\')">' + (expanded ? '▾' : '▸') + '</span>';
        if (expanded) treeHtml = '<div class="tools-link-tree" id="fp-link-tree-' + link.id + '"></div>';
      }
      var activeClass = (_fpActivePath === link.path) ? ' active' : '';
      var rowClick = isFolder
        ? 'fpToggleLinkFolder(\\'' + escAttr(link.id) + '\\')'
        : 'fpOpenLinkedFile(\\'' + escAttr(link.id) + '\\')';
      return '<div class="tools-link-tree-node">'
        + '<div class="tools-link-row' + activeClass + '" onclick="' + rowClick + '">'
        + arrowHtml
        + '<span class="tools-link-icon">' + icon + '</span>'
        + '<span class="tools-link-label">' + escHtml(link.label) + '</span>'
        + '<button class="tools-saved-item-del" title="移除引用" onclick="event.stopPropagation();fpRemoveLink(\\'' + escAttr(link.id) + '\\')">&times;</button>'
        + '</div>'
        + treeHtml
        + '</div>';
    }).join('');
    links.forEach(function(link) {
      if (link.type === 'folder' && _fpExpandedDirs[link.path]) fpRenderLinkTreeContainer(link.id);
    });
  }

  // ── Folder toggle ──

  window.fpToggleLinkFolder = async function(id) {
    var link = (_fpLinks || []).find(function(l) { return l.id === id; });
    if (!link) return;
    var dirPath = link.path;
    if (_fpExpandedDirs[dirPath]) { delete _fpExpandedDirs[dirPath]; fpRenderLinkList(); return; }
    _fpExpandedDirs[dirPath] = true;
    _fpActivePath = dirPath;
    if (!_fpDirCache[dirPath]) {
      try {
        var res = await fetch('/api/tools/file-links/' + encodeURIComponent(id) + '/tree');
        if (!res.ok) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkList(); return; }
        var data = await res.json();
        _fpDirCache[dirPath] = { nodes: data.tree || [], truncated: data.truncated };
        if (data.truncated) toolsShowToast('目录较大，部分内容已截断');
      } catch (e) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkList(); return; }
    }
    fpRenderLinkList();
  };

  window.fpToggleTreeFolder = async function(linkId, dirPath) {
    if (_fpExpandedDirs[dirPath]) { delete _fpExpandedDirs[dirPath]; fpRenderLinkTreeContainer(linkId); return; }
    _fpExpandedDirs[dirPath] = true;
    _fpActivePath = dirPath;
    if (!_fpDirCache[dirPath]) {
      try {
        var res = await fetch('/api/tools/file-links/expand-dir', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: dirPath }),
        });
        if (!res.ok) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkTreeContainer(linkId); return; }
        var data = await res.json();
        _fpDirCache[dirPath] = { nodes: data.nodes || [], truncated: data.truncated };
        if (data.truncated) toolsShowToast('目录较大，部分内容已截断');
      } catch (e) { toolsShowToast('加载目录失败'); delete _fpExpandedDirs[dirPath]; fpRenderLinkTreeContainer(linkId); return; }
    }
    fpRenderLinkTreeContainer(linkId);
  };

  function fpRenderLinkTreeContainer(linkId) {
    var el = document.getElementById('fp-link-tree-' + linkId);
    if (!el) return;
    var link = (_fpLinks || []).find(function(l) { return l.id === linkId; });
    if (!link) return;
    var cached = _fpDirCache[link.path];
    var nodes = cached ? cached.nodes : [];
    el.innerHTML = fpRenderTreeNodes(nodes, linkId);
  }

  function fpRenderTreeNodes(nodes, linkId) {
    if (!nodes || nodes.length === 0) return '<div style="padding:4px 8px;color:var(--text-muted,#888);font-size:12px;">（空目录）</div>';
    return nodes.map(function(node) {
      var isFolder = node.type === 'folder';
      var icon = isFolder ? '\u{1F4C1}' : '\u{1F4C4}';
      if (isFolder) {
        var expanded = _fpExpandedDirs[node.path];
        var arrow = expanded ? '▾' : '▸';
        var childrenHtml = '';
        if (expanded) { var cached = _fpDirCache[node.path]; var children = cached ? cached.nodes : []; childrenHtml = '<div class="tools-link-tree">' + fpRenderTreeNodes(children, linkId) + '</div>'; }
        return '<div class="tools-link-tree-node">'
          + '<div class="tools-link-row' + (_fpActivePath === node.path ? ' active' : '') + '" onclick="event.stopPropagation();fpToggleTreeFolder(\\'' + escAttr(linkId) + '\\',\\'' + escAttr(node.path) + '\\')">'
          + '<span class="tools-link-arrow">' + arrow + '</span>'
          + '<span class="tools-link-icon">' + icon + '</span>'
          + '<span class="tools-link-label">' + escHtml(node.name) + '</span>'
          + '</div>' + childrenHtml + '</div>';
      } else {
        return '<div class="tools-link-tree-node">'
          + '<div class="tools-link-row' + (_fpActivePath === node.path ? ' active' : '') + '" onclick="event.stopPropagation();fpOpenLinkedFileByPath(\\'' + escAttr(node.path) + '\\')">'
          + '<span class="tools-link-arrow" style="visibility:hidden">▸</span>'
          + '<span class="tools-link-icon">' + icon + '</span>'
          + '<span class="tools-link-label">' + escHtml(node.name) + '</span>'
          + '</div></div>';
      }
    }).join('');
  }

  // ── Add link dialog ──

  window.fpShowLinkDialog = function() {
    var overlay = document.createElement('div');
    overlay.className = 'tools-save-overlay';
    overlay.id = 'fp-link-overlay';
    overlay.innerHTML = '<div class="tools-save-dialog" style="width:420px">'
      + '<h3>添加文件夹或文件</h3>'
      + '<div class="tools-import-section">'
      + '<div class="tools-import-section-title">选择文件夹或文件</div>'
      + '<div class="tools-import-drop">'
      + '<div class="tools-import-drop-icon">&#128193;</div>'
      + '<div class="tools-import-drop-text">选择文件夹或任意文件</div>'
      + '<div style="display:flex;gap:8px;justify-content:center">'
      + '<button class="tools-file-btn" onclick="event.stopPropagation();fpPickFolder()">&#128193; 文件夹</button>'
      + '<button class="tools-file-btn" onclick="event.stopPropagation();fpPickFile()">&#128196; 文件</button>'
      + '</div></div></div>'
      + '<div class="tools-import-divider"><span>或</span></div>'
      + '<div class="tools-import-section">'
      + '<div class="tools-import-section-title">手动输入路径</div>'
      + '<input type="text" class="tools-save-input" id="fp-link-path" placeholder="绝对路径，如 /path/to/folder" autofocus style="margin-bottom:10px">'
      + '<input type="text" class="tools-save-input" id="fp-link-label" placeholder="显示名（可选，默认取文件名）">'
      + '</div>'
      + '<div class="tools-save-actions" style="margin-top:14px">'
      + '<button class="tools-save-cancel" onclick="fpDismissLinkDialog()">取消</button>'
      + '<button class="tools-save-confirm" onclick="fpConfirmLink()">确认</button>'
      + '</div></div>';
    overlay.addEventListener('click', function(e) { if (e.target === overlay) fpDismissLinkDialog(); });
    document.body.appendChild(overlay);
  };

  window.fpConfirmLink = async function() {
    var pathInput = document.getElementById('fp-link-path');
    var labelInput = document.getElementById('fp-link-label');
    if (!pathInput) return;
    var path = pathInput.value.trim();
    if (!path) { pathInput.focus(); toolsShowToast('请输入目标路径'); return; }
    var label = labelInput ? labelInput.value.trim() : '';
    try {
      var body = { path: path }; if (label) body.label = label;
      var res = await fetch('/api/tools/file-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { var err = await res.json(); toolsShowToast('添加失败: ' + (err.error || 'Unknown')); return; }
      fpDismissLinkDialog();
      toolsShowToast('已添加引用');
      fpLoadLinks();
    } catch (e) { toolsShowToast('添加失败: ' + e.message); }
  };

  window.fpPickFolder = function() {
    pickNativePath('folder', function(p) {
      document.getElementById('fp-link-path').value = p;
      document.getElementById('fp-link-label').value = p.replace(/\\/$/, '').split('/').pop();
    });
  };
  window.fpPickFile = function() {
    pickNativePath('file', function(p) {
      document.getElementById('fp-link-path').value = p;
      document.getElementById('fp-link-label').value = p.split('/').pop();
    });
  };
  window.fpDismissLinkDialog = function() { var o = document.getElementById('fp-link-overlay'); if (o) o.remove(); };
  window.fpRemoveLink = async function(id) {
    if (!confirm('确定移除此引用？')) return;
    try {
      var res = await fetch('/api/tools/file-links/' + encodeURIComponent(id), { method: 'DELETE' });
      if (!res.ok) { var err = await res.json(); toolsShowToast('移除失败: ' + (err.error || 'Unknown')); return; }
      toolsShowToast('已移除引用'); fpLoadLinks();
    } catch (e) { toolsShowToast('移除失败: ' + e.message); }
  };

  // ── Open linked file ──

  window.fpOpenLinkedFile = async function(id) {
    try {
      var res = await fetch('/api/tools/file-links/' + encodeURIComponent(id) + '/content');
      if (!res.ok) { toolsShowToast('加载失败'); return; }
      var data = await res.json();
      _fpActivePath = data.path;
      _fpActiveFile = { path: data.path, linkId: id };
      fpRenderPreview(data.ext, data.content, data.path, fpDirname(data.path));
      fpShowLinkedReadonlyBar(data.path, id);
      fpRenderLinkList();
    } catch (e) { toolsShowToast('加载失败: ' + e.message); }
  };

  window.fpOpenLinkedFileByPath = async function(absPath) {
    try {
      var res = await fetch('/api/tools/file-links/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: absPath }) });
      if (!res.ok) { toolsShowToast('加载失败'); return; }
      var data = await res.json();
      _fpActivePath = absPath;
      _fpActiveFile = { path: absPath, linkId: null };
      fpRenderPreview(data.ext, data.content, data.path, fpDirname(data.path));
      fpShowLinkedReadonlyBar(absPath, null);
      fpRenderLinkList();
    } catch (e) { toolsShowToast('加载失败: ' + e.message); }
  };

  // ── Preview dispatch ──

  var _fpPreviewContent = '';
  var _fpMermaidInitialized = false;

  function fpRenderMermaid(pane) {
    if (!window.mermaid || !window.mermaid.render) return;
    try {
      if (!_fpMermaidInitialized) {
        window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
        _fpMermaidInitialized = true;
      }
      var blocks = pane.querySelectorAll('pre > code.language-mermaid, pre > code.lang-mermaid');
      blocks.forEach(function(code, index) {
        var pre = code.parentElement;
        // Mermaid's bidirectional sequence arrow is <<->>. Accept the common
        // shorthand <->> as well, so existing Markdown diagrams still render.
        var source = (code.textContent || '').replace(/<->>/g, '<<->>');
        if (!pre || !source.trim()) return;
        var id = 'fp-mermaid-' + Date.now() + '-' + index;
        window.mermaid.render(id, source).then(function(result) {
          // A new preview may have replaced this pane while Mermaid was rendering.
          if (!pre.isConnected) return;
          var wrapper = document.createElement('div');
          wrapper.className = 'fp-mermaid';
          wrapper.innerHTML = result.svg;
          pre.replaceWith(wrapper);
          if (result.bindFunctions) result.bindFunctions(wrapper);
        }).catch(function() {
          // Keep the original code block when a diagram has invalid Mermaid syntax.
        });
      });
    } catch (_) {
      // Mermaid is optional: Markdown preview remains available if it cannot initialize.
    }
  }

  function fpRenderPreview(ext, content, path, baseDir) {
    var area = document.getElementById('fp-preview-content');
    if (!area) return;
    _fpPreviewContent = content || '';

    // Markdown
    if (ext === '.md' || ext === '.markdown') {
      area.className = 'fp-preview-content';
      try {
        area.innerHTML = '<div class="notes-preview-pane">' + (window.marked ? marked.parse(content || '') : escHtml(content || '')) + '</div>';
      } catch(e) { area.innerHTML = '<div class="notes-preview-pane">' + escHtml(content || '') + '</div>'; }
      if (baseDir) { var pane = area.querySelector('.notes-preview-pane'); if (pane) fpRewriteLocalImages(pane, baseDir); }
      var markdownPane = area.querySelector('.notes-preview-pane');
      if (markdownPane) fpRenderMermaid(markdownPane);
      return;
    }

    // Images
    var imgExts = ['.png','.jpg','.jpeg','.gif','.svg','.webp','.bmp','.ico'];
    if (imgExts.includes(ext)) {
      area.className = 'fp-preview-content';
      var imgSrc = '/api/notes/file?base=' + encodeURIComponent(baseDir || fpDirname(path)) + '&rel=' + encodeURIComponent(path.split('/').pop());
      area.innerHTML = '<div class="fp-img-wrap"><img src="' + imgSrc + '" alt="' + escHtml(path) + '" id="fp-img-preview"></div>';
      var img = document.getElementById('fp-img-preview');
      if (img) {
        img.onerror = function() {
          this.parentElement.innerHTML = '<div class="fp-unsupported"><div class="fp-unsupported-icon">🖼</div><div class="fp-unsupported-text">图片加载失败</div></div>';
        };
      }
      return;
    }

    // Unsupported binary
    if (content === '' && ext) {
      area.className = 'fp-preview-content';
      area.innerHTML = '<div class="fp-unsupported"><div class="fp-unsupported-icon">📄</div><div class="fp-unsupported-text">不支持预览此文件类型</div><div class="fp-unsupported-name">' + escHtml(path) + '</div><button class="tools-btn" onclick="fpRevealFile()" style="margin-top:8px">📁 在 Finder 中显示</button></div>';
      return;
    }

    // JSON — CodeMirror readonly with JSON syntax
    if (ext === '.json' || ext === '.jsonc') {
      area.className = 'fp-preview-content';
      area.innerHTML = '<div class="tools-cm-wrap" id="fp-cm-wrap" style="flex:1;height:100%"></div>';
      fpInitCodeMirror(true);
      fpCmSetDoc(content || '');
      return;
    }

    // All other text — CodeMirror readonly plain text
    area.className = 'fp-preview-content';
    area.innerHTML = '<div class="tools-cm-wrap" id="fp-cm-wrap" style="flex:1;height:100%"></div>';
    fpInitCodeMirror(false);
    fpCmSetDoc(content || '');
  }

  function fpRewriteLocalImages(pane, baseDir) {
    if (!baseDir || baseDir[0] !== '/') return;
    var imgs = Array.from(pane.querySelectorAll('img'));
    imgs.forEach(function(img) {
      var src = img.getAttribute('src');
      if (!src) return;
      if (/^(https?:|data:|file:|[/]{2}|\\/api\\/)/i.test(src)) return;
      var decoded = src; try { decoded = decodeURIComponent(src); } catch(_) {}
      img.src = '/api/notes/file?base=' + encodeURIComponent(baseDir) + '&rel=' + encodeURIComponent(decoded);
    });
  }

  function fpDirname(p) { var i = p.lastIndexOf('/'); return i >= 0 ? p.slice(0, i) : p; }

  // ── File Preview CodeMirror ──

  var _fpCmView = null;
  var _fpCmThemeComp = null;

  function fpInitCodeMirror(jsonMode) {
    var S = cmGetSetup();
    if (!S.EditorView) return;
    var container = document.getElementById('fp-cm-wrap');
    if (!container) return;
    if (_fpCmView) {
      if (_fpCmView.dom.parentNode !== container) { _fpCmView.destroy(); _fpCmView = null; _fpCmThemeComp = null; }
      else { _fpCmView.requestMeasure(); return; }
    }
    _fpCmThemeComp = S.Compartment ? new S.Compartment : { of: function() { return []; } };
    var exts = [
      S.lineNumbers ? S.lineNumbers() : null,
      S.foldGutter ? S.foldGutter() : null,
      S.highlightActiveLine ? S.highlightActiveLine() : null,
      S.syntaxHighlighting ? S.syntaxHighlighting(S.defaultHighlightStyle) : null,
      S.search ? S.search({ top: true }) : null,
      S.keymap ? S.keymap.of([(S.defaultKeymap || []), (S.historyKeymap || []), (S.foldKeymap || []), (S.searchKeymap || [])].flat()) : null,
      _fpCmThemeComp.of(fpCmThemeExtension()),
      S.EditorView.editable.of(false),
    ];
    if (jsonMode && S.json) exts.push(S.json());
    _fpCmView = new S.EditorView({ doc: '', extensions: exts.filter(Boolean), parent: container });
  }

  function fpCmThemeExtension() {
    var S = cmGetSetup();
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark && S.oneDark) return S.oneDark;
    return [];
  }

  function fpCmSetDoc(text) {
    if (!_fpCmView) return;
    _fpCmView.dispatch({ changes: { from: 0, to: _fpCmView.state.doc.length, insert: text } });
  }

  function fpCmGetDoc() { return _fpCmView ? _fpCmView.state.doc.toString() : _fpPreviewContent; }

  // ── Readonly bar ──

  function fpShowLinkedReadonlyBar(path, linkId) {
    _fpActiveFile = { path: path, linkId: linkId };
    var bar = document.getElementById('fp-preview-bar');
    var pathEl = document.getElementById('fp-preview-path');
    var revealBtn = document.getElementById('fp-btn-reveal');
    if (bar) bar.style.display = '';
    if (pathEl) pathEl.textContent = path;
    if (revealBtn) revealBtn.style.display = linkId ? '' : 'none';
  }

  window.fpCopyContent = async function() {
    var val = fpCmGetDoc();
    if (!val) { toolsShowToast('无可复制内容'); return; }
    try { await navigator.clipboard.writeText(val); toolsShowToast('已复制全部内容'); }
    catch (e) { toolsShowToast('复制失败'); }
  };

  window.fpRevealFile = async function() {
    if (!_fpActiveFile || !_fpActiveFile.linkId) { toolsShowToast('无法定位文件'); return; }
    try {
      var res = await fetch('/api/tools/file-links/' + encodeURIComponent(_fpActiveFile.linkId) + '/reveal');
      if (!res.ok) { toolsShowToast('打开失败'); return; }
    } catch (e) { toolsShowToast('打开失败'); }
  };

  // ── Expose init ──
  window.toolsInit = toolsInit;
  window.toolsHookSwitchModule = toolsHookSwitchModule;

  // Self-init: called immediately so cx/cm templates (which use IIFE) work
  toolsInit();
  toolsHookSwitchModule();

})();
`
