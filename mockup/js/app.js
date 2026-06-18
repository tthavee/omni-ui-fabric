// ============================================================
// OmniUI Fabric — App Controller
// ============================================================

// ── App State ──
const S = {
  view: 'dashboard',
  params: {},
  // Preview
  previewXD:          'loan-application-web',
  previewChannel:     'web',
  previewTier:        'standard',
  previewLocale:      'en-US',
  previewDeviceWidth: 1200,
  // Studio
  chatHistory: [],
  chatPhase:   0,
  generatedManifest: null,
  manifestValidated: false,
  // Skills
  skillSearch: '',
  skillFilter: 'all'
};

// ── Public API (called from inline handlers) ──
const FABRIC = {
  navigate,
  toast: showToast,
  updatePreviewComputed,
  updatePreviewSlider
};

// ── Live ticker ──
let _tickerInterval = null;
let _renderCount    = 10247;

function startTicker() {
  if (_tickerInterval) return;
  _tickerInterval = setInterval(() => {
    if (S.view !== 'dashboard') { stopTicker(); return; }
    const sig = generateSignal();
    MOCK.recentSignals.unshift(sig);
    if (MOCK.recentSignals.length > 10) MOCK.recentSignals.pop();
    _renderCount++;

    const tbody = document.getElementById('signals-body');
    if (!tbody) { stopTicker(); return; }

    const newRow = document.createElement('tr');
    newRow.className = 'signal-row row-new';
    newRow.innerHTML = `
      <td class="code" style="color:#64748b">${sig.ts}</td>
      <td><span style="font-size:12px;font-weight:500;color:#0f172a">${sig.skill}</span></td>
      <td>${channelPill(sig.channel)}</td>
      <td class="code" style="color:${sig.cache?'#16a34a':'#374151'}">${sig.cache?'⚡ <1ms':sig.ms+'ms'}</td>
      <td class="code" style="color:#6366f1">0</td>
      <td>${sig.rules.map(r=>`<span style="font-size:10px;background:#f0f4ff;color:#4f46e5;padding:1px 6px;border-radius:4px;margin-right:3px;font-family:monospace">${r}</span>`).join('') || '<span style="color:#94a3b8;font-size:11px">—</span>'}</td>`;

    tbody.insertBefore(newRow, tbody.firstChild);
    if (tbody.children.length > 10) tbody.removeChild(tbody.lastChild);

    // Bump counter display
    const counterEl = document.querySelector('.kpi-val[data-target="10247"]');
    if (counterEl) counterEl.textContent = _renderCount.toLocaleString();
  }, 2800 + Math.random() * 1200);
}

function stopTicker() {
  if (_tickerInterval) { clearInterval(_tickerInterval); _tickerInterval = null; }
}

// ── KPI counter animation ──
function animateCounters() {
  document.querySelectorAll('.kpi-val[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isFloat = target % 1 !== 0;
    let start = 0;
    const steps = 40;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString()) + suffix;
      if (step >= steps) {
        clearInterval(interval);
        el.textContent = (isFloat ? target.toFixed(1) : target.toLocaleString()) + suffix;
      }
    }, 20);
  });
}

// ── Preview computed (live loan calc) ──
function updatePreviewComputed() {
  const amtEl  = document.getElementById('web-loan-amount');
  const termEl = document.getElementById('web-loan-term');
  if (!amtEl) return;

  const amount = parseFloat(amtEl.value) || 25000;
  const term   = parseInt(termEl?.value) || 36;
  const r      = 0.05 / 12;
  const pmt    = amount * r * Math.pow(1+r,term) / (Math.pow(1+r,term) - 1);
  const sym    = S.previewLocale === 'en-GB' ? '£' : '$';
  const val    = sym + pmt.toFixed(2) + '/mo';

  document.querySelectorAll('.live-pmt').forEach(el => {
    el.textContent = val;
    el.style.transform = 'scale(1.04)';
    setTimeout(() => { el.style.transform = ''; }, 180);
  });
}

function updatePreviewSlider(input) {
  const label = document.getElementById(input.id + '-label');
  if (label) label.textContent = input.value + ' months';
}

// ── Navigation ──
function navigate(view, params = {}) {
  stopTicker();
  S.view   = view;
  S.params = params;

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  const views = {
    dashboard:      { title:'Dashboard',      fn: viewDashboard },
    skills:         { title:'Skill Registry', fn: viewSkills },
    'skill-detail': { title:'Skill Detail',   fn: () => viewSkillDetail(S.params.id) },
    'xd-registry':  { title:'XD Registry',    fn: viewXDRegistry },
    studio:         { title:'AI Studio',      fn: viewStudio },
    preview:        { title:'Preview Bench',  fn: viewPreview },
    mcp:            { title:'MCP Gateway',    fn: viewMCP },
    analytics:      { title:'Analytics',      fn: viewAnalytics }
  };

  const v = views[view] || views.dashboard;
  document.getElementById('page-title').textContent = v.title;

  const content = document.getElementById('content');
  content.innerHTML = v.fn();

  if (view === 'dashboard') {
    animateCounters();
    startTicker();
  }
  if (view === 'studio') {
    setTimeout(() => {
      const msgs = document.getElementById('chat-messages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 30);
  }
}

// ── Toast ──
function showToast(msg, type = 'default') {
  const t = document.getElementById('toast');
  const icons = { success:'✓', error:'✗', default:'ℹ' };
  t.innerHTML = `<span>${icons[type] || icons.default}</span> ${msg}`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Chat / Streaming ──
let _streamInterval = null;

function sendChat(text) {
  if (!text.trim()) return;
  S.chatHistory.push({ role:'user', text, id: 'u' + Date.now() });
  S.chatPhase++;

  // Show thinking
  const thinkId = 'think-' + Date.now();
  S.chatHistory.push({ role:'ai', text:'', thinking:true, id:thinkId });
  navigate('studio');

  const thinkDelay = 700 + Math.random() * 500;

  setTimeout(() => {
    // Remove thinking bubble
    const idx = S.chatHistory.findIndex(m => m.id === thinkId);
    if (idx !== -1) S.chatHistory.splice(idx, 1);

    // Pick reply
    let reply = '';
    let generateYAML = false;

    if (S.chatPhase === 1) {
      let matched = null;
      for (const [, flow] of Object.entries(CHAT_FLOWS)) {
        if (flow.q && flow.q.test(text)) { matched = flow; break; }
      }
      reply = matched ? matched.reply : CHAT_FLOWS.fallback.reply;
    } else if (S.chatPhase === 2) {
      reply = `Perfect. Generating your skill + XD manifest now…\n\nI'm building:\n• *Skill schema* with compliance tags and channel support\n• *XD slots* for each input field\n• *Adaptive rules* for chatbot and copilot channels\n• *Webhook action* binding`;
      generateYAML = true;
    } else {
      reply = `The manifest is ready. Next steps:\n\n1. *Validate* — check schema correctness and rule conflicts\n2. *Preview* — see it rendered across all channels in the Bench\n3. *Publish* — push to the XD registry when satisfied\n\nWant to adjust anything?`;
    }

    // Stream it in
    streamChatReply(reply, () => {
      if (generateYAML) {
        setTimeout(() => {
          S.generatedManifest = GENERATED_YAML;
          navigate('studio');
          showToast('✓ Manifest generated — 0 tokens used');
        }, 400);
      }
    });
  }, thinkDelay);
}

function streamChatReply(text, onDone) {
  const streamId = 'stream-' + Date.now();
  S.chatHistory.push({ role:'ai', text:'', streaming:true, id:streamId });
  navigate('studio');

  let i = 0;
  const speed = 14;

  _streamInterval = setInterval(() => {
    if (i >= text.length) {
      clearInterval(_streamInterval);
      const msg = S.chatHistory.find(m => m.id === streamId);
      if (msg) { msg.text = text; msg.streaming = false; }
      navigate('studio');
      if (onDone) onDone();
      return;
    }
    i++;
    // Update DOM directly — no full re-render
    const el = document.getElementById(streamId);
    if (el) {
      const body = el.querySelector('div:last-child');
      if (body) body.innerHTML = formatChatText(text.slice(0, i)) + '<span class="typing-cursor"></span>';
    }
    // Scroll chat
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, speed);
}

// ── Manifest Validation ──
function validateManifest() {
  showToast('Validating manifest…');
  setTimeout(() => {
    S.manifestValidated = true;
    navigate('studio');
    showToast('✓ Manifest validated — all checks passed', 'success');
  }, 1400);
}

// ── Command Palette ──
let _cmdSelected = -1;
let _cmdItems    = [];

function openCmdPalette() {
  const overlay = document.getElementById('cmd-overlay');
  overlay.style.display = 'flex';
  const input = document.getElementById('cmd-input');
  input.value = '';
  _cmdSelected = -1;
  setTimeout(() => input.focus(), 50);
  updateCmdResults('');
}

function closeCmdPalette() {
  document.getElementById('cmd-overlay').style.display = 'none';
}

function updateCmdResults(q) {
  const lower = q.toLowerCase();
  _cmdItems = [];

  if (!q) {
    // Show nav items
    _cmdItems = [
      { icon:'⊞', label:'Dashboard',      sub:'Platform overview', action:() => navigate('dashboard') },
      { icon:'⚙',  label:'Skill Registry', sub:'Browse all skills', action:() => navigate('skills') },
      { icon:'📄', label:'XD Registry',    sub:'Experience definitions', action:() => navigate('xd-registry') },
      { icon:'✦',  label:'AI Studio',      sub:'Generate manifests', action:() => navigate('studio') },
      { icon:'▣',  label:'Preview Bench',  sub:'3-channel render preview', action:() => navigate('preview') },
      { icon:'⌘',  label:'MCP Gateway',    sub:'Test MCP tool calls', action:() => navigate('mcp') },
      { icon:'📈', label:'Analytics',       sub:'Render telemetry', action:() => navigate('analytics') }
    ];
  } else {
    // Search skills
    MOCK.skills.forEach(sk => {
      if (sk.name.toLowerCase().includes(lower) || sk.skill_id.includes(lower)) {
        _cmdItems.push({
          icon:'⚙', label:sk.name, sub:`${sk.skill_id} · ${sk.status}`,
          action:() => { navigate('skill-detail', { id:sk.skill_id }); S.params = { id:sk.skill_id }; }
        });
      }
    });
    // Search XDs
    MOCK.xds.forEach(xd => {
      if (xd.name.toLowerCase().includes(lower) || xd.xd_id.includes(lower)) {
        _cmdItems.push({
          icon:'📄', label:xd.name, sub:`${xd.xd_id} · preview`,
          action:() => { S.previewXD = xd.xd_id; navigate('preview'); }
        });
      }
    });
    // Nav
    [['Dashboard','dashboard'],['Skills','skills'],['AI Studio','studio'],['Preview Bench','preview'],['Analytics','analytics'],['MCP Gateway','mcp']].forEach(([l,v]) => {
      if (l.toLowerCase().includes(lower)) {
        _cmdItems.push({ icon:'→', label:l, sub:'Navigate', action:() => navigate(v) });
      }
    });
  }

  const container = document.getElementById('cmd-results');
  if (!_cmdItems.length) {
    container.innerHTML = `<div class="cmd-empty">No results for "${q}"</div>`;
    return;
  }

  const section = q ? '' : `<div class="cmd-section-label">Navigation</div>`;
  container.innerHTML = section + _cmdItems.map((item,i) => `
    <div class="cmd-result ${i===_cmdSelected?'selected':''}" data-cmd-idx="${i}">
      <div class="cmd-result-icon">${item.icon}</div>
      <div>
        <div style="font-size:13px;font-weight:500;color:#0f172a">${item.label}</div>
        <div style="font-size:11px;color:#94a3b8">${item.sub}</div>
      </div>
    </div>`).join('');
}

function execCmdItem(idx) {
  const item = _cmdItems[idx];
  if (item) { item.action(); closeCmdPalette(); }
}

// ── Notifications ──
let _notifOpen = false;

function buildNotifPanel() {
  const icons = { deploy:'🚀', alert:'⚠️', review:'👁', info:'ℹ️' };
  const unread = MOCK.notifications.filter(n => !n.read).length;

  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.style.display = unread > 0 ? 'flex' : 'none';
    badge.textContent   = unread;
  }

  const panel = document.getElementById('notif-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #f1f5f9">
      <span style="font-size:13px;font-weight:600;color:#0f172a">Notifications</span>
      <button class="btn-ghost" style="font-size:11px;padding:3px 8px;color:#6366f1" data-action="mark-all-read">Mark all read</button>
    </div>
    ${MOCK.notifications.map(n => `
      <div class="notif-item ${n.read?'':'unread'}" data-action="read-notif" data-id="${n.id}">
        <div class="notif-icon notif-icon-${n.type}">${icons[n.type]||'ℹ️'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:${n.read?'400':'600'};color:#0f172a">${n.title}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px">${n.body}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:4px">${n.ts}</div>
        </div>
        ${!n.read ? '<div style="width:7px;height:7px;border-radius:50%;background:#6366f1;flex-shrink:0;margin-top:4px"></div>' : ''}
      </div>`).join('')}`;
}

// ── Event Delegation ──
document.addEventListener('click', e => {
  // Close notif panel on outside click
  if (_notifOpen && !e.target.closest('#notif-container')) {
    document.getElementById('notif-panel').style.display = 'none';
    _notifOpen = false;
  }

  const el = e.target.closest('[data-action]');
  if (!el) return;
  e.stopPropagation();

  const action = el.dataset.action;
  const d = el.dataset;

  switch (action) {
    case 'nav':
      navigate(d.view, d);
      break;

    case 'skill-detail':
      S.params = { id: d.id };
      navigate('skill-detail');
      break;

    case 'skill-filter':
      S.skillFilter = d.filter;
      navigate('skills');
      break;

    case 'preview-skill': {
      const xd = MOCK.xds.find(x => x.implements_skill === d.id);
      if (xd) { S.previewXD = xd.xd_id; navigate('preview'); }
      else showToast('No XD found for this skill yet');
      break;
    }

    case 'preview-xd':
      S.previewXD = d.id;
      navigate('preview');
      break;

    case 'send-chat': {
      const inp = document.getElementById('chat-input');
      if (inp && inp.value.trim()) { sendChat(inp.value.trim()); inp.value = ''; }
      break;
    }

    case 'chat-suggest':
      sendChat(d.text);
      break;

    case 'clear-chat':
      if (_streamInterval) { clearInterval(_streamInterval); _streamInterval = null; }
      S.chatHistory = []; S.chatPhase = 0;
      S.generatedManifest = null; S.manifestValidated = false;
      navigate('studio');
      break;

    case 'copy-manifest':
      if (S.generatedManifest) {
        navigator.clipboard?.writeText(S.generatedManifest).catch(() => {});
        showToast('✓ Manifest copied to clipboard', 'success');
      }
      break;

    case 'validate-manifest':
      validateManifest();
      break;

    case 'publish-manifest':
      showToast('Publishing to XD registry…');
      setTimeout(() => {
        MOCK.xds.push({
          xd_id: 'apply-for-loan-web-v2',
          name:  'Loan Application — Web v2 (AI Generated)',
          implements_skill: 'apply-for-loan',
          version: '1.0.0', status: 'draft',
          channels: ['web','chatbot','copilot'],
          template_id: 'sys:single-step-form',
          owner_team: 'lending-squad',
          slots: [], rules: [], actions: []
        });
        showToast('✓ Published to XD Registry as draft', 'success');
      }, 1000);
      break;

    case 'mcp-tool':
      _mcpTool     = d.tool;
      _mcpResponse = null;
      navigate('mcp');
      break;

    case 'call-mcp': {
      const params = {};
      MCP_TOOLS[_mcpTool].params.forEach(p => {
        const el2 = document.getElementById('mcp-' + p.id);
        if (el2) params[p.id] = el2.value;
      });
      showToast('⌘ Calling ' + _mcpTool + '…');
      setTimeout(() => {
        _mcpResponse = mcpSimulate(_mcpTool, params);
        navigate('mcp');
        showToast('✓ ' + _mcpTool + ' responded', 'success');
      }, 650);
      break;
    }

    case 'open-cmd':
      openCmdPalette();
      break;

    case 'close-cmd-overlay':
      closeCmdPalette();
      break;

    case 'toggle-notif':
      _notifOpen = !_notifOpen;
      const panel = document.getElementById('notif-panel');
      panel.style.display = _notifOpen ? 'block' : 'none';
      if (_notifOpen) buildNotifPanel();
      break;

    case 'mark-all-read':
      MOCK.notifications.forEach(n => n.read = true);
      buildNotifPanel();
      showToast('All notifications marked as read');
      break;

    case 'read-notif': {
      const notif = MOCK.notifications.find(n => n.id === d.id);
      if (notif) notif.read = true;
      buildNotifPanel();
      break;
    }

    // Command palette results
    default:
      if (el.dataset.cmdIdx !== undefined) {
        execCmdItem(parseInt(el.dataset.cmdIdx));
      }
  }
});

// Command palette result clicks
document.addEventListener('click', e => {
  const res = e.target.closest('[data-cmd-idx]');
  if (res) execCmdItem(parseInt(res.dataset.cmdIdx));
});

// ── Keyboard Shortcuts ──
document.addEventListener('keydown', e => {
  // Send chat: Enter (not Shift+Enter)
  if (e.target.id === 'chat-input' && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const v = e.target.value.trim();
    if (v) { sendChat(v); e.target.value = ''; }
    return;
  }

  // Command palette
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const overlay = document.getElementById('cmd-overlay');
    if (overlay.style.display === 'none') openCmdPalette();
    else closeCmdPalette();
    return;
  }

  const overlay = document.getElementById('cmd-overlay');
  if (overlay.style.display !== 'none') {
    if (e.key === 'Escape') { closeCmdPalette(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _cmdSelected = Math.min(_cmdSelected + 1, _cmdItems.length - 1);
      renderCmdSelection();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      _cmdSelected = Math.max(_cmdSelected - 1, 0);
      renderCmdSelection();
    }
    if (e.key === 'Enter' && _cmdSelected >= 0) {
      e.preventDefault();
      execCmdItem(_cmdSelected);
    }
  }

  // Nav shortcuts
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  const shortcuts = { '1':'dashboard', '2':'skills', '3':'xd-registry', '4':'studio', '5':'preview', '6':'mcp', '7':'analytics' };
  if (shortcuts[e.key] && !e.metaKey && !e.ctrlKey) navigate(shortcuts[e.key]);
});

function renderCmdSelection() {
  document.querySelectorAll('.cmd-result').forEach((el,i) => {
    el.classList.toggle('selected', i === _cmdSelected);
  });
}

// ── Init ──
buildNotifPanel();
navigate('dashboard');
