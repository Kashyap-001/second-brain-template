---
description: Complete work session with checklist and context handoff
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

You are completing a work session. Run this final checklist before stopping.

## Completion Checklist

### 1. Work Status

```bash
git status
git log origin/main..HEAD --oneline  # or origin/dev..HEAD
```

Status options:
- **Complete** → ready for PR
- **In Progress** → safe stopping point, commit and document
- **Blocked** → document blocker

### 2. Commit All Work

If uncommitted changes exist:

```bash
git add .
git commit -m "type(scope): description"
```

Verify clean:
```bash
git status  # should show nothing to commit
```

### 3. Update Vault Task Note

Find the task note created at `<VAULT_ROOT>/Personal/Tasks/`:

```bash
ls -t <VAULT_ROOT>/Personal/Tasks/ | head -5
```

Update:
- Check off completed AC/DoD criteria
- Add evidence in the `## Evidence` section (test output, screenshots, commands run)
- Update `**Status**` to `Done`, `In Progress`, or `Blocked`
- Add any decisions or blockers in `## Notes`

### 4. Context Preservation (write HANDOFF.md)

If stopping mid-work, write a HANDOFF.md in the current project directory:

```markdown
## Session Context — [Date]

### Completed
- Item 1

### Next Steps
1. Task 1

### Decisions
- Decision: Rationale

### Blockers
- Blocker: Details
```

You can also use the `claude-handoff` alias from terminal:
```bash
claude-handoff   # writes HANDOFF.md automatically
```

Or `agy-handoff` if switching to agy next session.

### 5. Branch Push (if ready for PR)

```bash
git push -u origin $(git branch --show-current)
```

Then create PR:
```bash
gh pr create --title "type(scope): description" --body "..."
```

Reference `/pre-pr` command for full PR validation checklist.

## Output

Report:
- Work status (done / in-progress / blocked)
- AC/DoD criteria checked off
- Context preserved (HANDOFF.md / vault note updated)
- Next session can resume cleanly
