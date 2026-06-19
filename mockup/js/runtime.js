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

// ── AG-UI Event Stream Simulation (spec §3) ──
function simulateAGUIEvents(skillId, sessionId, action) {
  const sk = MOCK.skills.find(s => s.skill_id === skillId) || MOCK.skills[0];
  const tcId = 'tc_' + Math.random().toString(36).slice(2, 8);
  const msgId = 'msg_' + Math.random().toString(36).slice(2, 8);
  const now = Date.now();
  const events = [
    { type:'RUN_STARTED',        ts: now,      cls:'agui-start',  payload: `{"session_id":"${sessionId}","org_id":"acme-bank"}` },
    { type:'TEXT_MESSAGE_START', ts: now+8,    cls:'agui-start',  payload: `{"message_id":"${msgId}","role":"assistant"}` },
    { type:'TOOL_CALL_START',    ts: now+18,   cls:'agui-tool',   payload: `{"tool":"execute_skill","skill_id":"${skillId}"}` },
    { type:'STATE_SNAPSHOT',     ts: now+26,   cls:'agui-patch',  payload: `{"slots":${MOCK.xds.find(x=>x.implements_skill===skillId)?.slots.length||5},"rules_applied":[],"render_ms":3.2,"cache_hit":true}` },
    { type:'TEXT_MESSAGE_CHUNK', ts: now+38,   cls:'agui-chunk',  payload: `{"delta":"Here's your ${sk.name.toLowerCase()} form. "}` },
    { type:'TEXT_MESSAGE_CHUNK', ts: now+52,   cls:'agui-chunk',  payload: `{"delta":"Please fill in the details below."}` },
    { type:'TOOL_CALL_END',      ts: now+58,   cls:'agui-tool',   payload: `{"tool_call_id":"${tcId}","tokens_used":0,"render_ms":3.2}` },
    { type:'TEXT_MESSAGE_END',   ts: now+64,   cls:'agui-end',    payload: `{"message_id":"${msgId}","finish_reason":"stop"}` },
  ];
  if (action) {
    events.push({ type:'ACTION_DISPATCH', ts: now+120, cls:'agui-action', payload: `{"action_id":"${action}","webhook_status":202,"dispatch_ms":6.1}` });
    events.push({ type:'RUN_FINISHED',    ts: now+128, cls:'agui-end',   payload: `{"session_id":"${sessionId}","total_ms":128}` });
  } else {
    events.push({ type:'RUN_FINISHED',    ts: now+70,  cls:'agui-end',   payload: `{"session_id":"${sessionId}","total_ms":70}` });
  }
  return events;
}

// ── XD Validation for Publish Console (spec §10.5) ──
function validateXD(xdId) {
  const xd = MOCK.xds.find(x => x.xd_id === xdId);
  if (!xd) return [];
  const templateOk = MOCK.templates.some(t => t.template_id === xd.template_id);
  const skill = MOCK.skills.find(s => s.skill_id === xd.implements_skill);
  const boundSlots = xd.slots.filter(s => s.bind);
  const badBindings = boundSlots.filter(s => !s.bind.startsWith('$.'));
  const actionWebhooks = xd.actions.filter(a => a.webhook_url);
  const hasConsent = xd.slots.some(s => s.type === 'checkbox' && s.id.includes('consent'));
  const piiRequired = (skill?.compliance_tags || []).includes('PCI-DSS') || (skill?.compliance_tags || []).includes('GDPR');
  return [
    { id:'schema',     label:'XD schema valid',           status:'pass', detail:`${xd.slots.length} slots · ${xd.rules.length} rules · ${xd.actions.length} actions` },
    { id:'template',   label:'Template resolved',          status: templateOk ? 'pass' : 'fail', detail: xd.template_id + (templateOk ? ' ✓' : ' — not found in registry') },
    { id:'bindings',   label:'Slot bind paths valid',      status: badBindings.length === 0 ? 'pass' : 'warn', detail: `${boundSlots.length} bound paths · ${badBindings.length} warnings` },
    { id:'actions',    label:'Action webhooks declared',   status: actionWebhooks.length > 0 ? 'pass' : 'warn', detail: `${actionWebhooks.length}/${xd.actions.length} with webhook_url` },
    { id:'wcag',       label:'WCAG 2.1 AA baseline',      status: 'warn', detail: '1 contrast warning on metric-display (ratio 3.8:1 < 4.5:1)' },
    { id:'compliance', label:'Compliance gate clear',      status: (!piiRequired || hasConsent) ? 'pass' : 'fail', detail: (skill?.compliance_tags||[]).join(', ') || 'none declared' },
    { id:'breaking',   label:'No breaking changes vs prev',status: 'pass', detail: `Same slot/action signatures as v${xd.version}` }
  ];
}

// ── Extended MCP Simulate ──
const _mcpSimulateOrig = mcpSimulate;
function mcpSimulate(tool, params) {
  const p = params;
  if (tool === 'create_experience_definition') {
    const channels = (p.channels || 'web,chatbot').split(',').map(c => c.trim());
    const xdId = (p.xd_name || 'new-xd').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    return {
      status: 'created',
      xd_id: xdId,
      org_id: p.org_id || 'acme-bank',
      skill_id: p.skill_id || 'apply-for-loan',
      name: p.xd_name || 'New XD',
      template_id: p.template_id || 'sys:single-step-form',
      version: '0.1.0',
      status_tag: 'draft',
      channels,
      slots_scaffold: ['text-input','currency-input','button'].map((t,i) => ({ id:`field-${i+1}`, type:t, label:`Field ${i+1}`, required:true })),
      next: `Validate with validate_experience_definition, then publish when ready.`,
      created_ms: +(Math.random()*8+4).toFixed(1)
    };
  }
  if (tool === 'validate_experience_definition') {
    const checks = validateXD(p.xd_id || 'loan-application-web');
    const passed = checks.filter(c => c.status === 'pass').length;
    const warned = checks.filter(c => c.status === 'warn').length;
    const failed = checks.filter(c => c.status === 'fail').length;
    return {
      xd_id: p.xd_id || 'loan-application-web',
      org_id: p.org_id || 'acme-bank',
      strict: p.strict === 'true',
      overall: failed > 0 ? 'FAIL' : warned > 0 ? 'WARN' : 'PASS',
      checks,
      summary: { passed, warned, failed },
      validate_ms: +(Math.random()*12+6).toFixed(1)
    };
  }
  if (tool === 'subscribe_to_actions') {
    const sessId = p.session_id || 'sess_abc123';
    const streamUrl = `https://fabric.acme-bank.com/stream/${sessId}/actions`;
    return {
      status: 'subscribed',
      session_id: sessId,
      xd_id: p.xd_id || 'loan-application-web',
      transport: p.transport || 'sse',
      stream_url: streamUrl,
      initial_snapshot: {
        slots_rendered: 5,
        rules_applied: [],
        render_ms: 3.2,
        cache_hit: true
      },
      example_event: { type:'ACTION_DISPATCH', action_id:'submit', session_id:sessId, webhook_status:202 }
    };
  }
  return _mcpSimulateOrig(tool, params);
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
