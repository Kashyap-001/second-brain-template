# claude-memory

This folder is your persistent, cross-session memory — loaded into agent
context every session (see `.agents/AGENTS.md` section 6 and `MEMORY.md.example`
for the routing rules).

The vault ships only `*.example` templates here, not real memory files:
copying real preferences, fixes, and project notes into a public template
repo would leak your personal data. Real memory files are git-ignored (see
`.gitignore`) so you can safely fill them in without risking an accidental
commit.

## Setup

```bash
cd .agents/claude-memory
cp core.md.example core.md
cp MEMORY.md.example MEMORY.md
cp tooling.md.example tooling.md
```

Fill in `<placeholders>` with your own details. Add more files as you go —
one `session_<project>.md` per active project, one `feedback_*.md` per
recurring behavior-correction topic — following the same frontmatter shape
and dispatch-table pattern shown in the examples.
