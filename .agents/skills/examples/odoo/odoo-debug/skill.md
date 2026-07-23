---
name: odoo-debug
description: Read /tmp/odoo-dev.log, extract traceback, fix it, verify, brain-sync. Called by the babysitter loop in claude-odoo19 and claude-migrate sessions.
---

# Skill: odoo-debug

**Trigger:** Called by `/loop` babysitter in `claude-odoo19` / `claude-migrate`, or manually when Odoo shows an error.

---

## Step 1 — Extract (token-efficient)

Read `/tmp/odoo-dev.log`. Extract ONLY lines containing:
`ERROR`, `Traceback`, `File "`, `raise `, `Exception`

Pull: filename, line number, error type, error message.
Do NOT ingest the full log.

If no traceback → report `Clean — no errors` and stop.

---

## Step 2 — Classify

| Error pattern | Type | Fix location |
|---|---|---|
| `AttributeError: 'x' has no attribute 'y'` | API change | `models/*.py` |
| `KeyError` / `TypeError` in view rendering | XML issue | `views/*.xml` |
| `psycopg2.errors` / `IntegrityError` | SQL/constraint | `models/*.py` |
| `ValidationError` unexpected | Logic error | `models/*.py` |
| `ModuleNotFoundError` / `ImportError` | Import/manifest | `__manifest__.py` |
| `ir.model.access` / `AccessError` | Security | `security/*.csv` or `*.xml` |

Check `Odoo-Mistakes.md` and module ledger first — if this error is already documented, use the documented fix.

---

## Step 3 — Fix

Apply minimal fix at root cause. Never patch every caller — fix the shared function.

Rules:
- Never edit your Odoo core install directory (e.g. `<ODOO_CORE_PATH>`) — treat it as read-only
- Use Odoo 19 patterns (check `odoo-19` skill if unsure of the correct API)
- One guard in the right place beats five guards in callers

---

## Step 4 — Verify

Run `test-odoo`. Read new `/tmp/odoo-dev.log`.

- Clean → go to Step 5
- Same error 3× consecutive → **STOP**, report blocker, ask for input
- New error → repeat from Step 1 (counts as a new cycle, resets consecutive counter)

---

## Step 5 — brain-sync

If the fix revealed a new/undocumented pattern, call `brain-sync` immediately.

---

## Output per cycle

```
🔍 odoo-debug
   Error: [type] at [file]:[line]
   Fix: [one line]
   Result: ✅ Clean  /  ❌ [new error type]
   brain-sync: ✅ saved  /  — not needed
```
