---
description: Fast-track workflow for small, isolated bug fixes
argument-hint: [bug-description]
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

Execute streamlined workflow for small, urgent bug fixes.

## When to Use

- Critical bug blocking work
- Small, isolated change (< 50 lines)
- No architecture change
- Existing test coverage adequate

**NOT for**: new features, large refactors, breaking changes.

## Workflow

### 1. Confirm Scope

If $1 provided, use as bug description. Otherwise ask: "What's the bug?"

Verify it qualifies as a quick fix (isolated, < 50 lines). If not, use `/start-work` instead.

### 2. Branch

```bash
git checkout main && git pull origin main  # or dev
git checkout -b fix/YYYYMMDD-short-description
```

### 3. Find Root Cause First

Before editing: grep for all callers of the function you're about to touch.
The lazy fix is the root-cause fix — one guard in the shared function beats a guard in every caller.

```bash
grep -r "functionName" . --include="*.py" --include="*.js"
```

### 4. Make Minimal Fix

Make the smallest change that fixes the root cause. Run tests:

```bash
# Run project tests
python -m pytest  # or npm test, or test-odoo alias
```

### 5. Commit

```bash
git add .
git commit -m "fix(scope): resolve [description]"
```

### 6. Quick PR

```bash
git push -u origin $(git branch --show-current)
gh pr create --title "fix(scope): [description]" --body "$(cat <<'EOF'
## Bug Fix

### Issue
[what was broken]

### Fix
[what was changed — 1-2 sentences]

### Testing
- [ ] Manually tested
- [ ] Tests pass
- [ ] No regressions expected
EOF
)"
```

## Success Criteria

- Root cause fixed (not symptom)
- Minimal diff
- Tests pass
- PR created
