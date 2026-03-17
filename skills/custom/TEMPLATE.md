# Custom Skill Template

Use this template when creating a project-specific skill that doesn't exist in trusted repositories.

---

## Before Creating

Checklist:
- [ ] Searched Superpowers (obra/superpowers)
- [ ] Searched UI-UX Pro Max (nextlevelbuilder/ui-ux-pro-max-skill)
- [ ] Searched Anthropic plugins (anthropics/claude-plugins-official)
- [ ] Confirmed nothing suitable exists
- [ ] Documented why existing skills don't fit

---

## Skill Template

```markdown
# [Skill Name]

> Source: custom (created for [project-name])
> Created: [DATE]
> Author: [who created it]

## Purpose

[One paragraph explaining what this skill does and when to use it]

## Triggers

This skill activates when:
- [Trigger 1: e.g., "user mentions X"]
- [Trigger 2: e.g., "task involves Y"]

## Prerequisites

Before using this skill:
- [ ] [Prerequisite 1]
- [ ] [Prerequisite 2]

## Process

### Step 1: [Name]

[What to do]

### Step 2: [Name]

[What to do]

### Step 3: [Name]

[What to do]

## Outputs

This skill produces:
- [Output 1]
- [Output 2]

## Anti-Patterns

Don't:
- [Thing to avoid 1]
- [Thing to avoid 2]
```

---

## After Creating

1. Save to `skills/custom/[skill-name].md`
2. Add entry to `skills/.registry`
3. Test the skill
4. Document any issues found
