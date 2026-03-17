# Tech Stack — [PROJECT_NAME]

## Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [package] | [version] | [what it does] |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| [package] | [version] | [what it does] |

## Folder Conventions

```
src/
├── types/          # Domain types
├── lib/            # Business logic, utilities
├── stores/         # State management
├── hooks/          # Custom hooks
├── components/     # UI components
│   ├── ui/         # Primitives (button, input, card)
│   └── [domain]/   # Feature-specific components
└── pages/          # Route pages
```

## Conventions

- **Naming:** [camelCase for files, PascalCase for components, etc.]
- **State management:** [Zustand/Redux/Context — how stores are organized]
- **Styling:** [Tailwind utilities, CSS modules, styled-components]
- **Path alias:** [e.g., @ -> ./src]
- **API calls:** [e.g., wrapper function, token injection, base URL config]
- **Dev server:** [e.g., Frontend port 3000, backend port 3001]

## Git Workflow

- **Branch strategy:** [e.g., phase-N/description per roadmap phase | feature branches | trunk-based]
- **Main branch:** [main | master] — always deployable
- **Commit conventions:** [e.g., conventional commits with feat:/fix:/refactor:/chore:/docs: prefixes]
- **Merge strategy:** [e.g., regular merge (preserve history) | squash merge | rebase]
- **PR process:** [e.g., PR to main on phase completion | PR per feature | direct push]
- **Commit granularity:** [e.g., one commit per logical unit of work, not one per phase]

## Deploy

- **CI/CD:** [e.g., GitHub Actions | Vercel auto-deploy | manual firebase deploy | none]
- **Environments:** [e.g., local -> staging -> production | local -> production]
- **Deploy command:** [e.g., `firebase deploy`, `vercel`, `npm run deploy`]
- **Environment variables:** [e.g., .env.local for dev, Cloud Run env vars for prod — DO NOT list values, just location/pattern]

## Known Gotchas

[Add entries here as you discover framework-specific issues during development. These should also have corresponding ADRs in DECISIONS.md if they required a design-level workaround.]
