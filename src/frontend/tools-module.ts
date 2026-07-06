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

  var ICON_FOLDER = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/></svg>';

  var ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  var ICON_COMPRESS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 8 10 12 14"/><polyline points="20 10 16 14 12 10"/><line x1="12" y1="4" x2="12" y2="14"/></svg>';

  var ICON_COPY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  var ICON_SAVE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  var ICON_TRASH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';

  var ICON_OPEN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  // ── Tool registry (extensible — add entries here for new tools) ──
  var TOOLS = [
    {
      id: 'json-format',
      icon: ICON_JSON,
      name: 'JSON 格式化',
      desc: '编辑、格式化、压缩 JSON',
    },
    // Future tools: add entries here
  ];

  // ── State ──
  S.tools = {
    activeToolId: null,
    activeSubtab: 'edit', // 'edit' | 'saved'
    savedFiles: null,
    saveDirty: false,
  };

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
        // Auto-select first tool
        if (TOOLS.length > 0) {
          toolsSelectTool(TOOLS[0].id, true);
        }
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

    if (toolId === 'json-format') {
      renderJsonFormatWorkarea(innerEl);
      initCodeMirror();
    }
    if (!silent) updateHash({ tool: toolId });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // JSON Formatter
  // ═══════════════════════════════════════════════════════════════════════

  function renderJsonFormatWorkarea(container) {
    container.innerHTML = ''
      // Sub-tabs
      + '<div class="tools-subtabs">'
      + '<button class="tools-subtab active" id="tools-subtab-edit" onclick="toolsSwitchSubtab(\\'edit\\')">编辑</button>'
      + '<button class="tools-subtab" id="tools-subtab-saved" onclick="toolsSwitchSubtab(\\'saved\\')">已保存</button>'
      + '</div>'
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
      + '</div>';
  }

  // ── CodeMirror ──
  var _cmView = null;
  var _cmThemeComp = null;

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
      // Already initialized — request a remeasure (handles display:none → display:'' transition)
      _cmView.requestMeasure();
      return _cmView;
    }

    _cmThemeComp = S.Compartment ? new S.Compartment : { of: function() { return []; } };

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
        S.keymap ? S.keymap.of([
          (S.defaultKeymap || []),
          (S.historyKeymap || []),
          (S.foldKeymap || []),
        ].flat()) : null,
        _cmThemeComp.of(cmThemeExtension()),
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
    if (tab === 'edit') {
      if (toolbar) toolbar.style.display = '';
      if (cmWrap) cmWrap.style.display = '';
      if (savedList) savedList.style.display = 'none';
      initCodeMirror();
    } else {
      if (toolbar) toolbar.style.display = 'none';
      if (cmWrap) cmWrap.style.display = 'none';
      if (savedList) savedList.style.display = '';
      toolsLoadSavedList();
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

  // ── Expose init ──
  window.toolsInit = toolsInit;
  window.toolsHookSwitchModule = toolsHookSwitchModule;

})();
`
