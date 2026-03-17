# Roadmap — [PROJECT_NAME]

Quick reference to retake work in any session.

**Legend:** done | current | next | backlog
**Codebase type:** brownfield (existing code, WAT overlay)
**Branch strategy:** [e.g., `phase-N/short-description`, PR to main on completion]

---

## Quantified State

Hard data for tracking progress across phases:

| Metric | Baseline | Target |
|--------|----------|--------|
| [e.g., Hardcoded color classes] | [count across N files] | 0 |
| [e.g., Monolith page file lines] | [lines] | < 200 |
| [e.g., Test coverage] | 0% | > 0% |

---

## Phase 0: Cleanup — [status]

Tasks derived from Audit Report. Each task is optional — user approves which ones to tackle.

| # | Task | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 0.1 | [e.g., Remove stale .js files alongside .tsx] | critical | [status] | [notes] |
| 0.2 | [e.g., Remove unused dependencies] | high | [status] | [notes] |
| 0.3 | [e.g., Add TypeScript strict mode] | medium | [status] | [notes] |
| 0.4 | [e.g., Add tests for core modules] | medium | [status] | [notes] |
| 0.5 | [e.g., Clean up TODO/FIXME comments] | low | [status] | [notes] |

**Priority guide:**
- **critical** — Blocks development or is a security risk. Fix first.
- **high** — Causes confusion or hides bugs. Fix during Phase 0.
- **medium** — Improves maintainability. Fix when touching related code.
- **low** — Nice to have. Move to backlog if time is short.

### Verification

| Checkpoint | Command/Action |
|------------|----------------|
| Build succeeds | [build command] |
| No security issues | [audit command or manual check] |

---

## Phase 1: [Name] — [status]

**Goal:** [One-line description of what this phase delivers.]
**Branch:** `phase-1/[short-description]`

| # | Task | Status | Key Files |
|---|------|--------|-----------|
| 1.1 | [Task] | [status] | [files] |
| 1.2 | [Task] | [status] | [files] |

### Verification

| Checkpoint | Command/Action |
|------------|----------------|
| Build succeeds | [build command] |
| Feature works | [describe what to test manually] |

---

## Phase 2: [Name] — [status]

**Goal:** [One-line description.]
**Branch:** `phase-2/[short-description]`

| # | Task | Status | Key Files |
|---|------|--------|-----------|
| 2.1 | [Task] | [status] | [files] |

### Verification

| Checkpoint | Command/Action |
|------------|----------------|
| [check] | [command] |

---

## Global Verification (applies to all phases)

| Checkpoint | Command/Action |
|------------|----------------|
| Build succeeds | [build command] |
| Dev server runs | [dev command] |
| Backend starts | [backend command] |
| All pages render | Navigate each route manually |

---

## Backlog (from Audit)

Issues flagged during work but not blocking current tasks. Review periodically.

| Issue | Source | Priority | Notes |
|-------|--------|----------|-------|
| [issue] | [audit / discovered during Phase N] | [low / medium] | [notes] |

---

## Questions the Project Needs to Answer

1. [What is the actual goal for this codebase?]
2. [What's the minimum viable improvement?]

---

_Updated: [date]_
