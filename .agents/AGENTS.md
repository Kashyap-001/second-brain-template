# Custom Agent Rules & Behavioral Directives

These rules govern the behavior of all AI agents (Claude Code, Cursor, or any other coding agent) working in a workspace linked to this vault.

Everything below is a framework — the concrete paths, tech stack, and domain examples (Odoo shows up a lot) are illustrative. Swap them for your own stack; keep the shape of the rules.

---

## 1. 🚫 Read-Only Constraints

- If your work touches a vendored/core dependency directory you must never modify directly (e.g. a framework's core source tree, a generated `vendor/` folder), name it explicitly here and mark it strictly **read-only**.
- Example: `<CORE_FRAMEWORK_PATH>` and all of its subfolders are read-only. You may read these files for context, but you must **never** create, edit, or delete any files inside that path.

---

## 2. 🛢️ Environment / Database Reuse Constraints

- **Do not drop or recreate expensive local resources** (databases, containers, build caches) unless truly necessary — recreating them costs time.
- **Prefer incremental operations:** upgrade/migrate in place rather than reinstalling from scratch. Only do a full reinstall/reset if the resource is corrupted beyond repair.

*(This example is phrased for an Odoo module database — replace with whatever expensive-to-rebuild resource your stack has.)*

---

## 📥 Universal Learn-and-Save Rule

**Any time the user tells you something new — a preference, correction, decision, fix, workflow change, anything — save it to the vault immediately. No exceptions. No asking. Just write it.**

**Save in a way that's useful to future sessions — structured and actionable, not just logged.**
- Write to memory files (`feedback_*.md`, `project_*.md`, `core.md`) — these are loaded every session.
- If a file already covers the topic, UPDATE it. Never duplicate.
- Daily logs (`Personal/Daily-Logs/YYYY-MM-DD.md`) are for human review only — not agent context.
- Keep entries rule-shaped: what to do / avoid / why.

Routing:
- Domain-specific fix (e.g. Odoo) → `brain-sync` → domain mistakes file + ledger
- General code fix → `brain-sync` → `General-Mistakes.md`
- AI behavior / style → `claude-memory/feedback_*.md`
- Alias / tooling → `claude-memory/tooling.md`
- Personal preference → `claude-memory/core.md`
- New agent rule → `AGENTS.md`
- Session summary → `Personal/Daily-Logs/YYYY-MM-DD.md` (human only)

**Never say "I'll remember that." Write it.**

---

## 3. 🔄 Automated Self-Healing & Logging Loop

- **Execute a self-healing loop automatically:** when running integration tests or a dev-server upgrade, do not halt on the first traceback or error.
- You are fully authorized to:
  1. Parse the error traceback from the console.
  2. Implement the fix in the code.
  3. **Log the mistake and fix** to your domain's mistakes file immediately using the `brain-sync` skill.
  4. Re-run the failing command.
- Repeat this loop up to **10 times** automatically without user intervention until the command exits cleanly.
- **Repeated error guard:** if the same error type and line number appears **3 consecutive times**, stop the loop immediately, report the blocker clearly, and ask for user input. Do not keep iterating on an unfixable error.

---

## 🪙 4. Token Preservation & Context Compaction

To avoid running out of tokens during big builds or migration loops:
1. **Speed mode during execution:** write direct code changes and command executions without chatty conversational intros or outros.
2. **Subagent spawning:** for multi-file changes, spawn a separate subagent for each file. This resets the chat history context and prevents token accumulation.
3. **Compact logs:** when analyzing tracebacks or test errors, only extract and read the specific lines containing the filename, line number, and error type. Do not paste or ingest the entire console output.

---

## 📚 5. Local Skill References (Domain Example: Odoo)

- **Primary source of truth:** prefer pre-downloaded local skills over relying on the model's own knowledge for framework-version-sensitive work:
  - `.agents/skills/examples/odoo/odoo-18/SKILL.md` (and `references/`)
  - `.agents/skills/examples/odoo/odoo-19/SKILL.md` (and `references/`)
- **Version isolation (do not mix):** always inspect the current project's manifest/config file first to identify the framework version.
  - If the project is on version 19 (or mid-migration), use **only** the `odoo-19` skill.
  - If the project is on version 18, use **only** the `odoo-18` skill.
  - You must **never** read, mix, or reference version-18 guidelines inside a version-19 workspace (or vice versa) if the versions have breaking changes between them.
- **Web search fallback:** always check the appropriate local version skill first. If the local references are insufficient to complete the task or resolve a complex traceback, you are permitted to use web search. Do not guess syntax.

This whole section is specific to the Odoo example pack — if you deleted `.agents/skills/examples/odoo/`, delete or replace this section with your own domain skill's version-isolation rules.

---

## 🏰 6. Session Memory Rule

- **Initial context loading:** upon starting a session, load and read `AGENTS.md` and your personal profile (`Personal/Personal-AI-Profile.md`, if you keep one) **before** writing any code or commands.
- **Routing memory by project type:**
  - **Domain projects (e.g. Odoo):** write tracebacks and framework fixes back to `Development/<Domain>/<Domain>-Mistakes.md`.
  - **General code projects (Python, JS, etc.):** write general bugs and coding solutions back to `Development/General-Mistakes.md`.
  - **General tasks / conversations:** if the user completes a focus session, brainstorms ideas, or plans tasks, write a bullet-point summary of the session directly to the bottom of the active daily note: `Personal/Daily-Logs/[YYYY-MM-DD].md`.
- Never log learnings to temporary directories. Keep all memory centralized inside the vault.

---

## 🦖 7. Mistakes-Log Pruning & Context Compaction

- **File length limit:** if a domain mistakes file (e.g. `Development/Odoo/Odoo-Mistakes.md`) exceeds 30 entries, the agent must automatically archive older resolved entries.
- **How:** call the `vault-pruner` skill — it handles classification and archiving automatically.
- **Archive process:**
  1. Create or open archive files under `Development/<Domain>/Mistakes/Archive_<Category>.md`.
  2. Move older entries from the main mistakes file into the respective archive file.
  3. Keep the most recent 20 rules in the main file to keep the context window small, fast, and token-efficient.

---

## 🔍 8. Finding New Skills

- If a task could benefit from a community skill that doesn't exist in the vault yet, use the `find-skills` skill.
- It uses `npx skills find [query]` to search the skills.sh ecosystem and can install skills with `npx skills add <package> -g -y`.
- When a new skill is installed, add it to the relevant alias/context so future sessions pick it up.

---

## 🐴 9. Ponytail — YAGNI Enforcement (General Code Only)

- **Applies to:** general Python, JavaScript, Bash, Shell scripts — not framework ORM boilerplate that requires its own conventions (e.g. Odoo models/views/security files).
- **Rule:** for any general utility, script, or non-boilerplate task, apply YAGNI principles:
  1. Question if the task needs to exist at all.
  2. Reach for stdlib/native tools before writing custom code.
  3. One line before fifty. No speculative abstractions.
- **Invoke:** the `ponytail` skill/plugin (installed separately — not part of this vault's `.agents/skills/`) for any general code task, and `ponytail-review` after writing a general utility to catch over-engineering.
- **Never apply this to:** ORM models, views, security files, or anything inside a framework module that requires its own boilerplate patterns.

---

## ⚙️ 10. SAFe Agentic Workflow (SAW) — Structured Multi-Agent Commands

Modeled on https://github.com/bybren-llc/safe-agentic-workflow. Available vault-wide via `.claude/commands/` and `.claude/agents/`.

### Claude Code Slash Commands
| Command | What It Does |
|---|---|
| `/start-work [description]` | AC/DoD gate → vault task note → feature branch |
| `/end-work` | Commit checklist + vault note update + handoff |
| `/pre-pr` | Full validation (tests, rebase, AC/DoD) before PR creation |
| `/quick-fix [bug]` | Fast-track workflow for small isolated fixes |
| `/retro` | Retrospective — surfaces learnings for brain-sync |
| `/search-pattern <pattern> [ext]` | Codebase pattern search |

### Agent Profiles (`.claude/agents/`)
| Agent | Role |
|---|---|
| `be-developer` | Implementation with AC/DoD gate and ponytail |
| `qas` | Gate owner — independent AC/DoD verification |
| `rte` | PR creation, CI monitoring, merge coordination |
| `system-architect` | Design review, ponytail ladder, architecture |

### AC/DoD Gate Rule (All Agents)
- **Never implement without Acceptance Criteria / Definition of Done.**
- Task note lives at `Personal/Tasks/YYYY-MM-DD-[slug].md`.
- You are NOT responsible for inventing AC/DoD — halt and ask the user.

### Skills Supporting the Workflow (`.agents/skills/`)
- `safe-workflow` — branch naming, commit format, PR workflow
- `spec-creation` — AC/DoD spec templates
- `security-audit` — OWASP checklist, credential scanning
- `testing-patterns` — test strategy patterns
- `git-advanced` — advanced git operations

---

## 🕸️ 11. Graphify — Knowledge Graph Codebase Navigation

Graphify (installed separately — see repo README) is a CLI that builds `graphify-out/graph.json`, a queryable graph of files, functions, and cross-file relationships for a codebase (code + docs). It is distinct from the `.agents/skills/` registry (skills.sh ecosystem, section 8); it's native to Claude Code and lives in `.claude/skills/graphify/`.

- **Rule:** for codebase questions, run `graphify query "<question>"` before grepping when `graphify-out/graph.json` exists; use `graphify path "A" "B"` for relationships, `graphify explain "X"` for a concept, `graphify affected "X"` to find callers/impact.
- **Keep it fresh:** run `graphify update .` after code changes (AST-only, no LLM cost).
- **Per-project graphs:** if you work across multiple codebases from one vault, consider storing each project's `graphify-out/` outside that project's own git history (e.g. a visible `Graphify/projects/<name>/` folder in the vault, symlinked into each project as `graphify-out`) so multi-MB graph files don't bloat your project repos. When two projects are architecturally connected, build each separately, then `graphify merge-graphs` them into one combined graph, then **re-cluster the merged graph as one unit** (`graphify cluster-only --backend claude-cli`) before labeling — plain `merge-graphs` only unions two independently-clustered graphs, so community IDs collide across projects until re-clustered.
- **Backend:** if you don't have an `ANTHROPIC_API_KEY` set, use `--backend claude-cli` for semantic extraction (docs/notes) — it shells out to the local `claude` CLI instead of an API key.
- **Hooks:** the installer can register `PreToolUse` hooks on `Bash`/`Read`/`Glob` in `.claude/settings.json` (`graphify hook-guard`) — these are non-blocking nudges toward the graph, not enforcement.
- **MCP server:** `graphify-mcp` can be registered project-wide in `.mcp.json` (query/explain/path/affected as native tool calls instead of Bash) — see `.mcp.json.example`. New MCP servers need a one-time approval prompt on session start.
