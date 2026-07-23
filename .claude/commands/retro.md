---
description: Retrospective analysis of work session for continuous improvement
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob]
---

Conduct a retrospective on this work session. Analyze what happened and provide structured feedback.

## Retrospective Framework

### What Worked Well
- Effective patterns and approaches used
- Good decisions made
- Workflows that ran smoothly

**Focus**: What should we keep doing?

### Observations & Learnings
- Patterns noticed
- Technical learnings
- Workflow insights
- Any surprises

**Focus**: What did we learn?

### What Could Be Better
- Friction points
- Inefficiencies
- Missing documentation
- Tool or automation gaps

**Focus**: What should we improve?

### Session Metrics
- Deliverables completed
- Files modified
- Issues resolved
- AC/DoD criteria closed

### Wins to Celebrate
- Goals met
- Quality work delivered
- Improvements validated

## Output

After the retrospective analysis, **always save learnings automatically — do not ask**:

1. For any code bug fixed this session → use the `brain-sync` skill to append to `Odoo-Mistakes.md` or `General-Mistakes.md`
2. For any AI behavior / workflow improvement noticed → append to `.agents/AGENTS.md` under the relevant section
3. For any new preference or style rule → update `.agents/claude-memory/core.md` or `session_general.md`
4. For anything that would make the harness better → note it in `.agents/claude-memory/session_general.md` under `## Harness Improvements`

Report what was saved and where. If nothing worth saving, say so explicitly ("Nothing new to save this session").
