// Standalone CLAUDE.md editor page — opened in new tab from history module
declare const __MARKED_MIN_JS__: string

const MARKED_SOURCE: string = __MARKED_MIN_JS__

export const CLAUDEMD_TEMPLATE = `<!DOCTYPE html>
<html lang="zh" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CLAUDE.md Editor</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
  --green:        #16a34a;
  --yellow:       #ca8a04;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif;
}

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
  --green:        #34d399;
  --yellow:       #fbbf24;
}

html, body { height: 100%; background: var(--bg-base); color: var(--text-pri); overflow: hidden; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-muted); border-radius: 4px; }

/* ── Layout ── */
#app { display: flex; flex-direction: column; height: 100vh; }

/* ── Top Bar ── */
.top-bar {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-sub);
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-surface);
  flex-shrink: 0;
}
.top-bar-icon { font-size: 16px; }
.top-bar-title { font-weight: 700; font-size: 14px; color: var(--text-pri); }
.top-bar-path {
  font-size: 10px; color: var(--text-muted);
  background: var(--bg-elevated); padding: 3px 8px;
  border-radius: 4px; max-width: 400px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.top-bar-modes { margin-left: auto; display: flex; gap: 4px; }
.mode-btn {
  padding: 4px 12px; font-size: 11px; font-weight: 600;
  border-radius: 6px; border: 1px solid var(--border-muted);
  background: transparent; color: var(--text-muted); cursor: pointer;
  transition: all 0.12s;
}
.mode-btn:hover { background: var(--bg-hover); color: var(--text-sec); }
.mode-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--border-acc); }
.theme-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid var(--border-muted); background: var(--bg-elevated);
  color: var(--text-muted); cursor: pointer; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  margin-left: 8px; transition: all 0.12s;
}
.theme-btn:hover { background: var(--bg-hover); color: var(--text-pri); }

/* ── Content Area ── */
.content-area { flex: 1; display: flex; overflow: hidden; min-height: 0; }

.editor-textarea {
  flex: 1; width: 100%; height: 100%; padding: 16px 20px;
  background: var(--bg-base); color: var(--text-pri);
  border: none; outline: none; resize: none;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px; line-height: 1.7; tab-size: 2;
}
.editor-textarea::placeholder { color: var(--text-muted); }

.preview-pane {
  flex: 1; height: 100%; overflow-y: auto; padding: 20px 28px;
  background: var(--bg-surface); color: var(--text-pri);
  line-height: 1.75; font-size: 14px;
}

/* Split mode */
.content-area.split .editor-textarea { flex: 1; border-right: 1px solid var(--border-sub); }
.content-area.split .preview-pane { flex: 1; }

/* Markdown preview styles */
.preview-pane h1 { font-size: 1.7em; font-weight: 700; margin: 0 0 .5em; border-bottom: 1px solid var(--border-sub); padding-bottom: .3em; }
.preview-pane h2 { font-size: 1.35em; font-weight: 700; margin: 1.2em 0 .4em; border-bottom: 1px solid var(--border-sub); padding-bottom: .2em; }
.preview-pane h3 { font-size: 1.1em; font-weight: 700; margin: 1em 0 .3em; }
.preview-pane p { margin: 0 0 .9em; }
.preview-pane ul, .preview-pane ol { margin: 0 0 .9em; padding-left: 1.6em; }
.preview-pane li { margin-bottom: .2em; }
.preview-pane code {
  font-family: 'SF Mono', 'Fira Code', monospace; font-size: .88em;
  background: var(--bg-elevated); border: 1px solid var(--border-sub);
  padding: .15em .35em; border-radius: 4px;
}
.preview-pane pre {
  background: var(--bg-elevated); border: 1px solid var(--border-sub);
  border-radius: 8px; padding: 12px 16px; overflow-x: auto; margin: 0 0 .9em;
}
.preview-pane pre code { background: none; border: none; padding: 0; font-size: .85em; }
.preview-pane blockquote {
  border-left: 3px solid var(--accent); margin: 0 0 .9em; padding: .3em 1em;
  color: var(--text-sec); background: var(--accent-dim); border-radius: 0 6px 6px 0;
}
.preview-pane a { color: var(--accent); text-decoration: none; }
.preview-pane a:hover { text-decoration: underline; }
.preview-pane hr { border: none; border-top: 1px solid var(--border-muted); margin: 1.2em 0; }
.preview-pane table { border-collapse: collapse; width: 100%; margin: 0 0 .9em; font-size: 13px; }
.preview-pane th, .preview-pane td { border: 1px solid var(--border-muted); padding: 6px 12px; text-align: left; }
.preview-pane th { background: var(--bg-elevated); font-weight: 600; }
.preview-pane img { max-width: 100%; border-radius: 6px; }

/* ── Status Bar ── */
.status-bar {
  height: 26px; background: var(--bg-surface);
  border-top: 1px solid var(--border-sub);
  display: flex; align-items: center; padding: 0 16px; gap: 16px;
  flex-shrink: 0; font-size: 10px; color: var(--text-muted);
}
.save-status { display: flex; align-items: center; gap: 4px; }
.save-status.saved { color: var(--green); }
.save-status.saving { color: var(--text-muted); }
.save-status.dirty { color: var(--yellow); }

/* ── Empty State ── */
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: var(--text-muted); gap: 12px;
}
.empty-state-icon { font-size: 48px; opacity: 0.3; }
.empty-state-title { font-size: 14px; }
.empty-state-desc { font-size: 11px; color: var(--text-muted); max-width: 280px; text-align: center; line-height: 1.5; }
.empty-state-btn {
  margin-top: 8px; padding: 8px 20px; border-radius: 7px;
  border: 1px solid var(--border-acc); background: var(--accent-dim);
  color: var(--accent); font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.12s;
}
.empty-state-btn:hover { background: var(--accent); color: #fff; }
</style>
</head>
<body>
<div id="app">
  <div class="top-bar">
    <span class="top-bar-icon">📄</span>
    <span class="top-bar-title">CLAUDE.md</span>
    <span class="top-bar-path" id="file-path"></span>
    <div class="top-bar-modes" id="mode-buttons"></div>
    <button class="theme-btn" onclick="toggleTheme()" title="切换主题">🌓</button>
  </div>
  <div class="content-area split" id="content-area">
    <!-- Filled by JS -->
  </div>
  <div class="status-bar">
    <span class="save-status saved" id="save-status">● 已保存</span>
    <span id="cursor-pos"></span>
    <span>UTF-8</span>
    <span style="margin-left:auto">自动保存</span>
  </div>
</div>
<script>
${MARKED_SOURCE}
</script>
<script>
(function() {
  // ── State ─────────────────────────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const scope = params.get('scope');
  const project = params.get('project');
  let currentMode = 'split'; // 'edit' | 'preview' | 'split'
  let content = '';
  let saveTimer = null;
  let isDirty = false;

  // ── Theme ─────────────────────────────────────────────────────────────────
  window.toggleTheme = function() {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ccs-theme', next);
  };
  // Restore saved theme
  const savedTheme = localStorage.getItem('ccs-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  // ── API helpers ───────────────────────────────────────────────────────────
  function apiUrl(endpoint) {
    let qs = '';
    if (scope === 'global') qs = '?scope=global';
    else if (project) qs = '?project=' + encodeURIComponent(project);
    return endpoint + qs;
  }

  async function loadFile() {
    const res = await fetch(apiUrl('/api/claude-md'));
    const data = await res.json();
    document.getElementById('file-path').textContent = data.path || '';
    document.getElementById('file-path').title = data.path || '';
    if (data.exists) {
      content = data.content;
      renderEditor();
    } else {
      renderEmpty();
    }
  }

  async function saveFile() {
    if (!isDirty) return;
    setSaveStatus('saving');
    try {
      await fetch(apiUrl('/api/claude-md'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      isDirty = false;
      setSaveStatus('saved');
    } catch {
      setSaveStatus('dirty');
    }
  }

  async function createFile() {
    try {
      const res = await fetch(apiUrl('/api/claude-md/create'), { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        content = data.content;
        renderEditor();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (err) {
      alert('创建失败: ' + err.message);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function renderModeButtons() {
    const modes = [
      { id: 'edit', label: '编辑' },
      { id: 'preview', label: '预览' },
      { id: 'split', label: '分屏' },
    ];
    document.getElementById('mode-buttons').innerHTML = modes.map(m =>
      '<button class="mode-btn ' + (m.id === currentMode ? 'active' : '') + '" onclick="setMode(\\'' + m.id + '\\')">' + m.label + '</button>'
    ).join('');
  }

  function renderEditor() {
    const area = document.getElementById('content-area');
    area.className = 'content-area ' + currentMode;

    let html = '';
    if (currentMode === 'edit' || currentMode === 'split') {
      html += '<textarea class="editor-textarea" id="editor" placeholder="开始编写 CLAUDE.md...">' + escHtml(content) + '</textarea>';
    }
    if (currentMode === 'preview' || currentMode === 'split') {
      html += '<div class="preview-pane" id="preview">' + renderMarkdown(content) + '</div>';
    }
    area.innerHTML = html;
    renderModeButtons();

    const editor = document.getElementById('editor');
    if (editor) {
      editor.addEventListener('input', onEditorInput);
      editor.addEventListener('click', updateCursorPos);
      editor.addEventListener('keyup', updateCursorPos);
    }
  }

  function renderEmpty() {
    const area = document.getElementById('content-area');
    area.className = 'content-area';
    area.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state-icon">📄</div>' +
        '<div class="empty-state-title">该项目暂无 CLAUDE.md 文件</div>' +
        '<div class="empty-state-desc">CLAUDE.md 用于为 Claude Code 提供项目级指令和上下文</div>' +
        '<button class="empty-state-btn" onclick="handleCreate()">+ 创建 CLAUDE.md</button>' +
      '</div>';
    // Hide mode buttons and status in empty state
    document.getElementById('mode-buttons').innerHTML = '';
    document.getElementById('save-status').textContent = '';
    document.getElementById('cursor-pos').textContent = '';
  }

  // ── Event Handlers ────────────────────────────────────────────────────────
  function onEditorInput(e) {
    content = e.target.value;
    isDirty = true;
    setSaveStatus('dirty');

    // Update preview in split mode
    const preview = document.getElementById('preview');
    if (preview) preview.innerHTML = renderMarkdown(content);

    // Debounced save
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveFile, 1000);
  }

  function updateCursorPos() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    const pos = editor.selectionStart;
    const lines = editor.value.substring(0, pos).split('\\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    document.getElementById('cursor-pos').textContent = '行 ' + line + ', 列 ' + col;
  }

  window.setMode = function(mode) {
    currentMode = mode;
    renderEditor();
  };

  window.handleCreate = createFile;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function setSaveStatus(status) {
    const el = document.getElementById('save-status');
    el.className = 'save-status ' + status;
    if (status === 'saved') el.textContent = '● 已保存';
    else if (status === 'saving') el.textContent = '○ 保存中...';
    else if (status === 'dirty') el.textContent = '● 未保存';
  }

  function renderMarkdown(md) {
    if (window.marked && window.marked.parse) {
      return window.marked.parse(md || '');
    }
    return (md || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
  }

  function escHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadFile();
})();
</script>
</body>
</html>`;
