---
description: Start work on a task with SAFe AC/DoD gate and branch setup
argument-hint: [task-description]
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

You are starting work on a new task.

**Workflow Authority**: This command enforces the SAFe AC/DoD gate before any implementation begins.

## Pre-Flight Checklist

### 1. Task Identification

If an argument was provided ($1), use it as the task description.
If no argument, ask the user: "What are you working on? Describe in one sentence."

### 2. Stop-the-Line: AC/DoD Gate (MANDATORY)

Ask the user:
> "What are the Acceptance Criteria / Definition of Done for this task? List each criterion on a new line. Type END when done."

**HALT** if user cannot supply AC/DoD:
- Do not proceed with implementation
- You are NOT responsible for inventing AC/DoD
- Help the user define them by asking: "What does 'done' look like? How will you verify it works?"

Work begins ONLY when AC/DoD exists.

### 3. Create Vault Task Note

Create a task note at:
`<VAULT_ROOT>/Personal/Tasks/YYYY-MM-DD-[slug].md`

Where:
- `YYYY-MM-DD` = today's date
- `[slug]` = task description lowercased with hyphens (max 5 words)

Template:
```markdown
# [Task Description]

**Date**: YYYY-MM-DD
**Branch**: (fill in after creation)
**Status**: In Progress

## Acceptance Criteria / Definition of Done
- [ ] criterion 1
- [ ] criterion 2

## Notes

## Evidence
```

### 4. Branch Setup

Check current git state:
```bash
git status
git branch --show-current
```

If on main/dev: create a feature branch.
Branch format: `task/YYYYMMDD-short-description` (lowercase, hyphens).

```bash
git checkout main && git pull origin main   # or 'master'/'dev' as appropriate
git checkout -b task/YYYYMMDD-short-description
```

Update the vault task note's **Branch** field with the branch name.

### 5. Confirm Ready

Report:
- Task note created at: [path]
- AC/DoD gate: PASSED ([N] criteria confirmed)
- Branch: [branch-name]
- Ready to begin implementation

## Success Criteria

- AC/DoD confirmed (gate passed)
- Vault task note created with criteria
- On a dedicated feature branch
- Ready to begin work
