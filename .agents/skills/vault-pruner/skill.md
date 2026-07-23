---
name: vault-pruner
description: Archive older entries from Odoo-Mistakes.md when count exceeds 30. Implements AGENTS.md rule 7 automatically. Call from claude-general loop or manually.
---

# Skill: vault-pruner

**Trigger:** Called by `/loop` in `claude-general`, or manually. Implements AGENTS.md Rule 7.

---

## Step 1 — Count entries

Count `###` headers in `Development/Odoo/Odoo-Mistakes.md`. Each `###` = one entry.

If count ≤ 30 → report count and stop. Nothing to do.

---

## Step 2 — Classify entries for archiving

Sort entries by type tag into archive files under `Development/Odoo/Mistakes/`:

| Tag | Archive file |
|---|---|
| `[XML-Change]` | `Archive_XML.md` |
| `[API-Change]` | `Archive_API.md` |
| `[Field-Change]` | `Archive_Field.md` |
| `[Security-Change]` | `Archive_Security.md` |
| `[Performance-Tip]` | `Archive_Performance.md` |
| `[Module-Specific]` | skip — these belong in ledgers, not here |

---

## Step 3 — Archive oldest

Keep the 20 most recent entries in `Odoo-Mistakes.md`.
Move the rest to their archive file.

**Never delete entries — only move them.**
If an archive file doesn't exist, create it with a `# Archive: [Type]` header.

---

## Step 4 — Confirm

```
✅ vault-pruner complete
   Entries before: [N]
   Entries kept:   20
   Archived:       [N] → [list of archive files updated]
```
