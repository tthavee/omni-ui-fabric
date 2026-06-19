// ============================================================
// OmniUI Fabric — Mock Data
// ============================================================
const MOCK = {
  org: {
    org_id: 'acme-bank', name: 'Acme Bank',
    plan: 'enterprise', compliance_level: 'pci', region: 'us-east-1'
  },

  skills: [
    {
      skill_id: 'apply-for-loan', name: 'Apply for Loan',
      domain: 'financial-services', category: 'transaction', version: '2.1.0',
      status: 'stable',
      description: 'Enables customers to apply for personal or business loans with real-time eligibility checking and deterministic rendering.',
      compliance_tags: ['PCI-DSS', 'GDPR'], auth_required: true, is_composite: false,
      channels: ['web', 'chatbot', 'copilot'], owner_team: 'lending-squad',
      created_at: '2024-01-15', estimated_tokens_ui: 0, estimated_tokens_fallback: 520,
      renders_7d: 4821, renders_30d: 18420, p95_ms: 3.8, cache_hit_rate: 0.94
    },
    {
      skill_id: 'verify-identity', name: 'Verify Identity',
      domain: 'financial-services', category: 'onboarding', version: '1.0.3',
      status: 'stable',
      description: 'KYC identity verification — collects and validates government-issued ID and selfie biometric.',
      compliance_tags: ['GDPR', 'PII_handling'], auth_required: false, is_composite: false,
      channels: ['web', 'mobile'], owner_team: 'platform-squad',
      created_at: '2024-01-20', estimated_tokens_ui: 0, estimated_tokens_fallback: 480,
      renders_7d: 1203, renders_30d: 5812, p95_ms: 4.2, cache_hit_rate: 0.91
    },
    {
      skill_id: 'check-application-status', name: 'Check Application Status',
      domain: 'financial-services', category: 'lookup', version: '1.2.0',
      status: 'stable',
      description: 'Query the status of an existing loan application by reference number.',
      compliance_tags: [], auth_required: true, is_composite: false,
      channels: ['web', 'chatbot', 'copilot', 'portal'], owner_team: 'lending-squad',
      created_at: '2024-02-01', estimated_tokens_ui: 0, estimated_tokens_fallback: 320,
      renders_7d: 2108, renders_30d: 8240, p95_ms: 2.9, cache_hit_rate: 0.97
    },
    {
      skill_id: 'escalate-to-human', name: 'Escalate to Human',
      domain: 'financial-services', category: 'support', version: '1.0.1',
      status: 'stable',
      description: 'Connect customer to a human advisor — passes full session context automatically.',
      compliance_tags: [], auth_required: false, is_composite: false,
      channels: ['chatbot', 'copilot'], owner_team: 'cx-squad',
      created_at: '2024-02-15', estimated_tokens_ui: 0, estimated_tokens_fallback: 180,
      renders_7d: 512, renders_30d: 1940, p95_ms: 1.8, cache_hit_rate: 0.99
    },
    {
      skill_id: 'loan-onboarding-flow', name: 'Loan Onboarding Flow',
      domain: 'financial-services', category: 'onboarding', version: '1.0.0',
      status: 'staging',
      description: 'Composite: verify-identity → apply-for-loan → confirmation.',
      compliance_tags: ['PCI-DSS', 'GDPR'], auth_required: true, is_composite: true,
      channels: ['web'], owner_team: 'lending-squad',
      created_at: '2024-03-10', estimated_tokens_ui: 0, estimated_tokens_fallback: 0,
      renders_7d: 0, renders_30d: 0, p95_ms: null, cache_hit_rate: null
    },
    {
      skill_id: 'open-account', name: 'Open Account',
      domain: 'financial-services', category: 'onboarding', version: '0.9.2',
      status: 'draft',
      description: 'New current account opening flow for retail banking. PII-heavy, GDPR-scoped.',
      compliance_tags: ['GDPR', 'PII_handling'], auth_required: false, is_composite: false,
      channels: ['web'], owner_team: 'retail-squad',
      created_at: '2024-03-20', estimated_tokens_ui: 0, estimated_tokens_fallback: 600,
      renders_7d: 0, renders_30d: 0, p95_ms: null, cache_hit_rate: null
    },
    {
      skill_id: 'make-payment', name: 'Make Payment',
      domain: 'financial-services', category: 'transaction', version: '3.0.1',
      status: 'stable',
      description: 'Initiate a domestic or international payment with PSD2 strong authentication.',
      compliance_tags: ['PCI-DSS', 'PSD2'], auth_required: true, is_composite: false,
      channels: ['web', 'mobile', 'portal'], owner_team: 'payments-squad',
      created_at: '2023-12-01', estimated_tokens_ui: 0, estimated_tokens_fallback: 440,
      renders_7d: 6342, renders_30d: 24180, p95_ms: 3.1, cache_hit_rate: 0.96
    },
    {
      skill_id: 'view-statement', name: 'View Statement',
      domain: 'financial-services', category: 'lookup', version: '2.0.0',
      status: 'stable',
      description: 'Display account statement for a given date range with PDF/CSV export.',
      compliance_tags: ['GDPR'], auth_required: true, is_composite: false,
      channels: ['web', 'mobile', 'portal'], owner_team: 'accounts-squad',
      created_at: '2024-01-05', estimated_tokens_ui: 0, estimated_tokens_fallback: 280,
      renders_7d: 3891, renders_30d: 15200, p95_ms: 2.4, cache_hit_rate: 0.98
    }
  ],

  xds: [
    {
      xd_id: 'loan-application-web', name: 'Loan Application — Web',
      implements_skill: 'apply-for-loan', version: '3.0.0', status: 'stable',
      channels: ['web', 'portal'], template_id: 'sys:single-step-form', owner_team: 'lending-squad',
      slots: [
        { id:'loan-type',         type:'select',        label:'Loan Type',             bind:'$.loanType',         required:true,  visible_if:'true', options:['Personal','Business','Home Improvement','Vehicle'] },
        { id:'loan-amount',       type:'currency-input', label:'Loan Amount',           bind:'$.loanAmount',       required:true,  visible_if:'true', validation:{min:1000,max:1000000} },
        { id:'loan-term',         type:'range-slider',  label:'Loan Term (months)',     bind:'$.loanTerm',         required:true,  visible_if:'true', validation:{min:12,max:84} },
        { id:'monthly-payment',   type:'metric-display',label:'Est. Monthly Payment',  compute:'PMT(0.05/12,loanTerm,loanAmount)', visible_if:'true' },
        { id:'employment-status', type:'select',        label:'Employment Status',      bind:'$.employmentStatus', required:true,  visible_if:'true', options:['Employed','Self-employed','Retired','Unemployed'] },
        { id:'annual-income',     type:'currency-input', label:'Annual Income',         bind:'$.annualIncome',     required:true,  visible_if:'true' },
        { id:'consent',           type:'checkbox',      label:'I consent to a soft credit check', bind:'$.consent', required:true, visible_if:'true' },
        { id:'submit',            type:'button',        label:'Submit Application',     visible_if:'true', variant:'primary' }
      ],
      rules: [
        { id:'chatbot-compact', condition:"channel=='chatbot'",  priority:4, description:'Chatbot: hide computed & income fields',   patch:{hide:['monthly-payment','employment-status','annual-income','consent']} },
        { id:'copilot-minimal', condition:"channel=='copilot'",  priority:4, description:'Copilot: minimal card — key fields only',  patch:{hide:['monthly-payment','loan-term','annual-income','consent']} },
        { id:'premium-user',    condition:"user_tier=='premium'",priority:2, description:'Premium: extend max loan cap to $5M',      patch:{maxAmount:5000000} },
        { id:'locale-uk',       condition:"locale=='en-GB'",     priority:1, description:'UK locale: switch currency to GBP',        patch:{currency:'GBP'} },
        { id:'mobile-compact',  condition:"device_width<500",   priority:1, description:'Narrow screen: hide range slider',          patch:{hide:['loan-term']} }
      ],
      actions: [{ action_id:'submit', label:'Submit Application', webhook_url:'/api/webhooks/loan-apply' }]
    },
    {
      xd_id: 'status-card-web', name: 'Application Status Card',
      implements_skill: 'check-application-status', version: '1.2.0', status: 'stable',
      channels: ['web','chatbot','copilot','portal'], template_id: 'sys:metric-card', owner_team: 'lending-squad',
      slots: [
        { id:'ref-number',    type:'text-input',    label:'Application Reference', bind:'$.refNumber', required:true, visible_if:'true' },
        { id:'status-display',type:'metric-display',label:'Application Status',   compute:"LOOKUP('statuses',refNumber)", visible_if:'true' },
        { id:'check',         type:'button',        label:'Check Status',          visible_if:'true', variant:'primary' }
      ],
      rules: [
        { id:'chatbot-compact', condition:"channel=='chatbot'", priority:4, description:'Chatbot: compact single-field layout', patch:{hide:[]} }
      ],
      actions: [{ action_id:'check', label:'Check Status', webhook_url:'/api/webhooks/loan-status' }]
    },
    {
      xd_id: 'escalate-card', name: 'Escalate to Human Card',
      implements_skill: 'escalate-to-human', version: '1.0.1', status: 'stable',
      channels: ['chatbot','copilot'], template_id: 'sys:confirmation', owner_team: 'cx-squad',
      slots: [
        { id:'message', type:'text-display', label:'Connecting you to an advisor. Estimated wait: 3 minutes.', visible_if:'true' },
        { id:'confirm', type:'button', label:'Connect Now',           visible_if:'true', variant:'primary' },
        { id:'cancel',  type:'button', label:'Continue Self-Service', visible_if:'true', variant:'secondary' }
      ],
      rules: [],
      actions: [
        { action_id:'confirm', label:'Connect to advisor',  webhook_url:'/api/webhooks/escalate' },
        { action_id:'cancel',  label:'Cancel escalation',   webhook_url:'/api/webhooks/cancel-escalate' }
      ]
    },
    {
      xd_id: 'payment-form-web', name: 'Make Payment — Web',
      implements_skill: 'make-payment', version: '3.0.1', status: 'stable',
      channels: ['web','mobile','portal'], template_id: 'sys:single-step-form', owner_team: 'payments-squad',
      slots: [
        { id:'from-account', type:'select',        label:'From Account',           bind:'$.fromAccount', required:true,  visible_if:'true', options:['Current ••4521','Savings ••8832'] },
        { id:'amount',       type:'currency-input', label:'Amount',                bind:'$.amount',      required:true,  visible_if:'true', validation:{min:1,max:100000} },
        { id:'to-account',   type:'text-input',    label:'Recipient / IBAN',       bind:'$.toAccount',   required:true,  visible_if:'true' },
        { id:'reference',    type:'text-input',    label:'Payment Reference',      bind:'$.reference',   required:false, visible_if:'true' },
        { id:'pay-btn',      type:'button',        label:'Send Payment',           visible_if:'true', variant:'primary' }
      ],
      rules: [
        { id:'mobile-compact', condition:"device_width<500", priority:1, description:'Mobile: larger tap targets & stacked layout', patch:{layout:'stack'} },
        { id:'psd2-auth',      condition:"amount>1000",      priority:3, description:'PSD2: require 2FA for amounts over $1,000',  patch:{require_2fa:true} }
      ],
      actions: [{ action_id:'pay-btn', label:'Send Payment', webhook_url:'/api/webhooks/payment' }]
    }
  ],

  templates: [
    { template_id:'sys:single-step-form', name:'Single-Step Form',  channels:['web','mobile','chatbot','copilot','portal'] },
    { template_id:'sys:multi-step-form',  name:'Multi-Step Form',   channels:['web','mobile'] },
    { template_id:'sys:calculator',       name:'Calculator',        channels:['web','portal'] },
    { template_id:'sys:metric-card',      name:'Metric Card',       channels:['web','mobile','chatbot','copilot'] },
    { template_id:'sys:confirmation',     name:'Confirmation',      channels:['web','mobile','chatbot','copilot'] },
    { template_id:'sys:data-table',       name:'Data Table',        channels:['web','portal'] }
  ],

  agents: [
    {
      agent_id: 'lending-agent-v2', name: 'Lending Assistant v2',
      agent_type: 'claude', status: 'active',
      model: 'claude-sonnet-4-6',
      channels: ['web','chatbot'],
      capabilities: ['apply-for-loan','check-application-status','escalate-to-human'],
      tokens_saved: 8400, renders_today: 1843,
      last_active: '12:43:22'
    },
    {
      agent_id: 'onboarding-copilot', name: 'Onboarding Copilot',
      agent_type: 'copilot', status: 'active',
      model: 'claude-haiku-4-5',
      channels: ['copilot'],
      capabilities: ['verify-identity','open-account'],
      tokens_saved: 6200, renders_today: 921,
      last_active: '12:40:11'
    },
    {
      agent_id: 'payments-bot', name: 'Payments Assistant',
      agent_type: 'claude', status: 'active',
      model: 'claude-sonnet-4-6',
      channels: ['web','chatbot','mobile'],
      capabilities: ['make-payment','view-statement','check-application-status'],
      tokens_saved: 11200, renders_today: 2841,
      last_active: '12:43:55'
    }
  ],

  notifications: [
    { id:'n1', type:'deploy', title:'Loan Application XD deployed', body:'v3.0.0 is live on web & portal channels', ts:'2 min ago', read:false },
    { id:'n2', type:'alert',  title:'Cache hit rate dip', body:'apply-for-loan dropped to 89% on chatbot — auto-warmup triggered', ts:'14 min ago', read:false },
    { id:'n3', type:'review', title:'Open Account skill needs review', body:'retail-squad submitted v0.9.2 for staging approval', ts:'1 hr ago', read:false },
    { id:'n4', type:'info',   title:'June analytics report ready', body:'284,921 renders · $4,270 in estimated token savings', ts:'3 hr ago', read:true }
  ],

  recentSignals: [
    { ts:'12:43:22', skill:'apply-for-loan',           channel:'chatbot', ms:3.2, cache:true,  tokens:0, rules:['chatbot-compact'] },
    { ts:'12:43:19', skill:'check-application-status', channel:'web',     ms:6.8, cache:false, tokens:0, rules:[] },
    { ts:'12:43:15', skill:'apply-for-loan',           channel:'web',     ms:0.8, cache:true,  tokens:0, rules:['locale-uk'] },
    { ts:'12:43:09', skill:'escalate-to-human',        channel:'copilot', ms:2.1, cache:true,  tokens:0, rules:[] },
    { ts:'12:43:02', skill:'make-payment',             channel:'web',     ms:0.9, cache:true,  tokens:0, rules:[] },
    { ts:'12:42:58', skill:'verify-identity',          channel:'web',     ms:7.2, cache:false, tokens:0, rules:[] },
    { ts:'12:42:44', skill:'apply-for-loan',           channel:'copilot', ms:0.9, cache:true,  tokens:0, rules:['copilot-minimal'] },
    { ts:'12:42:31', skill:'check-application-status', channel:'chatbot', ms:1.2, cache:true,  tokens:0, rules:['chatbot-compact'] }
  ]
};

// Live ticker: random signal generator
const _TICKER_SKILLS   = ['apply-for-loan','check-application-status','make-payment','view-statement','escalate-to-human','verify-identity'];
const _TICKER_CHANNELS = ['web','chatbot','copilot','web','web','chatbot','portal','mobile'];
const _TICKER_RULES = {
  'apply-for-loan':           [['chatbot-compact'],['locale-uk'],['premium-user'],['copilot-minimal'],[]],
  'check-application-status': [['chatbot-compact'],[]],
  'make-payment':             [['mobile-compact'],['psd2-auth'],[]],
  'view-statement':           [[]],
  'escalate-to-human':        [[]],
  'verify-identity':          [[]]
};

function generateSignal() {
  const skill   = _TICKER_SKILLS[Math.floor(Math.random() * _TICKER_SKILLS.length)];
  const channel = _TICKER_CHANNELS[Math.floor(Math.random() * _TICKER_CHANNELS.length)];
  const cache   = Math.random() > 0.28;
  const ms      = cache ? +(Math.random() * 0.9 + 0.1).toFixed(1) : +(Math.random() * 8 + 2).toFixed(1);
  const opts    = _TICKER_RULES[skill] || [[]];
  const rules   = opts[Math.floor(Math.random() * opts.length)];
  const now     = new Date();
  const ts      = [now.getHours(), now.getMinutes(), now.getSeconds()]
                    .map(n => String(n).padStart(2,'0')).join(':');
  return { ts, skill, channel, ms, cache, tokens:0, rules, isNew:true };
}

// AI Studio chat flows
const CHAT_FLOWS = {
  loan: {
    q: /loan|borrow|credit|mortgage|apply/i,
    reply: `Got it — let's build a **Loan Application** skill.\n\nA few quick questions:\n\n1. What *loan types* should be supported? (Personal, Business, Vehicle…)\n2. What's the *maximum loan amount*?\n3. Which *channels* — web form, chatbot, copilot?\n\nAnswer all three and I'll generate the full manifest.`
  },
  identity: {
    q: /identity|kyc|verify|id check|passport/i,
    reply: `I'll build an **Identity Verification** skill.\n\nQuick questions:\n\n1. What documents should be accepted? (Passport, Driver's license, National ID)\n2. Synchronous scan or async upload-and-review?\n3. GDPR data residency region? (EU / US)`
  },
  account: {
    q: /account|open|register|onboard|sign.?up/i,
    reply: `Perfect — let's create an **Account Opening** skill.\n\nA few questions:\n\n1. Account types to support? (Current, Savings, Business)\n2. Which PII fields are required? (Name, DOB, SSN, Address)\n3. Target channels?`
  },
  payment: {
    q: /payment|pay|transfer|send money|wire/i,
    reply: `Great — let's build a **Payment** skill.\n\nQuick questions:\n\n1. Payment types? (Domestic bank transfer, International SWIFT, Card payment)\n2. Maximum single transaction limit?\n3. Does PSD2 Strong Customer Authentication apply?`
  },
  fallback: {
    reply: `Interesting — let me make sure I understand the experience.\n\n1. Who is the *primary user* for this flow?\n2. What *data* do they need to input?\n3. What *outcome* happens at the end — form submit, webhook, agent handoff?\n\nDescribe it and I'll draft the skill schema.`
  }
};

const GENERATED_YAML = `# OmniUI Fabric — Auto-generated Manifest
# skill: apply-for-loan  |  org: acme-bank  |  generated: 2026-06-18
# model: claude-sonnet-4-6  |  tokens_used: 0 (deterministic)

skill:
  skill_id: apply-for-loan
  org_id: acme-bank
  name: Apply for Loan
  domain: financial-services
  category: transaction
  version: 2.1.0
  status: draft
  description: >
    Enables customers to apply for personal or business loans
    with real-time eligibility checking and deterministic rendering.
  compliance_tags: [PCI-DSS, GDPR]
  auth_required: true
  is_composite: false
  ai_fallback_enabled: false
  estimated_tokens_ui: 0

experience_definition:
  xd_id: apply-for-loan-web-v2
  org_id: acme-bank
  name: Loan Application — Web
  implements_skill: apply-for-loan
  template_id: sys:single-step-form
  version: 1.0.0
  status: draft
  channels: [web, chatbot, copilot]

  slots:
    - id: loan-type
      type: select
      label: Loan Type
      bind: "$.loanType"
      required: true
      options: [Personal, Business, Vehicle, Home Improvement]

    - id: loan-amount
      type: currency-input
      label: Loan Amount
      bind: "$.loanAmount"
      required: true
      validation:
        min: 1000
        max: 500000

    - id: loan-term
      type: range-slider
      label: Loan Term (months)
      bind: "$.loanTerm"
      required: true
      validation: { min: 12, max: 84 }

    - id: monthly-payment
      type: metric-display
      label: Est. Monthly Payment
      compute: "PMT(0.05/12, $.loanTerm, $.loanAmount)"
      visible_if: "true"

    - id: submit
      type: button
      label: Submit Application
      variant: primary

  rules:
    - id: chatbot-compact
      condition: "channel == 'chatbot'"
      priority: 4
      patch:
        hide: [monthly-payment]
        layout: compact

    - id: copilot-minimal
      condition: "channel == 'copilot'"
      priority: 4
      patch:
        hide: [monthly-payment, loan-term]

    - id: locale-uk
      condition: "locale == 'en-GB'"
      priority: 1
      patch:
        currency: GBP

  actions:
    - action_id: submit
      label: Submit Application
      webhook_url: /api/webhooks/loan-apply
      payload_schema:
        type: object
        required: [loanType, loanAmount, loanTerm]`;

// ── Compliance Rules (spec §6.6) ──
const COMPLIANCE_RULES = [
  {
    rule_id: 'pci-no-pan-web', name: 'No PAN in Web Forms',
    regulation: 'PCI-DSS', enforcement: 'blocking',
    description: 'XDs with PCI-DSS compliance tag must not expose full card number (PAN) as plaintext in web channel.',
    applies_to: ['web','portal'],
    skills_affected: ['make-payment']
  },
  {
    rule_id: 'gdpr-pii-consent', name: 'GDPR PII Consent Required',
    regulation: 'GDPR', enforcement: 'blocking',
    description: 'Any XD collecting PII fields must include an explicit consent checkbox before data submission.',
    applies_to: ['web','mobile','portal'],
    skills_affected: ['verify-identity','open-account','apply-for-loan']
  },
  {
    rule_id: 'psd2-2fa-high-value', name: 'PSD2 2FA for High-Value Transfers',
    regulation: 'PSD2', enforcement: 'blocking',
    description: 'Payment transactions exceeding $1,000 must trigger strong customer authentication before dispatch.',
    applies_to: ['web','mobile','portal'],
    skills_affected: ['make-payment']
  },
  {
    rule_id: 'wcag-aa-contrast', name: 'WCAG 2.1 AA Contrast',
    regulation: 'WCAG', enforcement: 'warning',
    description: 'All metric display values must maintain a contrast ratio ≥ 4.5:1 against their background.',
    applies_to: ['web','mobile'],
    skills_affected: []
  },
  {
    rule_id: 'data-residency-eu', name: 'EU Data Residency',
    regulation: 'GDPR', enforcement: 'audit',
    description: 'PII collected via en-GB locale must be stored in EU data centres. Logged for audit; does not block publish.',
    applies_to: ['web','mobile','portal'],
    skills_affected: ['verify-identity','apply-for-loan']
  }
];

// ── Skill Version History ──
const SKILL_VERSIONS = {
  'apply-for-loan': [
    { version:'2.1.0', date:'2026-06-01', author:'Taylor H.', note:'Added UK locale rule, extended max loan cap to $1M', status:'stable', breaking:false },
    { version:'2.0.0', date:'2026-04-10', author:'Taylor H.', note:'BREAKING: renamed employment field, added GDPR consent checkbox', status:'stable', breaking:true },
    { version:'1.3.2', date:'2026-02-22', author:'Jordan K.', note:'Perf: warm-path cache pre-load on org init', status:'deprecated', breaking:false },
    { version:'1.3.0', date:'2025-12-15', author:'Jordan K.', note:'Added premium-user rule (extended loan cap)', status:'deprecated', breaking:false }
  ],
  'make-payment': [
    { version:'3.0.1', date:'2026-05-28', author:'Sam L.', note:'Hotfix: PSD2 threshold corrected to $1,000', status:'stable', breaking:false },
    { version:'3.0.0', date:'2026-05-01', author:'Sam L.', note:'BREAKING: migrated to sys:single-step-form@2.0', status:'stable', breaking:true },
    { version:'2.1.0', date:'2025-11-20', author:'Sam L.', note:'Added mobile-compact rule for narrow screens', status:'deprecated', breaking:false }
  ],
  'verify-identity': [
    { version:'1.0.3', date:'2026-05-14', author:'Jordan K.', note:'Hotfix: async upload path CORS headers', status:'stable', breaking:false },
    { version:'1.0.0', date:'2026-01-20', author:'Jordan K.', note:'Initial release: KYC flow with biometric selfie', status:'stable', breaking:false }
  ]
};

const MCP_TOOLS = {
  find_skill: {
    description: 'Discover skills by intent, domain, or channel. Returns ranked list with confidence scores.',
    params: [
      { id:'org_id',  label:'org_id',  type:'text',   default:'acme-bank',      required:true },
      { id:'query',   label:'query',   type:'text',   default:'loan application',required:false },
      { id:'channel', label:'channel', type:'select', default:'web',             opts:['web','chatbot','copilot','mobile','portal'] },
      { id:'status',  label:'status',  type:'select', default:'stable',          opts:['stable','staging','draft'] }
    ]
  },
  execute_skill: {
    description: 'Execute a skill — resolves XD, runs rule engine, returns A2UI component tree ready to render.',
    params: [
      { id:'org_id',    label:'org_id',      type:'text',   default:'acme-bank',     required:true },
      { id:'skill_id',  label:'skill_id',    type:'text',   default:'apply-for-loan',required:true },
      { id:'channel',   label:'channel',     type:'select', default:'web',           opts:['web','chatbot','copilot'] },
      { id:'user_tier', label:'user.tier',   type:'select', default:'standard',      opts:['standard','premium'] },
      { id:'locale',    label:'user.locale', type:'select', default:'en-US',         opts:['en-US','en-GB'] }
    ]
  },
  dispatch_action: {
    description: 'Submit a user action event from a rendered XD — validates payload and fires webhook.',
    params: [
      { id:'org_id',     label:'org_id',     type:'text',   default:'acme-bank',            required:true },
      { id:'session_id', label:'session_id', type:'text',   default:'sess_abc123',           required:true },
      { id:'xd_id',      label:'xd_id',      type:'text',   default:'loan-application-web',  required:true },
      { id:'action_id',  label:'action_id',  type:'select', default:'submit',                opts:['submit','check','confirm','cancel'] }
    ]
  },
  get_skill_graph: {
    description: "Return an agent's full capability graph for introspection and routing.",
    params: [
      { id:'org_id',   label:'org_id',   type:'text',   default:'acme-bank',      required:true },
      { id:'agent_id', label:'agent_id', type:'select', default:'lending-agent-v2',opts:['lending-agent-v2','onboarding-copilot','payments-bot'] }
    ]
  },
  create_experience_definition: {
    description: 'Create a new XD manifest for a skill — define slots, rules, channels, and actions. Returns draft XD ready for validation.',
    params: [
      { id:'org_id',      label:'org_id',      type:'text',   default:'acme-bank',               required:true },
      { id:'skill_id',    label:'skill_id',    type:'text',   default:'apply-for-loan',           required:true },
      { id:'xd_name',     label:'xd_name',     type:'text',   default:'Loan Application — Web',   required:true },
      { id:'template_id', label:'template_id', type:'select', default:'sys:single-step-form',     opts:['sys:single-step-form','sys:multi-step-form','sys:metric-card','sys:confirmation','sys:calculator'] },
      { id:'channels',    label:'channels',    type:'text',   default:'web,chatbot,copilot',      required:true }
    ]
  },
  validate_experience_definition: {
    description: 'Run the full automated validation suite on an XD — schema, template resolution, bind paths, WCAG, and compliance gate.',
    params: [
      { id:'org_id', label:'org_id', type:'text',   default:'acme-bank',            required:true },
      { id:'xd_id',  label:'xd_id',  type:'text',   default:'loan-application-web', required:true },
      { id:'strict', label:'strict', type:'select', default:'true',                 opts:['true','false'] }
    ]
  },
  subscribe_to_actions: {
    description: 'Subscribe to action dispatch events for a session via AG-UI SSE stream. Returns stream URL and initial state snapshot.',
    params: [
      { id:'org_id',     label:'org_id',     type:'text',   default:'acme-bank',            required:true },
      { id:'session_id', label:'session_id', type:'text',   default:'sess_abc123',          required:true },
      { id:'xd_id',      label:'xd_id',      type:'text',   default:'loan-application-web', required:true },
      { id:'transport',  label:'transport',  type:'select', default:'sse',                  opts:['sse','websocket'] }
    ]
  }
};
