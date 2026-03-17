# Architecture Decisions

This log captures significant technical decisions using a lightweight ADR format.

For brownfield projects, existing patterns are documented as **Inherited** ADRs during the audit phase. New decisions made during development use the standard Proposed → Accepted flow.

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **Inherited** | Pattern found in existing codebase, documented retroactively |
| **Proposed** | New decision under consideration |
| **Accepted** | Decision approved and implemented |
| **Deprecated** | Decision reversed or superseded by a newer ADR |

---

## Inherited Decisions (from Audit)

### ADR-001 (Inherited): [e.g., Project uses React with Redux for state management]

**Date:** [date of audit]
**Status:** Inherited

**Context:** [What pattern exists in the codebase? How is it used?]

**Evidence:** [Where in the code is this pattern? Key files.]

**Assessment:**
- (+) [What works well about this pattern]
- (-) [What's problematic or could be improved]
- **Recommendation:** Keep as-is | Refactor gradually | Replace (add to ROADMAP)

---

### ADR-002 (Inherited): [e.g., No test framework configured]

**Date:** [date of audit]
**Status:** Inherited

**Context:** [Description of the gap]

**Evidence:** [No test files found, no test dependencies in package.json]

**Assessment:**
- (-) [Risk of regressions, no safety net for refactoring]
- **Recommendation:** Add [vitest/jest/pytest] in Phase 0 cleanup

---

## New Decisions

### ADR-NNN: [Short title]

**Date:** [date]
**Status:** Proposed | Accepted | Deprecated

**Context:** What problem were you solving?
**Decision:** What did you decide?
**Consequences:**
- (+) benefits
- (-) tradeoffs

---

<!-- Add new decisions above this line -->
