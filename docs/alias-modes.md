# Alias "modes" — wiring shell shortcuts to skill loadouts

A second brain is more useful when starting a session doesn't mean typing the
same long `claude --append-system-prompt "$(cat ...)"` invocation every time.
The pattern here: define one shell alias/function per **mode**, where a mode
is a fixed combination of *which skills load*, *which loop runs*, and *what
you're using it for*. Give each mode a short name and never think about the
wiring again.

This is a pattern to copy, not a script to run — pick names and skills that
fit your own work, using the table below as a template.

**Fastest start:** `bin/setup.js` (the `npx` scaffolder — see the root
README) can add a single starter `secondbrain` function to your shell config
for you (`~/.bashrc`/`~/.zshrc` on Linux/macOS, your PowerShell `$PROFILE` on
Windows) — just answer "y" to its last prompt, then say which CLI you use.
It's idempotent (safe to run setup again, it won't duplicate the block) and
it's the *only* thing the scaffolder touches outside the vault directory,
opt-in every time. Rename that one function and duplicate it per mode using
the table below as your guide.

### Different CLIs load context differently — this isn't just a binary name swap

Don't assume every agent CLI takes a `--append-system-prompt`-style flag the
way Claude Code does. Verified conventions, as of mid-2026:

| CLI | How it loads context | Alias shape |
|---|---|---|
| `claude` (Claude Code) | Flag: `claude --append-system-prompt "<text>"` | Concatenate files into a variable, pass via the flag |
| `agy` (Antigravity) | Auto-reads `AGENTS.md` from the **current working directory** — no flag at all (same mechanism it used for `GEMINI.md` before) | `cd` into the vault, then run `agy` plainly |
| Cursor CLI (`cursor-agent`) | Reads project rules via `/rules` / a rules file, not a CLI flag | No direct equivalent — set up `.cursorrules` (via `link-brain.sh`) instead of a shell alias |
| Aider | `--message` / `--message-file` drive a one-shot task prompt, not a persistent system-prompt append | Different mental model entirely — see Aider's own docs |

`bin/setup.js` knows the first two conventions and builds the right shape
automatically. For anything else, it asks you for the exact command
(`{ctx}` as the placeholder for loaded context, or blank to fall back to the
cd-and-run shape several newer CLIs share) rather than guessing a flag that
might not exist — check the tool's own docs before assuming a flag-based
convention will work.

## Example mode table

| Mode name | Skills loaded | Loop | Use when |
|---|---|---|---|
| `devmode [HANDOFF.md]` | `<domain>-tutor` + `<domain>-debug` | 30m HANDOFF.md writer | Domain dev work with teaching/explain mode on |
| `speedmode [HANDOFF.md]` | `<domain>` skill + `<domain>-debug` | 5m babysitter | Pure speed dev in one domain, minimal narration |
| `migratemode [HANDOFF.md]` | `<domain>` skill + protocol + `<domain>-debug` | 10m phase auto-advance | Version migration / multi-phase work |
| `generalmode` | `session-wrap` + `vault-pruner` | 25m Pomodoro logger | General coding across languages, brainstorming |
| `talkmode` | none | none | Plain conversation, no tool loadout needed |

Swap `<domain>` for whatever you actually work in (the repo's `odoo` example
pack shows one filled-in version of this).

## Wiring it up — Linux / macOS (bash or zsh)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# devmode: domain dev with teaching mode, loads AGENTS.md + skill files,
# starts a 30-minute HANDOFF.md-writing loop.
devmode() {
  local vault="$HOME/second-brain"   # or wherever you cloned this repo
  local ctx
  ctx="$(cat "$vault/.agents/AGENTS.md" \
         "$vault/.agents/claude-memory/core.md" \
         "$vault/.agents/claude-memory/tooling.md" 2>/dev/null)"
  claude --append-system-prompt "$ctx" "$@"
}
```

Repeat per mode, changing which files get concatenated into `$ctx` and which
`/loop` command you run after Claude starts. See the CLI gotcha list in
`.agents/claude-memory/tooling.md.example` — **`--append-system-prompt` must
be a flag, not a positional argument**, or your context silently becomes just
a chat message instead of loaded instructions.

## Wiring it up — Windows (PowerShell)

Add to your PowerShell profile (`notepad $PROFILE`):

```powershell
function devmode {
    $vault = "$HOME\second-brain"   # or wherever you cloned this repo
    $ctx = Get-Content "$vault\.agents\AGENTS.md", `
                        "$vault\.agents\claude-memory\core.md", `
                        "$vault\.agents\claude-memory\tooling.md" `
                        -Raw -ErrorAction SilentlyContinue -join "`n"
    claude --append-system-prompt $ctx @args
}
```

Same idea — one PowerShell function per mode. Works natively; WSL users can
just use the bash version instead.

## Handoff between sessions

If you also use a second agent/tool alongside Claude Code (any tool that can
write a plain text file works), the pattern is:
- End-of-session: one mode/alias writes a short `HANDOFF.md` (a few hundred
  words: what changed, what's next, open questions).
- Start-of-session: the next mode/alias reads `HANDOFF.md` automatically if
  present, so context survives the gap between sessions without you
  re-explaining it.

This is optional — `talkmode`-style aliases with no loop and no handoff are
just as valid for casual use.
