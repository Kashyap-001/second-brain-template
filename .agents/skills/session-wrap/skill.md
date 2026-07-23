---
name: session-wrap
description: Write a concise bullet summary of the current session block to the correct topic memory file. Called by the claude-general loop every 25 minutes. Never writes to daily logs.
---

# Skill: session-wrap

**Trigger:** Called by `/loop` in `claude-general` every 25m, or manually at end of a work block.

---

## Step 1 — Identify topic file

| Session content | Save to |
|---|---|
| Project-specific work | `claude-memory/session_<project>.md` |
| General Python / JS / Bash | `claude-memory/session_general.md` |
| Tooling / aliases / CLI / scripts | `claude-memory/tooling.md` |
| User preference or behavior change | `claude-memory/core.md` |
| Odoo code / framework fix | use `brain-sync` instead |

If nothing meaningful happened in the last 25 min → skip, write nothing.

---

## Step 2 — Write entry

Append to the bottom of the correct file:

```markdown
## [YYYY-MM-DD HH:MM]
- [Decision or pattern worth keeping — rule-shaped]
- [What to do / avoid / why]
- [Open question or what's next, if any]
```

Rules:
- 2–5 bullets max
- Rule-shaped only: what/avoid/why — not narrative
- No "we discussed", no "the user asked" — just the actionable fact
- Never duplicate what's already in the file

---

## Step 3 — Confirm

```
✅ session-wrap
   File: [filename]
   [YYYY-MM-DD HH:MM] — [N] bullets added
```
