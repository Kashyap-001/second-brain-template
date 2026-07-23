# Contributing

This repo is a framework template, not a running application — contributions
are mostly markdown (agent rules, skills, docs) plus a couple of small
scripts. That keeps the bar low, but a couple of things matter more here than
in a typical codebase.

## Core vs. examples

- Anything at the top level of `.agents/skills/`, plus `.agents/AGENTS.md`,
  `.claude/agents/`, `.claude/commands/`, and `docs/` is **core** — it must
  stay domain-agnostic. Don't add anything here that only makes sense for one
  language, framework, or company.
- Domain-specific packs (the way `.agents/skills/examples/odoo/` demonstrates
  Odoo) belong under `.agents/skills/examples/<your-domain>/`, with a short
  `README.md` in that folder explaining what it is and that it's optional.
  New domain packs are welcome as examples — just keep them out of core.

If a PR touches both, split it: one PR for the core-framework change, one for
the domain example.

## No personal data, ever

This template exists specifically to be a *sanitized*, shareable version of
someone's real setup. Contributions must not reintroduce the problem:

- No real names, usernames, or absolute filesystem paths (`/home/<user>/...`,
  `C:\Users\<name>\...`). Use placeholders like `<YOUR_NAME>` or `<VAULT_ROOT>`,
  the same convention used throughout the repo.
- No real company/client/project names in examples — invent a generic one or
  use `<PROJECT_NAME>`.
- No credentials, API keys, tokens, or database names/topology from a real
  machine, even as "just an example."
- Before opening a PR, grep your diff for anything that looks like it came
  from your own machine or work: `git diff | grep -iE "/(home|users)/[a-z0-9_-]+"`.

## Workflow

1. Fork the repo, branch off `master`.
2. Keep PRs focused — one skill, one doc, one fix per PR.
3. If you're adding a skill, follow the existing `SKILL.md`/`skill.md`
   frontmatter shape used by the other skills in `.agents/skills/` (bare
   `---` frontmatter, not fenced — see the CLI-gotchas note in
   `.agents/claude-memory/tooling.md.example`).
4. Open the PR with a short description of what the change does and, if it's
   a new skill or mode, when someone would reach for it.

## What's out of scope

- Anything that only works with one specific paid tool/service as a hard
  dependency — keep integrations (like graphify) optional and documented as
  such, not required for the base framework to make sense.
- Large binary assets, generated graph output, or anything that belongs in
  `.gitignore` per the existing rules.
