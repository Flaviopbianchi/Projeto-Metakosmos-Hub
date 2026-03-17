# Codebase Audit Report — [PROJECT_NAME]

> Audited: [DATE]
> Auditor: Claude (WAT Framework v2 — Brownfield Init)

---

## File Inventory

| Extension | Count | Notes |
|-----------|-------|-------|
| [ext] | [n] | [notes] |

**Total files:** [n]
**Total LOC:** [n] (excluding node_modules, dist, build)

### Stale / Generated Files
| File | Issue | Recommendation |
|------|-------|----------------|
| [path] | [e.g., compiled .js alongside .tsx source] | [remove / ignore / investigate] |

### Duplicates
| File A | File B | Similarity |
|--------|--------|------------|
| [path] | [path] | [identical / near-identical / same name different dir] |

### Empty / Dead Files
| File | Last Modified | Imported By |
|------|---------------|-------------|
| [path] | [date] | [nothing — candidate for removal] |

---

## Dependency Audit

**Package manager:** [npm / yarn / pnpm / pip / etc.]
**Lock file:** [exists / missing]

### Unused Dependencies
| Package | Declared In | Evidence |
|---------|------------|----------|
| [package] | [dependencies / devDependencies] | [no imports found] |

### Outdated / Vulnerable
| Package | Current | Latest | Severity |
|---------|---------|--------|----------|
| [package] | [version] | [version] | [low / medium / high / critical] |

### Version Conflicts
| Package | Required By | Version A | Version B |
|---------|------------|-----------|-----------|
| [package] | [dependents] | [ver] | [ver] |

---

## Architecture Map

### Entry Points
| File | Role |
|------|------|
| [path] | [main entry / router / app shell / etc.] |

### Routing
| Route | Component/Handler | Notes |
|-------|-------------------|-------|
| [path] | [component] | [notes] |

### State Management
- **Approach:** [Redux / Zustand / Context / MobX / none / mixed]
- **Stores/Slices:** [list]
- **Patterns:** [notes on how state flows]

### Database / API Layer
- **Database:** [PostgreSQL / MongoDB / IndexedDB / none / etc.]
- **ORM/Client:** [Prisma / Mongoose / Dexie / raw queries / etc.]
- **API Style:** [REST / GraphQL / tRPC / none]

### Component/Module Hierarchy (Top 2 Levels)
```
[tree structure of main directories]
```

---

## Code Health Signals

### TODO / FIXME / HACK Comments
| Type | Count | Top Locations |
|------|-------|---------------|
| TODO | [n] | [top 3 files] |
| FIXME | [n] | [top 3 files] |
| HACK | [n] | [top 3 files] |

### Dead Code
| Export | File | Imported By |
|--------|------|-------------|
| [name] | [path] | [nothing] |

### Circular Dependencies
| Cycle | Files Involved |
|-------|---------------|
| [n] | [file A → file B → file A] |

### Test Coverage
- **Test framework:** [vitest / jest / pytest / none]
- **Test files found:** [n]
- **Tested modules:** [list]
- **Untested modules:** [list]

### Security Concerns
| Issue | File | Severity |
|-------|------|----------|
| [e.g., hardcoded API key] | [path] | [critical / high / medium] |

---

## Severity Summary

### Critical (fix before any feature work)
- [issue]

### Warning (fix during Phase 0 if approved)
- [issue]

### Info (note for future reference)
- [issue]

---

## Health Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| File organization | [good / fair / poor] | [notes] |
| Dependency health | [good / fair / poor] | [notes] |
| Type safety | [good / fair / poor] | [notes] |
| Test coverage | [good / fair / poor] | [notes] |
| Documentation | [good / fair / poor] | [notes] |
| Security | [good / fair / poor] | [notes] |

---

_This report feeds into Phase 0 (Cleanup) of the project ROADMAP._
