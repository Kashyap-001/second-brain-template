---
description: Run validation checklist before creating a PR
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

You are preparing to create a Pull Request. Run the full validation checklist.

## Validation Checklist

### 1. Run Project Tests

Run whatever test/lint/typecheck suite this project uses:

```bash
# Python projects
python -m pytest  # or: python -m unittest

# Node/JS projects
npm test && npm run lint && npm run typecheck

# Odoo modules
# Use the test-odoo alias: cd module-dir && test-odoo

# Generic: look for Makefile targets
make test 2>/dev/null || echo "No make test found"
```

**BLOCKER** if tests fail. Fix before proceeding.

### 2. Git Status — No Uncommitted Changes

```bash
git status
```

**BLOCKER**: All changes must be committed.

### 3. Rebase onto Latest Main/Dev

```bash
git fetch origin
git rebase origin/main  # or origin/dev
```

**BLOCKER**: Must be up-to-date before creating PR.

### 4. Commit Message Check

```bash
git log origin/main..HEAD --oneline
```

Verify commits are descriptive: `type(scope): description`

### 5. AC/DoD Verification

Open the vault task note for this work:
```bash
ls -t <VAULT_ROOT>/Personal/Tasks/ | head -5
```

Verify:
- [ ] All AC/DoD criteria checked off in the task note
- [ ] Evidence section filled with test output / proof

### 6. Create PR

```bash
git push --force-with-lease origin $(git branch --show-current)

gh pr create --title "type(scope): description" --body "$(cat <<'EOF'
## Summary
- What was done

## AC/DoD Checklist
- [ ] criterion 1
- [ ] criterion 2

## Evidence
(test output, screenshots, etc.)

## Test Plan
- [ ] Tested manually
- [ ] Tests pass
EOF
)"
```

## Report

For each step:
- PASS: step completed
- BLOCKER: what failed and how to fix

Do not create PR until all blockers resolved.
