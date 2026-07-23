# Second Brain — AI Agent Rules

This is a personal knowledge vault with an AI-agent automation framework layered on top. Before doing anything:

1. Read `<VAULT_ROOT>/.agents/AGENTS.md` for global behavior rules (read-only constraints, self-healing loop, memory routing, token preservation).
2. Read the relevant mistakes/learnings file before coding, if your domain has one (e.g. `Development/Odoo/Odoo-Mistakes.md` if you're using the Odoo example skill pack, or `Development/General-Mistakes.md` for general code).
3. Save all learnings back to the vault:
   - Domain-specific fixes → use the `brain-sync` skill
   - General fixes → append to `General-Mistakes.md`
   - Personal/session notes → append a bullet summary to today's daily log

See `<VAULT_ROOT>/AI-Second-Brain-Blueprint.md` for the full architecture.

## graphify

If this vault has a knowledge graph at `graphify-out/` (built by the [graphify](https://github.com) tool — install separately, see README), it has god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than a full report or raw grep output.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
