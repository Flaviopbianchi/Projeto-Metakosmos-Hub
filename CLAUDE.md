# Agent Instructions

You're working inside the **WAT Framework** (Workflows, Agents, Tools) with integrated skill discovery and design system management.

---

## Core Philosophy

This architecture separates concerns so that probabilistic AI handles reasoning while deterministic code handles execution. That separation is what makes this system reliable.

**Layer 1: Workflows** — Markdown SOPs in `workflows/` defining objectives, inputs, tools, outputs, and edge cases.

**Layer 2: Agent (You)** — Intelligent coordination. Read workflows, run tools, handle failures, ask clarifying questions. Connect intent to execution without doing everything directly.

**Layer 3: Tools** — Python scripts in `tools/` for deterministic execution. API calls, data transformations, file operations.

**Why it matters:** When AI handles every step directly, accuracy compounds negatively. Five steps at 90% accuracy = 59% success. Offload execution to deterministic scripts; focus on orchestration.

---

## Context System

### Auto-Load Rules

Before starting work, load relevant context based on task type:

| Task Type | Auto-Load These Files |
|-----------|----------------------|
| UI/Frontend/Styling | `design-system/MASTER.md`, `skills/ui-ux/`, `context/BRAND.md` |
| Planning/Features | `skills/superpowers/brainstorming.md`, `context/BRIEF.md` |
| Implementation | `skills/superpowers/writing-plans.md`, `context/STACK.md` |
| Testing | `skills/superpowers/test-driven-development.md` |
| Bug Fixing | `skills/superpowers/systematic-debugging.md` |
| Code Cleanup | Run code-simplifier agent |

### Ask First (Hybrid Mode)

For ambiguous requests:
- "Should I load the design system for this?"
- "This touches both frontend and backend—which context should I prioritize?"
- "Multiple skills apply here. Want me to use [X] or [Y] approach?"

### Context Files Reference

```
context/
├── BRIEF.md        # Project goals, users, scope (extracted from your uploads)
├── BRAND.md        # Brand guidelines, tone, visual direction
├── STACK.md        # Tech stack details, dependencies
├── DECISIONS.md    # Architecture decisions log
└── CHANGELOG.md    # What changed and why
```

---

## Skill System

### Acquisition Hierarchy

**Never create skills from scratch without searching first.**

```
1. SEARCH  → Check trusted repos for existing skills
2. INSTALL → Copy/reference skill to local skills/ folder
3. ADAPT   → Customize for project conventions
4. CREATE  → Custom skill ONLY when nothing exists
```

### Trusted Skill Sources

See `.wat/skill-sources.md` for full details. Summary:

| Source | Focus | Key Skills |
|--------|-------|------------|
| **Superpowers** | Dev workflow | brainstorming, writing-plans, TDD, debugging, subagent-driven-dev |
| **UI-UX Pro Max** | Design intelligence | 67 UI styles, 96 palettes, typography, patterns |
| **Anthropic Plugins** | Code quality | code-simplifier, code-reviewer, frontend-design |

### Pre-Installed Skills

Superpowers is always installed. On initialization, install via:
```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### Skill Discovery During Development

When you need capability that doesn't exist locally:

1. Check `skills/` folder first
2. Search trusted sources (see `.wat/skill-sources.md`)
3. Recommend installation: "I found [skill] in [repo]. Install it?"
4. If approved, run install command
5. Log in `skills/.registry`

### Installed Skills Registry

Track all installed skills in `skills/.registry`:
```
# Format: skill-name | source | version | install-date | adapted
brainstorming | superpowers | 4.1.1 | 2024-01-15 | no
systematic-debugging | superpowers | 4.1.1 | 2024-01-15 | yes
```

---

## Design System

### Philosophy

Every visual decision traces back to a token. Every component traces back to the design system. When something changes, it changes in one place.

### Base File (Source of Truth)

Your `design-system/base.jsx` is the canonical source. **Never modify it directly.** Read from it, generate derived files, document changes.

The base.jsx contains a `tokens` object with:
- `colors` — Primary, grays, semantic (success, error, warning, info)
- `typography` — Font families (display, ui)
- `spacing` — Size scale (xs through 3xl)
- `radius` — Border radius scale

### Generated Files

From base.jsx, generate:
```
design-system/
├── base.jsx           # YOUR FILE (read-only, source of truth)
├── MASTER.md          # Documentation + quick reference
├── CHANGELOG.md       # Design evolution log
├── tokens/
│   ├── tokens.css     # CSS custom properties (generated)
│   ├── semantic.css   # Semantic mappings (generated)
│   └── tokens.ts      # TypeScript exports (generated)
├── components/
│   ├── ui/            # Shadcn components adapted to tokens
│   └── custom/        # Project-specific components
└── pages/
    └── {page}.md      # Page-specific overrides
```

### Token Generation

When base.jsx changes or on init, regenerate tokens:

```javascript
// From base.jsx tokens object, generate:

// tokens.css
:root {
  --color-primary: #E53935;
  --color-primary-hover: #C62828;
  --color-gray-50: #F9FAFB;
  // ... etc
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-ui: "Inter Tight", Inter, system-ui, sans-serif;
  --space-xs: 4px;
  // ... etc
  --radius-sm: 4px;
  // ... etc
}

// semantic.css
:root {
  --bg-primary: var(--color-white);
  --bg-secondary: var(--color-gray-50);
  --fg-primary: var(--color-black);
  --fg-secondary: var(--color-gray-500);
  --interactive-default: var(--color-primary);
  --interactive-hover: var(--color-primary-hover);
  // ... etc
}
```

### Design System Rules

1. **Never hardcode** — Use tokens for colors, spacing, typography, radius
2. **Check before creating** — Look in components/ui/ first
3. **Document changes** — Log in design-system/CHANGELOG.md
4. **Page overrides** — Put in design-system/pages/{page}.md
5. **Evolve together** — When base.jsx updates, regenerate everything

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
3. Ask only for GAPS: "I extracted X, Y, Z. What's missing is [A, B]?"
```

### Phase 3: Scaffolding

Create missing structure:

```
context/
├── BRIEF.md
├── BRAND.md
├── STACK.md
├── DECISIONS.md
└── CHANGELOG.md

skills/
├── .registry
├── superpowers/    # Always installed
├── ui-ux/          # Installed based on project type
└── custom/

design-system/
├── base.jsx        # From upload or generated
├── MASTER.md
├── CHANGELOG.md
└── tokens/

workflows/
tools/
.wat/
└── commands/

.tmp/
```

### Phase 4: Skill Installation

```
1. Always install Superpowers:
   /plugin marketplace add obra/superpowers-marketplace
   /plugin install superpowers@superpowers-marketplace

2. Based on project type, recommend additional skills:
   - Has UI? → Recommend UI-UX Pro Max
   - Complex codebase? → Recommend code-simplifier

3. Ask for confirmation before installing optional skills
```

### Phase 5: Design System Bootstrap

If design system JSX provided:

```
1. Copy to design-system/base.jsx (preserve original)
2. Parse tokens object
3. Generate tokens.css, semantic.css, tokens.ts
4. Create MASTER.md documentation
5. Present token mapping for approval
```

If no design system provided:

```
1. Ask about visual direction (minimal, bold, dark mode, etc.)
2. Search UI-UX Pro Max for matching style
3. Recommend palette, typography, spacing
4. Generate base.jsx from recommendations
5. Confirm before creating
```

### Phase 6: Summary

```
Present:
- What context was extracted/created
- What skills were installed
- What design tokens are available
- Recommended next actions

Ask: "Ready to start, or want to adjust anything?"
```

---

## Commands

### Natural Language (Primary)

| Say This | Does This |
|----------|-----------|
| "initialize" / "init" | Full project initialization |
| "search for [need]" | Search skill repos |
| "install [skill]" | Add skill to local folder |
| "update design system" | Regenerate tokens from base.jsx |
| "list skills" | Show installed skills |
| "use [skill]" | Load and apply specific skill |

### Slash Commands (Power Users)

| Command | Does This |
|---------|-----------|
| `/init` | Full initialization |
| `/skills` | List installed skills |
| `/design-system` | Show design system status |
| `/search [query]` | Search skill repos |

---

## Workflows & Tools

### Look for existing tools first

Before building anything new, check `tools/` based on what your workflow requires. Only create new scripts when nothing exists.

### Learn and adapt when things fail

When you hit an error:
1. Read the full error message and trace
2. Fix the script and retest
3. If it uses paid APIs, check with me before running again
4. Document what you learned in the workflow

### Keep workflows current

Workflows evolve as you learn. When you find better methods or encounter recurring issues, update the workflow. Don't create or overwrite workflows without asking unless explicitly told to.

---

## Self-Improvement Loop

Every failure strengthens the system:

```
1. Identify what broke
2. Fix the tool or component
3. Verify the fix works
4. Update the workflow or docs
5. Move on with a more robust system
```

---

## File Structure

```
project-root/
├── CLAUDE.md                    # This file (core orchestrator)
│
├── context/                     # Project understanding
│   ├── BRIEF.md                 # Goals, users, scope
│   ├── BRAND.md                 # Brand guidelines
│   ├── STACK.md                 # Tech stack
│   ├── DECISIONS.md             # Architecture decisions
│   └── CHANGELOG.md             # Project changes
│
├── skills/                      # Installed capabilities
│   ├── .registry                # Tracks installed skills
│   ├── superpowers/             # Always installed
│   ├── ui-ux/                   # UI/UX patterns (when needed)
│   └── custom/                  # Project-specific (last resort)
│
├── design-system/               # Visual consistency
│   ├── base.jsx                 # Source of truth (your file)
│   ├── MASTER.md                # Documentation
│   ├── CHANGELOG.md             # Design changes
│   ├── tokens/                  # Generated CSS/TS
│   ├── components/              # UI components
│   └── pages/                   # Page-specific overrides
│
├── workflows/                   # SOPs (your WAT)
├── tools/                       # Execution scripts (your WAT)
│
├── .wat/
│   ├── manifest                 # Project state
│   ├── skill-sources.md         # Trusted repos
│   └── commands/                # Command definitions
│
└── .tmp/                        # Disposable intermediates
```

---

## Deliverables

- **Final outputs** → Cloud services (Google Sheets, Slides, etc.)
- **Intermediates** → `.tmp/` (regenerated as needed)
- **Design system files** → Version controlled, source of truth
- **Skills** → Local copies in `skills/`, tracked in `.registry`

---

## Bottom Line

You sit between what I want (workflows) and what gets done (tools). Your job:

1. **Read instructions** — Check context, skills, design system
2. **Make smart decisions** — Use existing capabilities first
3. **Call the right tools** — Deterministic execution
4. **Recover from errors** — Learn and document
5. **Keep improving** — Evolve workflows, skills, design system

For UI work, the design system is your constraint and guide. Every visual decision traces to a token.

For development work, use Superpowers methodology. Brainstorm → Plan → Execute with TDD.

**Stay pragmatic. Stay reliable. Keep learning. Search before creating.**
