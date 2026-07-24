<div align="center">

# AI Second Brain
### A portable "second brain" framework for AI coding agents

[![CI](https://github.com/Kashyap-001/second-brain-template/actions/workflows/test-setup.yml/badge.svg)](https://github.com/Kashyap-001/second-brain-template/actions/workflows/test-setup.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Setup: npx](https://img.shields.io/badge/setup-npx-brightgreen.svg)](#quick-setup-recommended)
[![Platforms](https://img.shields.io/badge/platforms-Linux%20%7C%20macOS%20%7C%20Windows-blue.svg)](#platform-notes)

Global agent rules · SAFe-style dev-loop agents · reusable skills · persistent memory

</div>

---

I built this because I was sick of re-explaining the same fixes to my coding
agent every single session. This repo is my second brain — it's meant to be
**adopted, not run as-is**, just structure and prompts, no server, no build
step. Clone it, run one setup command, and you get a working setup for
Claude Code (or Cursor, or any other agent that reads
`AGENTS.md`/`CLAUDE.md`): global behavior rules, a self-healing dev loop,
reusable skills, and memory that actually survives between sessions instead
of getting re-explained every time.

**The main thing it does: it learns from its own mistakes and gets better
every session.** Whenever the agent hits an error, fixes a bug, or I correct
it on something, that gets written straight into memory automatically — I
don't have to ask it to remember. So the first project you run through this
is the rough one. By the tenth project, it's already stopped repeating half
the mistakes it made early on, because it's reading its own history back
before it touches code. The more projects you complete with it, the sharper
it gets — it's not a static prompt, it's a system that compounds.

## Contents

- [Features](#features)
- [Quick setup](#quick-setup-recommended)
- [Manual setup](#how-to-adopt-this-manual)
- [Platform notes](#platform-notes)
- [Day-to-day usage](#day-to-day-usage)
- [What's in here](#whats-in-here)
- [Contributing](#contributing)
- [Architecture](#architecture)
- [License](#license)

## Features

| | |
|---|---|
| 🧭 **Global agent rules** | `.agents/AGENTS.md` — read-only constraints, a self-healing error→fix→log→retry loop (with a repeated-error guard so it never spins forever), a memory-routing table, and token-preservation tactics for long sessions. |
| 🛠️ **SAFe-style dev-loop agents** | `.claude/agents/` + `.claude/commands/` — `be-developer`, `qas` (independent AC/DoD gate), `rte` (PR/CI/merge), `system-architect`, wired to `/start-work`, `/quick-fix`, `/pre-pr`, `/end-work`, `/retro`, `/search-pattern`. |
| 🧩 **Reusable skill library** | `.agents/skills/` — brain-sync, vault-pruner, safe-workflow, security-audit, testing-patterns, systematic-debugging, obsidian-vault, spec-creation, session-wrap, git-advanced, frontend-design, feature-guardian, feature-restorer, find-skills. All domain-agnostic. |
| 📦 **Optional domain example pack** | `.agents/skills/examples/odoo/` — a full worked example of a domain-specific skill pack (Odoo 18/19). Delete it, or use it as the template for your own domain. |
| 🧠 **Persistent cross-session memory that compounds** | `.agents/claude-memory/*.example` — frontmatter-tagged files loaded into agent context every session. Every mistake, fix, and correction gets written here automatically as you work (no manual "save" step needed), so the agent gets measurably better the more projects you run through it — it's reading its own accumulated history, not starting fresh each time. |
| ⚡ **Alias "mode" system** | `docs/alias-modes.md` — wire a short shell command (`devmode`, `speedmode`, …) to a fixed skill loadout + loop cadence. Examples for bash/zsh and PowerShell; `bin/setup.js` can install a starter one for you, with verified support for how `claude` and `agy` (Antigravity) each actually load context — not just a binary-name swap. |
| 🚀 **Cross-platform `npx` setup** | `bin/setup.js` — one command scaffolds a ready-to-use vault: fills in placeholders, promotes `*.example` files, offers to drop the Odoo pack, `git init`, and add a shell alias. Zero dependencies, identical on Linux/macOS/Windows. |
| 🕸️ **Optional graphify integration** | `.claude/skills/graphify/` — codebase knowledge-graph queries instead of raw grepping, if you install graphify separately. |
| ✅ **CI smoke tests** | `.github/workflows/test-setup.yml` — every push/PR runs the setup script on Linux, macOS, and Windows and asserts the output is correct, including the shell-alias installer against a sandboxed `HOME`. |
| 🔒 **Sanitized & MIT-licensed** | Built by stripping a real personal setup down to the reusable framework — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the no-personal-data rule that keeps it that way. |

## Quick setup (recommended)

Works the same on Linux, macOS, and Windows — it's a pure Node script, no
dependencies, no npm publish required:

```bash
npx github:Kashyap-001/second-brain-template
```

It prompts for your name, whether to keep the Odoo example skill pack,
whether to `git init` the result, and whether to add a starter `secondbrain`
shell alias — then scaffolds a ready-to-use vault: copies the template,
fills in `<YOUR_NAME>` / `<VAULT_ROOT>` placeholders, and turns the
`*.example` memory/MCP files into real ones.

> The shell-alias step is the only thing it ever touches outside the vault
> directory (your `~/.bashrc`, `~/.zshrc`, or PowerShell `$PROFILE`) — it's
> opt-in and idempotent, safe to run again. See `bin/setup.js` for exactly
> what it does; it's short and has no hidden steps.

Prefer to do it by hand, or want to understand each piece? Follow the manual
steps below instead.

## How to adopt this (manual)

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
   `.cursorrules` pointing back here. It's a bash script — on Windows, run it
   under WSL or Git Bash (everything else in this repo, including the
   `npx` setup above, is platform-agnostic).
8. **Set up shell shortcuts for common modes** (e.g. "domain dev with
   teaching mode on" vs. "fast speed-dev" vs. "general brainstorming") — see
   [`docs/alias-modes.md`](docs/alias-modes.md) for the pattern, with
   examples for bash/zsh and PowerShell.

## Platform notes

| Piece | Linux | macOS | Windows |
|---|:---:|:---:|:---:|
| `npx github:Kashyap-001/second-brain-template` setup | ✅ | ✅ | ✅ (needs Node + git) |
| `.agents/scripts/link-brain.sh` | ✅ | ✅ | via WSL or Git Bash |
| Alias/mode shortcuts | bash/zsh function | bash/zsh function | PowerShell function |
| Skills, agent rules, docs | ✅ plain markdown — no platform dependency | ✅ | ✅ |

## Day-to-day usage

This is the loop I actually run, once it's set up:

1. **`/start-work [description]`** — kicks off a task. It gates on Acceptance
   Criteria / Definition of Done first (it won't let the agent start coding
   without them — it'll stop and ask you instead of guessing), writes a task
   note into the vault, and cuts a feature branch.
2. **Just do the work.** This is the part I don't have to think about: while
   the agent codes, hits errors, fixes them, or I correct something, the
   `AGENTS.md` "Universal Learn-and-Save Rule" + the Phase 5 self-healing
   loop write that straight into the right memory file automatically —
   `Odoo-Mistakes.md`, `General-Mistakes.md`, `feedback_*.md`, whatever fits.
   **I don't need a separate "save what you learned" step, the loop already
   does it.** If I want to force it, I can still say "remember this" or run
   `brain-sync`, but for normal work it happens on its own.
3. **`/end-work`** — commit checklist, vault task note gets updated, and it
   writes a handoff so the next session (or the next agent, if I'm switching
   between Claude and Cursor/agy) picks up exactly where I left off instead
   of starting cold.

**What actually lands in memory** — a trimmed, made-up-but-representative
entry, same shape as the real ones in `General-Mistakes.md`:

```markdown
### [API-Change] Retry wrapper swallowed the original exception
- Avoid: catching `Exception` in a retry decorator and re-raising a generic `RuntimeError`.
- What happens: the real error (a `KeyError` from a missing config value) gets lost — every
  retry failure looks identical in the logs, so debugging starts from zero each time.
- Fix: re-raise with `raise RuntimeError(...) from err`, or don't catch what you don't handle.
```

Next time the agent touches a retry wrapper, it reads this first instead of writing the
same bug again — that's the whole mechanism behind "gets better every project."

Other commands for when the happy path doesn't fit: `/quick-fix` for small
isolated bugs that don't need the full gate, `/pre-pr` to run full
validation before opening a PR, `/retro` to pull learnings out of a finished
session, `/search-pattern` to grep the codebase for a pattern instead of
doing it by hand.

## What's in here

```text
.agents/
├── AGENTS.md               Global agent behavior rules (read-only constraints,
│                            self-healing loop, memory routing, token preservation)
├── skills/                 Reusable skills (brain-sync, vault-pruner, safe-workflow,
│                            security-audit, testing-patterns, systematic-debugging,
│                            obsidian-vault, spec-creation, session-wrap, git-advanced,
│                            frontend-design, feature-guardian, feature-restorer,
│                            find-skills)
│   └── examples/odoo/      A full worked example of a domain-specific skill pack.
│                            Delete it if you don't need it, or use it as a reference.
├── scripts/
│   ├── link-brain.sh       Symlinks .agents/ (+ .claude/commands, .claude/agents)
│   │                        into a project and generates CLAUDE.md / .cursorrules.
│   └── agy_scan.py         Example static-analysis scanner — shows the shape of a
│                            lint script the "self-healing loop" can drive.
└── claude-memory/          *.example templates for persistent cross-session memory.
                             Copy to real filenames and fill in — see the README there.

.claude/
├── agents/                 SAFe-style role profiles: be-developer, qas, rte,
│                            system-architect
├── commands/                Slash commands: /start-work, /quick-fix, /pre-pr,
│                            /end-work, /retro, /search-pattern
├── skills/graphify/         Codebase knowledge-graph skill (query/explain/path
│                            instead of raw grepping)
└── settings.json             Hooks config — nudges toward graphify before Bash/Read

templates/
└── Daily-Note-Template.md   A generic daily-log template (Pomodoro blocks,
                             mistakes log, habit checklist, AI session summary)

docs/
└── alias-modes.md           Pattern for wiring shell aliases (bash/zsh/PowerShell)
                             to fixed skill+loop combos ("modes")

bin/setup.js, package.json    npx setup CLI — see "Quick setup" below
.mcp.json.example             MCP server config template (graphify)
```

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the
core-vs-example split this repo follows and, importantly, the no-personal-data
rule for anything you submit.

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
