# Design System

> Last Updated: [DATE]
> Source: `design-system/base.jsx`

This is the documentation for the project's design system. All token values are generated from `base.jsx`.

---

## Quick Reference

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | [hex] | CTAs, key actions, brand |
| `--color-primary-hover` | [hex] | Hover states |
| `--color-black` | #000000 | Primary text |
| `--color-white` | #FFFFFF | Backgrounds, inverse text |

**Gray Scale:**
| Token | Value |
|-------|-------|
| `--color-gray-50` | [hex] |
| `--color-gray-100` | [hex] |
| `--color-gray-200` | [hex] |
| `--color-gray-300` | [hex] |
| `--color-gray-400` | [hex] |
| `--color-gray-500` | [hex] |
| `--color-gray-600` | [hex] |
| `--color-gray-700` | [hex] |
| `--color-gray-800` | [hex] |
| `--color-gray-900` | [hex] |

**Semantic Colors:**
| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | [hex] | Positive states |
| `--color-success-light` | [hex] | Success backgrounds |
| `--color-error` | [hex] | Error states |
| `--color-error-light` | [hex] | Error backgrounds |
| `--color-warning` | [hex] | Warning states |
| `--color-warning-light` | [hex] | Warning backgrounds |
| `--color-info` | [hex] | Info states |
| `--color-info-light` | [hex] | Info backgrounds |

---

### Typography

| Token | Value |
|-------|-------|
| `--font-display` | [font stack] |
| `--font-ui` | [font stack] |

**Usage:**
- Display font: Headlines, hero text, feature titles
- UI font: Body text, labels, buttons, form elements

---

### Spacing

| Token | Value |
|-------|-------|
| `--space-xs` | [value] |
| `--space-sm` | [value] |
| `--space-md` | [value] |
| `--space-lg` | [value] |
| `--space-xl` | [value] |
| `--space-2xl` | [value] |
| `--space-3xl` | [value] |

---

### Border Radius

| Token | Value |
|-------|-------|
| `--radius-none` | 0px |
| `--radius-sm` | [value] |
| `--radius-md` | [value] |
| `--radius-lg` | [value] |

---

## Semantic Tokens

These map primitive tokens to meaning. Use these in components.

### Backgrounds
| Token | Maps To |
|-------|---------|
| `--bg-primary` | white |
| `--bg-secondary` | gray-50 |
| `--bg-tertiary` | gray-100 |
| `--bg-inverse` | black |

### Foregrounds
| Token | Maps To |
|-------|---------|
| `--fg-primary` | black |
| `--fg-secondary` | gray-600 |
| `--fg-tertiary` | gray-400 |
| `--fg-inverse` | white |

### Interactive
| Token | Maps To |
|-------|---------|
| `--interactive-default` | primary |
| `--interactive-hover` | primary-hover |
| `--interactive-disabled` | gray-300 |

### Borders
| Token | Maps To |
|-------|---------|
| `--border-default` | gray-200 |
| `--border-strong` | gray-300 |
| `--border-focus` | primary |

---

## Component Inventory

### Available (from base.jsx)

| Component | Variants | Notes |
|-----------|----------|-------|
| [Component] | [variants] | [notes] |

### To Add

| Component | Status | Notes |
|-----------|--------|-------|
| [Component] | To add | [notes] |

---

## Usage Guidelines

### Do

- Use semantic tokens (`--bg-primary`) not primitives (`--color-white`)
- Check this document before creating new components
- Use spacing scale for all margins/padding
- Use radius tokens for all rounded corners
- Add transition for interactive states: `transition: all 0.15s ease`

### Don't

- Hardcode color values (`#E53935`)
- Use arbitrary spacing (`padding: 13px`)
- Create components without checking inventory
- Change tokens without updating CHANGELOG.md

---

## Files

| File | Purpose |
|------|---------|
| `base.jsx` | Source of truth (read-only) |
| `tokens/tokens.css` | CSS custom properties |
| `tokens/semantic.css` | Semantic layer |
| `tokens/tokens.ts` | TypeScript exports |
| `CHANGELOG.md` | Design changes log |

---

## Updating the Design System

When `base.jsx` changes:

1. Update token values in base.jsx
2. Regenerate `tokens/tokens.css`
3. Regenerate `tokens/semantic.css`
4. Regenerate `tokens/tokens.ts`
5. Update this MASTER.md
6. Log change in CHANGELOG.md

Command: "update design system" or ask Claude to regenerate.

---

*Generated from base.jsx. Source of truth is always the JSX file.*
