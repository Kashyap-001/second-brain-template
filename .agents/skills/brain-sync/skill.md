# Skill: brain-sync
**Trigger:** Call after every single file migration (Odoo) OR after any general Python/JS/Bash/Shell bug fix. Never batch multiple files into one sync.

---

## Step 1 — Classify the fix FIRST

Before writing anywhere, assign ONE type:

| Type | What it is | Example |
|---|---|---|
| `[API-Change]` | Decorator or method that changed in Odoo 19 | `@api.ondelete` replaces `unlink()` |
| `[Field-Change]` | Field attribute renamed or removed | `group_operator` → `aggregator` |
| `[XML-Change]` | View attribute or tag changed | `<tree>` → `<list>`, `attrs` removed |
| `[Security-Change]` | Access rights or group pattern changed | ir.model.access format |
| `[Performance-Tip]` | A better Odoo 19 pattern | `odoo.tools.SQL` instead of raw string |
| `[Module-Specific]` | Only makes sense in THIS module | field renamed from x to y in estate only |

**Rule:** Could this mistake happen in ANY Odoo module? → Framework type → global files
Could this ONLY make sense reading THIS module's code? → `[Module-Specific]` → ledger only

---

## Step 2 — Route by type

**Framework types** (`[API-Change]` / `[Field-Change]` / `[XML-Change]` / `[Security-Change]` / `[Performance-Tip]`):
```
→ Odoo-Mistakes.md          (one-line global rule)
→ Mistakes/[MODULE]_ledger.md   (compact project reference)
→ Notes/[TYPE]_Notes.md         (full intern explanation)
   API-Change     → API_Notes.md
   Field-Change   → Field_Notes.md
   XML-Change     → XML_Notes.md
   Security-Change → Security_Notes.md
   Performance-Tip → Performance_Notes.md
```

**`[Module-Specific]`:**
```
→ Mistakes/[MODULE]_ledger.md ONLY
   Do NOT write to Odoo-Mistakes.md or any Notes file
```

---

## Step 3 — Write formats

### Odoo-Mistakes.md (global rules — one entry per fix)
```markdown
### [XML-Change] <tree> renamed to <list>
- **Avoid:** `<tree string="...">` in any view file
- **Always:** Use `<list string="...">` in Odoo 19
- **Why:** Odoo renamed the tag to match what it actually is
- **First seen in:** estate
```

### [MODULE]_ledger.md (project handoff — next subagent reads this)
```markdown
## [views/estate_property_views.xml] — Fix: <tree>→<list>
- **Type:** [XML-Change]
- **Before:** `<tree string="Properties">`
- **After:** `<list string="Properties">`
- **Impact on other files:** None
- **Notes ref:** [[XML_Notes#tree-renamed-list]]
```

### [TYPE]_Notes.md (intern study guide — full explanation, always this format)
```markdown
## 🔖 [XML-Change] — <tree> renamed to <list>
**First seen in:** estate | **Ledger ref:** [[estate_ledger#tree-list]]

### 🧠 WHY Odoo 19 changed this
[Explain the architectural/design reason. Write to someone in their first month
of Odoo. Not "it changed" — WHY the Odoo team decided to change it.]

### 📅 WHEN you will see this as an intern
[Real situations where they'll encounter this. Which modules, which workflows.]

### 🏗️ Real Scenario
[Actual before/after code from the file just migrated — not a generic example]

```python or xml
# ❌ Odoo 17
[old code]

# ✅ Odoo 19
[new code]
```

### ⚠️ Common Mistakes Interns Make
1. [Specific mistake with this change]
2. [Another specific mistake]
3. [Edge case they'd miss]
```

---

## Step 4 — Confirm after every sync

```
✅ brain-sync complete
   File: models/estate_property.py
   Type: [API-Change]
   Odoo-Mistakes.md: updated
   estate_ledger.md: updated
   API_Notes.md: new section "@api.ondelete replaces unlink()"
```

---

## General Coding Mistakes (non-Odoo)

If the fix is a **general Python / JavaScript / Bash / Shell** mistake (not Odoo-specific):

**Route to:** `<VAULT_ROOT>/Development/General-Mistakes.md`

**Format:**
```markdown
### [CATEGORY] — Short description
- **Avoid:** what not to do
- **Always:** what to do instead
- **Why:** the reason
- **First seen in:** [project name]
```

Categories: `[Python]`, `[JavaScript]`, `[Bash]`, `[Git]`, `[SQL]`, `[Claude-CLI]`, `[General]`

**Confirm after sync:**
```
✅ brain-sync complete
   Type: General / [CATEGORY]
   General-Mistakes.md: updated
```

---

## What brain-sync NEVER does

- Never writes `[Module-Specific]` fixes to global `Odoo-Mistakes.md`
- Never batches multiple files into one sync call
- Never writes to any file inside the Git repo / module directory
- Never skips the Why/When/Then — even for "obvious" fixes