# Alias "modes" — wiring shell shortcuts to skill loadouts

A second brain is more useful when starting a session doesn't mean typing the
same long `claude --append-system-prompt-file <path>` invocation every time.
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
| `claude` (Claude Code) | Flag, **via a file**: `claude --append-system-prompt-file <path>` | Concatenate files into a variable, write it to a temp file, pass the path |
| `agy` (Antigravity) | Auto-reads `AGENTS.md` from the **current working directory** — no flag at all (same mechanism it used for `GEMINI.md` before) | `cd` into the vault, then run `agy` plainly |
| Cursor CLI (`cursor-agent`) | Reads project rules via `/rules` / a rules file, not a CLI flag | No direct equivalent — set up `.cursorrules` (via `link-brain.sh`) instead of a shell alias |
| Aider | `--message` / `--message-file` drive a one-shot task prompt, not a persistent system-prompt append | Different mental model entirely — see Aider's own docs |

`bin/setup.js` knows the first two conventions and builds the right shape
automatically. For anything else, it asks you for the exact command —
`{ctx_file}` as a placeholder for a path to the loaded context (use this if
the tool accepts a file), `{ctx}` for the text inline, or blank to fall back
to the cd-and-run shape several newer CLIs share — rather than guessing a
flag that might not exist. Check the tool's own docs before assuming any
convention will work.

### Why a file, not an inline argument

Concatenating `AGENTS.md` + memory files into a single string and passing it
as a CLI argument works fine at first — until those memory files accumulate
months of entries and the combined string blows past the shell's `ARG_MAX`
(a few MB on Linux/macOS, but as little as ~8191 characters on Windows
`cmd.exe`). Past that limit the command fails outright with `E2BIG`. Writing
the same content to a temp file and passing *its path* instead sidesteps the
limit completely, since the file's contents never go through argv. This is
the fix that was actually needed in practice, not a hypothetical — apply the
same idea to any custom `{ctx}`-based template you write if your tool's
argument size ever becomes a problem; swap it for `{ctx_file}` if the tool
accepts one.

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
  if [ -f "$vault/HANDOFF.md" ]; then
    ctx="$ctx

## Handoff
$(cat "$vault/HANDOFF.md")"
  fi
  local ctx_file
  ctx_file="$(mktemp)"
  printf '%s' "$ctx" > "$ctx_file"
  claude --append-system-prompt-file "$ctx_file" "$@"
  rm -f "$ctx_file"
}
```

Repeat per mode, changing which files get concatenated into `$ctx` and which
`/loop` command you run after Claude starts. See the CLI gotcha list in
`.agents/claude-memory/tooling.md.example` for two things that bite silently:
- **`--append-system-prompt-file` must be a flag, not a positional
  argument**, or your context becomes just a chat message instead of loaded
  instructions.
- **Use the `-file` variant, not the inline `--append-system-prompt "$ctx"`
  form.** The inline form passes your whole context string as a single argv
  entry, which works fine while memory files are small — then silently stops
  working (or hard-fails with `E2BIG`) once they grow past the shell's
  `ARG_MAX`. Writing to a temp file first and passing its path avoids the
  limit entirely; `bin/setup.js` does this automatically.

## Wiring it up — Windows (PowerShell)

Add to your PowerShell profile (`notepad $PROFILE`):

```powershell
function devmode {
    $vault = "$HOME\second-brain"   # or wherever you cloned this repo
    $ctx = Get-Content "$vault\.agents\AGENTS.md", `
                        "$vault\.agents\claude-memory\core.md", `
                        "$vault\.agents\claude-memory\tooling.md" `
                        -Raw -ErrorAction SilentlyContinue -join "`n"
    if (Test-Path "$vault\HANDOFF.md") {
        $ctx = $ctx + "`n`n## Handoff`n" + (Get-Content "$vault\HANDOFF.md" -Raw)
    }
    $ctxFile = New-TemporaryFile
    Set-Content -Path $ctxFile -Value $ctx -NoNewline
    claude --append-system-prompt-file $ctxFile @args
    Remove-Item $ctxFile -ErrorAction SilentlyContinue
}
```

Same reasoning as the bash version: Windows `cmd.exe` caps a command line at
around 8191 characters, and even PowerShell has practical limits — writing
to a temp file and passing its path avoids the issue rather than hitting it
later once memory files grow.

Same idea — one PowerShell function per mode. Works natively; WSL users can
just use the bash version instead.

## Handoff between sessions

If you also use a second agent/tool alongside Claude Code (any tool that can
write a plain text file works), the pattern is:
- End-of-session: one mode/alias writes a short `HANDOFF.md` (a few hundred
  words: what changed, what's next, open questions) to the vault root.
- Start-of-session: the next mode/alias reads `HANDOFF.md` automatically if
  present, so context survives the gap between sessions without you
  re-explaining it.

This is optional — `talkmode`-style aliases with no loop and no handoff are
just as valid for casual use.

### Worked example: switching between `agy` and `claude` on the same project

This is the concrete case the pattern is built for — two different CLIs,
same vault, same HANDOFF.md, and it works in **both directions** but for two
different reasons:

1. **You finish a session in `agy`.** Ask it to write a short summary to
   `HANDOFF.md` in the vault root before you stop (a one-off request, or
   wire it to a `/handoff`-style command in your own setup if `agy` supports
   custom commands).
2. **You switch to `claude` next.** The `secondbrain` alias (see the bash
   example above, or what `bin/setup.js` generates for the `claude`
   profile) explicitly checks for `HANDOFF.md` and appends it to the context
   file it passes via `--append-system-prompt-file` — so Claude Code sees
   agy's handoff note automatically, no extra step.
3. **You switch back to `agy` later**, after a Claude Code session that also
   wrote its own `HANDOFF.md`. This direction needs *no alias-side code at
   all*: `agy` auto-reads `AGENTS.md` from the working directory, and
   `AGENTS.md`'s "Cross-tool handoff" rule (section 6) tells it to check for
   and read `HANDOFF.md` first — so it picks up the note as a natural
   consequence of following its own instructions, not because anything was
   injected into it programmatically.

The asymmetry is the important thing to understand: **flag-driven CLIs
(`claude`) need the alias to explicitly read `HANDOFF.md` into what it
injects; CLIs that auto-read `AGENTS.md` (`agy`, and likely others as this
becomes a more common convention) need the instruction to live in
`AGENTS.md` itself instead.** Both are already wired up in this repo — the
`claude` alias (both the doc example and what `setup.js` generates) checks
`HANDOFF.md`, and `.agents/AGENTS.md` carries the cross-tool instruction. If
you add a third CLI with its own convention, replicate whichever half
actually applies to it.
