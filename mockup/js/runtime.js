// ============================================================
// OmniUI Fabric — Runtime Engine & Helpers
// ============================================================

// ── Rule Engine ──
function evalCondition(cond, ctx) {
  try {
    const expr = cond
      .replace(/\bchannel\b/g,    JSON.stringify(ctx.channel))
      .replace(/\buser_tier\b/g,  JSON.stringify(ctx.user_tier))
      .replace(/\blocale\b/g,     JSON.stringify(ctx.locale))
      .replace(/\bdevice_width\b/g, String(ctx.device_width))
      .replace(/\bamount\b/g,     String(ctx.amount || 0));
    return !!Function('return (' + expr + ')')();
  } catch(e) { return false; }
}

function computeVal(expr, ctx) {
  if (!expr) return null;
  if (expr.startsWith('PMT(')) {
    const pv = ctx.loanAmount || 25000;
    const n  = ctx.loanTerm   || 36;
    const r  = 0.05 / 12;
    const p  = pv * r * Math.pow(1+r,n) / (Math.pow(1+r,n) - 1);
    return (ctx.currency === 'GBP' ? '£' : '$') + p.toFixed(2) + '/mo';
  }
  if (expr.includes('LOOKUP')) return '🟡 Under Review';
  return null;
}

function runRuntime(xdId, ctx) {
  const xd = MOCK.xds.find(x => x.xd_id === xdId);
  if (!xd) return null;

  const hidden = new Set();
  const matched = [];
  let currency = 'USD';

  for (const rule of [...xd.rules].sort((a,b) => a.priority - b.priority)) {
    if (evalCondition(rule.condition, ctx)) {
      matched.push(rule.id);
      if (rule.patch.hide)     rule.patch.hide.forEach(id => hidden.add(id));
      if (rule.patch.currency) currency = rule.patch.currency;
    }
  }

  const cacheHit = Math.random() > 0.3;
  const ms       = cacheHit ? +(Math.random()*0.7+0.1).toFixed(1) : +(Math.random()*6+2).toFixed(1);

  const slots = xd.slots
    .filter(s => !hidden.has(s.id))
    .map(s => ({
      ...s, currency,
      computedValue: computeVal(s.compute, { ...ctx, currency })
    }));

  return {
    xd_id:xd.xd_id, xd_version:xd.version, skill_id:xd.implements_skill,
    org_id:'acme-bank', a2ui_version:'0.8',
    session_id: 'sess_' + Math.random().toString(36).slice(2,9),
    slots, rules_applied:matched,
    render_ms:parseFloat(ms), tokens_used:0, cache_hit:cacheHit,
    bundle_size_bytes: 2048 + Math.floor(Math.random()*512)
  };
}

// ── Slot → HTML ──
function slotHTML(slot, opts = {}) {
  const { idPrefix = '', live = false } = opts;
  const curr = slot.currency === 'GBP' ? '£' : '$';
  const req  = slot.required ? '<span style="color:#ef4444">*</span>' : '';
  const pfx  = idPrefix ? `${idPrefix}-` : '';

  const liveHook = live ? 'oninput="FABRIC.updatePreviewComputed()"' : '';
  const termHook = live ? 'oninput="FABRIC.updatePreviewSlider(this);FABRIC.updatePreviewComputed()"' : 'oninput="this.nextElementSibling.textContent=this.value+\' months\'"';

  switch (slot.type) {
    case 'text-input':
      return `<div class="render-slot">
        <label>${slot.label} ${req}</label>
        <input type="text" id="${pfx}${slot.id}" placeholder="Enter ${slot.label.toLowerCase()}…" />
      </div>`;

    case 'currency-input':
      return `<div class="render-slot">
        <label>${slot.label} ${req}</label>
        <div style="position:relative">
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#6b7280;font-size:13px">${curr}</span>
          <input type="number" id="${pfx}${slot.id}" style="padding-left:24px" placeholder="0.00" value="${slot.id.includes('loan-amount') ? 25000 : ''}" ${liveHook} />
        </div>
      </div>`;

    case 'select': {
      const opts2 = (slot.options || []).map(o => `<option>${o}</option>`).join('');
      return `<div class="render-slot">
        <label>${slot.label} ${req}</label>
        <select id="${pfx}${slot.id}"><option value="">Select…</option>${opts2}</select>
      </div>`;
    }

    case 'range-slider': {
      const mn = slot.validation?.min || 12, mx = slot.validation?.max || 84;
      const mid = Math.floor((mn + mx) / 2);
      return `<div class="render-slot">
        <label>${slot.label} ${req}</label>
        <input type="range" id="${pfx}${slot.id}" min="${mn}" max="${mx}" value="${mid}" style="width:100%" ${termHook} />
        <div id="${pfx}${slot.id}-label" style="font-size:12px;color:#6b7280;margin-top:4px">${mid} months</div>
      </div>`;
    }

    case 'metric-display':
      return `<div class="render-slot">
        <div class="a2ui-metric">
          <div style="font-size:11px;color:#6366f1;font-weight:700;text-transform:uppercase;letter-spacing:.06em">${slot.label}</div>
          <div class="a2ui-metric-value${live ? ' live-pmt' : ''}" id="${pfx}${slot.id}-value">${slot.computedValue || curr + '694.00/mo'}</div>
          <div style="font-size:11px;color:#818cf8;margin-top:2px">⚡ Deterministic · 0 tokens</div>
        </div>
      </div>`;

    case 'text-display':
      return `<div class="render-slot">
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;font-size:13px;color:#0369a1">
          ℹ️ ${slot.computedValue || slot.label}
        </div>
      </div>`;

    case 'checkbox':
      return `<div class="render-slot">
        <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:13px;color:#374151">
          <input type="checkbox" style="margin-top:2px;accent-color:#4f46e5" />
          <span>${slot.label} ${req}</span>
        </label>
      </div>`;

    case 'button': {
      const ip = slot.variant === 'primary';
      return `<button onclick="FABRIC.toast('✓ Action: ${slot.id}')" style="width:100%;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-top:4px;border:${ip?'none':'1px solid #d1d5db'};background:${ip?'#4f46e5':'#fff'};color:${ip?'#fff':'#374151'};transition:opacity .15s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${slot.label}</button>`;
    }

    default:
      return `<div class="render-slot" style="font-size:12px;color:#9ca3af">[${slot.type}] ${slot.label}</div>`;
  }
}

function renderFormHTML(result, title, icon, opts = {}) {
  if (!result) return `<div style="padding:20px;color:#9ca3af;font-size:13px">No XD found</div>`;
  return `
    <div style="padding:16px">
      <div style="font-size:10px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">${icon} ${title}</div>
      ${result.slots.map(s => slotHTML(s, opts)).join('')}
    </div>`;
}

// ── Syntax Highlighters ──
function hl(obj) {
  const s = JSON.stringify(obj, null, 2);
  return s
    .replace(/("[\w_\-./: ]+")\s*:/g, '<span class="json-key">$1</span>:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="json-str">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="json-num">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="json-bool">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>');
}

function hlYAML(yaml) {
  return yaml
    .split('\n')
    .map(line => {
      if (line.trim().startsWith('#')) {
        return `<span class="yaml-cmt">${escHtml(line)}</span>`;
      }
      // key: value
      return line.replace(/^(\s*)([\w\-]+)(\s*:)(\s*)(.*)?$/, (_, indent, key, colon, sp, val) => {
        const safeKey = `<span class="yaml-key">${escHtml(key)}</span>`;
        const safeColon = `<span class="yaml-punct">:</span>`;
        if (!val) return `${indent}${safeKey}${safeColon}`;
        const safeVal = val.startsWith('[') || val.startsWith('{')
          ? `<span class="yaml-val">${escHtml(val)}</span>`
          : `<span class="yaml-str">${escHtml(val)}</span>`;
        return `${indent}${safeKey}${safeColon}${sp}${safeVal}`;
      });
    })
    .join('\n');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Badge & Pill ──
function statusBadge(s) {
  const map = { stable:'badge-stable', staging:'badge-staging', draft:'badge-draft', deprecated:'badge-deprecated', archived:'badge-archived', active:'badge-active' };
  return `<span class="badge ${map[s] || 'badge-draft'}">${s}</span>`;
}
function channelPill(ch) {
  const map = { web:'pill-web', chatbot:'pill-chatbot', copilot:'pill-copilot', mobile:'pill-mobile', portal:'pill-portal' };
  return `<span class="pill ${map[ch] || ''}">${ch}</span>`;
}

// ── MCP Simulation ──
function mcpSimulate(tool, params) {
  const p = params;
  if (tool === 'find_skill') {
    const results = MOCK.skills
      .filter(s => s.status === (p.status || 'stable') && s.channels.includes(p.channel || 'web'))
      .slice(0, 3);
    return {
      results: results.map((s,i) => ({
        skill_id:s.skill_id, name:s.name,
        confidence: +(0.97 - i * 0.07).toFixed(2),
        domain:s.domain,
        xd_count: MOCK.xds.filter(x => x.implements_skill === s.skill_id).length
      })),
      total: results.length,
      query_ms: +(Math.random()*4+1).toFixed(1)
    };
  }
  if (tool === 'execute_skill') {
    const ctx = { channel:p.channel||'web', user_tier:p.user_tier||'standard', locale:p.locale||'en-US', device_width:1200 };
    const xd  = MOCK.xds.find(x => x.implements_skill === (p.skill_id || 'apply-for-loan'));
    const result = xd ? runRuntime(xd.xd_id, ctx) : null;
    return result
      ? { ...result, stream_url:`wss://fabric.acme-bank.com/stream/${result.session_id}` }
      : { error:'No XD found for skill + channel combination' };
  }
  if (tool === 'dispatch_action') {
    return {
      status:'dispatched', action_id:p.action_id||'submit',
      session_id:p.session_id||'sess_abc123',
      webhook_url:'/api/webhooks/loan-apply',
      webhook_status:202, payload_valid:true,
      dispatch_ms: +(Math.random()*8+2).toFixed(1)
    };
  }
  if (tool === 'get_skill_graph') {
    const agent = MOCK.agents.find(a => a.agent_id === (p.agent_id || 'lending-agent-v2'));
    if (!agent) return { error:'Agent not found' };
    return {
      agent_id:agent.agent_id, name:agent.name, agent_type:agent.agent_type,
      model:agent.model, channels:agent.channels,
      capabilities: agent.capabilities.map(cid => {
        const sk = MOCK.skills.find(s => s.skill_id === cid);
        return { skill_id:cid, name:sk?.name||cid, status:sk?.status||'stable', xds:MOCK.xds.filter(x=>x.implements_skill===cid).length };
      })
    };
  }
  return { error:'Unknown tool' };
}

// ── Format helpers ──
function fmtMs(ms) {
  if (ms === null || ms === undefined) return '—';
  return ms < 1 ? `<${ms}ms` : `${ms}ms`;
}
function fmtNum(n) {
  return Number(n).toLocaleString();
}
function fmtPct(n) {
  return (n * 100).toFixed(1) + '%';
}
