# AI Second Brain — Claude Code Template

A portable "second brain" framework for AI coding agents: global agent rules,
SAFe-style dev-loop agents (design → implement → verify → ship), reusable
skills, hooks, and a persistent-memory system that routes learnings back into
your vault instead of losing them at the end of a session.

This repo is meant to be **adopted, not run as-is**. It's structure and
prompts — no server, no build step.

## What's in here

```text
.agents/
  AGENTS.md              Global agent behavior rules (read-only constraints,
                          self-healing loop, memory routing, token preservation)
  skills/                Reusable skills (brain-sync, vault-pruner, safe-workflow,
                          security-audit, testing-patterns, systematic-debugging,
                          obsidian-vault, spec-creation, session-wrap, git-advanced,
                          frontend-design, feature-guardian, feature-restorer,
                          find-skills)
  skills/examples/odoo/  A full worked example of a domain-specific skill pack
                          (Odoo). Delete it if you don't need it — nothing else
                          depends on it. Keep it as a reference for building
                          your own domain pack.
  scripts/
    link-brain.sh         Symlinks .agents/ (+ .claude/commands, .claude/agents)
                           into a project workspace and generates CLAUDE.md /
                           .cursorrules pointing back at this vault.
    agy_scan.py            Example static-analysis scanner (Odoo legacy-pattern
                           checker) — shows the shape of a project-specific lint
                           script the "self-healing loop" in AGENTS.md can drive.
  claude-memory/          *.example templates for persistent cross-session memory.
                           Copy to real filenames and fill in — see the README there.

.claude/
  agents/                 SAFe-style role profiles: be-developer, qas, rte,
                           system-architect
  commands/                Slash commands: /start-work, /quick-fix, /pre-pr,
                           /end-work, /retro, /search-pattern
  skills/graphify/         Codebase knowledge-graph skill (query/explain/path
                           a codebase instead of raw grepping)
  settings.json             Hooks config — nudges toward graphify before Bash/Read

templates/
  Daily-Note-Template.md   A generic daily-log template (Pomodoro focus blocks,
                           mistakes log, habit checklist, AI session summary)

.mcp.json.example          MCP server config template (graphify) — copy to
                           .mcp.json and fill in real paths
```

## How to adopt this

1. **Clone this repo** as your own vault (Obsidian or plain folder — nothing
   here is Obsidian-specific except that markdown renders nicely in it).
2. **Rename placeholders.** Search for `<VAULT_ROOT>`, `<YOUR_NAME>`,
   `<ODOO_CORE_PATH>`, and similar bracketed placeholders and replace them
   with your real values (or leave `<VAULT_ROOT>` as a literal env var —
   `link-brain.sh` resolves it from its own location by default, or from a
   `VAULT_ROOT` env var if you set one).
3. **Set up memory:** `cd .agents/claude-memory && cp core.md.example core.md`
   (and the other two `.example` files) — fill them in with your own profile
   and preferences.
4. **Decide on the Odoo example pack:** if you don't do Odoo work, delete
   `.agents/skills/examples/odoo/`. If you do, it's ready to use, or use it as
   a reference for building your own domain skill pack under
   `.agents/skills/<your-domain>/`.
5. **Install [graphify](https://github.com)** separately if you want codebase
   knowledge-graph queries (`graphify query "..."`, `graphify path "A" "B"`).
   It's optional — `.claude/settings.json`'s hooks and `.agents/AGENTS.md`'s
   graphify section only matter if it's on your `PATH`. Without it, ignore or
   remove those hooks.
6. **Set up `.mcp.json`** from `.mcp.json.example` if you're using the
   graphify MCP server: copy it, fill in the real paths, and Claude Code will
   pick it up on next session start (one-time approval prompt).
7. **Wire a project to this vault:** from inside any project directory, run
   `.agents/scripts/link-brain.sh .` (pointing `VAULT_ROOT` at this repo if
   it's not adjacent). This symlinks `.agents/`, `.claude/commands/`,
   `.claude/agents/` into the project and generates a `CLAUDE.md` /
   `.cursorrules` pointing back here.

## Architecture

See [`AI-Second-Brain-Blueprint.md`](AI-Second-Brain-Blueprint.md) for the
full vault + linked-workspace architecture: directory layout, the symlink
flow, how to connect Claude Code / Cursor / other tools, and the
self-documenting "healing loop" (error → fix → log the learning → re-test).

`.agents/AGENTS.md` has the actual behavior rules an agent follows session to
session — read-only constraints, the self-healing loop with its
repeated-error guard, memory routing table, token-preservation tactics, the
SAFe AC/DoD gate flow, and the graphify integration.

## License

MIT — see [LICENSE](LICENSE).
