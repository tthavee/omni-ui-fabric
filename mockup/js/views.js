// ============================================================
// OmniUI Fabric — View Functions
// ============================================================

// ── Dashboard ──
function viewDashboard() {
  const bars = [38,52,61,55,74,83,70,80,65,88,79,92,84,68,57,50,72,90,83,76,68,60,52,45];
  const total = 10247;

  const barHtml = bars.map((v,i) => {
    const isLast = i === bars.length - 1;
    return `<div class="bar-chart-bar bar-root" style="height:${v}%;width:100%;background:${isLast?'#a5b4fc':'#6366f1'}">
      <div class="bar-tooltip">${Math.round(v*total/100).toLocaleString()} renders</div>
    </div>`;
  }).join('');

  const sigRows = MOCK.recentSignals.map((s,i) => `
    <tr class="signal-row" id="sig-${i}">
      <td class="code" style="color:#64748b">${s.ts}</td>
      <td><span style="font-size:12px;font-weight:500;color:#0f172a">${s.skill}</span></td>
      <td>${channelPill(s.channel)}</td>
      <td class="code" style="color:${s.cache?'#16a34a':'#374151'}">${s.cache?'⚡ &lt;1ms':s.ms+'ms'}</td>
      <td class="code" style="color:#6366f1">0</td>
      <td>${s.rules.map(r=>`<span style="font-size:10px;background:#f0f4ff;color:#4f46e5;padding:1px 6px;border-radius:4px;margin-right:3px;font-family:monospace">${r}</span>`).join('') || '<span style="color:#94a3b8;font-size:11px">—</span>'}</td>
    </tr>`).join('');

  const statusDist = [['stable',6,'#16a34a'],['staging',1,'#ca8a04'],['draft',1,'#64748b']];

  return `
  <div style="padding:24px;max-width:1200px" class="view-enter">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <h1 style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.02em">Dashboard</h1>
        <p style="font-size:13px;color:#64748b;margin-top:2px">Acme Bank · acme-bank · Wednesday, Jun 18, 2026</p>
      </div>
      <button class="btn-primary" data-action="nav" data-view="studio">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        New Skill via AI
      </button>
    </div>

    <!-- KPI cards -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      <div class="metric-card">
        <div style="font-size:12px;color:#64748b;font-weight:500">Renders Today</div>
        <div class="kpi-val" style="font-size:30px;font-weight:800;color:#0f172a;margin-top:4px;letter-spacing:-.02em" data-target="10247">0</div>
        <div style="font-size:12px;color:#16a34a;margin-top:4px">↑ 12% vs yesterday</div>
      </div>
      <div class="metric-card">
        <div style="font-size:12px;color:#64748b;font-weight:500">p95 Render Latency</div>
        <div class="kpi-val" style="font-size:30px;font-weight:800;color:#0f172a;margin-top:4px;letter-spacing:-.02em" data-target="4.2" data-suffix="ms">0</div>
        <div style="font-size:12px;color:#16a34a;margin-top:4px">✓ Under 10ms SLA</div>
      </div>
      <div class="metric-card">
        <div style="font-size:12px;color:#64748b;font-weight:500">Cache Hit Rate</div>
        <div class="kpi-val" style="font-size:30px;font-weight:800;color:#0f172a;margin-top:4px;letter-spacing:-.02em" data-target="94.3" data-suffix="%">0</div>
        <div style="font-size:12px;color:#16a34a;margin-top:4px">↑ 2.1 pts this week</div>
      </div>
      <div class="metric-card" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-color:#bbf7d0">
        <div style="font-size:12px;color:#15803d;font-weight:500">AI Tokens Used</div>
        <div style="font-size:30px;font-weight:800;color:#14532d;margin-top:4px;letter-spacing:-.02em">0</div>
        <div style="font-size:12px;color:#15803d;margin-top:4px">⚡ 100% deterministic</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px">
      <!-- Left -->
      <div>
        <!-- Bar chart -->
        <div class="card" style="padding:20px;margin-bottom:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <span style="font-size:14px;font-weight:600;color:#0f172a">Renders — Last 24 Hours</span>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:11px;color:#94a3b8">Hover bars for count</span>
              <span style="font-size:12px;color:#64748b">Total: <strong style="color:#0f172a">10,247</strong></span>
            </div>
          </div>
          <div style="display:flex;align-items:flex-end;gap:3px;height:80px;padding-top:4px">
            ${barHtml}
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            ${['00:00','04:00','08:00','12:00','16:00','20:00','now'].map(t=>`<span style="font-size:10px;color:#94a3b8">${t}</span>`).join('')}
          </div>
        </div>

        <!-- Signals table -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #f1f5f9">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:14px;font-weight:600;color:#0f172a">Live Render Signals</span>
              <span id="live-badge" style="display:flex;align-items:center;gap:4px;font-size:11px;background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:10px;font-weight:600">
                <span class="dot dot-green live-dot" style="width:6px;height:6px"></span> LIVE
              </span>
            </div>
            <span style="font-size:12px;color:#6366f1;cursor:pointer" data-action="nav" data-view="analytics">View all →</span>
          </div>
          <table id="signals-table" style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f8fafc">
                ${['TIME','SKILL','CHANNEL','LATENCY','TOKENS','RULES FIRED'].map(h=>`<th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:700;letter-spacing:.04em">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody id="signals-body">${sigRows}</tbody>
          </table>
        </div>
      </div>

      <!-- Right panel -->
      <div>
        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:12px">Skills by Status</div>
          ${statusDist.map(([s,n,c]) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <div style="width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0"></div>
              <div style="flex:1;font-size:12px;color:#374151">${s}</div>
              <div style="font-size:12px;font-weight:700;color:#0f172a">${n}</div>
              <div style="flex:1;background:#f1f5f9;border-radius:3px;height:6px;overflow:hidden">
                <div style="height:100%;width:${n/8*100}%;background:${c};border-radius:3px;transition:width .5s ease"></div>
              </div>
            </div>`).join('')}
          <button class="btn-secondary" style="width:100%;font-size:12px;margin-top:4px" data-action="nav" data-view="skills">View registry →</button>
        </div>

        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:12px">Active Agents</div>
          ${MOCK.agents.map(a => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer" data-action="nav" data-view="mcp">
              <div class="dot dot-green live-dot"></div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:600;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name}</div>
                <div style="font-size:11px;color:#64748b">${a.channels.join(', ')} · ${a.capabilities.length} skills</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:11px;color:#16a34a;font-weight:600">−${a.tokens_saved.toLocaleString()} tkn</div>
                <div style="font-size:10px;color:#94a3b8">${a.renders_today.toLocaleString()} today</div>
              </div>
            </div>`).join('')}
        </div>

        <div class="card" style="padding:16px">
          <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:10px">Quick Actions</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn-secondary" style="text-align:left;font-size:12px;justify-content:flex-start" data-action="nav" data-view="studio">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              New Skill via AI Studio
            </button>
            <button class="btn-secondary" style="text-align:left;font-size:12px;justify-content:flex-start" data-action="nav" data-view="preview">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Open Preview Bench
            </button>
            <button class="btn-secondary" style="text-align:left;font-size:12px;justify-content:flex-start" data-action="nav" data-view="mcp">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Test MCP Gateway
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Skills ──
function skillsList() {
  const q = (S.skillSearch || '').toLowerCase();
  const filtered = MOCK.skills.filter(sk => {
    const matchQ = !q || sk.name.toLowerCase().includes(q) || sk.skill_id.includes(q) || sk.domain.includes(q) || sk.category.includes(q);
    const matchF = S.skillFilter === 'all' || sk.status === S.skillFilter;
    return matchQ && matchF;
  });
  if (!filtered.length) return `<div style="padding:40px;text-align:center;color:#9ca3af;font-size:13px">No skills found matching "${q}"</div>`;
  return filtered.map(sk => `
    <div class="skill-row" data-action="skill-detail" data-id="${sk.skill_id}">
      <div>
        <div style="font-size:14px;font-weight:600;color:#0f172a;display:flex;align-items:center;gap:6px">
          ${sk.name}
          ${sk.is_composite ? '<span style="font-size:10px;background:#f0f4ff;color:#6366f1;padding:1px 6px;border-radius:4px;font-weight:700">COMPOSITE</span>' : ''}
        </div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;font-family:monospace">${sk.skill_id}</div>
      </div>
      <div style="font-size:12px;color:#64748b">${sk.domain}<br><span style="color:#94a3b8">${sk.category}</span></div>
      <div class="code" style="font-size:12px;color:#374151">v${sk.version}</div>
      <div>${statusBadge(sk.status)}</div>
      <div>${sk.channels.map(channelPill).join('')}</div>
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:11px;color:#6366f1;cursor:pointer;font-weight:600" data-action="preview-skill" data-id="${sk.skill_id}">Preview</span>
      </div>
    </div>`).join('');
}

function viewSkills() {
  const filters = ['all','stable','staging','draft','deprecated'].map(f =>
    `<button class="tab ${S.skillFilter===f?'active':''}" data-action="skill-filter" data-filter="${f}">${f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('');
  return `
  <div style="padding:24px;max-width:1100px" class="view-enter">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div>
        <h1 style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.02em">Skill Registry</h1>
        <p style="font-size:13px;color:#64748b;margin-top:2px">${MOCK.skills.length} skills · org: acme-bank</p>
      </div>
      <button class="btn-primary" data-action="nav" data-view="studio">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Skill
      </button>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #f1f5f9;flex-wrap:wrap">
        <div style="position:relative;flex:1;min-width:200px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="position:absolute;left:10px;top:50%;transform:translateY(-50%)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="skill-search" type="text" value="${S.skillSearch || ''}" placeholder="Search by name, id, domain…"
            style="width:100%;border:1px solid #e2e8f0;border-radius:7px;padding:7px 12px 7px 32px;font-size:13px;outline:none"
            oninput="S.skillSearch=this.value;document.getElementById('skills-list').innerHTML=skillsList()" />
        </div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">${filters}</div>
      </div>
      <div style="display:grid;grid-template-columns:2fr 1.2fr .8fr 1fr 1.4fr .6fr;padding:8px 20px;background:#f8fafc;border-bottom:1px solid #f1f5f9">
        ${['SKILL','DOMAIN / CATEGORY','VERSION','STATUS','CHANNELS',''].map(h=>`<div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:.06em">${h}</div>`).join('')}
      </div>
      <div id="skills-list">${skillsList()}</div>
    </div>
  </div>`;
}

// ── Skill Detail ──
function viewSkillDetail(id) {
  const sk = MOCK.skills.find(s => s.skill_id === id);
  if (!sk) return `<div style="padding:40px;color:#9ca3af">Skill not found</div>`;
  const relatedXDs    = MOCK.xds.filter(x => x.implements_skill === id);
  const relatedAgents = MOCK.agents.filter(a => a.capabilities.includes(id));

  const usageBars = [62,71,80,74,88,82,76].map((v,i) =>
    `<div title="${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="background:#e0e7ff;border-radius:3px 3px 0 0;width:100%;height:${v*0.5}px;background:#6366f1;opacity:${0.4+v*0.006}" title="${v}%"></div>
      <div style="font-size:9px;color:#94a3b8">${['M','T','W','T','F','S','S'][i]}</div>
    </div>`).join('');

  return `
  <div style="padding:24px;max-width:960px" class="view-enter">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
      <button class="btn-ghost" data-action="nav" data-view="skills">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Skills
      </button>
      <span style="color:#94a3b8">/</span>
      <h1 style="font-size:18px;font-weight:700;color:#0f172a">${sk.name}</h1>
      ${statusBadge(sk.status)}
      ${sk.is_composite ? '<span style="font-size:10px;background:#f0f4ff;color:#6366f1;padding:2px 8px;border-radius:5px;font-weight:700">COMPOSITE</span>' : ''}
    </div>

    <div style="display:grid;grid-template-columns:1fr 300px;gap:16px;margin-bottom:16px">
      <!-- Left: metadata -->
      <div class="card" style="padding:20px">
        <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:14px">Skill Metadata</div>
        ${[
          ['Skill ID',    `<span class="code" style="color:#6366f1">${sk.skill_id}</span>`],
          ['Description', sk.description],
          ['Domain',      sk.domain],
          ['Category',    sk.category],
          ['Version',     `<span class="code">v${sk.version}</span>`],
          ['Owner',       sk.owner_team],
          ['Auth Required', sk.auth_required ? '<span style="color:#16a34a;font-weight:600">Yes</span>' : 'No'],
          ['Composite',   sk.is_composite ? 'Yes — contains child skills' : 'No'],
          ['Compliance',  sk.compliance_tags.length ? sk.compliance_tags.map(t=>`<span style="font-size:11px;background:#fef9c3;color:#854d0e;padding:2px 7px;border-radius:4px;margin-right:4px">${t}</span>`).join('') : '<span style="color:#9ca3af;font-size:12px">None</span>'],
          ['Channels',    sk.channels.map(channelPill).join('')],
          ['AI Tokens (UI)',  '<span style="color:#16a34a;font-weight:600">0</span> — always deterministic'],
          ['AI Fallback',  sk.estimated_tokens_fallback ? sk.estimated_tokens_fallback+' tokens (fallback only)' : 'N/A']
        ].map(([k,v]) => `
          <div style="display:flex;gap:12px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f8fafc">
            <div style="font-size:12px;font-weight:500;color:#64748b;width:130px;flex-shrink:0;padding-top:1px">${k}</div>
            <div style="font-size:13px;color:#0f172a;flex:1">${v}</div>
          </div>`).join('')}
      </div>

      <!-- Right -->
      <div>
        ${sk.renders_7d ? `
        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:4px">Usage — Last 7 Days</div>
          <div style="font-size:24px;font-weight:800;color:#0f172a;margin-bottom:12px">${sk.renders_7d.toLocaleString()} <span style="font-size:13px;font-weight:400;color:#64748b">renders</span></div>
          <div style="display:flex;align-items:flex-end;gap:4px;height:44px">${usageBars}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
            <div style="background:#f8fafc;border-radius:7px;padding:8px">
              <div style="font-size:10px;color:#64748b;font-weight:600">p95 LATENCY</div>
              <div style="font-size:16px;font-weight:700;color:#0f172a;margin-top:2px">${sk.p95_ms}ms</div>
            </div>
            <div style="background:#f8fafc;border-radius:7px;padding:8px">
              <div style="font-size:10px;color:#64748b;font-weight:600">CACHE HIT</div>
              <div style="font-size:16px;font-weight:700;color:#16a34a;margin-top:2px">${fmtPct(sk.cache_hit_rate)}</div>
            </div>
          </div>
        </div>` : ''}

        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:10px">XD Implementations</div>
          ${relatedXDs.length ? relatedXDs.map(xd => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;padding:8px;border-radius:7px;border:1px solid #f1f5f9;transition:border-color .15s" onmouseover="this.style.borderColor='#c7d2fe'" onmouseout="this.style.borderColor='#f1f5f9'" data-action="preview-xd" data-id="${xd.xd_id}">
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:500;color:#4f46e5">${xd.name}</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px">${xd.channels.map(channelPill).join('')}</div>
              </div>
              ${statusBadge(xd.status)}
            </div>`).join('')
          : `<div style="font-size:12px;color:#9ca3af;padding:8px 0">No XDs yet</div>`}
          <button class="btn-secondary" style="width:100%;margin-top:8px;font-size:12px" data-action="nav" data-view="studio">+ Create XD in AI Studio</button>
        </div>

        <div class="card" style="padding:16px">
          <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:10px">Agents Using This Skill</div>
          ${relatedAgents.length ? relatedAgents.map(a => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div class="dot dot-green live-dot"></div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:500;color:#0f172a">${a.name}</div>
                <div style="font-size:11px;color:#64748b">${a.model}</div>
              </div>
              <span style="font-size:10px;background:#f1f5f9;color:#64748b;padding:1px 6px;border-radius:4px">${a.agent_type}</span>
            </div>`).join('')
          : `<div style="font-size:12px;color:#9ca3af">No agents registered</div>`}
        </div>
      </div>
    </div>

    <div style="display:flex;gap:8px">
      <button class="btn-primary" data-action="preview-skill" data-id="${sk.skill_id}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        Preview in Bench
      </button>
      <button class="btn-secondary" data-action="nav" data-view="mcp">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        Test via MCP
      </button>
    </div>
  </div>`;
}

// ── XD Registry ──
function viewXDRegistry() {
  return `
  <div style="padding:24px;max-width:1000px" class="view-enter">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div>
        <h1 style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.02em">XD Registry</h1>
        <p style="font-size:13px;color:#64748b;margin-top:2px">${MOCK.xds.length} experience definitions · acme-bank</p>
      </div>
      <button class="btn-primary" data-action="nav" data-view="studio">+ New XD</button>
    </div>
    ${MOCK.xds.map(xd => {
      const sk = MOCK.skills.find(s => s.skill_id === xd.implements_skill);
      return `
      <div class="card" style="padding:18px;margin-bottom:12px;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 16px rgba(99,102,241,.12)'" onmouseout="this.style.boxShadow=''" data-action="preview-xd" data-id="${xd.xd_id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:15px;font-weight:700;color:#0f172a">${xd.name}</span>
              ${statusBadge(xd.status)}
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;font-family:monospace">
              ${xd.xd_id} · v${xd.version} · ${xd.template_id}
            </div>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <span style="font-size:12px;color:#374151">Skill: <span style="color:#6366f1;font-weight:500">${sk?.name || xd.implements_skill}</span></span>
              <span style="color:#e2e8f0">·</span>
              <span style="font-size:12px;color:#374151">${xd.slots.length} slots</span>
              <span style="color:#e2e8f0">·</span>
              <span style="font-size:12px;color:#374151">${xd.rules.length} rules</span>
              <span style="color:#e2e8f0">·</span>
              <span style="font-size:12px;color:#374151">team: ${xd.owner_team}</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
            <div>${xd.channels.map(channelPill).join('')}</div>
            <span style="font-size:12px;color:#6366f1;font-weight:500">Preview in Bench →</span>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ── AI Studio ──
function viewStudio() {
  const phase = S.chatPhase || 0;
  const msgs  = S.chatHistory.length === 0
    ? [{ role:'ai', text:'Hi! I\'m your AI experience designer.\n\nI\'ll help you create a skill and XD manifest for OmniUI Fabric. Just describe the experience you want to build:\n\n• *"I need a loan application form"*\n• *"Create an identity verification flow"*\n• *"Build a payment experience"*' }]
    : S.chatHistory;

  const chatHtml = msgs.map(m => {
    const isAI = m.role === 'ai';
    const text = m.thinking
      ? `<div style="display:flex;gap:5px;padding:4px 0"><div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div></div>`
      : formatChatText(m.text) + (m.streaming ? '<span class="typing-cursor"></span>' : '');
    return `<div class="chat-bubble ${isAI ? 'chat-ai' : 'chat-user'}" id="${m.id || ''}">
      <div class="chat-sender ${isAI ? 'chat-sender-ai' : 'chat-sender-user'}">${isAI ? 'AI DESIGNER' : 'YOU'}</div>
      <div>${text}</div>
    </div>`;
  }).join('');

  const pipSteps = [
    { label:'Describe', done: phase >= 1, active: phase === 0 },
    { label:'Generate', done: !!S.generatedManifest, active: phase >= 1 && !S.generatedManifest },
    { label:'Validate', done: S.manifestValidated, active: !!S.generatedManifest && !S.manifestValidated },
    { label:'Preview',  done: false, active: false },
    { label:'Publish',  done: false, active: false }
  ];

  const pipeline = `
    <div class="pipeline-track">
      ${pipSteps.map((s,i) => `
        <div class="pipeline-step ${s.done?'done':s.active?'active':''}">
          <div class="pip-num">${s.done ? '✓' : i+1}</div>
          <span>${s.label}</span>
        </div>`).join('')}
    </div>`;

  const rightContent = S.generatedManifest
    ? `<div style="position:relative">
        <div class="code-block-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          manifest.yaml
          <span style="background:#dcfce7;color:#15803d;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700;margin-left:4px">YAML</span>
          <div style="flex:1"></div>
          <button class="btn-ghost" style="font-size:11px;padding:3px 8px;color:#94a3b8" data-action="copy-manifest">Copy</button>
        </div>
        <div class="code-block with-header" style="max-height:100%;overflow:auto;min-height:300px">${hlYAML(S.generatedManifest)}</div>
      </div>`
    : `<div style="height:100%;min-height:380px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8fafc;border:2px dashed #e2e8f0;border-radius:10px">
        <div style="font-size:36px;margin-bottom:12px">✦</div>
        <div style="font-size:14px;font-weight:600;color:#374151;margin-bottom:6px">Manifest will appear here</div>
        <div style="font-size:13px;color:#94a3b8;text-align:center;max-width:240px">Chat with the AI designer to generate a skill + XD manifest</div>
      </div>`;

  const validateHtml = S.generatedManifest && !S.manifestValidated
    ? `<div style="margin-top:10px">
        <button class="btn-secondary" style="width:100%;font-size:12px" data-action="validate-manifest">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Validate Manifest
        </button>
      </div>` : '';

  const validateResultHtml = S.manifestValidated
    ? `<div style="margin-top:10px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">
        ${[
          'Skill schema valid',
          'XD slots well-formed',
          'Rules have no conflicts',
          'Compliance tags present',
          'No AI tokens required'
        ].map(check => `<div class="check-item"><svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span class="check-pass" style="font-size:12px">${check}</span></div>`).join('')}
      </div>
      <div style="margin-top:10px;display:flex;gap:6px">
        <button class="btn-success" style="flex:1;font-size:12px" data-action="nav" data-view="preview">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Preview in Bench
        </button>
        <button class="btn-primary" style="flex:1;font-size:12px" data-action="publish-manifest">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          Publish to Registry
        </button>
      </div>` : '';

  const suggestions = phase === 0
    ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        ${['I need a loan application form','Create an identity verification flow','Build a payment experience'].map(s =>
          `<button class="tab" style="font-size:11px;padding:5px 10px" data-action="chat-suggest" data-text="${s}">${s}</button>`).join('')}
      </div>` : '';

  return `
  <div style="display:flex;flex-direction:column;height:100%">
    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid #e2e8f0;background:#fff;flex-shrink:0">
      <div>
        <h1 style="font-size:16px;font-weight:700;color:#0f172a">AI Studio</h1>
        <p style="font-size:12px;color:#64748b">Natural language → Skill + XD manifest</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-ghost" style="font-size:12px" data-action="clear-chat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          Reset
        </button>
      </div>
    </div>

    <!-- Pipeline -->
    <div style="padding:12px 24px 0;background:#fff;flex-shrink:0;border-bottom:1px solid #f1f5f9">
      ${pipeline}
    </div>

    <!-- Split pane -->
    <div style="display:grid;grid-template-columns:1fr 1fr;flex:1;overflow:hidden">
      <!-- Left: Chat -->
      <div style="display:flex;flex-direction:column;border-right:1px solid #e2e8f0;overflow:hidden">
        <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px">${chatHtml}</div>
        <div style="padding:12px 14px;border-top:1px solid #e2e8f0;background:#fff;flex-shrink:0">
          ${suggestions}
          <div style="display:flex;gap:8px;align-items:flex-end">
            <textarea id="chat-input" rows="2" placeholder="Describe the experience you want to build…"
              style="flex:1;font-size:13px;resize:none;border-radius:8px;border:1px solid #d1d5db;padding:8px 12px;outline:none;transition:border-color .15s"
              onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#d1d5db'"></textarea>
            <button class="btn-primary" style="padding:10px 16px;flex-shrink:0" data-action="send-chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-top:6px">Enter to send · Shift+Enter for newline</div>
        </div>
      </div>

      <!-- Right: Manifest -->
      <div style="display:flex;flex-direction:column;overflow:hidden">
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid #e2e8f0;background:#f8fafc;flex-shrink:0">
          <span style="font-size:12px;font-weight:600;color:#0f172a">Generated Manifest</span>
          <div style="flex:1"></div>
          <span style="font-size:11px;color:#94a3b8">0 tokens used</span>
        </div>
        <div style="flex:1;overflow:auto;padding:14px">
          ${rightContent}
          ${validateHtml}
          ${validateResultHtml}
        </div>
      </div>
    </div>
  </div>`;
}

// ── Preview Bench ──
function viewPreview() {
  const xd  = MOCK.xds.find(x => x.xd_id === S.previewXD);
  const ctx = {
    channel:      S.previewChannel || 'web',
    user_tier:    S.previewTier    || 'standard',
    locale:       S.previewLocale  || 'en-US',
    device_width: S.previewDeviceWidth || 1200
  };

  const webCtx    = { ...ctx, channel:'web' };
  const chatCtx   = { ...ctx, channel:'chatbot' };
  const copilotCtx = { ...ctx, channel:'copilot' };

  const webResult     = runRuntime(S.previewXD, webCtx);
  const chatResult    = runRuntime(S.previewXD, chatCtx);
  const copilotResult = runRuntime(S.previewXD, copilotCtx);

  const xdOpts = MOCK.xds.map(x =>
    `<option value="${x.xd_id}" ${x.xd_id === S.previewXD ? 'selected':''}>${x.name}</option>`).join('');

  const rulesHtml = (xd?.rules || []).map(r => {
    const webMatch  = webResult?.rules_applied?.includes(r.id);
    const chatMatch = chatResult?.rules_applied?.includes(r.id);
    return `<div class="rule-row ${webMatch||chatMatch ? 'matched' : ''}">
      <span class="rule-id">${r.id}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:#374151;margin-bottom:2px">${r.description}</div>
        <div class="code" style="font-size:10px;color:#94a3b8">${r.condition}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end">
        ${webMatch  ? '<span style="font-size:10px;background:#dbeafe;color:#1d4ed8;padding:1px 5px;border-radius:3px">web</span>':''}
        ${chatMatch ? '<span style="font-size:10px;background:#fae8ff;color:#7e22ce;padding:1px 5px;border-radius:3px">chat</span>':''}
        ${!webMatch&&!chatMatch ? '<span style="font-size:10px;color:#94a3b8">—</span>':''}
      </div>
    </div>`;
  }).join('');

  const a2uiOut = webResult ? {
    a2ui_version: '0.8',
    session_id:   webResult.session_id,
    xd_id:        webResult.xd_id,
    xd_version:   webResult.xd_version,
    skill_id:     webResult.skill_id,
    slots_rendered: webResult.slots.length,
    rules_applied:  webResult.rules_applied,
    meta: {
      render_ms:         webResult.render_ms,
      tokens_used:       0,
      cache_hit:         webResult.cache_hit,
      bundle_size_bytes: webResult.bundle_size_bytes
    }
  } : {};

  return `
  <div style="display:flex;flex-direction:column;height:100%">
    <!-- Controls bar -->
    <div style="display:flex;align-items:center;gap:12px;padding:10px 20px;border-bottom:1px solid #e2e8f0;background:#fff;flex-shrink:0;flex-wrap:wrap">
      <select style="border:1px solid #e2e8f0;border-radius:7px;padding:6px 28px 6px 10px;font-size:13px;background:#fff;outline:none;font-weight:500" onchange="S.previewXD=this.value;FABRIC.navigate('preview')">
        ${xdOpts}
      </select>
      <div style="width:1px;height:24px;background:#e2e8f0"></div>
      <span style="font-size:12px;font-weight:600;color:#64748b">Context:</span>
      ${[
        ['User Tier',  ['standard','premium'], 'previewTier'],
        ['Locale',     ['en-US','en-GB'],      'previewLocale']
      ].map(([lbl,opts2,key]) => `
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-size:12px;color:#64748b">${lbl}:</span>
          <select style="border:1px solid #e2e8f0;border-radius:6px;padding:4px 24px 4px 8px;font-size:12px;background:#fff;outline:none" onchange="S['${key}']=this.value;FABRIC.navigate('preview')">
            ${opts2.map(o => `<option ${(S[key]||opts2[0])===o?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>`).join('')}
      <div style="flex:1"></div>
      <div style="font-size:11px;background:${webResult?.cache_hit?'#dcfce7':'#fef9c3'};color:${webResult?.cache_hit?'#15803d':'#a16207'};padding:4px 10px;border-radius:6px;font-weight:600">
        ${webResult?.cache_hit ? '⚡ Cache HIT' : '🔄 Cache MISS'} · ${webResult?.render_ms}ms · 0 tokens
      </div>
    </div>

    <!-- 3-column channel + sidebar -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 300px;flex:1;overflow:hidden">

      <!-- Web channel -->
      <div style="overflow:auto;border-right:1px solid #e2e8f0;padding:14px">
        <div class="device-browser">
          <div class="browser-chrome">
            <div class="browser-dot" style="background:#ff5f57"></div>
            <div class="browser-dot" style="background:#febc2e"></div>
            <div class="browser-dot" style="background:#28c840"></div>
            <div class="browser-url">acme-bank.com/apply</div>
          </div>
          <div style="padding:16px">
            <div style="font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">
              📋 WEB · ${webResult?.slots?.length || 0} slots · ${webResult?.rules_applied?.length || 0} rules
            </div>
            ${(webResult?.slots || []).map(s => slotHTML(s, { idPrefix:'web', live:true })).join('')}
          </div>
        </div>
      </div>

      <!-- Chatbot channel -->
      <div style="overflow:auto;border-right:1px solid #e2e8f0;padding:14px">
        <div class="chatbot-frame">
          <div class="chatbot-chrome">
            <div class="chatbot-avatar">🤖</div>
            <div>
              <div style="font-size:12px;font-weight:600">Lending Assistant</div>
              <div class="chatbot-status">Online · powered by OmniUI Fabric</div>
            </div>
          </div>
          <div style="padding:12px">
            <div style="background:#f5d0fe;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:13px;color:#581c87">
              To apply for a loan, I'll need a few details. Please fill in the fields below.
            </div>
            <div style="font-size:11px;font-weight:700;color:#7e22ce;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">
              CHATBOT · ${chatResult?.slots?.length || 0} slots · ${chatResult?.rules_applied?.length || 0} rules
            </div>
            ${(chatResult?.slots || []).map(s => slotHTML(s, { idPrefix:'chat' })).join('')}
          </div>
        </div>
      </div>

      <!-- Copilot channel -->
      <div style="overflow:auto;border-right:1px solid #e2e8f0;padding:14px">
        <div class="copilot-frame">
          <div class="copilot-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Copilot · Lending
          </div>
          <div style="padding:12px">
            <div style="font-size:11px;color:#4f46e5;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">SUGGESTED ACTION</div>
            <div style="font-size:13px;font-weight:600;color:#0f172a;margin-bottom:12px">Apply for Loan</div>
            <div style="font-size:11px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px">
              COPILOT · ${copilotResult?.slots?.length || 0} slots · ${copilotResult?.rules_applied?.length || 0} rules
            </div>
            ${(copilotResult?.slots || []).map(s => slotHTML(s, { idPrefix:'copilot' })).join('')}
          </div>
        </div>
      </div>

      <!-- Right sidebar: rules + output -->
      <div style="overflow:auto;background:#f8fafc">
        <!-- Rules -->
        <div style="padding:14px;border-bottom:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">Rules Evaluated</div>
          ${rulesHtml || '<div style="font-size:12px;color:#9ca3af">No rules defined for this XD</div>'}
        </div>

        <!-- Slot diff -->
        <div style="padding:14px;border-bottom:1px solid #e2e8f0">
          <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">Slot Presence by Channel</div>
          ${(xd?.slots || []).map(slot => {
            const inWeb     = webResult?.slots?.some(s => s.id === slot.id);
            const inChat    = chatResult?.slots?.some(s => s.id === slot.id);
            const inCopilot = copilotResult?.slots?.some(s => s.id === slot.id);
            return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <div style="font-size:11px;font-family:monospace;color:#374151;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${slot.id}</div>
              <span style="font-size:9px;padding:1px 4px;border-radius:3px;${inWeb?'background:#dbeafe;color:#1d4ed8':'background:#f1f5f9;color:#94a3b8'}">W</span>
              <span style="font-size:9px;padding:1px 4px;border-radius:3px;${inChat?'background:#fae8ff;color:#7e22ce':'background:#f1f5f9;color:#94a3b8'}">C</span>
              <span style="font-size:9px;padding:1px 4px;border-radius:3px;${inCopilot?'background:#dcfce7;color:#15803d':'background:#f1f5f9;color:#94a3b8'}">P</span>
            </div>`;
          }).join('')}
          <div style="font-size:10px;color:#94a3b8;margin-top:6px">W=Web · C=Chatbot · P=Copilot</div>
        </div>

        <!-- A2UI Output -->
        <div style="padding:14px">
          <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em">A2UI Output (web)</div>
          <div class="code-block" style="font-size:10px;line-height:1.6;max-height:260px;overflow:auto">${hl(a2uiOut)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── MCP Gateway ──
let _mcpTool = 'find_skill';
let _mcpResponse = null;

function viewMCP() {
  const tool = _mcpTool;
  const def  = MCP_TOOLS[tool];

  const toolBtns = Object.keys(MCP_TOOLS).map(t =>
    `<button class="tab ${tool===t?'active':''}" data-action="mcp-tool" data-tool="${t}" style="font-size:12px">${t}</button>`).join('');

  const paramForm = def.params.map(p => {
    if (p.type === 'select') return `
      <div style="margin-bottom:12px">
        <label style="display:block;font-size:12px;font-weight:500;color:#374151;margin-bottom:4px">${p.label}${p.required?'<span style="color:#ef4444"> *</span>':''}</label>
        <select id="mcp-${p.id}" style="width:100%;border:1px solid #d1d5db;border-radius:6px;padding:7px 10px;font-size:13px;background:#fff;outline:none;cursor:pointer">
          ${p.opts.map(o => `<option ${o===p.default?'selected':''}>${o}</option>`).join('')}
        </select>
      </div>`;
    return `
      <div style="margin-bottom:12px">
        <label style="display:block;font-size:12px;font-weight:500;color:#374151;margin-bottom:4px">${p.label}${p.required?'<span style="color:#ef4444"> *</span>':''}</label>
        <input id="mcp-${p.id}" type="text" value="${p.default||''}" style="width:100%;border:1px solid #d1d5db;border-radius:6px;padding:7px 10px;font-size:13px;outline:none" />
      </div>`;
  }).join('');

  // Build a curl command preview
  const curlParams = def.params.map(p => `  "${p.label}": "${p.default||''}"`).join(',\n');
  const curlCmd = `curl -X POST https://fabric.acme-bank.com/mcp \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{\n  "tool": "${tool}",\n${curlParams}\n}'`;

  const responseHtml = _mcpResponse
    ? `<div class="code-block" style="font-size:12px;line-height:1.7;max-height:360px;overflow:auto">${hl(_mcpResponse)}</div>`
    : `<div style="min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8fafc;border:2px dashed #e2e8f0;border-radius:10px">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin-bottom:8px"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <div style="font-size:12px;color:#94a3b8">Fill params and click Execute Tool</div>
      </div>`;

  const ms = _mcpResponse ? +(Math.random()*12+3).toFixed(1) : null;

  return `
  <div style="padding:24px;max-width:1100px" class="view-enter">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px">
      <div>
        <h1 style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.02em">MCP Gateway</h1>
        <p style="font-size:13px;color:#64748b;margin-top:2px">Interactive tool tester — simulates agent-to-platform calls</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">
        <div class="dot dot-green live-dot"></div>
        <span style="font-size:12px;color:#15803d;font-weight:600">MCP Gateway · Online</span>
        <span style="font-size:11px;color:#86efac">fabric.acme-bank.com</span>
      </div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">${toolBtns}</div>

    <div style="display:grid;grid-template-columns:320px 1fr;gap:16px">
      <!-- Params -->
      <div>
        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px;font-family:monospace">${tool}</div>
          <div style="font-size:12px;color:#64748b;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #f1f5f9">${def.description}</div>
          ${paramForm}
          <button class="btn-primary" style="width:100%" data-action="call-mcp">
            Execute Tool →
          </button>
        </div>

        <!-- Curl preview -->
        <div class="card" style="overflow:hidden">
          <div class="code-block-header">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
            cURL equivalent
          </div>
          <div class="code-block with-header" style="font-size:10px;line-height:1.6">${escHtml(curlCmd)}</div>
        </div>
      </div>

      <!-- Response -->
      <div>
        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em">Request Preview</div>
          <div class="code-block" style="font-size:11px">${hl({ tool, org_id:'acme-bank', params:'(configured above)' })}</div>
        </div>
        <div class="card" style="padding:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.06em">Response</div>
            ${_mcpResponse ? `<div style="display:flex;align-items:center;gap:8px">
              <div style="font-size:11px;background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:6px;font-weight:600">200 OK</div>
              <div style="font-size:11px;color:#64748b">${ms}ms</div>
            </div>` : ''}
          </div>
          ${responseHtml}
        </div>
      </div>
    </div>
  </div>`;
}

// ── Analytics ──
function viewAnalytics() {
  const bySkill = [
    { name:'make-payment',             count:24180, pct:30 },
    { name:'apply-for-loan',           count:18420, pct:23 },
    { name:'view-statement',           count:15200, pct:19 },
    { name:'check-application-status', count:8240,  pct:10 },
    { name:'verify-identity',          count:5812,  pct:7  },
    { name:'escalate-to-human',        count:1940,  pct:2  }
  ];
  const byChan = [
    { ch:'web',     count:38200, color:'#6366f1' },
    { ch:'chatbot', count:28400, color:'#a855f7' },
    { ch:'mobile',  count:12100, color:'#f97316' },
    { ch:'portal',  count:4200,  color:'#64748b' },
    { ch:'copilot', count:2021,  color:'#22c55e' }
  ];
  const maxChan = Math.max(...byChan.map(c => c.count));

  const sparkBars = [68,74,82,78,90,87,84,91,88,76,69,63,78,95,88,82,74,67,60,52,78,94,88,80].map((v,i) =>
    `<div style="border-radius:2px 2px 0 0;width:100%;height:${v}%;background:${i>20?'#a5b4fc':'#6366f1'};opacity:${0.4+v*0.006}"></div>`).join('');

  return `
  <div style="padding:24px;max-width:1120px" class="view-enter">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <div>
        <h1 style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-.02em">Analytics</h1>
        <p style="font-size:13px;color:#64748b;margin-top:2px">Render signal telemetry · June 2026</p>
      </div>
      <div style="display:flex;gap:8px">
        <select style="border:1px solid #e2e8f0;border-radius:7px;padding:6px 28px 6px 10px;font-size:13px;background:#fff;outline:none">
          <option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option>
        </select>
        <button class="btn-secondary" style="font-size:12px">Export CSV</button>
      </div>
    </div>

    <!-- KPIs -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
      ${[
        ['Total Renders','284,921','↑ 18% MoM','#0f172a'],
        ['Avg Render (p95)','4.8ms','✓ SLA met all month','#0f172a'],
        ['Cache Hit Rate','93.7%','↑ 1.4 pts','#0f172a'],
        ['AI Tokens Used','0','⚡ 100% deterministic','#14532d']
      ].map(([l,v,d,tc],i) => `
        <div class="metric-card" style="${i===3?'background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-color:#bbf7d0':''}">
          <div style="font-size:12px;color:${i===3?'#15803d':'#64748b'};font-weight:500">${l}</div>
          <div style="font-size:28px;font-weight:800;color:${tc};margin-top:4px;letter-spacing:-.02em">${v}</div>
          <div style="font-size:12px;color:#16a34a;margin-top:4px">${d}</div>
        </div>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 320px;gap:16px">
      <div>
        <!-- Spark chart -->
        <div class="card" style="padding:20px;margin-bottom:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <span style="font-size:14px;font-weight:600;color:#0f172a">Daily Renders — June 2026</span>
            <span style="font-size:12px;color:#64748b">Total: <strong>284,921</strong></span>
          </div>
          <div style="display:flex;align-items:flex-end;gap:3px;height:80px">${sparkBars}</div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            <span style="font-size:10px;color:#94a3b8">Jun 1</span>
            <span style="font-size:10px;color:#94a3b8">Jun 8</span>
            <span style="font-size:10px;color:#94a3b8">Jun 15</span>
            <span style="font-size:10px;color:#94a3b8">Jun 22</span>
            <span style="font-size:10px;color:#94a3b8">Jun 29</span>
          </div>
        </div>

        <!-- By skill -->
        <div class="card" style="padding:20px;margin-bottom:16px">
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:16px">Renders by Skill</div>
          ${bySkill.map(s => `
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;margin-bottom:5px">
                <div>
                  <span style="font-size:13px;font-weight:500;color:#374151">${s.name}</span>
                  <span style="font-size:10px;color:#94a3b8;margin-left:6px;font-family:monospace">${s.pct}%</span>
                </div>
                <span style="font-size:12px;color:#64748b">${s.count.toLocaleString()}</span>
              </div>
              <div class="prog-bar">
                <div class="prog-fill" style="width:${s.pct}%;background:#6366f1"></div>
              </div>
            </div>`).join('')}
        </div>

        <!-- Token savings -->
        <div class="card" style="padding:20px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-color:#bbf7d0">
          <div style="font-size:14px;font-weight:700;color:#14532d;margin-bottom:12px">🌱 Token Efficiency</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px">
            ${[['Renders (30d)','284,921'],['Tokens Saved','~142M'],['Est. Cost Saved','$4,270']].map(([l,v]) =>
              `<div><div style="font-size:11px;color:#15803d;font-weight:600">${l}</div><div style="font-size:22px;font-weight:800;color:#14532d;margin-top:2px">${v}</div></div>`).join('')}
          </div>
          <div style="font-size:12px;color:#15803d;padding:10px;background:rgba(255,255,255,.5);border-radius:7px">
            Based on ~500 tokens/render for AI fallback path at $0.00003/token. OmniUI Fabric serves <strong>0 tokens</strong> — all renders are deterministic.
          </div>
        </div>
      </div>

      <div>
        <!-- By channel -->
        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:14px">By Channel</div>
          ${byChan.map(c => `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <div style="display:flex;align-items:center;gap:6px">
                  ${channelPill(c.ch)}
                </div>
                <span style="font-size:12px;color:#64748b">${c.count.toLocaleString()}</span>
              </div>
              <div class="prog-bar">
                <div class="prog-fill" style="width:${Math.round(c.count/maxChan*100)}%;background:${c.color}"></div>
              </div>
            </div>`).join('')}
        </div>

        <!-- System health -->
        <div class="card" style="padding:16px">
          <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:14px">System Health</div>
          ${[
            ['Cache Hit Rate',   '93.7%', '#16a34a', 93.7],
            ['AI Fallback Rate', '0.0%',  '#16a34a', 0],
            ['Rule Fire Rate',   '68.4%', '#6366f1', 68.4],
            ['Error Rate',       '0.001%','#16a34a', 0.001]
          ].map(([l,v,c,n]) => `
            <div style="margin-bottom:12px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:13px;color:#374151">${l}</span>
                <span style="font-size:14px;font-weight:700;color:${c}">${v}</span>
              </div>
              <div class="prog-bar">
                <div class="prog-fill" style="width:${Math.min(n,100)}%;background:${c};opacity:.4"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// ── Utility ──
function formatChatText(text) {
  return escHtml(text)
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/•/g, '&bull;')
    .replace(/\n/g, '<br>');
}
