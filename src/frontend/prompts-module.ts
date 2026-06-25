// ── 1. CSS ───────────────────────────────────────────────────────────────────

export const PROMPTS_CSS = `
/* ── Prompts Module ───────────────────────────────────────────────── */
#mod-prompts { overflow: hidden; }

/* List panel */
.prompts-list-panel {
  width: 280px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-sub);
  display: flex; flex-direction: column;
  flex-shrink: 0; overflow: hidden;
}
.prompts-search-wrap {
  position: relative; padding: 6px 8px;
  border-bottom: 1px solid var(--border-sub); flex-shrink: 0;
}
.prompts-search-wrap::before {
  content: '⌕'; position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); font-size: 14px; pointer-events: none; z-index: 1;
}
.prompts-search {
  width: 100%; height: 28px; padding: 0 8px 0 28px;
  border: 1px solid var(--border-sub); border-radius: 7px;
  background: var(--bg-elevated); color: var(--text-pri);
  font-size: 12px; outline: none;
}
.prompts-search:focus { border-color: var(--accent); }
.prompts-list { flex: 1; overflow-y: auto; padding: 4px; }

/* Request card */
.prompt-card {
  padding: 8px 10px; margin-bottom: 2px;
  border-radius: 8px; cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 0.1s;
}
.prompt-card:hover { background: var(--bg-hover); }
.prompt-card.active {
  background: var(--accent-dim);
  border-left-color: var(--accent);
}
.prompt-card-header {
  display: flex; justify-content: space-between; align-items: center;
}
.prompt-card-model {
  font-weight: 600; font-size: 12px; color: var(--text-pri);
}
.prompt-card-time {
  font-size: 10px; color: var(--text-muted);
}
.prompt-card-meta {
  font-size: 11px; color: var(--text-sec); margin-top: 3px;
}

/* Detail panel */
.prompts-detail-panel {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.prompts-detail-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-sub);
  background: var(--bg-surface);
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
}
.prompts-detail-left { display: flex; align-items: center; gap: 8px; }
.prompts-detail-method { font-weight: 700; font-size: 14px; }
.prompts-tag {
  padding: 2px 8px; border-radius: 10px; font-size: 11px;
  background: var(--accent-dim); color: var(--accent);
}
.prompts-tag-model {
  background: var(--purple-dim); color: var(--purple);
}
.prompts-detail-actions { display: flex; gap: 6px; }
.prompts-btn {
  padding: 4px 10px; border-radius: 6px; font-size: 11px;
  border: 1px solid var(--border-muted); background: var(--bg-elevated);
  color: var(--text-sec); cursor: pointer;
}
.prompts-btn:hover { border-color: var(--accent); color: var(--accent); }
.prompts-detail-body {
  flex: 1; overflow-y: auto; padding: 12px 16px;
}

/* Collapsible sections */
.prompts-section { margin-bottom: 16px; }
.prompts-section-header {
  font-weight: 600; font-size: 13px; padding: 8px 0;
  cursor: pointer; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border-sub); user-select: none;
}
.prompts-section-header:hover { color: var(--accent); }
.prompts-section-meta { font-size: 11px; color: var(--text-muted); font-weight: 400; }
.prompts-section-body { margin-top: 8px; }
.prompts-section-body.collapsed { display: none; }

/* System block card */
.system-block {
  margin-bottom: 8px; border: 1px solid var(--border-sub); border-radius: 6px; overflow: hidden;
}
.system-block-header {
  padding: 4px 10px; background: var(--bg-elevated); font-size: 11px;
  display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-sub);
}
.system-block-type { font-weight: 600; }
.system-block-cache { color: var(--text-muted); }
.system-block-content {
  padding: 8px 10px; font-size: 12px; line-height: 1.6;
  max-height: 200px; overflow-y: auto; white-space: pre-wrap;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--text-sec);
}

/* Message item */
.msg-item { margin-bottom: 6px; display: flex; gap: 8px; }
.msg-bar { width: 4px; border-radius: 2px; flex-shrink: 0; }
.msg-bar-user { background: var(--accent); }
.msg-bar-assistant { background: var(--green); }
.msg-bar-tool { background: var(--purple); }
.msg-body { flex: 1; }
.msg-label { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; }
.msg-tool-tag {
  display: inline-block; padding: 0 5px; border-radius: 3px; font-size: 10px;
  background: var(--amber-dim); color: var(--amber);
}
.msg-content {
  padding: 6px 10px; background: var(--bg-surface); border-radius: 6px;
  font-size: 12px; line-height: 1.5; max-height: 120px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-word;
}

/* Tool grid */
.tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.tool-card {
  padding: 6px 10px; background: var(--bg-surface); border-radius: 4px;
  font-size: 12px; cursor: pointer; border: 1px solid transparent;
}
.tool-card:hover { border-color: var(--accent); }
.tool-card-name { font-weight: 600; }
.tool-card-desc { color: var(--text-muted); font-size: 10px; margin-left: 4px; }
.tool-card-schema {
  display: none; margin-top: 6px; padding: 6px 8px;
  background: var(--bg-elevated); border-radius: 4px;
  font-size: 11px; line-height: 1.4; white-space: pre-wrap;
  font-family: 'SF Mono', 'Fira Code', monospace;
  max-height: 200px; overflow-y: auto;
}
.tool-card.expanded { grid-column: 1 / -1; }
.tool-card.expanded .tool-card-schema { display: block; }

/* Params grid */
.params-grid {
  display: grid; grid-template-columns: 160px 1fr; gap: 4px 12px; font-size: 12px;
}
.params-key { color: var(--text-muted); }
.params-val { color: var(--text-pri); }

/* Empty state */
.prompts-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: var(--text-muted); gap: 8px; padding: 20px; text-align: center;
}
.prompts-empty-icon { font-size: 32px; opacity: 0.3; }
.prompts-empty code {
  background: var(--bg-elevated); padding: 2px 8px; border-radius: 4px; font-size: 12px;
}
`

// ── 2. Nav item ──────────────────────────────────────────────────────────────

export const PROMPTS_NAV_ITEM = `
    <div class="nav-item" id="nav-prompts" data-module="prompts" onclick="switchModule('prompts')" style="display:none">
      <div class="nav-item-icon">&#9881;</div>
      <div class="nav-item-label">Prompts</div>
      <div class="nav-tooltip">API &#35831;&#27714;&#26597;&#30475;</div>
    </div>`

// ── 3. Module HTML ───────────────────────────────────────────────────────────

export const PROMPTS_MODULE_HTML = `
      <!-- Prompts Module -->
      <div id="mod-prompts" class="module">
        <div class="prompts-list-panel">
          <div class="panel-header">API Requests</div>
          <div class="prompts-search-wrap">
            <input type="text" id="prompts-search" class="prompts-search" placeholder="&#25628;&#32034;&#27169;&#22411;..." autocomplete="off">
          </div>
          <div class="prompts-list" id="prompts-list">
            <div class="loading"><div class="spinner"></div> &#21152;&#36733;&#20013;&#8230;</div>
          </div>
        </div>
        <div class="prompts-detail-panel">
          <div id="prompts-detail-content" class="prompts-empty">
            <div class="prompts-empty-icon">&#9881;</div>
            <div>&#36873;&#25321;&#19968;&#20010;&#35831;&#27714;&#26597;&#30475;&#35814;&#24773;</div>
            <div style="margin-top:12px;font-size:12px;">
              &#21551;&#21160;&#20195;&#29702;&#24320;&#22987;&#25429;&#33719;:<br>
              <code>ccs proxy start</code><br><br>
              &#28982;&#21518;&#22312; settings.json &#30340; env &#20013;&#35774;&#32622;:<br>
              <code>"ANTHROPIC_BASE_URL": "http://localhost:18888"</code>
            </div>
          </div>
        </div>
      </div>`

// ── 4. JavaScript ────────────────────────────────────────────────────────────

export const PROMPTS_JS = `
// ── Prompts Module ──────────────────────────────────────────────────────────

(function() {
  // State
  S.prompts = {
    data: null,
    selectedId: null,
    detail: null,
    query: ''
  };

  // ── Data loading ──

  window.loadPrompts = async function() {
    const list = document.getElementById('prompts-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
    try {
      const res = await fetch('/api/proxy/requests?limit=200');
      if (!res.ok) throw new Error('Failed to load');
      S.prompts.data = await res.json();
      renderPromptsList();
    } catch (e) {
      list.innerHTML = '<div class="prompts-empty"><div>\\u52a0\\u8f7d\\u5931\\u8d25</div></div>';
    }
  };

  function renderPromptsList() {
    const list = document.getElementById('prompts-list');
    if (!S.prompts.data || !S.prompts.data.requests.length) {
      list.innerHTML = '<div class="prompts-empty"><div class="prompts-empty-icon">\\u2699</div><div>\\u6682\\u65e0\\u8bf7\\u6c42\\u6570\\u636e</div><div style="font-size:12px;margin-top:8px"><code>ccs proxy start</code></div></div>';
      return;
    }
    const q = S.prompts.query.toLowerCase();
    let items = S.prompts.data.requests;
    if (q) {
      items = items.filter(r => r.model.toLowerCase().includes(q));
    }
    list.innerHTML = items.map(r => {
      const active = r.id === S.prompts.selectedId ? ' active' : '';
      const t = new Date(r.timestamp);
      const timeStr = formatRelativeTime(t.getTime());
      const sysK = (r.system_tokens_estimate / 1000).toFixed(1);
      return '<div class="prompt-card' + active + '" data-id="' + r.id + '" onclick="selectPrompt(\\'' + r.id + '\\')">'
        + '<div class="prompt-card-header">'
        + '<span class="prompt-card-model">' + esc(r.model) + '</span>'
        + '<span class="prompt-card-time">' + esc(timeStr) + '</span>'
        + '</div>'
        + '<div class="prompt-card-meta">msgs: ' + r.messages_count + ' | tools: ' + r.tools_count + ' | sys: ~' + sysK + 'k tokens</div>'
        + '</div>';
    }).join('');
  }

  // ── Detail loading ──

  window.selectPrompt = async function(id) {
    S.prompts.selectedId = id;
    renderPromptsList();
    const panel = document.getElementById('prompts-detail-content');
    panel.className = '';
    panel.innerHTML = '<div class="loading" style="padding:40px;text-align:center"><div class="spinner"></div> \\u52a0\\u8f7d\\u4e2d\\u2026</div>';
    try {
      const res = await fetch('/api/proxy/requests/' + encodeURIComponent(id));
      if (!res.ok) throw new Error('Not found');
      S.prompts.detail = await res.json();
      renderPromptDetail();
    } catch (e) {
      panel.innerHTML = '<div class="prompts-empty"><div>\\u52a0\\u8f7d\\u5931\\u8d25</div></div>';
    }
  };

  function renderPromptDetail() {
    const d = S.prompts.detail;
    if (!d) return;
    const panel = document.getElementById('prompts-detail-content');
    const body = d.body || {};

    let html = '';

    // Header
    html += '<div class="prompts-detail-header">';
    html += '<div class="prompts-detail-left">';
    html += '<span class="prompts-detail-method">POST /v1/messages</span>';
    if (body.stream) html += '<span class="prompts-tag">stream: true</span>';
    html += '<span class="prompts-tag prompts-tag-model">' + esc(d.model) + '</span>';
    html += '</div>';
    html += '<div class="prompts-detail-actions">';
    html += '<button class="prompts-btn" onclick="copyPromptJson()">\\ud83d\\udccb \\u590d\\u5236</button>';
    html += '<button class="prompts-btn" onclick="exportPromptJson(\\'' + d.id + '\\')">\\ud83d\\udcbe \\u5bfc\\u51fa JSON</button>';
    html += '</div></div>';

    // Body
    html += '<div class="prompts-detail-body">';

    // 1. System Prompt
    html += renderSystemSection(body.system);

    // 2. Messages
    html += renderMessagesSection(body.messages);

    // 3. Tools
    html += renderToolsSection(body.tools);

    // 4. Parameters
    html += renderParamsSection(body);

    html += '</div>';

    panel.innerHTML = html;
  }

  // ── Section renderers ──

  function renderSystemSection(system) {
    if (!system) return '';
    const blocks = typeof system === 'string' ? [{ type: 'text', text: system }] : (Array.isArray(system) ? system : []);
    const totalChars = blocks.reduce((s, b) => s + (b.text || '').length, 0);
    const estTokens = Math.ceil(totalChars / 4);
    const estK = (estTokens / 1000).toFixed(1);

    let html = '<div class="prompts-section">';
    html += '<div class="prompts-section-header" onclick="togglePromptsSection(this)">';
    html += '<span>\\u25bc System Prompt</span>';
    html += '<span class="prompts-section-meta">' + blocks.length + ' blocks \\u00b7 ~' + estK + 'k tokens</span>';
    html += '</div>';
    html += '<div class="prompts-section-body">';
    for (const b of blocks) {
      const cache = b.cache_control ? (b.cache_control.type || '') : '';
      html += '<div class="system-block">';
      html += '<div class="system-block-header"><span class="system-block-type">' + esc(b.type || 'text') + '</span>';
      if (cache) html += '<span class="system-block-cache">cache_control: ' + esc(cache) + '</span>';
      html += '</div>';
      html += '<div class="system-block-content">' + esc(b.text || '') + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderMessagesSection(messages) {
    if (!messages || !messages.length) return '';
    let html = '<div class="prompts-section">';
    html += '<div class="prompts-section-header" onclick="togglePromptsSection(this)">';
    html += '<span>\\u25bc Messages (' + messages.length + ')</span>';
    html += '<span class="prompts-section-meta">';
    html += '<label style="cursor:pointer"><input type="checkbox" id="prompts-user-only" onchange="filterPromptsMessages()" style="margin-right:3px">\\u4ec5\\u7528\\u6237\\u6d88\\u606f</label>';
    html += '</span>';
    html += '</div>';
    html += '<div class="prompts-section-body" id="prompts-messages-body">';
    html += renderMessageItems(messages, false);
    html += '</div></div>';
    return html;
  }

  function renderMessageItems(messages, userOnly) {
    let html = '';
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const role = m.role || 'user';
      if (userOnly && role !== 'user') continue;

      const barClass = role === 'assistant' ? 'msg-bar-assistant' : (role === 'user' && hasToolResult(m) ? 'msg-bar-tool' : 'msg-bar-user');
      const label = role + ' \\u00b7 #' + (i + 1);
      const toolTags = getToolUseTags(m);

      html += '<div class="msg-item">';
      html += '<div class="msg-bar ' + barClass + '"></div>';
      html += '<div class="msg-body">';
      html += '<div class="msg-label">' + esc(label);
      if (toolTags.length) {
        html += ' \\u00b7 ' + toolTags.map(t => '<span class="msg-tool-tag">' + esc(t) + '</span>').join(' ');
      }
      html += '</div>';
      html += '<div class="msg-content">' + esc(extractMessageText(m)) + '</div>';
      html += '</div></div>';
    }
    return html;
  }

  function hasToolResult(m) {
    if (!m.content || !Array.isArray(m.content)) return false;
    return m.content.some(function(c) { return c.type === 'tool_result'; });
  }

  function getToolUseTags(m) {
    if (!m.content || !Array.isArray(m.content)) return [];
    return m.content.filter(function(c) { return c.type === 'tool_use'; }).map(function(c) { return c.name || 'tool'; });
  }

  function extractMessageText(m) {
    if (typeof m.content === 'string') return m.content;
    if (!Array.isArray(m.content)) return JSON.stringify(m.content);
    return m.content.map(function(c) {
      if (c.type === 'text') return c.text || '';
      if (c.type === 'tool_use') return '[tool_use] ' + (c.name || '') + '(' + JSON.stringify(c.input || {}).slice(0, 100) + ')';
      if (c.type === 'tool_result') return '[tool_result] ' + ((typeof c.content === 'string' ? c.content : JSON.stringify(c.content)) || '').slice(0, 200);
      if (c.type === 'thinking') return '[thinking] ...';
      return '[' + (c.type || 'unknown') + ']';
    }).join('\\n');
  }

  window.filterPromptsMessages = function() {
    const userOnly = document.getElementById('prompts-user-only')?.checked || false;
    const body = document.getElementById('prompts-messages-body');
    if (!body || !S.prompts.detail) return;
    body.innerHTML = renderMessageItems(S.prompts.detail.body.messages || [], userOnly);
  };

  function renderToolsSection(tools) {
    if (!tools || !tools.length) return '';
    let html = '<div class="prompts-section">';
    html += '<div class="prompts-section-header" onclick="togglePromptsSection(this)">';
    html += '<span>\\u25b6 Tools (' + tools.length + ')</span>';
    html += '<span class="prompts-section-meta">\\u70b9\\u51fb\\u5c55\\u5f00</span>';
    html += '</div>';
    html += '<div class="prompts-section-body collapsed">';
    html += '<div style="margin-bottom:6px"><input type="text" class="prompts-search" placeholder="\\u641c\\u7d22\\u5de5\\u5177..." oninput="filterPromptsTools(this.value)" style="width:200px;padding:0 8px;height:24px"></div>';
    html += '<div class="tool-grid" id="prompts-tools-grid">';
    for (const t of tools) {
      const desc = (t.description || '').slice(0, 50);
      const schema = JSON.stringify(t, null, 2);
      html += '<div class="tool-card" data-name="' + esc(t.name || '') + '" onclick="toggleToolSchema(this)">';
      html += '<span class="tool-card-name">' + esc(t.name || '') + '</span>';
      html += '<span class="tool-card-desc">\\u2014 ' + esc(desc) + '</span>';
      html += '<div class="tool-card-schema">' + esc(schema) + '</div>';
      html += '</div>';
    }
    html += '</div></div></div>';
    return html;
  }

  function renderParamsSection(body) {
    const keys = ['model', 'max_tokens', 'temperature', 'stream', 'top_p', 'top_k', 'stop_sequences'];
    let html = '<div class="prompts-section">';
    html += '<div class="prompts-section-header" onclick="togglePromptsSection(this)">';
    html += '<span>\\u25b6 Parameters</span>';
    html += '</div>';
    html += '<div class="prompts-section-body collapsed">';
    html += '<div class="params-grid">';
    for (const k of keys) {
      if (body[k] !== undefined) {
        html += '<span class="params-key">' + esc(k) + '</span>';
        html += '<span class="params-val">' + esc(String(body[k])) + '</span>';
      }
    }
    // Flatten thinking
    if (body.thinking) {
      for (const [tk, tv] of Object.entries(body.thinking)) {
        html += '<span class="params-key">thinking.' + esc(tk) + '</span>';
        html += '<span class="params-val">' + esc(String(tv)) + '</span>';
      }
    }
    // tool_choice
    if (body.tool_choice) {
      if (typeof body.tool_choice === 'string') {
        html += '<span class="params-key">tool_choice</span>';
        html += '<span class="params-val">' + esc(body.tool_choice) + '</span>';
      } else {
        html += '<span class="params-key">tool_choice.type</span>';
        html += '<span class="params-val">' + esc(body.tool_choice.type || '') + '</span>';
      }
    }
    html += '</div></div></div>';
    return html;
  }

  // ── Interactions ──

  window.togglePromptsSection = function(headerEl) {
    const body = headerEl.nextElementSibling;
    if (!body) return;
    const collapsed = body.classList.toggle('collapsed');
    const arrow = headerEl.querySelector('span:first-child');
    if (arrow) {
      const text = arrow.textContent;
      arrow.textContent = collapsed ? text.replace('\\u25bc', '\\u25b6') : text.replace('\\u25b6', '\\u25bc');
    }
  };

  window.toggleToolSchema = function(cardEl) {
    cardEl.classList.toggle('expanded');
  };

  window.filterPromptsTools = function(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('#prompts-tools-grid .tool-card').forEach(function(el) {
      const name = (el.dataset.name || '').toLowerCase();
      el.style.display = name.includes(q) ? '' : 'none';
    });
  };

  window.copyPromptJson = function() {
    if (!S.prompts.detail) return;
    navigator.clipboard.writeText(JSON.stringify(S.prompts.detail.body, null, 2)).then(function() {
      // Brief visual feedback would be nice but not required
    });
  };

  window.exportPromptJson = async function(id) {
    try {
      const res = await fetch('/api/proxy/requests/' + encodeURIComponent(id) + '/export', { method: 'POST' });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      alert('\\u5bfc\\u51fa\\u6210\\u529f: ' + data.path);
    } catch (e) {
      alert('\\u5bfc\\u51fa\\u5931\\u8d25: ' + String(e));
    }
  };

  // ── Search ──
  document.getElementById('prompts-search').addEventListener('input', function(e) {
    S.prompts.query = e.target.value.trim();
    renderPromptsList();
  });

  // ── Relative time helper (reuse from main if available) ──
  function formatRelativeTime(ts) {
    if (typeof window.formatRelativeTime === 'function') return window.formatRelativeTime(ts);
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '\\u521a\\u521a';
    if (mins < 60) return mins + '\\u5206\\u949f\\u524d';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + '\\u5c0f\\u65f6\\u524d';
    const days = Math.floor(hrs / 24);
    return days + '\\u5929\\u524d';
  }

})();

// ── Init ─────────────────────────────────────────────────────────────────
function promptsInit() {
  if (!window.CCS_PROMPTS) return;
  var navEl = document.getElementById('nav-prompts');
  if (navEl) navEl.style.display = '';
}
`
