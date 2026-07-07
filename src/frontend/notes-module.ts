// Build-time injected by tsup define — marked.min.js content
declare const __MARKED_MIN_JS__: string

// ── 4.1  marked.js source (injected at build time) ───────────────────────────
export const NOTES_MARKED: string = __MARKED_MIN_JS__

// ── 4.2  CSS ──────────────────────────────────────────────────────────────────

export const NOTES_CSS = `
/* ── Notes Module ─────────────────────────────────────────────────── */
/* Notes now render inside the tools workarea (.tools-notes-wrap) */

/* Tools notes wrapper (replaces #mod-notes) */
.tools-notes-wrap {
  display: flex; flex: 1; overflow: hidden;
}

/* List panel */
.notes-list-panel {
  width: 220px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  flex-shrink: 0; overflow: hidden;
  position: relative; transition: width 0.2s ease;
}
.notes-list-header {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px 6px;
  border-bottom: 1px solid var(--border-sub);
  flex-shrink: 0;
  position: relative;
}

/* Notes panel collapsed */
.notes-list-panel.panel-collapsed .notes-list-header {
  flex: 1; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 6px 2px; border-bottom: none;
}
.notes-list-panel.panel-collapsed .notes-new-btn,
.notes-list-panel.panel-collapsed .notes-import-btn,
.notes-list-panel.panel-collapsed .notes-tabs,
.notes-list-panel.panel-collapsed .notes-search-wrap,
.notes-list-panel.panel-collapsed .notes-list-scroll { display: none; }
.notes-new-btn, .notes-import-btn {
  flex: 1; height: 28px; border-radius: 7px; border: 1px solid var(--border-muted);
  background: var(--bg-elevated); color: var(--text-sec);
  font-size: 11px; font-weight: 600; cursor: pointer; display: flex;
  align-items: center; justify-content: center; gap: 4px;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.notes-new-btn:hover  { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
.notes-import-btn:hover { background: var(--bg-hover); border-color: var(--border-acc); color: var(--text-pri); }

/* List tabs (本地笔记 / 引用) */
.notes-tabs {
  display: flex; gap: 2px; padding: 6px 8px 0;
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
}
.notes-tab {
  flex: 1; height: 26px; padding: 0 8px; border: none; border-bottom: 2px solid transparent;
  background: transparent; color: var(--text-sec);
  font-size: 12px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: color 0.12s, border-color 0.12s, background 0.12s;
  border-radius: 6px 6px 0 0;
}
.notes-tab:hover { color: var(--text-pri); background: var(--bg-hover); }
.notes-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.notes-tab-count {
  font-size: 10px; font-weight: 700; opacity: .7;
  padding: 0 5px; min-width: 16px; text-align: center;
}
.notes-tab.active .notes-tab-count { opacity: 1; }

.notes-search-wrap {
  position: relative; padding: 6px 8px;
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
}
.notes-search-wrap::before {
  content: '⌕'; position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); font-size: 14px; pointer-events: none; z-index: 1;
}
.notes-search {
  width: 100%; height: 28px; padding: 0 8px 0 28px;
  border: 1px solid var(--border-sub); border-radius: 7px;
  background: var(--bg-elevated); color: var(--text-pri);
  font-size: 12px; outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.notes-search:focus { border-color: var(--accent); background: var(--bg-surface); }

/* Note list items */
.notes-list-scroll { flex: 1; overflow-y: auto; padding: 4px; }
.note-item {
  padding: 8px 10px; border-radius: 8px; cursor: pointer;
  position: relative; margin-bottom: 2px;
  border: 1px solid transparent;
  transition: background 0.12s, border-color 0.12s;
}
.note-item:hover { background: var(--bg-hover); }
.note-item.active { background: var(--bg-selected); border-color: var(--border-acc); }
.note-item-title {
  font-size: 12px; font-weight: 600; color: var(--text-pri);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;
}
.note-item-meta {
  font-size: 10px; color: var(--text-muted);
  display: flex; align-items: center; gap: 6px;
}
.note-item-tags { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 3px; }
.note-item-tag {
  font-size: 9px; padding: 1px 5px; border-radius: 6px;
  background: var(--accent-dim); color: var(--accent);
  border: 1px solid var(--border-acc);
}
.note-delete-btn {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  width: 22px; height: 22px; border-radius: 5px; border: none;
  background: transparent; color: var(--text-muted); font-size: 12px;
  cursor: pointer; display: none; align-items: center; justify-content: center;
  transition: background 0.12s, color 0.12s;
}
.note-item:hover .note-delete-btn { display: flex; }
.note-delete-btn:hover { background: rgba(220,38,38,0.12); color: #dc2626; }
.note-delete-confirm {
  position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
  background: var(--bg-surface); border: 1px solid var(--border-muted);
  border-radius: 7px; padding: 4px 6px; display: flex; gap: 4px; align-items: center;
  font-size: 10px; color: var(--text-sec); white-space: nowrap; z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.note-delete-confirm button {
  padding: 2px 7px; border-radius: 5px; border: 1px solid var(--border-muted);
  font-size: 10px; font-weight: 600; cursor: pointer; background: var(--bg-elevated); color: var(--text-sec);
}
.note-delete-confirm button.yes { background: rgba(220,38,38,0.12); color: #dc2626; border-color: rgba(220,38,38,0.3); }
.note-empty-state {
  text-align: center; padding: 40px 16px; color: var(--text-muted); font-size: 12px;
}
.note-empty-state-icon { font-size: 22px; line-height: 1; margin-bottom: 8px; }

/* Editor panel */
.notes-editor-panel {
  flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;
  background: var(--bg-base);
}
.notes-editor-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--text-muted); gap: 10px;
}
.notes-editor-empty-icon { font-size: 30px; line-height: 1; }
.notes-editor-empty-text { font-size: 13px; }

.notes-editor-inner { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

/* Title + tags bar */
.notes-title-bar {
  padding: 12px 16px 8px; background: var(--bg-surface);
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
}
.notes-title-input {
  width: 100%; font-size: 18px; font-weight: 700; color: var(--text-pri);
  background: transparent; border: none; outline: none;
  padding: 0; margin-bottom: 6px; line-height: 1.3;
}
.notes-title-input::placeholder { color: var(--text-muted); }
.notes-tags-row { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.note-edit-tag {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 6px 2px 8px; border-radius: 10px;
  font-size: 11px; font-weight: 600;
  background: var(--accent-dim); color: var(--accent);
  border: 1px solid var(--border-acc);
}
.note-edit-tag-del {
  cursor: pointer; font-size: 10px; line-height: 1; opacity: 0.7;
  padding: 0 1px; border-radius: 50%;
}
.note-edit-tag-del:hover { opacity: 1; background: rgba(0,0,0,0.1); }
.note-add-tag-btn {
  font-size: 11px; color: var(--text-muted); cursor: pointer; padding: 2px 6px;
  border-radius: 10px; border: 1px dashed var(--border-muted);
  background: transparent; display: inline-flex; align-items: center; gap: 3px;
  transition: all 0.12s;
}
.note-add-tag-btn:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-dim); }
.note-tag-input {
  font-size: 11px; padding: 2px 6px; border-radius: 10px;
  border: 1px solid var(--accent); background: var(--accent-dim); color: var(--text-pri);
  outline: none; width: 80px;
}

/* View mode toolbar */
.notes-view-toolbar {
  display: flex; align-items: center; gap: 0;
  padding: 0 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0; height: 36px;
}
.notes-view-btn {
  padding: 4px 12px; font-size: 11px; font-weight: 600;
  border: none; background: transparent; color: var(--text-muted); cursor: pointer;
  border-radius: 6px; transition: background 0.12s, color 0.12s;
  display: flex; align-items: center; gap: 4px;
}
.notes-view-btn:hover { background: var(--bg-hover); color: var(--text-sec); }
.notes-view-btn.active { background: var(--accent-dim); color: var(--accent); }

/* Content area */
.notes-content-area { flex: 1; overflow: hidden; display: flex; min-height: 0; }

.notes-editor-textarea {
  flex: 1; width: 100%; height: 100%; padding: 16px 20px;
  background: var(--bg-base); color: var(--text-pri);
  border: none; outline: none; resize: none;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px; line-height: 1.7; tab-size: 2;
}
.notes-editor-textarea::placeholder { color: var(--text-muted); }

.notes-preview-shell {
  flex: 1; height: 100%; min-width: 0; display: flex;
  background: var(--bg-surface);
}
.notes-preview-pane {
  flex: 1; min-width: 0; height: 100%; overflow-y: auto; padding: 20px 28px;
  background: var(--bg-surface); color: var(--text-pri);
  line-height: 1.75; font-size: 14px;
}
.notes-preview-toc {
  width: 190px; flex-shrink: 0; overflow-y: auto;
  padding: 14px 10px 16px; border-left: 1px solid var(--border-sub);
  background: var(--bg-surface);
}
.notes-preview-shell.no-toc .notes-preview-toc { display: none; }
.notes-toc-title {
  padding: 0 8px 8px; font-size: 10px; font-weight: 700;
  color: var(--text-muted); text-transform: uppercase;
}
.notes-toc-item {
  width: 100%; min-height: 26px; padding: 5px 8px;
  border: none; border-radius: 6px; background: transparent;
  color: var(--text-muted); cursor: pointer; text-align: left;
  font-size: 11px; line-height: 1.35; display: block;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: background 0.12s, color 0.12s;
}
.notes-toc-item:hover { background: var(--bg-hover); color: var(--text-sec); }
.notes-toc-item.active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }
.notes-toc-item.level-2 { padding-left: 16px; }
.notes-toc-item.level-3 { padding-left: 24px; }
.notes-toc-item.level-4 { padding-left: 32px; }

/* Split mode */
.notes-content-area.split .notes-editor-textarea {
  flex: 1; border-right: 1px solid var(--border-sub);
}
.notes-content-area.split .notes-preview-shell { flex: 1; min-width: 0; }
.notes-content-area.split .notes-preview-toc { width: 156px; padding-left: 8px; padding-right: 8px; }

/* Markdown preview styles */
.notes-preview-pane h1 { font-size: 1.7em; font-weight: 700; margin: 0 0 .5em; border-bottom: 1px solid var(--border-sub); padding-bottom: .3em; }
.notes-preview-pane h2 { font-size: 1.35em; font-weight: 700; margin: 1.2em 0 .4em; border-bottom: 1px solid var(--border-sub); padding-bottom: .2em; }
.notes-preview-pane h3 { font-size: 1.1em; font-weight: 700; margin: 1em 0 .3em; }
.notes-preview-pane h4,
.notes-preview-pane h5,
.notes-preview-pane h6 { font-size: 1em; font-weight: 700; margin: .8em 0 .2em; }
.notes-preview-pane p { margin: 0 0 .9em; }
.notes-preview-pane ul, .notes-preview-pane ol { margin: 0 0 .9em; padding-left: 1.6em; }
.notes-preview-pane li { margin-bottom: .2em; }
.notes-preview-pane code {
  font-family: 'SF Mono', 'Fira Code', monospace; font-size: .88em;
  background: var(--bg-elevated); border: 1px solid var(--border-sub);
  padding: .15em .35em; border-radius: 4px;
}
.notes-preview-pane pre {
  background: var(--bg-elevated); border: 1px solid var(--border-sub);
  border-radius: 8px; padding: 12px 16px; overflow-x: auto; margin: 0 0 .9em;
}
.notes-preview-pane pre code { background: none; border: none; padding: 0; font-size: .85em; }
.notes-preview-pane blockquote {
  border-left: 3px solid var(--accent); margin: 0 0 .9em; padding: .3em 1em;
  color: var(--text-sec); background: var(--accent-dim); border-radius: 0 6px 6px 0;
}
.notes-preview-pane a { color: var(--accent); text-decoration: none; }
.notes-preview-pane a:hover { text-decoration: underline; }
.notes-preview-pane hr { border: none; border-top: 1px solid var(--border-muted); margin: 1.2em 0; }
.notes-preview-pane table { border-collapse: collapse; width: 100%; margin: 0 0 .9em; font-size: 13px; }
.notes-preview-pane th, .notes-preview-pane td { border: 1px solid var(--border-muted); padding: 6px 12px; text-align: left; }
.notes-preview-pane th { background: var(--bg-elevated); font-weight: 600; }
.notes-preview-pane img { max-width: 100%; border-radius: 6px; }

@media (max-width: 980px) {
  .notes-preview-toc { display: none; }
}

/* Status bar */
.notes-status-bar {
  height: 26px; background: var(--bg-surface);
  border-top: 1px solid var(--border-sub);
  display: flex; align-items: center; padding: 0 16px; gap: 16px;
  flex-shrink: 0; font-size: 10px; color: var(--text-muted);
}
.notes-save-status { display: flex; align-items: center; gap: 4px; }
.notes-save-status.saved { color: var(--green); }
.notes-save-status.saving { color: var(--text-muted); }
.notes-save-status.dirty { color: var(--yellow); }
.note-path-row {
  display: flex; align-items: center; gap: 4px; flex: 1;
  min-width: 0; overflow: hidden;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 10px; color: var(--text-muted);
  cursor: pointer; user-select: none;
  transition: color 0.12s;
}
.note-path-row:hover { color: var(--text-sec); }
.note-path-icon { flex-shrink: 0; font-size: 10px; }
.note-path-text {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  direction: rtl; text-align: left;
}
.note-path-copied {
  font-size: 9px; color: var(--green); flex-shrink: 0;
  opacity: 0; transition: opacity 0.15s;
}
.note-path-copied.show { opacity: 1; }

/* Import Modal */
.notes-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.notes-modal-overlay.hidden { display: none; }
.notes-modal {
  background: var(--bg-surface); border: 1px solid var(--border-muted);
  border-radius: 14px; width: 480px; max-width: calc(100vw - 32px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}
.notes-modal-header {
  display: flex; align-items: center; padding: 14px 16px 12px;
  border-bottom: 1px solid var(--border-sub);
}
.notes-modal-title { font-size: 14px; font-weight: 700; color: var(--text-pri); flex: 1; }
.notes-modal-close {
  width: 24px; height: 24px; border-radius: 6px; border: none;
  background: var(--bg-elevated); color: var(--text-muted); cursor: pointer;
  font-size: 14px; display: flex; align-items: center; justify-content: center;
  transition: background 0.12s, color 0.12s;
}
.notes-modal-close:hover { background: var(--bg-hover); color: var(--text-pri); }
.notes-modal-tabs {
  display: flex; border-bottom: 1px solid var(--border-sub);
}
.notes-modal-tab {
  flex: 1; padding: 9px 0; font-size: 12px; font-weight: 600;
  border: none; background: transparent; color: var(--text-muted); cursor: pointer;
  border-bottom: 2px solid transparent; transition: color 0.12s, border-color 0.12s;
}
.notes-modal-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.notes-modal-body { padding: 16px; }
.notes-modal-tab-panel { display: none; }
.notes-modal-tab-panel.active { display: block; }

.notes-file-drop {
  border: 2px dashed var(--border-muted); border-radius: 10px;
  padding: 28px 20px; text-align: center; color: var(--text-muted);
  transition: border-color 0.15s, background 0.15s; cursor: pointer;
}
.notes-file-drop:hover, .notes-file-drop.drag-over {
  border-color: var(--accent); background: var(--accent-dim); color: var(--text-sec);
}
.notes-file-drop-icon { font-size: 28px; margin-bottom: 8px; }
.notes-file-drop-text { font-size: 12px; margin-bottom: 10px; }
.notes-file-drop-hint { font-size: 10px; color: var(--text-muted); margin-top: 6px; }
.notes-file-btn {
  padding: 6px 16px; border-radius: 7px; border: 1px solid var(--border-muted);
  background: var(--bg-elevated); color: var(--text-sec); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.notes-file-btn:hover { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

.notes-path-label { font-size: 11px; color: var(--text-sec); margin-bottom: 6px; font-weight: 600; }
.notes-path-input {
  width: 100%; height: 34px; padding: 0 10px;
  border: 1px solid var(--border-muted); border-radius: 7px;
  background: var(--bg-elevated); color: var(--text-pri); font-size: 12px;
  outline: none; font-family: 'SF Mono', 'Fira Code', monospace;
  transition: border-color 0.15s;
}
.notes-path-input:focus { border-color: var(--accent); }
.notes-path-input::placeholder { color: var(--text-muted); font-family: inherit; }
.notes-import-submit {
  margin-top: 10px; width: 100%; height: 34px; border-radius: 7px;
  border: none; background: var(--accent); color: #fff;
  font-size: 12px; font-weight: 700; cursor: pointer;
  transition: opacity 0.12s;
}
.notes-import-submit:hover { opacity: 0.88; }
.notes-import-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.notes-modal-error {
  margin-top: 8px; font-size: 11px; color: #dc2626; min-height: 16px;
}

/* Import sections (本地笔记 tab) */
.notes-import-section {
  margin-bottom: 12px;
}
.notes-import-section-title {
  font-size: 11px; font-weight: 600; color: var(--text-sec); margin-bottom: 6px;
}
.notes-import-divider {
  display: flex; align-items: center; gap: 10px; margin: 14px 0 12px;
  color: var(--text-muted); font-size: 11px;
}
.notes-import-divider::before,
.notes-import-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border-muted);
}

/* Link path row (引用笔记 tab) */
.notes-link-hint { font-size: .75rem; color: var(--text-muted, #888); margin: 8px 0; line-height: 1.5; }

/* ── Note links (引用) ── */
.note-link-item { border-bottom: 1px solid var(--border, rgba(255,255,255,.05)); }
.note-link-row { display: flex; align-items: center; gap: 6px; padding: 8px 12px; cursor: pointer; position: relative; }
.note-link-row:hover { background: var(--bg-elevated, rgba(255,255,255,.05)); }
.note-link-row.active { background: var(--accent-dim); box-shadow: inset 3px 0 0 var(--accent); }
.note-link-row.active .note-link-label { color: var(--accent); font-weight: 600; }
.note-link-row:hover .note-delete-btn { display: flex; }
.note-link-arrow { width: 12px; font-size: .7rem; color: var(--text-muted, #888); }
.note-link-icon { font-size: .9rem; }
.note-link-label { flex: 1; font-size: .88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.note-link-tree { padding: 2px 0 6px; }
.note-tree-folder { font-size: .8rem; color: var(--text-sec, #aaa); padding: 4px 0; cursor: pointer; user-select: none; border-radius: 4px; display: flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.note-tree-folder:hover { background: var(--bg-elevated, rgba(255,255,255,.05)); color: var(--text-pri); }
.note-tree-arrow { display: inline-block; width: 10px; text-align: center; color: var(--text-muted, #888); font-size: .7rem; flex-shrink: 0; }
.note-tree-file { font-size: .82rem; padding: 4px 12px; cursor: pointer; border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.note-tree-file:hover { background: var(--bg-elevated, rgba(255,255,255,.06)); }
.note-tree-file.active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }
.note-link-loading, .note-link-error, .note-link-truncated { font-size: .75rem; color: var(--text-muted, #888); padding: 4px 12px; }
.note-link-error { color: var(--danger, #e57373); }
.notes-link-hint { font-size: .75rem; color: var(--text-muted, #888); margin: 8px 0; line-height: 1.5; }
.notes-title-input.readonly { background: transparent; cursor: default; }
	.note-reveal-btn { font-size: .75rem; color: var(--accent, #4a9eff); cursor: pointer; margin-left: auto; }
	.note-backup-btn {
	  font-size: 11px; font-weight: 600; padding: 3px 10px;
	  border-radius: 6px; border: 1px solid var(--border-muted);
	  background: var(--bg-elevated); color: var(--text-sec);
	  cursor: pointer; transition: all 0.12s; white-space: nowrap;
	  flex-shrink: 0;
	}
	.note-backup-btn:hover { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
	.note-backup-btn.backed { color: var(--green); border-color: var(--green); background: rgba(34,197,94,0.08); cursor: default; }
	`

// ── 4.3  Nav item HTML ─────────────────────────────────────────────────────────

export const NOTES_NAV_ITEM = `
    <div class="nav-item" id="nav-notes" data-module="notes" onclick="switchModule('notes')" style="display:none">
      <div class="nav-item-icon">&#9636;</div>
      <div class="nav-item-label">&#31508;&#35760;</div>
      <div class="nav-tooltip">&#31508;&#35760;</div>
    </div>`

// ── 4.4  Module HTML (inject inside #content) ────────────────────────────────

export const NOTES_MODULE_HTML = `
      <!-- Notes Module -->
      <div id="mod-notes" class="module">
        <!-- List panel -->
        <div class="notes-list-panel">
          <div class="notes-list-header">
            <button class="notes-new-btn" onclick="notesNewNote()">&#43; &#26032;&#24314;</button>
            <button class="notes-import-btn" onclick="notesOpenImport()">&#8593; &#23548;&#20837;</button>
            <button class="panel-toggle-btn always-show" title="&#25240;&#21472;&#38754;&#26495;" onclick="event.stopPropagation();togglePanelCollapse(this.closest('.notes-list-panel'),'notes')" style="flex:0;">&#9664;</button>
          </div>
          <div class="notes-tabs">
            <button class="notes-tab" id="notes-tab-local" onclick="notesSwitchTab(&#39;local&#39;)"><span>&#26412;&#22320;&#31508;&#35760;</span><span class="notes-tab-count" id="notes-tab-local-count">0</span></button>
            <button class="notes-tab" id="notes-tab-links" onclick="notesSwitchTab(&#39;links&#39;)"><span>&#24341;&#29992;&#31508;&#35760;</span><span class="notes-tab-count" id="notes-tab-links-count">0</span></button>
          </div>
          <div class="notes-search-wrap">
            <input type="text" id="notes-search" class="notes-search" placeholder="&#25628;&#32034;&#26631;&#39064;&#12289;&#20869;&#23481;&#12289;&#26631;&#31614;..." autocomplete="off" oninput="notesOnSearch(this.value)">
          </div>
          <div class="notes-list-scroll" id="notes-list-scroll">
            <div class="note-empty-state">
              <div class="note-empty-state-icon">&#9636;</div>
              <div>&#26082;&#26080;&#31508;&#35760;</div>
            </div>
          </div>
          <div class="panel-resize-handle"></div>
        </div>

        <!-- Editor panel -->
        <div class="notes-editor-panel" id="notes-editor-panel">
          <div class="notes-editor-empty" id="notes-editor-empty">
            <div class="notes-editor-empty-icon">&#9636;</div>
            <div class="notes-editor-empty-text">&#36873;&#25321;&#19968;&#26465;&#31508;&#35760;&#65292;&#25110;&#26032;&#24314;</div>
          </div>
          <div class="notes-editor-inner" id="notes-editor-inner" style="display:none;flex-direction:column;flex:1;overflow:hidden">
            <div class="notes-title-bar">
              <div style="display:flex; align-items:center; gap:8px">
                <input type="text" id="notes-title-input" class="notes-title-input" placeholder="&#31508;&#35760;&#26631;&#39064;" oninput="notesOnTitleChange(this.value)" style="flex:1; margin-bottom:0">
                <button class="note-backup-btn" id="note-backup-btn" onclick="notesBackupLink()" style="display:none">&#128190; &#22791;&#20221;</button>
              </div>
              <div class="notes-tags-row" id="notes-tags-row">
                <button class="note-add-tag-btn" id="notes-add-tag-btn" onclick="notesShowTagInput()">&#43; &#26631;&#31614;</button>
              </div>
            </div>
            <div class="notes-view-toolbar">
              <button class="notes-view-btn" id="notes-btn-preview" onclick="notesSwitchView('preview')">&#9711; &#39044;&#35272;</button>
              <button class="notes-view-btn" id="notes-btn-edit" onclick="notesSwitchView('edit')">&#9998; &#32534;&#36753;</button>
              <button class="notes-view-btn" id="notes-btn-split" onclick="notesSwitchView('split')">&#9633; &#20998;&#23631;</button>
            </div>
            <div class="notes-content-area" id="notes-content-area">
              <textarea id="notes-editor-textarea" class="notes-editor-textarea" placeholder="&#24320;&#22987;&#20889;&#20316;..." oninput="notesOnContentChange(this.value)"></textarea>
              <div id="notes-preview-shell" class="notes-preview-shell no-toc">
                <div id="notes-preview-pane" class="notes-preview-pane"></div>
                <nav id="notes-preview-toc" class="notes-preview-toc" aria-label="Markdown heading navigation"></nav>
              </div>
            </div>
            <div class="notes-status-bar">
              <span class="notes-save-status saved" id="notes-save-status">&#10003; &#24050;&#20445;&#23384;</span>
              <span class="note-path-row" id="note-path-row" onclick="notesCopyPath()" title="">
                <span class="note-path-icon">&#9636;</span>
                <span class="note-path-text" id="note-path-text"></span>
                <span class="note-path-copied" id="note-path-copied">&#10003; 已复制</span>
              </span>
              <span id="notes-word-count">&#23383;&#25968;: 0</span>
              <span id="notes-line-count">&#34892;&#25968;: 0</span>
              <span class="note-reveal-btn" id="note-reveal-btn" onclick="notesRevealLink()" style="display:none">&#128193; 在 Finder 中显示</span>
            </div>
          </div>
        </div>
      </div>`

// ── 4.4b  Modal HTML (inject outside #app, position:fixed) ───────────────────

export const NOTES_MODAL_HTML = `
<!-- Notes Import Modal -->
<div class="notes-modal-overlay hidden" id="notes-modal-overlay" onclick="notesCloseImportIfOverlay(event)">
  <div class="notes-modal">
    <div class="notes-modal-header">
      <span class="notes-modal-title">&#23548;&#20837; Markdown &#25991;&#20214;</span>
      <button class="notes-modal-close" onclick="notesCloseImport()">&#10005;</button>
    </div>
    <div class="notes-modal-tabs">
      <button class="notes-modal-tab active" id="notes-modal-tab-local" onclick="notesSwitchImportTab('local')">&#9636; &#26412;&#22320;&#31508;&#35760;</button>
      <button class="notes-modal-tab" id="notes-modal-tab-link" onclick="notesSwitchImportTab('link')">&#128279; &#24341;&#29992;&#31508;&#35760;</button>
    </div>
    <div class="notes-modal-body">
      <!-- 本地笔记导入：文件拖拽 + 路径输入 -->
      <div class="notes-modal-tab-panel active" id="notes-panel-local">
        <div class="notes-import-section">
          <div class="notes-import-section-title">&#36873;&#25321;&#25991;&#20214;</div>
          <div class="notes-file-drop" id="notes-file-drop" onclick="document.getElementById('notes-file-input').click()" ondragover="notesDragOver(event)" ondrop="notesDrop(event)" ondragleave="notesDragLeave(event)">
            <div class="notes-file-drop-icon">&#9636;</div>
            <div class="notes-file-drop-text">&#25302;&#25318; .md &#25991;&#20214;&#21040;&#27492;&#22788;&#65292;&#25110;&#28857;&#20987;&#36873;&#25321;</div>
            <button class="notes-file-btn" onclick="event.stopPropagation();document.getElementById('notes-file-input').click()">&#36873;&#25321;&#25991;&#20214;</button>
          </div>
          <input type="file" id="notes-file-input" accept=".md" style="display:none" onchange="notesFileSelected(this)">
        </div>
        <div class="notes-import-divider"><span>&#25110;</span></div>
        <div class="notes-import-section">
          <div class="notes-import-section-title">&#36755;&#20837;&#36335;&#24452;</div>
          <input type="text" id="notes-path-input" class="notes-path-input" placeholder="/Users/you/notes/my-note.md">
          <button class="notes-import-submit" id="notes-path-submit" onclick="notesImportFromPath()">&#23548;&#20837;</button>
        </div>
        <div class="notes-modal-error" id="notes-local-error"></div>
      </div>
      <!-- 引用笔记导入：选择文件夹/文件 + 路径（自动识别类型） -->
      <div class="notes-modal-tab-panel" id="notes-panel-link">
        <div class="notes-import-section">
          <div class="notes-import-section-title">&#36873;&#25321;&#25991;&#20214;&#22841;&#25110;&#25991;&#20214;</div>
          <div class="notes-file-drop" id="notes-folder-drop">
            <div class="notes-file-drop-icon">&#128193;</div>
            <div class="notes-file-drop-text">&#28857;&#20987;&#36873;&#25321;&#25991;&#20214;&#22841;&#25110; .md &#25991;&#20214;&#65292;&#36335;&#24452;&#33258;&#21160;&#22635;&#20837;&#19979;&#26041;&#36755;&#20837;&#26694;</div>
            <div style="display:flex;gap:8px;justify-content:center">
              <button class="notes-file-btn" onclick="event.stopPropagation();notesPickFolder()">&#128193; &#25991;&#20214;&#22841;</button>
              <button class="notes-file-btn" onclick="event.stopPropagation();notesPickNoteFile()">&#128196; &#25991;&#20214;</button>
            </div>
          </div>
        </div>
        <div class="notes-import-divider"><span>&#25110;</span></div>
        <div class="notes-import-section">
          <div class="notes-import-section-title">&#36755;&#20837;&#36335;&#24452;</div>
          <input type="text" id="notes-link-path-input" class="notes-path-input" placeholder="/Users/you/Documents/notes &#25110; /path/to/file.md">
          <div class="notes-path-label" style="margin-top:10px">&#26174;&#31034;&#21517;&#65288;&#21487;&#36873;&#65292;&#30041;&#31354;&#29992;&#25991;&#20214;&#21517;&#65289;</div>
          <input type="text" id="notes-link-label-input" class="notes-path-input" placeholder="&#25105;&#30340;&#31508;&#35760;&#24211;">
          <button class="notes-import-submit" id="notes-link-submit" onclick="notesImportLink()">&#24341;&#20837;</button>
        </div>
        <div class="notes-link-hint">&#20165;&#20570;&#20851;&#32852;&#24341;&#29992;&#65292;&#19981;&#25335;&#36125;&#25991;&#20214;&#12290;ccs &#33258;&#21160;&#35782;&#21035;&#25991;&#20214;&#22841;/&#25991;&#20214;&#65292;&#21482;&#35835;&#26597;&#30475; .md &#25991;&#26723;&#12290;</div>
        <div class="notes-modal-error" id="notes-link-error"></div>
      </div>
    </div>
  </div>
</div>`

// ── 4.5-4.20  JavaScript ──────────────────────────────────────────────────────

export const NOTES_JS = `
// ── Notes module state ──────────────────────────────────────────────────────
var _notes = [];
var _activeId = null;
var _viewMode = 'preview';
var _searchQuery = '';
var _saveTimer = null;
var _isDirty = false;
var _notesLoaded = false;
var _importTab = 'local';
var _noteLinks = [];
var _activeTab = 'local';          // 'local' | 'links'，从 localStorage 恢复
var _activeLinkFile = null;        // {linkId, path, title}
var _expandedLinkFolders = {};     // {linkId: true} 顶层引用文件夹展开状态
var _expandedTreeFolders = {};     // {folderPath: true} 树内子文件夹逐级展开状态
var _linkTreeCache = {};           // {linkId: tree}

// ── 4.6  Init ────────────────────────────────────────────────────────────────
function notesInit() {
  if (!window.CCS_NOTE) return;
  var navEl = document.getElementById('nav-notes');
  if (navEl) navEl.style.display = '';
  // Hash state takes priority over localStorage for tab
  if (window._pendingNotesTab) {
    var pendingTab = window._pendingNotesTab;
    if (pendingTab === 'local' || pendingTab === 'links') _activeTab = pendingTab;
  } else {
    notesRestoreTab();
  }
  // Esc to close import modal
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') notesCloseImport();
  });
  // Panel collapse + resize
  var panel = document.querySelector('.notes-list-panel');
  if (panel) {
    if (typeof initPanelCollapse === 'function') initPanelCollapse(panel, 'notes');
    if (typeof initPanelResize === 'function') initPanelResize(panel, 'notes', 120, 500);
  }
}

// ── 4.7  Load list ───────────────────────────────────────────────────────────
function loadNotesList() {
  return fetch('/api/notes').then(function(r) { return r.json(); }).then(function(data) {
    _notes = data;
    notesRenderList();
  });
}

function loadNoteLinksList() {
  return fetch('/api/notes/links').then(function(r) { return r.json(); }).then(function(data) {
    _noteLinks = data.links || [];
    notesRenderList();
  });
}

function notesRenderList() {
  var el = document.getElementById('notes-list-scroll');
  if (!el) return;
  var q = _searchQuery.toLowerCase();
  // 本地笔记
  var localItems = _notes.filter(function(n) {
    return !q
      || (n.title || '').toLowerCase().includes(q)
      || (n.preview || '').toLowerCase().includes(q)
      || (n.tags || []).some(function(t) { return t.toLowerCase().includes(q); });
  });
  // 引用项（搜 label / 文件名）
  var linkItems = _noteLinks.filter(function(l) {
    return !q || (l.label || '').toLowerCase().includes(q) || (l.path || '').toLowerCase().includes(q);
  });

  // 更新 tab 计数与高亮
  notesUpdateTabs(localItems.length, linkItems.length);

  var html = '';
  if (_activeTab === 'links') {
    // 引用列表
    if (linkItems.length === 0) {
      html += '<div class="note-empty-state"><div class="note-empty-state-icon">&#128279;</div><div>'
        + (q ? '无匹配引用' : '暂无引用，点击“导入”引入') + '</div></div>';
    } else {
      linkItems.forEach(function(l) {
        html += notesRenderLinkItem(l);
      });
    }
  } else {
    // 本地笔记列表
    if (localItems.length === 0) {
      html += '<div class="note-empty-state"><div class="note-empty-state-icon">&#9636;</div><div>'
        + (q ? '无匹配笔记' : '暂无笔记，点击“+ 新建”') + '</div></div>';
    } else {
      localItems.forEach(function(n) {
        var active = n.id === _activeId ? ' active' : '';
        var tags = (n.tags || []).slice(0, 2).map(function(t) {
          return '<span class="note-item-tag">' + escHtml(t) + '</span>';
        }).join('');
        html += '<div class="note-item' + active + '" id="note-item-' + escHtml(n.id) + '" onclick="notesSelectNote(' + escHtml(JSON.stringify(n.id)) + ')">'
          + '<div class="note-item-title" title="' + escHtml(n.title || '无标题') + '">' + escHtml(n.title || '无标题') + '</div>'
          + '<div class="note-item-meta"><span>' + notesRelTime(n.updatedAt) + '</span></div>'
          + (tags ? '<div class="note-item-tags">' + tags + '</div>' : '')
          + '<button class="note-delete-btn" onclick="notesDeleteClick(event,' + escHtml(JSON.stringify(n.id)) + ')">&#10005;</button>'
          + '</div>';
      });
    }
  }

  el.innerHTML = html;
  // Handle pending state from URL hash
  if (window._pendingNotesTab) {
    var pendingTab = window._pendingNotesTab;
    window._pendingNotesTab = null;
    if (pendingTab === 'links' || pendingTab === 'local') notesSwitchTab(pendingTab);
  }
  if (window._pendingNoteSelect) {
    var pendingNote = window._pendingNoteSelect;
    window._pendingNoteSelect = null;
    // Ensure we're on the local tab and the note exists
    if (_activeTab !== 'local') notesSwitchTab('local');
    notesSelectNote(pendingNote);
  }
  // link/file pending 依赖 _noteLinks 数据：只有数据已加载才消费，
  // 否则留给后续 notesRenderList() 调用（loadNoteLinksList 完成时）
  if (window._pendingLinkSelect && _noteLinks.length > 0) {
    var pendingLink = window._pendingLinkSelect;
    window._pendingLinkSelect = null;
    // Ensure we're on the links tab
    if (_activeTab !== 'links') notesSwitchTab('links');
    notesOpenLinkFile(pendingLink);
  }
  if (window._pendingFileSelect && _noteLinks.length > 0) {
    var pendingFile = window._pendingFileSelect;
    window._pendingFileSelect = null;
    if (_activeTab !== 'links') notesSwitchTab('links');
    notesOpenLinkFileByPath(pendingFile);
  }
}

function notesUpdateTabs(localCount, linkCount) {
  var localCountEl = document.getElementById('notes-tab-local-count');
  var linkCountEl = document.getElementById('notes-tab-links-count');
  if (localCountEl) localCountEl.textContent = localCount;
  if (linkCountEl) linkCountEl.textContent = linkCount;
  var localTab = document.getElementById('notes-tab-local');
  var linksTab = document.getElementById('notes-tab-links');
  if (localTab) localTab.classList.toggle('active', _activeTab === 'local');
  if (linksTab) linksTab.classList.toggle('active', _activeTab === 'links');
}

function notesSwitchTab(tab) {
  if (_activeTab === tab) return;
  _activeTab = tab;
  try { localStorage.setItem('notes-active-tab', tab); } catch (e) {}
  notesRenderList();
  updateHash(tab !== 'local' ? { tab: tab } : {});
}

function notesRestoreTab() {
  try {
    var saved = localStorage.getItem('notes-active-tab');
    if (saved === 'local' || saved === 'links') _activeTab = saved;
  } catch (e) {}
}

function notesRenderLinkItem(l) {
  var icon = l.type === 'folder' ? '&#128193;' : '&#128196;';
  var expanded = _expandedLinkFolders[l.id];
  var arrow = l.type === 'folder' ? (expanded ? '▾' : '▸') : '';
  var active = _activeLinkFile && _activeLinkFile.linkId === l.id;
  var html = '<div class="note-link-item' + (expanded ? ' expanded' : '') + '" id="note-link-' + escHtml(l.id) + '">'
    + '<div class="note-link-row' + (active ? ' active' : '') + '" onclick="notesLinkClick(event,' + escHtml(JSON.stringify(l.id)) + ')">'
    + '<span class="note-link-arrow">' + arrow + '</span>'
    + '<span class="note-link-icon">' + icon + '</span>'
    + '<span class="note-link-label" title="' + escHtml(l.label) + '">' + escHtml(l.label) + '</span>'
    + '<button class="note-delete-btn" onclick="notesLinkDeleteClick(event,' + escHtml(JSON.stringify(l.id)) + ')">&#10005;</button>'
    + '</div>';
  if (expanded && l.type === 'folder') {
    // 已展开：从缓存同步渲染树内容（缓存命中时不再依赖异步加载，避免重渲染后内容丢失）
    var cached = _linkTreeCache[l.id];
    var treeHtml = cached ? notesRenderTreeNodes(cached, 0, l.id) : '<div class="note-link-loading">加载中...</div>';
    html += '<div class="note-link-tree" id="note-link-tree-' + escHtml(l.id) + '">' + treeHtml + '</div>';
  }
  html += '</div>';
  return html;
}

function notesLinkClick(e, linkId) {
  e.stopPropagation();
  var link = _noteLinks.find(function(l) { return l.id === linkId; });
  if (!link) return;
  if (link.type === 'folder') {
    // 展开/折叠
    if (_expandedLinkFolders[linkId]) {
      delete _expandedLinkFolders[linkId];
      // 折叠顶层时，清理该树内所有子文件夹展开状态，下次展开回到第一级
      notesClearTreeFolderState(linkId);
      notesRenderList();
    } else {
      _expandedLinkFolders[linkId] = true;
      notesRenderList();
      notesLoadLinkTree(linkId);
    }
  } else {
    // file：直接预览 — 先立即标为选中，再异步加载内容
    _activeId = null;
    _activeLinkFile = { linkId: linkId, path: '', title: link.label };
    notesRenderList();
    updateHash({ link: linkId });
    notesOpenLinkFile(linkId);
  }
}

function notesLoadLinkTree(linkId, callback) {
  var container = document.getElementById('note-link-tree-' + linkId);
  if (!container) return;
  container.innerHTML = '<div class="note-link-loading">加载中...</div>';
  fetch('/api/notes/links/' + linkId + '/tree').then(function(r) { return r.json(); }).then(function(data) {
    // 重新查询容器：并行加载的 loadNotesList/loadNoteLinksList 可能在 fetch 期间
    // 通过 notesRenderList() 重建了 DOM，旧 container 引用已脱离文档
    var el = document.getElementById('note-link-tree-' + linkId);
    if (!el) return;
    if (data && data.error) {
      el.innerHTML = '<div class="note-link-error">' + escHtml(data.error) + '</div>';
      loadNoteLinksList();  // 失效则刷新
      return;
    }
    _linkTreeCache[linkId] = data.tree || [];
    el.innerHTML = notesRenderTreeNodes(data.tree || [], 0, linkId);
    if (data.truncated) {
      el.innerHTML += '<div class="note-link-truncated">已截断显示（超过上限）</div>';
    }
    if (callback) callback(data.tree || []);
  }).catch(function() {
    var el = document.getElementById('note-link-tree-' + linkId);
    if (el) el.innerHTML = '<div class="note-link-error">加载失败</div>';
  });
}

function notesRenderTreeNodes(nodes, depth, linkId) {
  var activePath = _activeLinkFile ? _activeLinkFile.path : null;
  var html = '';
  nodes.forEach(function(n) {
    var pad = 'padding-left:' + (12 + depth * 14) + 'px;';
    if (n.type === 'folder') {
      var open = _expandedTreeFolders[n.path];
      var arrow = open ? '▾' : '▸';
      html += '<div class="note-tree-folder" style="' + pad + '" title="' + escHtml(n.name) + '" onclick="notesToggleTreeFolder(event,' + escHtml(JSON.stringify(linkId)) + ',' + escHtml(JSON.stringify(n.path)) + ')"><span class="note-tree-arrow">' + arrow + '</span> &#128193; ' + escHtml(n.name) + '</div>';
      // 逐级展开：仅在该文件夹已展开时渲染子节点
      if (open && n.children) html += notesRenderTreeNodes(n.children, depth + 1, linkId);
    } else {
      var fileActive = activePath && n.path === activePath;
      html += '<div class="note-tree-file' + (fileActive ? ' active' : '') + '" style="' + pad + '" title="' + escHtml(n.name) + '" onclick="notesOpenLinkFileByPath(' + escHtml(JSON.stringify(n.path)) + ')">&#128196; ' + escHtml(n.name) + '</div>';
    }
  });
  return html;
}

// 树内子文件夹逐级展开/折叠（局部重渲染，不影响整列表）
function notesToggleTreeFolder(e, linkId, folderPath) {
  if (e) e.stopPropagation();
  if (_expandedTreeFolders[folderPath]) {
    delete _expandedTreeFolders[folderPath];
  } else {
    _expandedTreeFolders[folderPath] = true;
  }
  // 局部刷新该顶层 link 的树容器
  var container = document.getElementById('note-link-tree-' + linkId);
  if (container && _linkTreeCache[linkId]) {
    container.innerHTML = notesRenderTreeNodes(_linkTreeCache[linkId], 0, linkId);
  }
}

// 递归清理某顶层 link 树内所有子文件夹的展开状态
function notesClearTreeFolderState(linkId) {
  var tree = _linkTreeCache[linkId];
  if (!tree) return;
  function walk(nodes) {
    nodes.forEach(function(n) {
      if (n.type === 'folder') {
        delete _expandedTreeFolders[n.path];
        if (n.children) walk(n.children);
      }
    });
  }
  walk(tree);
}

function notesOpenLinkFile(linkId) {
  // 立即高亮左侧 link 行，不等待 fetch 完成
  var link = _noteLinks.find(function(l) { return l.id === linkId; });
  _activeId = null;
  _activeLinkFile = { linkId: linkId, path: '', title: link ? link.label : '' };
  notesRenderList();
  // file 类型引用：按 linkId 读
  fetch('/api/notes/links/' + linkId + '/content').then(function(r) { return r.json(); }).then(function(data) {
    if (data && data.error) {
      notesShowLinkError(data.error);
      loadNoteLinksList();
      return;
    }
    notesShowLinkPreview(data.title || '', data.path || '', data.content || '', linkId);
  }).catch(function() { notesShowLinkError('加载失败'); });
}

// 根据文件路径在树中逐级展开文件夹，使目标文件可见
function expandTreeToPath(tree, filePath) {
  function walk(nodes) {
    if (!nodes) return;
    nodes.forEach(function(n) {
      if (n.type === 'folder' && filePath.indexOf(n.path + '/') === 0) {
        _expandedTreeFolders[n.path] = true;
        if (n.children) walk(n.children);
      }
    });
  }
  walk(tree);
}

function notesOpenLinkFileByPath(mdPath) {
  // 树内文件：立即标记所属引用链接为选中，再异步加载内容
  var activeLinkId = null;
  if (_noteLinks) {
    var best = null;
    _noteLinks.forEach(function(l) {
      if (l.path && mdPath.indexOf(l.path) === 0) {
        if (!best || l.path.length > best.path.length) best = l;
      }
    });
    if (best) {
      activeLinkId = best.id;
      // 展开顶层引用文件夹 + 加载树，树加载完成后逐级展开到文件路径
      _expandedLinkFolders[best.id] = true;
    }
  }
  _activeId = null;
  _activeLinkFile = { linkId: activeLinkId, path: mdPath, title: '' };
  // 先渲染列表创建 DOM 容器，再异步加载树（notesLoadLinkTree 依赖容器存在）
  notesRenderList();
  if (activeLinkId) {
    notesLoadLinkTree(activeLinkId, function(tree) {
      expandTreeToPath(tree, mdPath);
      // 局部刷新该 link 的树容器使逐级展开生效
      var container = document.getElementById('note-link-tree-' + activeLinkId);
      if (container && _linkTreeCache[activeLinkId]) {
        container.innerHTML = notesRenderTreeNodes(_linkTreeCache[activeLinkId], 0, activeLinkId);
      }
    });
  }
  // 按路径读（不持久化）
  fetch('/api/notes/links/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: mdPath })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data && data.error) { notesShowLinkError(data.error); return; }
    notesShowLinkPreview(data.title || '', data.path || mdPath, data.content || '', null);
  }).catch(function() { notesShowLinkError('加载失败'); });
}

function notesShowLinkError(msg) {
  var inner = document.getElementById('notes-editor-inner');
  var empty = document.getElementById('notes-editor-empty');
  if (empty) { empty.style.display = ''; empty.innerHTML = '<div class="notes-editor-empty-icon">&#9888;</div><div>' + escHtml(msg) + '<br><span style="font-size:.85em;opacity:.7">原文件可能已不存在</span></div>'; }
  if (inner) inner.style.display = 'none';
}

function notesShowLinkPreview(title, path, content, linkId) {
  _activeId = null;          // 与本地笔记互斥
  // 树内文件没有 linkId，尝试找到所属的引用链接
  var activeLinkId = linkId;
  if (!activeLinkId && path && _noteLinks) {
    var best = null;
    _noteLinks.forEach(function(l) {
      if (l.path && path.indexOf(l.path) === 0) {
        if (!best || l.path.length > best.path.length) best = l;
      }
    });
    if (best) activeLinkId = best.id;
  }
  _activeLinkFile = { linkId: activeLinkId, path: path, title: title };
  notesRenderList();
  updateHash(linkId ? { link: linkId } : { file: path });
  // 切到只读预览形态
  document.getElementById('notes-editor-empty').style.display = 'none';
  var inner = document.getElementById('notes-editor-inner');
  inner.style.display = 'flex';
  // 标题栏：只读
  var titleInput = document.getElementById('notes-title-input');
  titleInput.value = title;
  titleInput.readOnly = true;
  titleInput.classList.add('readonly');
  // 隐藏标签行、视图按钮（引用文档固定只读预览，无需切换视图）
  document.getElementById('notes-tags-row').style.display = 'none';
  document.getElementById('notes-btn-preview').style.display = 'none';
  document.getElementById('notes-btn-edit').style.display = 'none';
  document.getElementById('notes-btn-split').style.display = 'none';
  // 隐藏 textarea，显示预览
  document.getElementById('notes-editor-textarea').style.display = 'none';
  document.getElementById('notes-preview-shell').style.display = 'flex';
  document.getElementById('notes-preview-pane').style.display = 'block';
  // 路径行
  var pathText = document.getElementById('note-path-text');
  if (pathText) pathText.textContent = path;
  var pathRow = document.getElementById('note-path-row');
  if (pathRow) { pathRow.title = path; pathRow.setAttribute('onclick', 'notesCopyPath()'); }
  // 状态栏：只读标记 + 在 Finder 显示
  notesSetSaveStatus('saved');
  var status = document.getElementById('notes-save-status');
  if (status) status.innerHTML = '&#128279; 引用 · 只读';
  // 渲染预览
  notesUpdatePreview(content);
  notesUpdateWordCount(content);
  // 记录当前 linkId 供 reveal 用
  inner.setAttribute('data-link-id', linkId || '');
  // 显示「在 Finder 中显示」按钮（仅 file 引用有 linkId）
  var rb = document.getElementById('note-reveal-btn');
  if (rb) rb.style.display = linkId ? '' : 'none';
  // 显示备份按钮
  var bb = document.getElementById('note-backup-btn');
  if (bb) { bb.style.display = ''; bb.classList.remove('backed'); bb.textContent = '\ud83d\udcbe \u5907\u4efd'; }
}

function notesLinkDeleteClick(e, linkId) {
  e.stopPropagation();
  var row = e.currentTarget && e.currentTarget.closest ? e.currentTarget.closest('.note-link-row') : null;
  if (!row) {
    var item = document.getElementById('note-link-' + linkId);
    row = item ? item.querySelector('.note-link-row') : null;
  }
  if (!row) return;
  // 再次点击则收起确认气泡
  var existing = row.querySelector('.note-delete-confirm');
  if (existing) { existing.remove(); return; }
  var conf = document.createElement('div');
  conf.className = 'note-delete-confirm';
  conf.innerHTML = '&#31227;&#38500;&#24341;&#29992;? &#21407;&#25991;&#20214;&#20445;&#30041; '
    + '<button class="yes" onclick="notesLinkDeleteConfirm(event,' + escHtml(JSON.stringify(linkId)) + ')">&#26159;</button>'
    + '<button onclick="event.stopPropagation();this.closest(&#39;.note-delete-confirm&#39;).remove()">&#21542;</button>';
  row.appendChild(conf);
}
function notesLinkDeleteConfirm(e, linkId) {
  e.stopPropagation();
  fetch('/api/notes/links/' + linkId, { method: 'DELETE' }).then(function(r) {
    if (r.status === 204) {
      if (_activeLinkFile && _activeLinkFile.linkId === linkId) {
        _activeLinkFile = null;
        notesCloseLinkPreview();
      }
      // 清理该 link 的展开状态与树缓存
      notesClearTreeFolderState(linkId);
      delete _linkTreeCache[linkId];
      loadNoteLinksList();
    }
  });
}

function notesCloseLinkPreview() {
  // 恢复编辑器为本地笔记空状态
  var titleInput = document.getElementById('notes-title-input');
  titleInput.readOnly = false;
  titleInput.classList.remove('readonly');
  document.getElementById('notes-tags-row').style.display = '';
  document.getElementById('notes-btn-preview').style.display = '';
  document.getElementById('notes-btn-edit').style.display = '';
  document.getElementById('notes-btn-split').style.display = '';
  document.getElementById('notes-editor-empty').style.display = '';
  document.getElementById('notes-editor-inner').style.display = 'none';
  var rb = document.getElementById('note-reveal-btn');
  if (rb) rb.style.display = 'none';
  var bb = document.getElementById('note-backup-btn');
  if (bb) bb.style.display = 'none';
  updateHash({});
}

function notesBackupLink() {
  // 备份当前引用的文件到本地笔记
  var path = '';
  var pathText = document.getElementById('note-path-text');
  if (pathText) path = pathText.textContent || '';
  if (!path) return;
  var btn = document.getElementById('note-backup-btn');
  if (btn) { btn.disabled = true; btn.textContent = '备份中...'; }
  fetch('/api/notes/links/backup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: path })
  }).then(function(r) {
    if (r.ok) {
      if (btn) { btn.classList.add('backed'); btn.textContent = '\u2713 \u5df2\u5907\u4efd'; btn.disabled = false; }
      // 刷新本地笔记列表（后台静默）
      loadNotesList();
    } else {
      if (btn) { btn.textContent = '备份失败'; btn.disabled = false; }
      setTimeout(function() { if (btn) { btn.textContent = '\ud83d\udcbE \u5907\u4efd'; } }, 2000);
    }
  }).catch(function() {
    if (btn) { btn.textContent = '备份失败'; btn.disabled = false; }
    setTimeout(function() { if (btn) { btn.textContent = '\ud83d\udcbE \u5907\u4efd'; } }, 2000);
  });
}

function notesRevealLink() {
  var inner = document.getElementById('notes-editor-inner');
  var linkId = inner && inner.getAttribute('data-link-id');
  if (!linkId) return;
  fetch('/api/notes/links/' + linkId + '/reveal').then(function() {});
}

// ── 4.8  Select note ─────────────────────────────────────────────────────────
function notesSelectNote(id) {
  _activeId = id;
  _activeLinkFile = null;
  // 恢复可编辑形态（从引用只读切回本地笔记）
  var titleInput = document.getElementById('notes-title-input');
  if (titleInput) { titleInput.readOnly = false; titleInput.classList.remove('readonly'); }
  var tagsRow = document.getElementById('notes-tags-row'); if (tagsRow) tagsRow.style.display = '';
  var btnPreview = document.getElementById('notes-btn-preview'); if (btnPreview) btnPreview.style.display = '';
  var btnEdit = document.getElementById('notes-btn-edit'); if (btnEdit) btnEdit.style.display = '';
  var btnSplit = document.getElementById('notes-btn-split'); if (btnSplit) btnSplit.style.display = '';
  var status = document.getElementById('notes-save-status');
  if (status) status.innerHTML = '&#10003; 已保存';
  var rb = document.getElementById('note-reveal-btn'); if (rb) rb.style.display = 'none';
  var bb = document.getElementById('note-backup-btn'); if (bb) bb.style.display = 'none';
  notesRenderList();
  updateHash(id ? { note: id } : {});
  document.getElementById('notes-editor-empty').style.display = 'none';
  document.getElementById('notes-editor-inner').style.display = 'flex';
  notesBindScrollSync();
  fetch('/api/notes/' + id).then(function(r) { return r.json(); }).then(function(note) {
    document.getElementById('notes-title-input').value = note.title || '';
    document.getElementById('notes-editor-textarea').value = note.content || '';
    notesRenderTagsRow(note.tags || []);
    notesUpdateWordCount(note.content || '');
    // Set file path
    var pathRow = document.getElementById('note-path-row');
    if (pathRow && note.path) { pathRow.title = note.path; }
    var pathText = document.getElementById('note-path-text');
    if (pathText) { pathText.textContent = note.path || ''; }
    // Default: preview mode
    notesSwitchView('preview');
    notesUpdatePreview(note.content || '');
    _isDirty = false;
    notesSetSaveStatus('saved');
  });
}

// ── 4.9  Switch view ──────────────────────────────────────────────────────────
function notesSwitchView(mode) {
  _viewMode = mode;
  var area = document.getElementById('notes-content-area');
  var textarea = document.getElementById('notes-editor-textarea');
  var preview = document.getElementById('notes-preview-pane');
  var previewShell = document.getElementById('notes-preview-shell');
  // Reset classes
  area.className = 'notes-content-area';
  ['preview','edit','split'].forEach(function(m) {
    document.getElementById('notes-btn-' + m).classList.toggle('active', m === mode);
  });
  if (mode === 'preview') {
    textarea.style.display = 'none';
    previewShell.style.display = 'flex';
    preview.style.display = 'block';
    notesUpdatePreview(textarea.value);
  } else if (mode === 'edit') {
    textarea.style.display = 'block';
    previewShell.style.display = 'none';
    textarea.focus();
  } else { // split
    area.classList.add('split');
    textarea.style.display = 'block';
    previewShell.style.display = 'flex';
    preview.style.display = 'block';
    notesUpdatePreview(textarea.value);
  }
}

// ── 4.10  Sync scroll (set up once on first use) ─────────────────────────────
var _scrollSyncBound = false;
function notesBindScrollSync() {
  if (_scrollSyncBound) return;
  _scrollSyncBound = true;
  var ta = document.getElementById('notes-editor-textarea');
  var pv = document.getElementById('notes-preview-pane');
  if (!ta || !pv) return;
  var _syncing = false;
  ta.addEventListener('scroll', function() {
    if (_syncing) return; _syncing = true;
    var pct = ta.scrollHeight <= ta.clientHeight ? 0 : ta.scrollTop / (ta.scrollHeight - ta.clientHeight);
    pv.scrollTop = pct * (pv.scrollHeight - pv.clientHeight);
    _syncing = false;
  });
  pv.addEventListener('scroll', notesUpdateActiveToc);
}

// ── 4.11  Auto-save ───────────────────────────────────────────────────────────
function notesOnContentChange(val) {
  _isDirty = true;
  notesSetSaveStatus('dirty');
  notesUpdateWordCount(val);
  if (_viewMode === 'split' || _viewMode === 'preview') notesUpdatePreview(val);
  notesScheduleSave();
}
function notesOnTitleChange(val) {
  _isDirty = true;
  notesSetSaveStatus('dirty');
  notesScheduleSave();
}
function notesScheduleSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function() { notesSaveActive(); }, 1000);
}
function notesSaveActive() {
  if (!_activeId || !_isDirty) return;
  notesSetSaveStatus('saving');
  var title = document.getElementById('notes-title-input').value;
  var content = document.getElementById('notes-editor-textarea').value;
  var tags = notesGetCurrentTags();
  fetch('/api/notes/' + _activeId, {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({title: title, content: content, tags: tags})
  }).then(function(r) { return r.json(); }).then(function(updated) {
    _isDirty = false;
    notesSetSaveStatus('saved');
    // Update in cache
    var idx = _notes.findIndex(function(n) { return n.id === updated.id; });
    if (idx >= 0) {
      _notes[idx] = {id: updated.id, title: updated.title, tags: updated.tags, updatedAt: updated.updatedAt, preview: (updated.content||'').slice(0,100)};
      _notes.sort(function(a,b){ return new Date(b.updatedAt) - new Date(a.updatedAt); });
      notesRenderList();
    }
  }).catch(function() { notesSetSaveStatus('dirty'); });
}
function notesSetSaveStatus(state) {
  var el = document.getElementById('notes-save-status');
  if (!el) return;
  el.className = 'notes-save-status ' + state;
  el.innerHTML = state === 'saved' ? '&#10003; &#24050;&#20445;&#23384;'
    : state === 'saving' ? '&#27491;&#22312;&#20445;&#23384;...'
    : '&#9679; &#26410;&#20445;&#23384;';
}
function notesUpdateWordCount(content) {
  var words = (content || '').trim().length;
  var lines = (content || '').split('\\n').length;
  var wc = document.getElementById('notes-word-count');
  var lc = document.getElementById('notes-line-count');
  if (wc) wc.innerHTML = '&#23383;&#25968;: ' + words;
  if (lc) lc.innerHTML = '&#34892;&#25968;: ' + lines;
}
function notesCopyPath() {
  var el = document.getElementById('note-path-text');
  var path = el ? el.textContent : '';
  if (!path) return;
  navigator.clipboard.writeText(path).then(function() {
    var copied = document.getElementById('note-path-copied');
    if (copied) { copied.classList.add('show'); setTimeout(function() { copied.classList.remove('show'); }, 1500); }
  }).catch(function() {});
}
function notesUpdatePreview(content) {
  var pane = document.getElementById('notes-preview-pane');
  if (!pane) return;
  try {
    pane.innerHTML = window.marked ? marked.parse(content || '') : escHtml(content || '');
  } catch(e) {
    pane.textContent = content || '';
  }
  notesBuildPreviewNav(pane);
}
function notesBuildPreviewNav(pane) {
  var shell = document.getElementById('notes-preview-shell');
  var toc = document.getElementById('notes-preview-toc');
  if (!shell || !toc) return;
  var seen = {};
  var headings = Array.from(pane.querySelectorAll('h1,h2,h3,h4')).filter(function(h) {
    return (h.textContent || '').trim();
  });
  if (!headings.length) {
    shell.classList.add('no-toc');
    toc.innerHTML = '';
    return;
  }
  shell.classList.remove('no-toc');
  var html = '<div class="notes-toc-title">&#23548;&#33322;</div>';
  headings.forEach(function(h, idx) {
    var text = (h.textContent || '').trim();
    var base = notesSlugText(text) || ('section-' + (idx + 1));
    var id = base;
    var i = 2;
    while (seen[id]) {
      id = base + '-' + i;
      i += 1;
    }
    seen[id] = true;
    h.id = id;
    html += '<button class="notes-toc-item level-' + h.tagName.substring(1)
      + '" data-target="' + escHtml(id) + '" title="' + escHtml(text)
      + '" onclick="notesJumpToHeading(' + escHtml(JSON.stringify(id)) + ')">'
      + escHtml(text) + '</button>';
  });
  toc.innerHTML = html;
  notesUpdateActiveToc();
}
function notesSlugText(text) {
  return String(text).trim().toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
function notesJumpToHeading(id) {
  var pane = document.getElementById('notes-preview-pane');
  if (!pane) return;
  var heading = pane.querySelector('#' + cssEscapeCompat(id));
  if (!heading) return;
  pane.scrollTo({ top: Math.max(heading.offsetTop - 14, 0), behavior: 'smooth' });
}
function notesUpdateActiveToc() {
  var pane = document.getElementById('notes-preview-pane');
  var toc = document.getElementById('notes-preview-toc');
  if (!pane || !toc) return;
  var headings = Array.from(pane.querySelectorAll('h1,h2,h3,h4'));
  var activeId = '';
  var scrollTop = pane.scrollTop + 24;
  headings.forEach(function(h) {
    if (h.offsetTop <= scrollTop) activeId = h.id;
  });
  if (!activeId && headings[0]) activeId = headings[0].id;
  Array.from(toc.querySelectorAll('.notes-toc-item')).forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-target') === activeId);
  });
}
function cssEscapeCompat(s) {
  if (window.CSS && CSS.escape) return CSS.escape(s);
  return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\\\$&');
}

// ── 4.12  Tag editing ─────────────────────────────────────────────────────────
function notesRenderTagsRow(tags) {
  var row = document.getElementById('notes-tags-row');
  if (!row) return;
  var html = '';
  tags.forEach(function(t) {
    html += '<span class="note-edit-tag">' + escHtml(t)
      + '<span class="note-edit-tag-del" onclick="notesRemoveTag(' + escHtml(JSON.stringify(t)) + ')">&#215;</span></span>';
  });
  html += '<button class="note-add-tag-btn" id="notes-add-tag-btn" onclick="notesShowTagInput()">&#43; &#26631;&#31614;</button>';
  row.innerHTML = html;
}
function notesGetCurrentTags() {
  var row = document.getElementById('notes-tags-row');
  if (!row) return [];
  return Array.from(row.querySelectorAll('.note-edit-tag')).map(function(el) {
    return el.textContent.replace('×','').trim();
  });
}
function notesRemoveTag(tag) {
  var tags = notesGetCurrentTags().filter(function(t) { return t !== tag; });
  notesRenderTagsRow(tags);
  _isDirty = true;
  notesScheduleSave();
}
function notesShowTagInput() {
  var btn = document.getElementById('notes-add-tag-btn');
  if (!btn) return;
  var input = document.createElement('input');
  input.className = 'note-tag-input';
  input.placeholder = '&#26631;&#31614;&#21517;';
  btn.replaceWith(input);
  input.focus();
  function commit() {
    var val = input.value.trim();
    var tags = notesGetCurrentTags();
    // Restore add button first
    input.replaceWith(btn);
    if (val && !tags.includes(val)) {
      tags.push(val);
      notesRenderTagsRow(tags);
      _isDirty = true;
      notesScheduleSave();
    }
  }
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') { input.replaceWith(btn); } });
  input.addEventListener('blur', commit);
}

// ── 4.13  New note ────────────────────────────────────────────────────────────
function notesNewNote() {
  fetch('/api/notes', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({title: '\u65b0\u5efa\u7b14\u8bb0', content: ''})
  }).then(function(r) { return r.json(); }).then(function(note) {
    _notes.unshift({id: note.id, title: note.title, tags: note.tags, updatedAt: note.updatedAt, preview: ''});
    // 新建的是本地笔记，确保切到本地 tab 以便看到它
    if (_activeTab !== 'local') notesSwitchTab('local'); else notesRenderList();
    notesSelectNote(note.id);
    setTimeout(function() {
      var ti = document.getElementById('notes-title-input');
      if (ti) { ti.focus(); ti.select(); }
      notesSwitchView('edit');
    }, 50);
  });
}

// ── 4.14  Delete note ─────────────────────────────────────────────────────────
function notesDeleteClick(e, id) {
  e.stopPropagation();
  var item = document.getElementById('note-item-' + id);
  if (!item) return;
  // Remove any existing confirm
  var existing = item.querySelector('.note-delete-confirm');
  if (existing) { existing.remove(); return; }
  var conf = document.createElement('div');
  conf.className = 'note-delete-confirm';
  conf.innerHTML = '&#30830;&#35748;&#21024;&#38500;? '
    + '<button class="yes" onclick="notesDeleteConfirm(event,' + escHtml(JSON.stringify(id)) + ')">&#26159;</button>'
    + '<button onclick="this.closest(&#39;.note-delete-confirm&#39;).remove()">&#21542;</button>';
  item.appendChild(conf);
}
function notesDeleteConfirm(e, id) {
  e.stopPropagation();
  fetch('/api/notes/' + id, {method: 'DELETE'}).then(function() {
    _notes = _notes.filter(function(n) { return n.id !== id; });
    if (_activeId === id) {
      _activeId = null;
      document.getElementById('notes-editor-empty').style.display = '';
      document.getElementById('notes-editor-inner').style.display = 'none';
      updateHash({});
    }
    notesRenderList();
  });
}

// ── 4.15  Search ──────────────────────────────────────────────────────────────
function notesOnSearch(val) {
  _searchQuery = val;
  notesRenderList();
}

// ── 4.16  Search handled above in notesOnSearch ──────────────────────────────

// ── 4.17-4.19  Import Modal ───────────────────────────────────────────────────
function notesOpenImport() {
  document.getElementById('notes-modal-overlay').classList.remove('hidden');
  // Reset
  document.getElementById('notes-local-error').textContent = '';
  document.getElementById('notes-path-input').value = '';
  document.getElementById('notes-file-input').value = '';
  notesSwitchImportTab(_importTab);
}
function notesCloseImport() {
  document.getElementById('notes-modal-overlay').classList.add('hidden');
}
function notesCloseImportIfOverlay(e) {
  if (e.target === document.getElementById('notes-modal-overlay')) notesCloseImport();
}
function notesSwitchImportTab(tab) {
  _importTab = tab;
  ['local','link'].forEach(function(t) {
    var btn = document.getElementById('notes-modal-tab-' + t);
    var panel = document.getElementById('notes-panel-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
    if (panel) panel.classList.toggle('active', t === tab);
  });
  // 清空错误
  var localErr = document.getElementById('notes-local-error'); if (localErr) localErr.textContent = '';
  var linkErr = document.getElementById('notes-link-error'); if (linkErr) linkErr.textContent = '';
}

function notesPickFolder() {
  pickNativePath('folder', function(p) {
    document.getElementById('notes-link-path-input').value = p;
    var name = p.replace(/\\/$/, '').split('/').pop();
    document.getElementById('notes-link-label-input').value = name;
  });
}

function notesPickNoteFile() {
  pickNativePath('file', function(p) {
    document.getElementById('notes-link-path-input').value = p;
    var name = p.replace(/\\.md$/i, '').split('/').pop();
    document.getElementById('notes-link-label-input').value = name;
  });
}

function notesImportLink() {
  var path = (document.getElementById('notes-link-path-input').value || '').trim();
  var label = (document.getElementById('notes-link-label-input').value || '').trim();
  var errEl = document.getElementById('notes-link-error');
  if (errEl) errEl.textContent = '';
  if (!path) {
    if (errEl) errEl.textContent = '请输入目标路径';
    return;
  }
  var submit = document.getElementById('notes-link-submit');
  if (submit) submit.disabled = true;
  fetch('/api/notes/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: path, label: label || undefined })
  }).then(function(r) {
    return r.json().then(function(data) { return { status: r.status, body: data }; });
  }).then(function(res) {
    if (submit) submit.disabled = false;
    if (res.status === 201) {
      notesCloseImport();
      loadNotesList();
      loadNoteLinksList();
    } else {
      if (errEl) errEl.textContent = (res.body && res.body.error) || '引入失败';
    }
  }).catch(function() {
    if (submit) submit.disabled = false;
    if (errEl) errEl.textContent = '网络错误';
  });
}
// Drag & drop
function notesDragOver(e) { e.preventDefault(); document.getElementById('notes-file-drop').classList.add('drag-over'); }
function notesDragLeave(e) { document.getElementById('notes-file-drop').classList.remove('drag-over'); }
function notesDrop(e) {
  e.preventDefault();
  document.getElementById('notes-file-drop').classList.remove('drag-over');
  var file = e.dataTransfer.files[0];
  if (file) notesProcessFile(file);
}
function notesFileSelected(input) {
  var file = input.files[0];
  if (file) notesProcessFile(file);
}
function notesProcessFile(file) {
  var errEl = document.getElementById('notes-local-error');
  if (!file.name.toLowerCase().endsWith('.md')) {
    errEl.textContent = '&#20165;&#25903;&#25345; .md &#26684;&#24335;&#25991;&#20214;';
    return;
  }
  errEl.textContent = '';
  var reader = new FileReader();
  reader.onload = function(e) {
    var content = e.target.result;
    var title = file.name.replace(/\\.md$/i, '');
    // Try to extract title from frontmatter
    var fmMatch = /^---\\r?\\n[\\s\\S]*?^title:\\s*(.+)/m.exec(content);
    if (fmMatch) title = fmMatch[1].trim();
    fetch('/api/notes', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({title: title, content: content})
    }).then(function(r) { return r.json(); }).then(function(note) {
      _notes.unshift({id: note.id, title: note.title, tags: note.tags, updatedAt: note.updatedAt, preview: (note.content||'').slice(0,100)});
      notesRenderList();
      notesCloseImport();
      notesSelectNote(note.id);
    }).catch(function() { errEl.textContent = '&#23548;&#20837;&#22833;&#36133;'; });
  };
  reader.readAsText(file, 'utf-8');
}
function notesImportFromPath() {
  var pathInput = document.getElementById('notes-path-input');
  var errEl = document.getElementById('notes-path-error');
  var submitBtn = document.getElementById('notes-path-submit');
  var filePath = pathInput.value.trim();
  errEl.textContent = '';
  if (!filePath) { errEl.textContent = '&#35831;&#36755;&#20837;&#25991;&#20214;&#36335;&#24452;'; return; }
  submitBtn.disabled = true;
  submitBtn.textContent = '&#23548;&#20837;&#20013;...';
  fetch('/api/notes/import-path', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({filePath: filePath})
  }).then(function(r) { return r.json().then(function(d) { return {ok: r.ok, data: d}; }); }).then(function(res) {
    if (!res.ok) {
      errEl.textContent = res.data.error || '&#23548;&#20837;&#22833;&#36133;';
      return;
    }
    var note = res.data;
    _notes.unshift({id: note.id, title: note.title, tags: note.tags, updatedAt: note.updatedAt, preview: (note.content||'').slice(0,100)});
    notesRenderList();
    notesCloseImport();
    notesSelectNote(note.id);
  }).catch(function() {
    errEl.textContent = '&#35831;&#27714;&#22833;&#36133;';
  }).finally(function() {
    submitBtn.disabled = false;
    submitBtn.textContent = '&#23548;&#20837;';
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function notesRelTime(iso) {
  if (!iso) return '';
  var diff = Date.now() - new Date(iso).getTime();
  var s = Math.floor(diff / 1000);
  if (s < 60) return '&#21018;&#21018;';
  var m = Math.floor(s / 60);
  if (m < 60) return m + '&#20998;&#38047;&#21069;';
  var h = Math.floor(m / 60);
  if (h < 24) return h + '&#23567;&#26102;&#21069;';
  var d = Math.floor(h / 24);
  if (d < 7) return d + '&#22825;&#21069;';
  return new Date(iso).toLocaleDateString('zh-CN');
}

// ── notes module switchModule hook ────────────────────────────────────────────
var _notesSwitchModuleHooked = false;
function notesHookSwitchModule() {
  if (_notesSwitchModuleHooked) return;
  _notesSwitchModuleHooked = true;
  var orig = window.switchModule;
  window.switchModule = function(id, pushState) {
    orig(id, pushState);
    if (id === 'notes' && !_notesLoaded) {
      _notesLoaded = true;
      loadNotesList();
      loadNoteLinksList();
    }
  };
}
`
