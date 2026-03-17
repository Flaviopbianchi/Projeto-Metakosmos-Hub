# Agent Instructions — Brownfield Variant

You're working inside the **WAT Framework v2** — adapted for **existing codebases** that may be messy, undocumented, or poorly structured.

**Templates path:** `~/Desktop/Dev/templates/`
Use this path during initialization to read template files for scaffolding. Templates are centralized — do NOT copy the templates folder into the project.

**Brownfield mindset:** Audit first, organize second, build third. The existing codebase is the project — WAT wraps around it, not the other way around.

---

## Core Philosophy

This architecture separates reasoning from execution. You handle orchestration and decision-making; deterministic code handles execution.

**How this manifests depends on project type:**

- **Product projects** (web apps, SPAs, dashboards, mobile): The deterministic layer IS the source code (TypeScript, React components, database schemas). Your job is to reason about architecture, read context, and write clean code. No separate Python scripts needed.

- **Automation projects** (data pipelines, integrations, scheduled tasks): The deterministic layer is Python/shell scripts in `tools/`. Your job is to read workflow SOPs and call the right scripts. Workflows in `workflows/` define the process.

- **Hybrid projects**: Both tracks. Specify which parts get which treatment during initialization.

**Why separation matters:** When AI handles every step directly, accuracy compounds negatively. Five steps at 90% accuracy = 59% success. Offload execution to deterministic code (whether that's TypeScript components or Python scripts); focus on orchestration and architecture.

**Brownfield addition:** In existing codebases, the first step is always understanding what's already there. Don't assume. Don't restructure. Audit, document, then improve incrementally.

---

## Context System

### Context Files

```
context/
├── BRIEF.md          # Goals, users, scope
├── BRAND.md          # Brand guidelines, tone, visual direction [UI projects only]
├── STACK.md          # Tech stack, conventions, git workflow, deploy
├── DECISIONS.md      # Architecture Decision Records (ADRs)
├── CHANGELOG.md      # What shipped and when (Keep a Changelog format)
├── ROADMAP.md        # Phases, task status, verification commands
└── AUDIT-REPORT.md   # Codebase health assessment [brownfield only]

Root-level (optional):
├── PRD.md            # Product Requirements Document (current state)
└── PRD_V0.md         # Target architecture PRD (aspirational spec)
```

### Auto-Load Rules

Before starting work, load context based on task type:

| Task Type | Auto-Load These Files |
|-----------|----------------------|
| **Session Start / Orientation** | `context/ROADMAP.md`, `context/BRIEF.md`, `context/AUDIT-REPORT.md` |
| UI / Frontend / Styling | `design-system/MASTER.md`, `context/BRAND.md` |
| Planning / Features | `skills/superpowers/brainstorming/`, `context/BRIEF.md` |
| Implementation | `skills/superpowers/writing-plans/`, `context/STACK.md` |
| Testing | `skills/superpowers/test-driven-development/` |
| Bug Fixing | `skills/superpowers/systematic-debugging/` |
| Cleanup / Refactoring | `context/AUDIT-REPORT.md`, `context/ROADMAP.md` |

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
5. **An existing pattern discovered during audit** — document what exists BEFORE changing it

### ADR Format

```markdown
### ADR-NNN: [Short title]

**Date:** [date]
**Status:** Proposed | Accepted | Inherited | Deprecated

**Context:** What problem were you solving?
**Decision:** What did you decide?
**Consequences:**
- (+) benefits
- (-) tradeoffs
```

**"Inherited" status** is for patterns already in the codebase that you're documenting retroactively during audit. These are not decisions you made — they're decisions you found.

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

**Versioning:** Phase 0 (cleanup) = v0.0.1 per task. Phase 1 done = v0.1.0. Bugfix during Phase 1 = v0.1.1. Phase 2 done = v0.2.0. Post-MVP: switch to semantic versioning.

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

**Note:** This section is conditional for brownfield projects. If the existing codebase has no design system and the user doesn't want to formalize one, skip this section entirely.

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

### Phase 1: Codebase Audit

Deep scan of the existing codebase. Produce a structured report BEFORE making any changes. Use `~/Desktop/Dev/templates/context/AUDIT-REPORT-template.md` as output format.

```
1. File inventory
   - Count files by extension
   - Detect stale/generated files (e.g., .js alongside .tsx)
   - Flag duplicates, empty files, files with no imports
   - Measure codebase size (files, LOC by language)

2. Dependency audit
   - Read package.json / requirements.txt / go.mod
   - Flag unused dependencies
   - Check for version conflicts or outdated packages

3. Architecture mapping
   - Identify entry points (main, index, app)
   - Map routing, state management, database/API layers
   - Map component/module hierarchy (top 2 levels)

4. Code health signals
   - Find TODO/FIXME/HACK comments (count + locations)
   - Detect dead code (exported but never imported)
   - Check for circular dependencies
   - Note test coverage (any tests? what framework?)
   - Check for .env or credentials in source

5. Output structured Audit Report → context/AUDIT-REPORT.md
   - Present findings by severity (critical / warning / info)
   - Ask: "Should I proceed with organizing this codebase?"
```

### Phase 2: Context Generation

Generate context files FROM what the audit found. Do not ask the user to provide what the code already tells you.

```
1. Generate context/BRIEF.md
   - Infer from README, package.json description, route structure
   - Ask user to fill gaps: "I inferred [X, Y, Z]. What's the actual goal?"

2. Generate context/STACK.md
   - Extract from actual dependencies and code patterns
   - Document conventions already in use
   - Note gotchas discovered during audit
   - Document git workflow: branch strategy, commit conventions, merge/PR process
   - Document deploy pipeline: CI/CD, environments, commands, env var locations

3. If PRD.md exists at project root:
   - Reference it in BRIEF.md as the detailed spec
   - If no PRD exists, ask: "Is there a product spec? Should I generate one from the codebase?"

4. Generate context/DECISIONS.md using brownfield template
   - Document existing architectural patterns as retroactive ADRs
   - Use "Inherited" status for patterns found, not chosen
   - Example: "ADR-001 (Inherited): Project uses Redux for state management"

5. If project has UI:
   - Ask: "Is there a design system? Should I formalize one from existing styles?"
   - If yes → generate BRAND.md from existing colors/fonts/spacing
```

### Phase 3: Project Type Classification

```
Ask: "What type of project is this?"

[product]     → Web app / SPA / mobile / dashboard
               Skip: workflows/, tools/

[automation]  → Data pipelines / API integrations / scheduled tasks
               Skip: design-system/ (unless it has a UI)

[hybrid]      → Service with UI + backend + automated processes
               Full scaffold
```

### Phase 4: Overlay Scaffolding

The WAT structure wraps AROUND the existing codebase. Source code stays where it is.

```
Create WAT directories alongside existing structure:
- context/          ← Generated in Phase 2
- skills/           ← New
- .wat/             ← New
- .tmp/             ← New

Read template files from ~/Desktop/Dev/templates/ for:
- skills/.registry           ← from skills/registry-template
- skills/custom/TEMPLATE.md  ← from skills/custom/TEMPLATE.md
- .wat/manifest              ← from .wat/manifest-template
- .wat/skill-sources.md      ← from .wat/skill-sources-template.md

Do NOT:
- Move existing source files
- Restructure existing folders
- Rename existing conventions
- Delete anything without explicit approval
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
   - Add project-specific notes referencing patterns found in the audit
   - Mark adapted: yes in .registry

3. Brownfield-specific recommendations:
   - Messy codebase? → Recommend code-simplifier
   - No tests? → Prioritize TDD skill adaptation
   - Complex UI with no design system? → Recommend UI-UX Pro Max

4. Ask for confirmation before installing optional skills
```

### Phase 6: Design System Bootstrap (Conditional)

Only if the project has UI AND the user wants to formalize a design system.

```
If existing design tokens/theme found:
1. Extract into design-system/base.jsx format
2. Generate token files (tokens.css, semantic.css, tokens.ts)
3. Document in MASTER.md using ~/Desktop/Dev/templates/design-system/MASTER-template.md
4. Do NOT refactor existing components to use new tokens yet
   (that's a ROADMAP task, not an init task)

If no design system and user doesn't want one:
- Skip this phase entirely
- Note in manifest: design_system: none
```

### Phase 7: Cleanup Roadmap

Before any feature work, create a Phase 0 in ROADMAP.md using `~/Desktop/Dev/templates/context/ROADMAP-brownfield-template.md`.

```
1. From Audit Report, extract cleanup tasks ranked by impact:
   - Critical: security issues, exposed credentials, broken builds
   - High: dead files, unused dependencies, stale compiled artifacts
   - Medium: missing types, inconsistent naming, no tests
   - Low: TODO comments, minor code style issues

2. Create context/ROADMAP.md with:
   - Phase 0: Cleanup (each task is optional — user approves which ones)
   - Phase 1+: Actual feature/improvement work
   - Verification table

3. Ask: "Which cleanup tasks do you want to tackle? All are optional."
```

### Phase 8: Feature Roadmap

```
1. Ask user about goals: "What do you want to build/fix/improve?"
2. Group into phases after Phase 0
3. Add to ROADMAP.md with verification steps
4. Ask: "Does this phase breakdown match your plan?"
```

### Phase 9: Summary

```
Present:
- Audit findings summary (critical issues, codebase size, health score)
- What context was generated
- What skills were installed (and adapted)
- Phase 0 cleanup tasks (approved vs skipped)
- Current roadmap phase and first task
- Recommended next action

Ask: "Ready to start, or want to adjust anything?"
```

---

## Codebase Health Rules

When working in an inherited codebase, follow these principles:

### Minimal Blast Radius
- Don't refactor code you're not actively changing
- Fix what you touch, leave what you don't
- Prefer incremental improvement over big-bang rewrites

### Document Before Changing
- Write an ADR BEFORE changing an existing architectural pattern
- The ADR should explain: what exists now, why you're changing it, what the new approach is
- This prevents "why did they change this?" confusion in future sessions

### Flag, Don't Fix (Unless Asked)
- When you discover unrelated issues during work, add them to ROADMAP.md backlog
- Don't fix them unless the user asks or they block your current task
- Exception: security issues should be flagged immediately

### Respect Existing Conventions
- Match the naming patterns already in use (even if you'd prefer different ones)
- Match the file organization already in use
- Only propose convention changes as an explicit ROADMAP task, not as a side effect

### Progressive Enhancement
- Add types gradually (don't convert the whole codebase to TypeScript at once)
- Add tests for code you modify (don't write tests for untouched code)
- Add documentation for patterns you discover (in DECISIONS.md or STACK.md)

---

## Trigger Words

| Say This | Does This |
|----------|-----------|
| "initialize" / "init" | Full brownfield initialization (9 phases) |
| "audit" / "audit codebase" | Run Phase 1 codebase audit only |
| "cleanup" | Show Phase 0 cleanup tasks from ROADMAP.md |
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
codebase_type: brownfield
initialized: [date]
framework_version: 2.0
design_system: [DESIGN_SYSTEM_NAME or "none"]

# For current status, read:
# - context/ROADMAP.md (project phase and task status)
# - context/AUDIT-REPORT.md (codebase health assessment)
# - skills/.registry (installed and adapted skills)
# - context/CHANGELOG.md (what shipped)
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

WAT directories are created alongside the existing codebase, not replacing it.

```
project-root/

EXISTING CODE (untouched during init):
├── src/                         # Or whatever the existing structure is
├── package.json                 # Existing dependencies
├── README.md                    # Existing docs
└── ...                          # Everything else stays in place

WAT OVERLAY (created during init):
├── CLAUDE.md                    # This file (orchestrator)
├── context/
│   ├── AUDIT-REPORT.md          # Codebase health assessment
│   ├── BRIEF.md                 # Goals, users, scope (generated from code)
│   ├── STACK.md                 # Tech stack (extracted from dependencies)
│   ├── DECISIONS.md             # ADRs (retroactive + new)
│   ├── CHANGELOG.md             # Changes from this point forward
│   └── ROADMAP.md               # Phase 0: Cleanup + feature phases
├── skills/
│   ├── .registry                # Installed skills manifest
│   ├── superpowers/             # Always installed
│   └── custom/                  # Project-specific (last resort)
├── .wat/
│   ├── manifest                 # Project identity
│   └── skill-sources.md         # Trusted repos
└── .tmp/                        # Disposable intermediates

CONDITIONAL:
├── context/BRAND.md             # Only if UI project
└── design-system/               # Only if user wants to formalize one
```

---

## Bottom Line

You sit between what I want (context + roadmap) and what gets done (code or scripts). Your job:

1. **Audit first** — Understand the existing codebase before changing anything
2. **Load context** — ROADMAP.md tells you where we are, AUDIT-REPORT.md tells you the health
3. **Read instructions** — Check skills, design system, DECISIONS.md
4. **Document before changing** — ADR first, then modify
5. **Minimal blast radius** — Fix what you touch, flag what you don't
6. **Execute with verification** — Don't claim done without evidence
7. **Document hard-won lessons** — ADRs for gotchas, MEMORY.md for patterns
8. **Keep improving** — Evolve CHANGELOG, ROADMAP, DECISIONS as you go

For UI work, the design system is your constraint and guide (if one exists). Every visual decision traces to a token.

For development work, use Superpowers methodology. Brainstorm → Plan → Execute with TDD.

**Audit. Document. Improve incrementally. Search before creating.**
