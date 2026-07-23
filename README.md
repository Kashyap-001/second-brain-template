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

This repo is meant to be **adopted, not run as-is** — it's just structure and
prompts, no server, no build step. Clone it, run one setup command, and you
have a working, personal "second brain" for Claude Code (or Cursor, or any
other agent that reads `AGENTS.md`/`CLAUDE.md`): global behavior rules, a
self-healing dev loop, reusable skills, and memory that survives between
sessions instead of getting re-explained every time.

## Contents

- [Features](#features)
- [What's in here](#whats-in-here)
- [Quick setup](#quick-setup-recommended)
- [Manual setup](#how-to-adopt-this-manual)
- [Platform notes](#platform-notes)
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
| 🧠 **Persistent cross-session memory** | `.agents/claude-memory/*.example` — frontmatter-tagged files loaded into agent context every session, so preferences and project notes survive between sessions. |
| ⚡ **Alias "mode" system** | `docs/alias-modes.md` — wire a short shell command (`devmode`, `speedmode`, …) to a fixed skill loadout + loop cadence. Examples for bash/zsh and PowerShell; `bin/setup.js` can install a starter one for you. |
| 🚀 **Cross-platform `npx` setup** | `bin/setup.js` — one command scaffolds a ready-to-use vault: fills in placeholders, promotes `*.example` files, offers to drop the Odoo pack, `git init`, and add a shell alias. Zero dependencies, identical on Linux/macOS/Windows. |
| 🕸️ **Optional graphify integration** | `.claude/skills/graphify/` — codebase knowledge-graph queries instead of raw grepping, if you install graphify separately. |
| ✅ **CI smoke tests** | `.github/workflows/test-setup.yml` — every push/PR runs the setup script on Linux, macOS, and Windows and asserts the output is correct, including the shell-alias installer against a sandboxed `HOME`. |
| 🔒 **Sanitized & MIT-licensed** | Built by stripping a real personal setup down to the reusable framework — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the no-personal-data rule that keeps it that way. |

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
