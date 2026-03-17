# Agent Instructions

You're working inside the **WAT Framework v2** — a project orchestration system that adapts to what you're actually building.

**Templates path:** `~/Desktop/Dev/templates/`
Use this path during initialization to read template files for scaffolding. Templates are centralized — do NOT copy the templates folder into the project.

---

## Core Philosophy

This architecture separates reasoning from execution. You handle orchestration and decision-making; deterministic code handles execution.

**How this manifests depends on project type:**

- **Product projects** (web apps, SPAs, dashboards, mobile): The deterministic layer IS the source code (TypeScript, React components, database schemas). Your job is to reason about architecture, read context, and write clean code. No separate Python scripts needed.

- **Automation projects** (data pipelines, integrations, scheduled tasks): The deterministic layer is Python/shell scripts in `tools/`. Your job is to read workflow SOPs and call the right scripts. Workflows in `workflows/` define the process.

- **Hybrid projects**: Both tracks. Specify which parts get which treatment during initialization.

**Why separation matters:** When AI handles every step directly, accuracy compounds negatively. Five steps at 90% accuracy = 59% success. Offload execution to deterministic code (whether that's TypeScript components or Python scripts); focus on orchestration and architecture.

---

## Context System

### Context Files

```
context/
├── BRIEF.md        # Goals, users, scope
├── BRAND.md        # Brand guidelines, tone, visual direction [UI projects only]
├── STACK.md        # Tech stack, conventions, git workflow, deploy
├── DECISIONS.md    # Architecture Decision Records (ADRs)
├── CHANGELOG.md    # What shipped and when (Keep a Changelog format)
└── ROADMAP.md      # Phases, task status, verification commands

Root-level (optional):
├── PRD.md          # Product Requirements Document (current state)
└── PRD_V0.md       # Target architecture PRD (aspirational spec)
```

### Auto-Load Rules

Before starting work, load context based on task type:

| Task Type | Auto-Load These Files |
|-----------|----------------------|
| **Session Start / Orientation** | `context/ROADMAP.md`, `context/BRIEF.md` |
| UI / Frontend / Styling | `design-system/MASTER.md`, `context/BRAND.md` |
| Planning / Features | `skills/superpowers/brainstorming/`, `context/BRIEF.md` |
| Implementation | `skills/superpowers/writing-plans/`, `context/STACK.md` |
| Testing | `skills/superpowers/test-driven-development/` |
| Bug Fixing | `skills/superpowers/systematic-debugging/` |

**Session start is mandatory.** Always load ROADMAP.md first to know where the project stands before doing anything else.

### MEMORY.md vs DECISIONS.md

Both capture lessons, but at different abstraction levels:

| File | Register | When to Use | Example |
|------|----------|-------------|---------|
| **MEMORY.md** | Working memory | Patterns, preferences, gotchas for active development | "Zustand v5: return primitives from selectors" |
| **DECISIONS.md** | Permanent record | Architectural choices, framework workarounds, rejected alternatives | "ADR-005: Zustand v5 selectors must return primitives — Context, Decision, Consequences" |

**Rule:** If a gotcha could affect a new feature you're about to build, write an ADR. If it's a reminder for an existing pattern, note it in MEMORY.md.

### Ask First (Hybrid Mode)

For ambiguous requests:
- "Should I load the design system for this?"
- "This touches both frontend and backend — which context should I prioritize?"
- "Multiple skills apply here. Want me to use [X] or [Y] approach?"

---

## ADR Culture

ADRs in DECISIONS.md are the highest-value documentation in any project. Write one immediately when you encounter:

1. **A framework bug that required a design workaround** — e.g., bundler resolving wrong file extensions, state manager re-render failures
2. **A technology choice with meaningful alternatives rejected** — e.g., custom parser vs third-party library, REST vs GraphQL
3. **A data model decision with significant consequences** — e.g., separate join table vs inline fields, normalized vs denormalized
4. **A tooling gotcha that would waste hours if rediscovered** — e.g., ORM method that silently skips reactive updates, CSS-in-JS specificity conflicts

### ADR Format

```markdown
### ADR-NNN: [Short title]

**Date:** [date]
**Status:** Proposed | Accepted | Deprecated

**Context:** What problem were you solving?
**Decision:** What did you decide?
**Consequences:**
- (+) benefits
- (-) tradeoffs
```

**Rule: Don't let a session end after discovering a hard-won lesson without writing the ADR.** The cost of writing it is 5 minutes. The cost of rediscovering it is hours.

---

## Verification Culture

Every phase in ROADMAP.md must have a verification table answering: "How do we know this phase is done?"

### Typical Verification Steps

**Product projects:**
```
| Checkpoint | Command/Action |
|------------|----------------|
| TypeScript compiles | npx tsc --noEmit |
| Tests pass | npm run test |
| Dev server runs | npm run dev (no console errors) |
| Feature works | [describe what to click/check manually] |
```

**Automation projects:**
```
| Checkpoint | Command/Action |
|------------|----------------|
| Script runs | python tools/[script].py --dry-run |
| Output correct | diff expected_output.json actual_output.json |
| No side effects | Check target service state |
```

**Rules:**
- Do NOT mark a roadmap phase as "done" until all verification steps pass
- Do NOT start Phase N+1 until Phase N is verified
- After each phase completes, update CHANGELOG.md with a version entry

---

## CHANGELOG Discipline

Use Keep a Changelog format. Tie versions to roadmap phases. See `~/Desktop/Dev/templates/context/CHANGELOG-template.md` for structure.

**Versioning:** Phase 1 done = v0.1.0. Bugfix during Phase 1 = v0.1.1. Phase 2 done = v0.2.0. Post-MVP: switch to semantic versioning.

---

## Skill System

### Acquisition Hierarchy

**Never create skills from scratch without searching first.**

```
1. SEARCH  → Check trusted repos for existing skills
2. INSTALL → Copy skill to local skills/ folder
3. ADAPT   → Customize for project conventions (MANDATORY)
4. CREATE  → Custom skill ONLY when nothing exists
```

### Trusted Skill Sources

See `.wat/skill-sources.md` for full details. Summary:

| Source | Focus | Key Skills |
|--------|-------|------------|
| **Superpowers** | Dev workflow | brainstorming, writing-plans, TDD, debugging, subagent-driven-dev |
| **UI-UX Pro Max** | Design intelligence | 67 UI styles, 96 palettes, typography, patterns |
| **Anthropic Plugins** | Code quality | code-simplifier, code-reviewer, frontend-design |

### Skill Adaptation (Mandatory)

After installing each skill:
1. Open the skill file
2. Add a `## Project Adaptation Notes` block at the top with:
   - Stack-specific notes (e.g., "This project uses Dexie — use Table.update() not Collection.modify()")
   - Naming conventions in use
   - Patterns already established that the skill should follow
3. Mark `adapted: yes` in `.registry`

**A skill that is installed but not adapted is half-installed.** The adaptation step is what connects generic methodology to your specific codebase.

### Skills Registry

Track all installed skills in `skills/.registry`:
```
# Format: skill-name | source | version | install-date | adapted
brainstorming | obra/superpowers | 4.3.0 | 2024-01-15 | yes
systematic-debugging | obra/superpowers | 4.3.0 | 2024-01-15 | yes
```

---

## Design System

### Philosophy

Every visual decision traces back to a token. Every component traces back to the design system. When something changes, it changes in one place.

### Source of Truth

Your `design-system/base.jsx` is the canonical source. **Never modify it directly.** Read from it, generate derived files, document changes.

### Token Pipeline (Unidirectional)

```
design-system/base.jsx            ← Source of truth (read-only after creation)
        ↓ generate
design-system/tokens/tokens.css   ← CSS custom properties (--color-primary, etc.)
design-system/tokens/semantic.css ← Semantic layer (--bg-primary, --fg-secondary, etc.)
design-system/tokens/tokens.ts    ← TypeScript exports for programmatic access
        ↓ import in
src/index.css                     ← @import tokens.css + semantic.css
                                     @theme { ... } ← REQUIRED for Tailwind v4
```

### Tailwind v4 @theme Requirement

**Tokens must be declared TWICE** — once in `tokens.css` as CSS custom properties (for runtime `var()` usage), and once inside `@theme {}` in `index.css` (for Tailwind utility generation). The `@theme` block is what makes `bg-primary` work as a Tailwind class. Without it, the CSS variable exists but generates no utility classes.

### Where Components Live

**Production components live in `src/components/ui/`**, not in `design-system/`. The `design-system/base.jsx` serves as the visual specification and component reference gallery. `src/components/` is the production implementation.

### Design System Rules

1. **Never hardcode** — Use tokens for colors, spacing, typography, radius
2. **Check before creating** — Look in `src/components/ui/` first
3. **Document changes** — Log in `design-system/CHANGELOG.md`
4. **Evolve together** — When base.jsx updates, regenerate all token files

---

## Initialization Protocol

When asked to **"initialize"**, **"init"**, or **"initialize the project"**:

### Phase 1: Discovery

```
1. Check for existing CLAUDE.md → Read it
2. Check for existing codebase → Analyze structure, framework, patterns
3. Check for context/ folder → Load existing context
4. Check for skills/ folder → Note installed skills
5. Check for design-system/ → Note existing tokens
6. Check for uploaded files → Extract context from them
```

### Phase 2: Context Extraction

If files are uploaded (brief, PRD, brand guidelines, design system JSX):

```
1. Parse each uploaded file
2. Extract relevant information:
   - Goals, users, features → context/BRIEF.md
   - Brand guidelines → context/BRAND.md
   - Tech stack details → context/STACK.md
   - Design tokens → design-system/base.jsx
3. If PRD.md or PRD_V0.md exists at project root:
   - Reference it in BRIEF.md as the detailed spec
   - If no PRD exists, ask: "Is there a product spec? Should I generate one?"
4. Document git workflow in STACK.md:
   - Branch strategy, commit conventions, merge/PR process
   - Deploy pipeline: CI/CD, environments, commands, env var locations
5. Ask only for GAPS: "I extracted X, Y, Z. What's missing is [A, B]?"
```

### Phase 3: Project Type Classification

```
Ask: "What type of project is this?"

[product]     → Web app / SPA / mobile / dashboard
               Scaffold: context/, skills/, design-system/tokens/, src/
               Skip: workflows/, tools/

[automation]  → Data pipelines / API integrations / scheduled tasks
               Scaffold: context/, skills/, workflows/, tools/
               Skip: design-system/ (unless it has a UI)

[hybrid]      → Service with UI + backend + automated processes
               Full scaffold

Follow up: "Is there a design provided (Figma, JSX, image)
or should I generate a design system from scratch?"
```

### Phase 4: Adaptive Scaffolding

Create ONLY the directories relevant to the project type. Read template files from `~/Desktop/Dev/templates/` and use them as the starting structure for each file in the project.

**Template → Project mapping:**
```
~/Desktop/Dev/templates/                    →  project-root/
├── context/*-template.md                   →  context/*.md
├── design-system/MASTER-template.md        →  design-system/MASTER.md
├── skills/registry-template                →  skills/.registry
├── skills/custom/TEMPLATE.md               →  skills/custom/TEMPLATE.md
├── .wat/manifest-template                  →  .wat/manifest
└── .wat/skill-sources-template.md          →  .wat/skill-sources.md
```

**Product projects scaffold:**
```
context/
├── BRIEF.md, BRAND.md, STACK.md, DECISIONS.md, CHANGELOG.md, ROADMAP.md

design-system/
├── base.jsx, MASTER.md, CHANGELOG.md
└── tokens/ (tokens.css, semantic.css, tokens.ts)

skills/
├── .registry
├── superpowers/
└── custom/TEMPLATE.md

.wat/
├── manifest
└── skill-sources.md

.tmp/

src/                  ← Created by framework CLI (Vite, Next.js, etc.), not by WAT
```

**Automation projects scaffold:**
```
context/
├── BRIEF.md, STACK.md, DECISIONS.md, CHANGELOG.md, ROADMAP.md

workflows/    ← Markdown SOPs
tools/        ← Python/shell scripts

skills/
├── .registry
├── superpowers/
└── custom/TEMPLATE.md

.wat/
├── manifest
└── skill-sources.md

.tmp/
```

### Phase 5: Skill Installation (MANDATORY)

**Superpowers is always installed. This step is non-negotiable.**

```
1. Install Superpowers (REQUIRED — do not skip):
   /plugin marketplace add obra/superpowers-marketplace
   /plugin install superpowers@superpowers-marketplace

   This installs 10 skills:
   - Core: brainstorming, writing-plans, test-driven-development,
     systematic-debugging, subagent-driven-development
   - Supporting: executing-plans, verification-before-completion,
     requesting-code-review, receiving-code-review, dispatching-parallel-agents

2. ADAPT each installed skill immediately (see Skill Adaptation section above)
   - Add project-specific notes to each SKILL.md
   - Mark adapted: yes in .registry

3. Based on project type, recommend additional skills:
   - Has UI but no design provided? → Recommend UI-UX Pro Max
   - Complex codebase? → Recommend code-simplifier

4. Ask for confirmation before installing optional skills
```

### Phase 6: Design System Bootstrap

If design system JSX provided:

```
1. Copy to design-system/base.jsx (preserve original)
2. Parse tokens object
3. Generate tokens.css, semantic.css, tokens.ts
4. Create MASTER.md using `~/Desktop/Dev/templates/design-system/MASTER-template.md` (fill ALL placeholders — no [DATE] gaps)
5. If Tailwind v4: create src/index.css with @import + @theme {} block
6. Verify: bg-primary, text-fg-secondary, font-display resolve as Tailwind utilities
```

If no design system provided:

```
1. Ask about visual direction (minimal, bold, dark mode, etc.)
2. Search UI-UX Pro Max for matching style
3. Recommend palette, typography, spacing
4. Generate base.jsx from recommendations
5. Confirm before creating
```

### Phase 7: Roadmap Creation

```
1. Read context/BRIEF.md — extract Core Features
2. Group features into 3-5 phases with names and goals
3. Create context/ROADMAP.md with:
   - Status legend (done | current | next | backlog)
   - Phase tables with #, Task, Status, Key Files columns
   - Verification table (commands/actions to confirm each phase)
   - Questions the MVP needs to answer
4. Ask: "Does this phase breakdown match your plan?"
```

### Phase 8: Summary

```
Present:
- What context was extracted/created
- What skills were installed (and adapted)
- What design tokens are available
- Current roadmap phase and first task
- Recommended next action

Ask: "Ready to start, or want to adjust anything?"
```

---

## Trigger Words

| Say This | Does This |
|----------|-----------|
| "initialize" / "init" | Full project initialization |
| "where are we" / "status" | Load ROADMAP.md, summarize current phase |
| "update design system" | Regenerate tokens from base.jsx |
| "write an ADR" | Template prompt → DECISIONS.md |
| "update changelog" | Prompt for version + changes → CHANGELOG.md |
| "update roadmap" | Mark tasks done, identify next task |
| "list skills" | Show skills/.registry |

---

## WAT Manifest

The `.wat/manifest` tracks project identity only. All status is tracked in dedicated files.

```
# WAT Framework Manifest
project_name: [PROJECT_NAME]
project_type: [product|automation|hybrid]
codebase_type: greenfield
initialized: [date]
framework_version: 2.0
design_system: [DESIGN_SYSTEM_NAME or "none"]

# For current status, read:
# - context/ROADMAP.md (project phase and task status)
# - skills/.registry (installed and adapted skills)
# - context/CHANGELOG.md (what shipped)
# - context/STACK.md (tech stack, git workflow, deploy)
```

---

## Self-Improvement Loop

When something breaks or surprises you:

1. Fix the immediate problem
2. Ask: "Would this waste hours if a future developer (or a new session) hit it?"
3. If yes → write ADR in DECISIONS.md immediately
4. If it's a pattern preference (not a gotcha) → note in MEMORY.md
5. If it's a workflow improvement → suggest updating CLAUDE.md

**The loop closes when the lesson is documented, not when the code is fixed.**

---

## File Structure

Structure depends on project type determined at init.

```
project-root/

ALWAYS CREATED:
├── CLAUDE.md                    # This file (orchestrator)
├── PRD.md                       # Product Requirements Document (optional)
├── context/
│   ├── BRIEF.md                 # Goals, users, scope
│   ├── STACK.md                 # Tech stack, git workflow, deploy
│   ├── DECISIONS.md             # ADRs
│   ├── CHANGELOG.md             # Release history
│   └── ROADMAP.md               # Phase tracker + verification
├── skills/
│   ├── .registry                # Installed skills manifest
│   ├── superpowers/             # Always installed
│   └── custom/                  # Project-specific (last resort)
├── .wat/
│   ├── manifest                 # Project identity (simplified)
│   └── skill-sources.md         # Trusted repos
└── .tmp/                        # Disposable intermediates

PRODUCT PROJECTS add:
├── context/BRAND.md             # Brand guidelines
└── design-system/
    ├── base.jsx                 # Source of truth (read-only)
    ├── MASTER.md                # Token documentation
    ├── CHANGELOG.md             # Design evolution log
    └── tokens/
        ├── tokens.css           # CSS custom properties
        ├── semantic.css         # Semantic mappings
        └── tokens.ts            # TypeScript exports

AUTOMATION PROJECTS add:
├── workflows/                   # Markdown SOPs
└── tools/                       # Python/shell execution scripts
```

---

## Bottom Line

You sit between what I want (context + roadmap) and what gets done (code or scripts). Your job:

1. **Load context first** — ROADMAP.md tells you where we are
2. **Read instructions** — Check skills, design system, DECISIONS.md
3. **Make smart decisions** — Use existing capabilities; search before creating
4. **Execute with verification** — Don't claim done without evidence
5. **Document hard-won lessons** — ADRs for gotchas, MEMORY.md for patterns
6. **Keep improving** — Evolve CHANGELOG, ROADMAP, DECISIONS as you go

For UI work, the design system is your constraint and guide. Every visual decision traces to a token.

For development work, use Superpowers methodology. Brainstorm → Plan → Execute with TDD.

**Stay pragmatic. Stay reliable. Keep learning. Search before creating.**
