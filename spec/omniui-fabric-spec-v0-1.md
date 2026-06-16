# OmniUI Fabric — Complete Platform Specification
> **Purpose:** This document is the authoritative specification for building OmniUI Fabric.  
> Send to `/goal` to bootstrap the full project.  
> Neo4j graph database is the central brain. All domain knowledge is stored as nodes and edges, segregated by `org_id` across the entire graph.

---

## Table of Contents

1. [Vision and Problem Statement](#1-vision-and-problem-statement)
2. [Core Concepts](#2-core-concepts)
3. [Protocol Stack](#3-protocol-stack)
4. [Architecture](#4-architecture)
5. [Neo4j Graph Data Model](#5-neo4j-graph-data-model)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [MCP Gateway](#8-mcp-gateway)
9. [Runtime Engine](#9-runtime-engine)
10. [Authoring Studio](#10-authoring-studio)
11. [Testing Strategy](#11-testing-strategy)
12. [MVP Scope and Roadmap](#12-mvp-scope-and-roadmap)

---

## 1. Vision and Problem Statement

### 1.1 The Problem

Organizations build and maintain separate user experiences for every channel:

| Channel | Implementation Today |
|---|---|
| Web portal | React/Angular/Vue component |
| Mobile app | Native Swift / Kotlin / React Native |
| Chatbot | Text-only conversational flow |
| Copilot / AI agent | Custom card format per agent host |
| Dashboard | Separate analytics view |
| Portal embed | iFrame or web component |

**Consequences:**
- Duplicate development — same form built 5+ times in 5 frameworks
- Inconsistent validation rules, copy, and UX across channels
- High maintenance cost — change one rule, update everywhere
- High AI cost — generative UI burns tokens on every request
- Governance gaps — no single source of truth for compliance
- Slow delivery — adding a new channel requires rewriting everything

### 1.2 The Solution: OmniUI Fabric

**OmniUI Fabric** is an **Experience Operating System** that transforms how organizations define and deliver user experiences.

**Core thesis:** Experiences should be data, not code. Define what an experience *is* (intent, data, actions, rules, governance) once. The platform renders it consistently everywhere, with near-zero runtime AI cost.

**Key outcomes:**
- Build once, deploy to all channels
- Zero LLM tokens at render time (deterministic, not generative)
- Sub-10ms p95 render latency
- Enterprise governance built-in (RBAC, compliance, audit trail)
- Agent-native (MCP tools for orchestration)
- Compatible with emerging agentic UI protocols (A2UI, AG-UI)

### 1.3 Design Principles

1. **Experiences as data** — XDs are manifests, not code
2. **Deterministic runtime** — same inputs always produce same output
3. **AI only at authoring time** — zero tokens during render
4. **Skills as the semantic layer** — agents think in skills, not screens
5. **Graph as the brain** — Neo4j stores all domain knowledge with multi-tenant isolation by `org_id`
6. **Protocol-native** — output A2UI format, deliver over AG-UI transport
7. **Governance first** — compliance rules are encoded, not suggested

---

## 2. Core Concepts

### 2.1 Skills

A **skill** is a reusable, composable unit of work representing a meaningful user objective, independent of channel or interface.

Skills answer: *"What can happen here?"*

- Channel-neutral — defined once, works everywhere
- Versioned — semantic versioning, immutable once published
- Composable — skills can contain child skills (multi-step workflows)
- Governed — compliance tags, auth requirements, data classification
- Fallback-aware — has text-only alternative if no UI is available

**Example:** `apply-for-loan`, `verify-identity`, `check-application-status`, `escalate-to-human`

### 2.2 Experience Definitions (XDs)

An **XD** is the UI implementation of a skill. It specifies:
- Which template to use (canonical HTML/CSS structure)
- Which data fields to collect (slots)
- Which channels to support
- Which rules govern rendering (show/hide, format, layout)
- Which actions users can take

XDs answer: *"How should this skill appear on this channel?"*

One skill → multiple XDs (different XD per channel, or one XD covering multiple channels)

### 2.3 Runtime Engine

The **runtime** is a pure deterministic function:

```
evaluate(skill, xd, context) → A2UI component tree
```

- No LLM inference
- Evaluates rules against context
- Resolves data bindings and compute expressions
- Assembles output as A2UI JSON
- Fully cacheable (same inputs → same output)
- Target: <10ms p95 latency

### 2.4 MCP Gateway

The **MCP Gateway** exposes OmniUI Fabric capabilities as MCP tools that any AI agent can invoke:

- `find_skill` — discover skills by intent/domain/tag
- `execute_skill` — render a skill for a given context
- `dispatch_action` — submit a user action from a rendered XD
- `get_skill_graph` — introspect an agent's capability map
- `create_experience_definition` — author a new XD via MCP
- `validate_experience_definition` — check schema + policy compliance
- `subscribe_to_actions` — register callback for XD action events

### 2.5 Registries (All backed by Neo4j)

| Registry | What it stores | Primary node type |
|---|---|---|
| **Skill Registry** | Skill definitions, versioned | `Skill` |
| **XD Registry** | XD manifests + template bindings | `ExperienceDefinition` |
| **Template Library** | Canonical HTML/CSS/JS templates | `Template` |
| **Data Schema Registry** | Canonical data models | `DataSchema` |
| **Agent Capability Graph** | Agent skill inventories | `Agent` |
| **Governance Registry** | Compliance rules, policies | `ComplianceRule` |

All nodes carry `org_id` for multi-tenant isolation.

---

## 3. Protocol Stack

OmniUI Fabric sits **above** the emerging agentic UI protocol stack. It does not compete with AG-UI or A2UI — it uses them as its output format and transport layer.

```
┌──────────────────────────────────────────────────────┐
│                  OmniUI Fabric                       │
│                                                      │
│  Skills · XD Registry · Deterministic Runtime        │
│  Rules Engine · Governance · Neo4j Graph Brain       │
│                                                      │
│  "WHAT to render, for WHOM, governed HOW"            │
└──────────────────────┬───────────────────────────────┘
                       │ outputs A2UI component tree
                       ▼
┌──────────────────────────────────────────────────────┐
│                    A2UI (Google)                     │
│                                                      │
│  Declarative component format (JSON)                 │
│  Cross-platform: Flutter · Angular · Lit · SwiftUI   │
│  Client renders natively with own brand tokens       │
│                                                      │
│  "WHAT the UI looks like (the payload)"              │
└──────────────────────┬───────────────────────────────┘
                       │ delivered over AG-UI events
                       ▼
┌──────────────────────────────────────────────────────┐
│                   AG-UI (CopilotKit)                 │
│                                                      │
│  Event streaming protocol (SSE · WebSocket)          │
│  Typed events: TOOL_CALL_START · STATE_PATCH etc.    │
│  Human-in-the-loop · State synchronisation           │
│                                                      │
│  "HOW the UI gets to the user (the transport)"       │
└──────────────────────────────────────────────────────┘
```

### 3.1 Why Both Protocols

**A2UI (output format):**
- Declarative, not executable — safe across trust boundaries
- Cross-platform — same JSON renders on Flutter, Angular, Lit, SwiftUI
- Client owns rendering — native brand tokens, no iframe dissonance
- Template-hydration path aligns with OmniUI Fabric's deterministic model

**AG-UI (transport):**
- Standardizes streaming events from agent backend to frontend
- Handles human-in-the-loop interrupts and approvals
- State synchronisation for multi-step interactions
- Already compatible with A2UI (day-zero from CopilotKit)

**OmniUI Fabric's role:**
- Decides WHAT to render (skill + XD resolution)
- Enforces governance (policy gate, compliance rules)
- Eliminates runtime AI cost (deterministic rules engine)
- Manages reuse (skill registry, XD registry, template library)

---

## 4. Architecture

### 4.1 System Topology

```
┌─────────────────────────────────────────────────────────────┐
│  Producers                                                  │
│  AI Agents · Enterprise Apps · Human Authors               │
└────────┬────────────────────┬──────────────────┬───────────┘
         │ MCP calls          │ API calls         │ Studio UI
         ▼                    ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│  MCP Gateway                                                │
│  find_skill · execute_skill · dispatch_action               │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │   Neo4j     │  │  Runtime    │  │  Authoring  │
     │  Graph DB   │  │  Engine     │  │  Studio     │
     │  (Brain)    │  │  (Render)   │  │  (Author)   │
     └──────┬──────┘  └──────┬──────┘  └─────────────┘
            │                │
            ▼                ▼
     ┌─────────────┐  ┌─────────────┐
     │  Cache      │  │  A2UI       │
     │  Layer      │  │  Output     │
     │  (Redis)    │  │  (JSON)     │
     └─────────────┘  └──────┬──────┘
                             │ AG-UI transport
                             ▼
                    ┌─────────────────┐
                    │  Delivery       │
                    │  Channels       │
                    │  Web · Mobile   │
                    │  Chatbot        │
                    │  Copilot        │
                    └─────────────────┘
```

### 4.2 Request Flow

```
1. Agent calls MCP: find_skill("apply-for-loan", channel="chatbot", org_id="acme")
2. Gateway queries Neo4j: MATCH (s:Skill {org_id:"acme"})...
3. Returns: skill metadata with XD bindings
4. Agent calls MCP: execute_skill("apply-for-loan", {loanType:"personal"}, "chatbot")
5. Gateway:
   a. Loads Skill node from Neo4j
   b. Traverses IMPLEMENTATION edge to XD node for chatbot channel
   c. Loads XD manifest and rules
   d. Calls Runtime with (skill, xd, context)
6. Runtime:
   a. Evaluates rules against context (deterministic, 0 tokens)
   b. Resolves data bindings and compute expressions
   c. Assembles A2UI component tree
   d. Stores in Redis cache (key: hash of inputs)
7. Returns A2UI JSON to agent via AG-UI event stream
8. Client renders natively with own brand tokens
9. User submits form
10. Action event fires → dispatch_action → webhook → agent processes
11. Agent transitions to next skill in workflow
```

---

## 5. Neo4j Graph Data Model

> **Multi-tenancy:** Every node carries `org_id: string`. All queries MUST filter by `org_id`. No node is accessible across tenant boundaries without explicit cross-org permission edges.

### 5.1 Node Types

---

#### `Organisation`
The root tenant node. All other nodes belong to an organisation.

**Attributes:**
```
org_id:           String (unique, primary key)
name:             String
plan:             Enum [free, professional, enterprise]
status:           Enum [active, suspended, archived]
created_at:       DateTime
updated_at:       DateTime
settings:         JSON (feature flags, defaults)
compliance_level: Enum [standard, gdpr, hipaa, pci]
```

---

#### `Skill`
A reusable business capability. The semantic unit of work.

**Attributes:**
```
skill_id:                 String (unique within org)
org_id:                   String (tenant isolation)
name:                     String
description:              String
domain:                   String (e.g. financial-services, hr, ecommerce)
category:                 String (e.g. onboarding, lookup, transaction)
version:                  String (semver: 1.0.0)
status:                   Enum [draft, staging, stable, deprecated, archived]
owner_team:               String
created_at:               DateTime
updated_at:               DateTime
published_at:             DateTime
input_schema:             JSON (JSON Schema object)
output_schema:            JSON (JSON Schema object)
compliance_tags:          String[] (e.g. [GDPR, PII_handling])
auth_required:            Boolean
ai_fallback_enabled:      Boolean
fallback_prompt:          String
estimated_tokens_ui:      Integer (always 0 for deterministic path)
estimated_tokens_fallback: Integer
is_composite:             Boolean
content_hash:             String (SHA-256 of canonical form)
```

---

#### `ExperienceDefinition` (XD)
A UI implementation of a skill for one or more channels.

**Attributes:**
```
xd_id:            String (unique within org)
org_id:           String
name:             String
version:          String (semver)
status:           Enum [draft, staging, stable, deprecated, archived]
implements_skill: String (skill_id reference)
template_id:      String (template_id reference)
channels:         String[] ([web, mobile, chatbot, copilot, portal])
slots:            JSON (array of slot definitions)
rules:            JSON (array of rule definitions)
actions:          JSON (array of action definitions)
a2ui_mapping:     JSON (slot_id → A2UI component type mapping)
content_hash:     String
created_at:       DateTime
updated_at:       DateTime
published_at:     DateTime
owner_team:       String
```

**Slot definition structure (within `slots` JSON):**
```json
{
  "id": "loan-amount",
  "type": "currency-input",
  "label": "Loan Amount",
  "bind": "$.loanAmount",
  "required": true,
  "compute": null,
  "format": { "type": "currency", "locale": "$.user.locale" },
  "validation": { "min": 1000, "max": 1000000 },
  "visible_if": "true",
  "a2ui_component": "OmniUI.CurrencyInput"
}
```

**Rule definition structure (within `rules` JSON):**
```json
{
  "id": "chatbot-compact",
  "condition": "$.channel == 'chatbot'",
  "priority": 4,
  "patch": {
    "slots": [
      { "id": "monthly-payment", "visible": false }
    ],
    "layout": "compact"
  }
}
```

---

#### `Template`
A canonical HTML/CSS/JS structure that XDs reference.

**Attributes:**
```
template_id:       String (unique within org; system templates prefixed sys:)
org_id:            String (sys: templates belong to org_id: _system)
name:              String
description:       String
domain:            String
version:           String
status:            Enum [draft, stable, deprecated]
slot_types:        String[] (which slot types this template supports)
channel_support:   String[] (which channels this template works on)
html_template:     String (Handlebars/Mustache template string)
css:               String
js:                String
a2ui_components:   JSON (mapping of slot types to A2UI components)
preview_url:       String
created_at:        DateTime
updated_at:        DateTime
```

---

#### `DataSchema`
A canonical data model that skills and XDs use.

**Attributes:**
```
schema_id:          String (unique within org)
org_id:             String
name:               String
version:            String
status:             Enum [draft, stable, deprecated]
json_schema:        JSON (full JSON Schema definition)
pii_fields:         String[] (field names containing PII)
sensitive_fields:   String[] (fields requiring extra protection)
classification:     Enum [public, internal, confidential, restricted]
owner_team:         String
created_at:         DateTime
updated_at:         DateTime
```

---

#### `Agent`
An AI agent that has a registered skill capability graph.

**Attributes:**
```
agent_id:                  String (unique within org)
org_id:                    String
name:                      String
description:               String
version:                   String
status:                    Enum [active, inactive, deprecated]
agent_type:                Enum [claude, openai, custom, gemini, copilot]
channels:                  String[]
auth_token_hash:           String (hashed for security)
registered_at:             DateTime
last_seen_at:              DateTime
estimated_tokens_with_ui:  Integer
estimated_tokens_without_ui: Integer
compliance_certifications: String[]
```

---

#### `ComplianceRule`
A governance rule that restricts or modifies skill/XD behaviour.

**Attributes:**
```
rule_id:          String (unique within org)
org_id:           String
name:             String
description:      String
regulation:       String (e.g. GDPR, HIPAA, PCI-DSS, SOC2)
enforcement:      Enum [blocking, warning, audit_only, automatic]
condition:        String (CEL expression evaluated at runtime)
action:           JSON (what to do when triggered)
applies_to:       String[] (channels, roles, domains)
created_at:       DateTime
updated_at:       DateTime
owner_team:       String
```

---

#### `Action`
A named event that a user can trigger from a rendered XD.

**Attributes:**
```
action_id:        String (unique within XD scope)
org_id:           String
name:             String
label:            String
payload_schema:   JSON (JSON Schema for action payload)
webhook_url:      String (where to POST the action payload)
webhook_secret:   String (HMAC secret for verification)
timeout_ms:       Integer
retry_policy:     JSON
created_at:       DateTime
```

---

#### `SkillTransition`
Defines the state machine between skills in a composite workflow.

**Attributes:**
```
transition_id:    String
org_id:           String
from_skill_id:    String
action_id:        String (which action triggers this transition)
to_skill_id:      String
condition:        String (optional CEL guard expression)
payload_mapping:  JSON (how to map action payload to next skill input)
created_at:       DateTime
```

---

#### `Channel`
A delivery surface where experiences are rendered.

**Attributes:**
```
channel_id:       String (unique: web, mobile, chatbot, copilot, portal, dashboard)
org_id:           String
name:             String
type:             Enum [web, mobile, chatbot, copilot, portal, dashboard, voice, iot]
constraints:      JSON (max_width, max_payload_kb, supports_js, etc.)
a2ui_renderer:    String (which A2UI renderer this channel uses)
agui_transport:   Enum [sse, websocket, webhook, polling]
created_at:       DateTime
```

---

#### `RenderCache`
Metadata about a cached render (not the bundle itself — that lives in Redis).

**Attributes:**
```
cache_id:         String (= cache_key hash)
org_id:           String
xd_id:            String
xd_version:       String
channel:          String
context_hash:     String (hash of context fields that affect rules)
cache_key:        String
cached_at:        DateTime
expires_at:       DateTime
hit_count:        Integer
last_hit_at:      DateTime
```

---

#### `RenderSignal`
An audit record for every render execution.

**Attributes:**
```
signal_id:        String (UUID)
org_id:           String
skill_id:         String
xd_id:            String
xd_version:       String
channel:          String
session_id:       String
agent_id:         String
user_role:        String
locale:           String
rules_evaluated:  Integer
rules_matched:    Integer
rules_applied:    String[]
slots_rendered:   Integer
render_time_ms:   Float
bundle_size_bytes: Integer
cache_hit:        Boolean
tokens_used:      Integer
ai_fallback_used: Boolean
created_at:       DateTime
```

---

#### `SkillVersion`
Immutable version snapshot. The `Skill` node is mutable (status pointer); versions are immutable.

**Attributes:**
```
version_id:       String (skill_id + "@" + semver)
org_id:           String
skill_id:         String
version:          String
content_hash:     String
manifest_snapshot: JSON (full skill definition at publish time)
published_at:     DateTime
published_by:     String (user_id)
changelog:        String
breaking_change:  Boolean
```

---

#### `User`
An author or operator in the Authoring Studio.

**Attributes:**
```
user_id:          String
org_id:           String
email:            String
name:             String
role:             Enum [admin, author, reviewer, viewer]
teams:            String[]
created_at:       DateTime
last_login_at:    DateTime
```

---

#### `Team`
A group of users responsible for a domain of skills and XDs.

**Attributes:**
```
team_id:          String
org_id:           String
name:             String
domain:           String
created_at:       DateTime
```

---

### 5.2 Edge Types

All edges carry `org_id` on the relationship where traversal crosses tenant boundaries.

---

#### Skill ↔ XD

```cypher
(Skill)-[:IMPLEMENTED_BY {
  channel:    String,    # which channel this XD serves
  impl_type:  String,    # "form" | "card" | "table" | "calculator"
  is_primary: Boolean,   # primary implementation for this channel
  since:      DateTime
}]->(ExperienceDefinition)

(Skill)-[:HAS_FALLBACK {
  fallback_type: String  # "text" | "voice" | "summary"
}]->(Skill)             # points to a simpler skill or text fallback
```

---

#### Skill ↔ Skill (Composition)

```cypher
(Skill)-[:CHILD_SKILL {
  order:     Integer,    # execution order within parent
  required:  Boolean     # is this child mandatory?
}]->(Skill)

(SkillTransition)-[:FROM_SKILL]->(Skill)
(SkillTransition)-[:TO_SKILL]->(Skill)
(SkillTransition)-[:TRIGGERED_BY]->(Action)
```

---

#### Skill ↔ DataSchema

```cypher
(Skill)-[:USES_DATA {
  mode:       Enum [read, write, read_write],
  fields:     String[],  # which fields specifically
  required:   Boolean
}]->(DataSchema)
```

---

#### Skill ↔ ComplianceRule

```cypher
(Skill)-[:SUBJECT_TO {
  inherited: Boolean     # true if rule applied via domain, not directly
}]->(ComplianceRule)
```

---

#### XD ↔ Template

```cypher
(ExperienceDefinition)-[:USES_TEMPLATE {
  template_version: String,
  customizations:   JSON   # overrides from base template
}]->(Template)
```

---

#### XD ↔ Action

```cypher
(ExperienceDefinition)-[:HAS_ACTION {
  order:     Integer,
  slot_id:   String      # which button/slot triggers this action
}]->(Action)
```

---

#### XD ↔ Channel

```cypher
(ExperienceDefinition)-[:SUPPORTS_CHANNEL {
  layout:        String,
  max_width:     Integer,
  compact_mode:  Boolean
}]->(Channel)
```

---

#### Agent ↔ Skill

```cypher
(Agent)-[:HAS_CAPABILITY {
  granted_at:    DateTime,
  granted_by:    String,   # user_id who approved
  expires_at:    DateTime,
  permission:    Enum [execute, read_only]
}]->(Skill)
```

---

#### Agent ↔ Organisation

```cypher
(Agent)-[:BELONGS_TO]->(Organisation)
(Agent)-[:CERTIFIED_FOR {
  certification: String,
  valid_until:   DateTime
}]->(Channel)
```

---

#### DataSchema ↔ ComplianceRule

```cypher
(DataSchema)-[:RESTRICTED_BY {
  field_names: String[],  # specific fields restricted
  channel_constraint: String[]
}]->(ComplianceRule)
```

---

#### User ↔ Team ↔ Skill/XD

```cypher
(User)-[:MEMBER_OF {role: String}]->(Team)
(Team)-[:OWNS {domain: String}]->(Skill)
(Team)-[:OWNS]->(ExperienceDefinition)
(User)-[:PUBLISHED {at: DateTime}]->(Skill)
(User)-[:PUBLISHED {at: DateTime}]->(ExperienceDefinition)
(User)-[:APPROVED {at: DateTime, notes: String}]->(Skill)
```

---

#### RenderSignal ↔ Everything

```cypher
(RenderSignal)-[:FOR_SKILL]->(Skill)
(RenderSignal)-[:FOR_XD]->(ExperienceDefinition)
(RenderSignal)-[:BY_AGENT]->(Agent)
(RenderSignal)-[:ON_CHANNEL]->(Channel)
```

---

#### Versioning

```cypher
(Skill)-[:HAS_VERSION]->(SkillVersion)
(SkillVersion)-[:SUPERSEDES]->(SkillVersion)
(SkillVersion)-[:DEPENDS_ON {
  dependency_type: Enum [template, schema, skill]
}]->(SkillVersion)
```

---

#### Cross-Organisation (Optional, Enterprise Only)

```cypher
(Organisation)-[:TRUSTS {
  scope:      String[],   # which skill domains are shared
  since:      DateTime,
  approved_by: String
}]->(Organisation)

(Skill)-[:SHARED_WITH {
  visibility: Enum [public, partner, restricted]
}]->(Organisation)
```

---

### 5.3 Key Cypher Queries

**Find all stable skills for an org on a given channel:**
```cypher
MATCH (s:Skill {org_id: $org_id, status: "stable"})
      -[:IMPLEMENTED_BY {channel: $channel}]->
      (xd:ExperienceDefinition {status: "stable"})
RETURN s, xd
ORDER BY s.domain, s.name
```

**Impact analysis — which skills are affected if we deprecate an XD?**
```cypher
MATCH (xd:ExperienceDefinition {xd_id: $xd_id, org_id: $org_id})
      <-[:IMPLEMENTED_BY]-(s:Skill)
      <-[:HAS_CAPABILITY]-(a:Agent)
RETURN xd.xd_id, s.skill_id, s.name, collect(a.agent_id) AS affected_agents
```

**What does an agent's full skill graph look like?**
```cypher
MATCH (a:Agent {agent_id: $agent_id, org_id: $org_id})
      -[:HAS_CAPABILITY]->(s:Skill)
      -[:IMPLEMENTED_BY]->(xd:ExperienceDefinition)
      -[:SUPPORTS_CHANNEL]->(ch:Channel)
RETURN a, s, xd, ch
```

**Which skills contain PII and are subject to GDPR?**
```cypher
MATCH (s:Skill {org_id: $org_id})
      -[:USES_DATA]->(ds:DataSchema)
      -[:RESTRICTED_BY]->(cr:ComplianceRule {regulation: "GDPR"})
WHERE size(ds.pii_fields) > 0
RETURN s.skill_id, s.name, ds.schema_id, ds.pii_fields, cr.enforcement
```

**Get full composite skill tree:**
```cypher
MATCH path = (parent:Skill {skill_id: $skill_id, org_id: $org_id})
             -[:CHILD_SKILL*1..5]->(child:Skill)
RETURN path
ORDER BY [rel in relationships(path) | rel.order]
```

**Which skills would break if this data schema changes?**
```cypher
MATCH (ds:DataSchema {schema_id: $schema_id, org_id: $org_id})
      <-[:USES_DATA]-(s:Skill)
      <-[:HAS_CAPABILITY]-(a:Agent)
RETURN ds.schema_id, collect(s.skill_id) AS affected_skills,
       collect(DISTINCT a.agent_id) AS affected_agents
```

**Runtime rule cache key generation:**
```cypher
MATCH (xd:ExperienceDefinition {xd_id: $xd_id, org_id: $org_id})
RETURN xd.content_hash,
       [r IN xd.rules | r.condition] AS rule_conditions,
       xd.channels AS channels
```

**Find dead rules (rules that never fire in production):**
```cypher
MATCH (xd:ExperienceDefinition {org_id: $org_id})
WHERE NOT EXISTS {
  MATCH (sig:RenderSignal {org_id: $org_id})
        -[:FOR_XD]->(xd)
  WHERE ANY(r IN sig.rules_applied WHERE r IN
        [rule IN xd.rules | rule.id])
}
RETURN xd.xd_id, xd.name, "no rules fired in last 30 days" AS warning
```

---

### 5.4 Indexes and Constraints

```cypher
-- Uniqueness constraints
CREATE CONSTRAINT skill_unique IF NOT EXISTS
  FOR (s:Skill) REQUIRE (s.org_id, s.skill_id, s.version) IS UNIQUE;

CREATE CONSTRAINT xd_unique IF NOT EXISTS
  FOR (xd:ExperienceDefinition)
  REQUIRE (xd.org_id, xd.xd_id, xd.version) IS UNIQUE;

CREATE CONSTRAINT org_unique IF NOT EXISTS
  FOR (o:Organisation) REQUIRE o.org_id IS UNIQUE;

CREATE CONSTRAINT agent_unique IF NOT EXISTS
  FOR (a:Agent) REQUIRE (a.org_id, a.agent_id) IS UNIQUE;

-- Performance indexes
CREATE INDEX skill_org_status IF NOT EXISTS
  FOR (s:Skill) ON (s.org_id, s.status);

CREATE INDEX skill_domain IF NOT EXISTS
  FOR (s:Skill) ON (s.org_id, s.domain);

CREATE INDEX xd_skill_ref IF NOT EXISTS
  FOR (xd:ExperienceDefinition) ON (xd.org_id, xd.implements_skill);

CREATE INDEX render_signal_org_date IF NOT EXISTS
  FOR (rs:RenderSignal) ON (rs.org_id, rs.created_at);

CREATE INDEX agent_org IF NOT EXISTS
  FOR (a:Agent) ON (a.org_id, a.status);
```

---

## 6. Functional Requirements

### 6.1 Skill Management

| ID | Requirement |
|---|---|
| SK-01 | Author can create a skill via AI chat (natural language → manifest) |
| SK-02 | Skill must have `org_id`, `skill_id`, `version`, `status`, `input_schema`, `output_schema` |
| SK-03 | Skill versioning follows semver; published versions are immutable |
| SK-04 | Skill can declare child skills and transition rules (composite workflows) |
| SK-05 | Skill must declare at least one XD implementation or a text fallback |
| SK-06 | Skill status transitions: draft → staging → stable → deprecated → archived |
| SK-07 | Deprecated skill must notify all agents that have `HAS_CAPABILITY` edge to it |
| SK-08 | Skill search supports keyword, domain, category, and channel filters |
| SK-09 | Skill `find` query excludes skills with blocking compliance rules for the requesting channel |
| SK-10 | Content hash is computed on canonical JSON form at publish time |

### 6.2 XD Management

| ID | Requirement |
|---|---|
| XD-01 | XD must reference a valid, stable `Skill` node via `IMPLEMENTED_BY` edge |
| XD-02 | XD must reference a valid, stable `Template` node via `USES_TEMPLATE` edge |
| XD-03 | Every slot must have `id`, `type`, `label`, and either `bind` or `compute` |
| XD-04 | Rules are evaluated in ascending priority order; last patch wins on conflicts |
| XD-05 | XD supports at least one channel; channel constraints are declared in `SUPPORTS_CHANNEL` edge |
| XD-06 | XD publish triggers cache invalidation for all cached renders of that XD |
| XD-07 | XD actions must declare `payload_schema` and `webhook_url` |
| XD-08 | AI-assisted slot generation must validate all `bind` paths against the skill's `input_schema` |

### 6.3 Runtime Rendering

| ID | Requirement |
|---|---|
| RT-01 | Runtime is a pure function: same inputs always produce same A2UI output |
| RT-02 | Runtime performs no LLM inference; zero tokens consumed |
| RT-03 | p95 render latency < 10ms (cache miss); < 1ms (cache hit) |
| RT-04 | Rules evaluated using CEL (Common Expression Language) |
| RT-05 | Compute expressions use a safe formula engine (PMT, ROUND, IF, MIN, MAX, CONCAT) |
| RT-06 | Data bindings use JSONPath against the context object |
| RT-07 | Slots with `visible_if` evaluating to false are excluded from A2UI output entirely |
| RT-08 | Cache key = SHA-256 of (xd_id + xd_version + org_id + context fields referenced in rules) |
| RT-09 | Cache TTL = 1 hour default; invalidated on XD publish |
| RT-10 | Every render emits a `RenderSignal` node to Neo4j (async, non-blocking) |
| RT-11 | AI fallback is invoked only if `ai_fallback_enabled: true` on the skill AND no XD matches |
| RT-12 | Output format is A2UI JSON component tree |
| RT-13 | A2UI output is delivered to client over AG-UI SSE/WebSocket event stream |

### 6.4 MCP Gateway

| ID | Requirement |
|---|---|
| MCP-01 | Gateway exposes 7 MCP tools: find_skill, execute_skill, dispatch_action, get_skill_graph, create_experience_definition, validate_experience_definition, subscribe_to_actions |
| MCP-02 | All tool calls require `org_id` in context or auth token |
| MCP-03 | `find_skill` returns ranked list with confidence scores |
| MCP-04 | `execute_skill` returns A2UI JSON + AG-UI stream endpoint |
| MCP-05 | `dispatch_action` validates payload against action's `payload_schema` before forwarding |
| MCP-06 | `subscribe_to_actions` returns a session token and webhook registration URL |
| MCP-07 | All MCP tool calls are logged as `RenderSignal` or audit nodes |

### 6.5 Authoring Studio

| ID | Requirement |
|---|---|
| AS-01 | AI Designer workspace: natural language → skill manifest via LLM |
| AS-02 | Manifest Editor: dual-pane (structured form + YAML); changes sync bidirectionally |
| AS-03 | Rules Workbench: visual condition builder + context simulator |
| AS-04 | Preview Bench: live render using actual runtime, context switching, multi-channel side-by-side |
| AS-05 | Publish Console: schema validation + accessibility scan + policy check before promotion |
| AS-06 | All LLM calls in Studio use `claude-sonnet-4-6` via Anthropic API |
| AS-07 | Studio is multi-tenant; authors only see nodes where `org_id` matches their organisation |
| AS-08 | AI Designer sessions are saved as replayable authoring history |

### 6.6 Governance

| ID | Requirement |
|---|---|
| GV-01 | Compliance rules are stored as `ComplianceRule` nodes in Neo4j |
| GV-02 | Blocking rules prevent skill execution on restricted channels |
| GV-03 | PII fields defined in `DataSchema.pii_fields` are stripped from A2UI output for channels with data-minimization rules |
| GV-04 | Every rule evaluation is logged in `RenderSignal.rules_applied` |
| GV-05 | Promotion pipeline: draft → staging (automated CI) → production (human approval) |
| GV-06 | Breaking version changes require explicit approval from org admin |
| GV-07 | Deprecated assets trigger notification to all dependent `Agent` nodes |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target |
|---|---|
| Render latency (cache hit) | < 1ms |
| Render latency (cache miss, p95) | < 10ms |
| Render latency (cache miss, p99) | < 50ms |
| MCP tool call latency (end to end) | < 100ms |
| Neo4j query latency (indexed read) | < 5ms |
| Throughput | > 10,000 renders/sec per node |
| Cache hit rate (stable, high-traffic XDs) | > 95% |
| Authoring Studio: AI response (first token) | < 1s |

### 7.2 Reliability

| Metric | Target |
|---|---|
| API availability | 99.9% uptime |
| Neo4j availability | 99.95% (cluster with 3 nodes) |
| Redis cache availability | 99.9% |
| RenderSignal write failure | Non-blocking; queued, retried async |
| Graceful degradation | If runtime fails, return text fallback |

### 7.3 Scalability

- Horizontal scaling of the Runtime Engine (stateless, containerized)
- Neo4j Causal Cluster for read scaling
- Redis Cluster for cache scaling
- Multi-region deployment with edge cache nodes

### 7.4 Security

- All API calls authenticated with JWT; `org_id` extracted from token
- Neo4j queries always include `org_id` filter
- No cross-tenant data leakage (enforced at query layer, not application layer)
- A2UI output validated against component allowlist before delivery
- Webhook calls signed with HMAC-SHA256
- PII fields masked in logs and `RenderSignal` nodes
- TLS 1.3 for all network traffic

### 7.5 Cost Model

| Scenario | Token Cost |
|---|---|
| Standard render (deterministic) | 0 tokens |
| AI fallback render | ~500 tokens (skill-declared estimate) |
| Authoring Studio: skill generation | ~2,000 tokens (one-time) |
| Target: AI fallback rate | < 5% of total renders |

---

## 8. MCP Gateway

### 8.1 Tool Definitions

**`find_skill`**
```json
{
  "name": "find_skill",
  "description": "Discover skills by intent, domain, category, or tag. Returns ranked list.",
  "inputSchema": {
    "type": "object",
    "required": ["org_id"],
    "properties": {
      "org_id":   { "type": "string" },
      "query":    { "type": "string", "description": "Natural language intent" },
      "domain":   { "type": "string" },
      "category": { "type": "string" },
      "channel":  { "type": "string", "enum": ["web","mobile","chatbot","copilot","portal"] },
      "tags":     { "type": "array", "items": { "type": "string" } },
      "status":   { "type": "string", "default": "stable" }
    }
  }
}
```

**`execute_skill`**
```json
{
  "name": "execute_skill",
  "description": "Execute a skill. Returns A2UI component tree and AG-UI stream endpoint.",
  "inputSchema": {
    "type": "object",
    "required": ["org_id", "skill_id", "context"],
    "properties": {
      "org_id":     { "type": "string" },
      "skill_id":   { "type": "string" },
      "version":    { "type": "string", "default": "stable" },
      "input":      { "type": "object" },
      "context": {
        "type": "object",
        "properties": {
          "channel":  { "type": "string" },
          "user":     { "type": "object" },
          "device":   { "type": "object" },
          "flags":    { "type": "object" },
          "data":     { "type": "object" }
        }
      },
      "session_id": { "type": "string" }
    }
  }
}
```

**`dispatch_action`**
```json
{
  "name": "dispatch_action",
  "description": "Submit a user action event from a rendered XD.",
  "inputSchema": {
    "type": "object",
    "required": ["org_id", "session_id", "action_id", "payload"],
    "properties": {
      "org_id":     { "type": "string" },
      "session_id": { "type": "string" },
      "xd_id":      { "type": "string" },
      "action_id":  { "type": "string" },
      "payload":    { "type": "object" }
    }
  }
}
```

**`get_skill_graph`**
```json
{
  "name": "get_skill_graph",
  "description": "Return agent's full skill capability graph for introspection.",
  "inputSchema": {
    "type": "object",
    "required": ["org_id", "agent_id"],
    "properties": {
      "org_id":   { "type": "string" },
      "agent_id": { "type": "string" }
    }
  }
}
```

---

## 9. Runtime Engine

### 9.1 Rendering Pipeline

```
Input:  (skill_id, xd_id, context, org_id)
Output: A2UI component tree (JSON)

Step 1: Cache lookup
  - key = SHA-256(org_id + xd_id + xd_version + context_relevant_fields)
  - HIT  → return cached A2UI (< 1ms)
  - MISS → proceed to Step 2

Step 2: Load XD from Neo4j (or local cache)
  - MATCH (xd:ExperienceDefinition {xd_id, org_id})
  - Load manifest, slots, rules

Step 3: Build execution context
  - Merge: incoming context + user defaults + org defaults

Step 4: Evaluate rules (CEL evaluator)
  - For each rule (sorted ascending priority):
    - Evaluate condition against context
    - If true: add to matched_rules list

Step 5: Accumulate patches
  - Start from base slot configuration
  - Apply matched_rules patches in priority order (low → high)
  - Later/higher priority patches win on conflicts

Step 6: Resolve slots
  - For each slot:
    a. Evaluate visible_if (skip if false)
    b. Dereference bind path from context.data
    c. Evaluate compute expression (if present)
    d. Apply format (currency, date, percentage)
    e. Validate against validation rules

Step 7: Map to A2UI component tree
  - Each resolved slot → A2UI component (using xd.a2ui_mapping)
  - Compose into A2UI layout tree
  - Add metadata (session_id, xd_id, action endpoints)

Step 8: Cache result
  - Store A2UI JSON in Redis with TTL
  - Record cache_key in Neo4j RenderCache node (async)

Step 9: Emit RenderSignal
  - Write RenderSignal node to Neo4j (async, non-blocking)

Output: A2UI JSON component tree
```

### 9.2 Fallback Hierarchy

```
Level 0: Cache hit → return immediately (< 1ms)
Level 1: Deterministic render → full pipeline (< 10ms)
Level 2: Slot fallback → missing binding → use slot default value
Level 3: Template fallback → unsupported channel → use base template layout
Level 4: Text fallback → no XD for channel → render text summary from skill metadata
Level 5: AI fallback → skill has ai_fallback_enabled:true → LLM call (~500 tokens)
```

### 9.3 A2UI Output Structure

```json
{
  "a2ui_version": "0.8",
  "session_id": "sess_abc123",
  "xd_id": "loan-application-compact",
  "xd_version": "3.0.0",
  "skill_id": "apply-for-loan",
  "org_id": "acme-bank",
  "layout": {
    "type": "Card",
    "props": { "elevation": 2, "padding": "md" },
    "children": [
      {
        "id": "loan-amount",
        "type": "OmniUI.CurrencyInput",
        "props": {
          "label": "Loan Amount",
          "value": null,
          "min": 1000,
          "max": 1000000,
          "currency": "GBP",
          "locale": "en-GB",
          "required": true
        }
      },
      {
        "id": "submit-button",
        "type": "Button",
        "props": {
          "label": "Submit Application",
          "variant": "primary",
          "action": {
            "action_id": "submit",
            "endpoint": "/api/actions/sess_abc123/submit"
          }
        }
      }
    ]
  },
  "meta": {
    "render_ms": 4.2,
    "tokens_used": 0,
    "cache_hit": false,
    "rules_applied": ["chatbot-compact", "locale-uk"],
    "agui_stream_url": "wss://fabric.acme.com/stream/sess_abc123"
  }
}
```

---

## 10. Authoring Studio

### 10.1 AI Designer Workspace

- Natural language input → structured skill/XD manifest
- AI asks targeted disambiguation questions (max 5 per session)
- Each AI response produces a graph mutation (node creation or property update)
- LLM: `claude-sonnet-4-6` via Anthropic Messages API
- System prompt includes: org context, available templates, data schemas, compliance rules
- Session history is replayable and branchable

**AI Designer prompt structure:**
```
System: You are an experience designer for OmniUI Fabric.
        Org: {org_name}, Domain: {domain}
        Available templates: {template_list}
        Available data schemas: {schema_list}
        Compliance rules: {compliance_summary}
        
        Your job: help the author create a valid XD manifest.
        Output ONLY valid JSON matching the XD schema.
        Validate all bind paths against available schemas.
        Flag compliance issues before generating.

User: {author_intent}
```

### 10.2 Manifest Editor

- Dual-pane: structured form (left) + YAML/JSON editor (right)
- Bidirectional sync — changes in either pane update the other
- Live schema validation (JSON Schema, real-time)
- Inline policy warnings (compliance rule violations shown in context)
- All changes write to Neo4j as draft node mutations

### 10.3 Rules Workbench

- Visual condition builder (channel, locale, role, device, flags, data fields)
- CEL expression output shown alongside visual builder
- Context simulator: set test context → see which rules fire + resolved slots
- Hit rate display (from production `RenderSignal` telemetry)
- Dead rule detection (rules with < 1% hit rate over 30 days)

### 10.4 Preview Bench

- Calls actual runtime `POST /render` (not a mock)
- Multi-channel side-by-side view (web + chatbot simultaneously)
- Context switcher: change channel, locale, role, device width
- Action trace panel: shows AG-UI events the XD would emit
- Diff view: compare against current production version

### 10.5 Publish Console

**Automated checks:**
- JSON Schema validation against XD schema
- Template resolution (template exists at declared version)
- Slot bind path validation against skill's input_schema
- Accessibility scan (WCAG 2.1 AA automated rules)
- Compliance policy gate (any blocking rules for declared channels?)
- Breaking change detection (compare slot/action signature to previous version)

**Human approval (for stable promotion):**
- Visual diff screenshots across all declared channels
- Version changelog input (required for MAJOR bumps)
- Org admin sign-off for compliance-flagged XDs

---

## 11. Testing Strategy

### 11.1 Unit Tests

- **Rules evaluator:** For every rule in every XD, assert correct match/no-match for 10+ context combinations
- **Slot resolver:** Test each slot type's binding, compute, format, and visible_if logic
- **Cache key generation:** Assert that semantically equivalent contexts produce identical keys
- **A2UI serializer:** Assert output validates against A2UI schema
- **CEL expressions:** Fuzz test with random context inputs; assert no panics

### 11.2 Integration Tests

- **Neo4j queries:** Seed test graph with known data; assert each query returns expected subgraph
- **Runtime pipeline:** End-to-end render test for each canonical template × each supported channel
- **MCP tools:** Mock agent calls each tool; assert correct Neo4j state changes and render output
- **Cache invalidation:** Publish new XD version; assert old cache entries are evicted

### 11.3 Contract Tests

- **A2UI conformance:** Every runtime output validated against A2UI v0.8 JSON Schema
- **AG-UI conformance:** Every event emitted validated against AG-UI event type schema
- **MCP conformance:** Tool schemas validated against MCP specification

### 11.4 Performance Tests

- Render 1,000 concurrent requests for same XD; assert p95 < 10ms
- Render 1,000 concurrent requests for 100 different XDs; assert p95 < 50ms
- Neo4j query under 10,000 skill nodes; assert indexed reads < 5ms
- Cache hit rate > 95% for stable XD over 10,000 identical context requests

### 11.5 Security Tests

- Assert no query returns nodes from different `org_id`
- Assert PII fields stripped from A2UI output when compliance rule blocks channel
- Assert webhook signature validation rejects tampered payloads
- Assert AI fallback cannot be triggered without `ai_fallback_enabled: true` on skill node

### 11.6 Governance Tests

- Assert blocking compliance rule prevents skill execution
- Assert deprecated skill triggers notification to dependent agents
- Assert breaking version change requires admin approval before staging promotion

---

## 12. MVP Scope and Roadmap

### 12.1 MVP (Weeks 1–12)

**In scope:**

| Component | MVP Implementation |
|---|---|
| Neo4j graph | Skill, XD, Template, DataSchema, Agent, Channel, RenderSignal nodes; all edges listed in §5.2 |
| XD schema | Slots, rules, channels, actions (no state machine, no i18n) |
| Runtime | Full rules engine (CEL), slot resolution, A2UI output, Redis cache |
| MCP Gateway | 3 tools: find_skill, execute_skill, dispatch_action |
| A2UI output | Full A2UI v0.8 component tree (using system component catalog) |
| AG-UI transport | SSE delivery of A2UI events |
| Authoring Studio | AI chat pane + YAML editor + live validation + preview button |
| Channels | Web + chatbot/copilot |
| Templates | 5 canonical templates: single-step form, multi-step form, calculator, metric card, confirmation |
| Multi-tenancy | org_id on every node; JWT-based auth |

**Out of scope (v2):**
- Full Authoring Studio UI (rules workbench, preview bench, publish console)
- Semantic vector search for find_skill (keyword only in MVP)
- Mobile and portal channels
- Fabric Mesh CDN distribution
- Cross-org skill sharing
- Policy engine (compliance rules in graph but not enforced at runtime in MVP)
- subscribe_to_actions MCP tool

### 12.2 Build Sequence

**Phase 1 — Graph + Schema (Weeks 1–3)**
- Set up Neo4j with constraints and indexes from §5.4
- Implement all node types and edge types from §5.1 and §5.2
- Seed with 5 system templates and example org data
- Write and test all key Cypher queries from §5.3

**Phase 2 — Runtime (Weeks 3–6)**
- Implement CEL rules evaluator
- Implement slot resolver (bind, compute, format, visible_if)
- Implement A2UI serializer
- Implement Redis cache (key generation, TTL, invalidation)
- Implement RenderSignal writer (async)
- POST /render endpoint

**Phase 3 — MCP Gateway (Weeks 6–8)**
- Implement find_skill (keyword search on Neo4j)
- Implement execute_skill (orchestrates Neo4j lookup → runtime → A2UI output)
- Implement dispatch_action (webhook forwarding + payload validation)
- AG-UI SSE stream endpoint

**Phase 4 — Authoring Studio (Weeks 8–10)**
- AI chat pane (Claude API integration)
- YAML editor with live schema validation
- Preview button (calls POST /render, renders A2UI in iframe)
- Publish to Neo4j (creates/updates Skill and XD nodes)

**Phase 5 — Pilot (Weeks 10–12)**
- Onboard 1–2 design partners
- Author 10+ XDs in production
- Instrument telemetry (RenderSignal analytics)
- Validate: < 10ms p95 render, 0 tokens, non-developer authors XD via chat

### 12.3 Success Metrics (End of MVP)

| Metric | Target |
|---|---|
| p95 render latency | < 10ms |
| AI tokens per 1,000 renders | 0 (deterministic path) |
| Cache hit rate | > 90% |
| XDs authored by non-developers | ≥ 1 |
| Production XDs | ≥ 10 |
| Channels supported | 2 (web + chatbot) |
| A2UI conformance | 100% of outputs pass schema validation |

---

## Appendix A: Slot Types (MVP)

| Type | A2UI Component | Purpose |
|---|---|---|
| `text-input` | TextField | Free-form text |
| `currency-input` | OmniUI.CurrencyInput | Money with validation |
| `select` | Select | Dropdown choice |
| `checkbox` | Checkbox | Boolean toggle |
| `range-slider` | OmniUI.RangeSlider | Numeric range |
| `date-input` | DatePicker | Date selection |
| `metric-display` | OmniUI.MetricDisplay | Read-only computed value |
| `text-display` | Text | Read-only label/message |
| `button` | Button | Action trigger |
| `group` | Container | Logical slot grouping |

---

## Appendix B: Rule Priority Tiers

| Priority | Tier | Examples |
|---|---|---|
| 5 | Emergency override | Legal blocks, compliance emergency patches |
| 4 | Channel | `channel == "chatbot"`, `channel == "copilot"` |
| 3 | Organisation policy | Tenant brand rules, approved template overrides |
| 2 | Role / segment | `user.role == "advisor"`, `user.tier == "premium"` |
| 1 | Locale / device | `locale == "en-GB"`, `device.width < 500` |
| 0 | Base | Template defaults (always present) |

Higher priority wins. Within the same priority, later declaration wins.

---

## Appendix C: Compute Expression Functions (MVP)

| Function | Description |
|---|---|
| `PMT(rate, nper, pv)` | Loan payment calculation |
| `ROUND(value, decimals)` | Round to N decimal places |
| `IF(condition, true_val, false_val)` | Conditional value |
| `MIN(a, b)` | Minimum of two values |
| `MAX(a, b)` | Maximum of two values |
| `CONCAT(a, b, ...)` | String concatenation |
| `FORMAT(value, pattern)` | Format number/date as string |
| `LOOKUP(table_id, key)` | Look up value in a registered lookup table |

All functions are sandboxed. No I/O, no external calls, no loops.

---

## Appendix D: Protocol References

- **A2UI specification:** https://github.com/google/A2UI
- **A2UI documentation:** https://a2ui.org
- **AG-UI protocol:** https://ag-ui.com
- **MCP specification:** https://modelcontextprotocol.io
- **CEL specification:** https://cel.dev
- **Neo4j Cypher reference:** https://neo4j.com/docs/cypher-manual
- **JSON Schema:** https://json-schema.org

---

*End of OmniUI Fabric Platform Specification v1.0*
