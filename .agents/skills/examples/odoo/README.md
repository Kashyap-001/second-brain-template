# Example domain skill pack: Odoo

Everything under this `examples/odoo/` folder (`odoo-18`, `odoo-19`, `odoo-debug`,
`odoo-mcp`, `odoo-tutor`, `odoo-course-builder`) is a **worked example**, not core
framework. It shows what a full domain-specific skill pack looks like once you
plug it into the generic agent rules, memory routing, and SAFe-style dev loop
in the rest of this repo.

If you don't work with Odoo, delete this folder entirely — nothing outside
`examples/odoo/` depends on it. If you *do* work with Odoo, it's usable as-is.

To add your own domain (e.g. a different framework, language, or internal
platform), copy the shape of one of these skills — `SKILL.md` as the entry
point, `references/` for detail docs the agent pulls in on demand — and drop
it under `.agents/skills/<your-domain>/`. See `.agents/AGENTS.md` for how
skill routing and version-isolation rules are described generically.
