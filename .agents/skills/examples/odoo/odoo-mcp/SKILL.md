---
name: odoo-mcp
description: Design patterns for building, refactoring, or extending Odoo MCP servers and AI Gateways. Covers tool registry design, security, and safe dynamic execution.
---

# Odoo MCP Tool Registry Design Patterns

When developing, refactoring, or extending Odoo MCP servers or AI Gateways:

## 1. Prefer Generic Database/ORM Tools Over Static Business Tools

Instead of hardcoding specialized tools (e.g., `partner_search`, `sale_order_create`) which limit the agent to specific fields or models, prefer implementing generic, dynamic database/ORM query and manipulation tools:

- `list_models`, `get_model_schema`
- `search_read`, `read_record`, `read_group`
- `create_record`, `update_record`, `delete_record`
- `execute_method`

This maximizes LLM client capability and adaptability without requiring constant code updates when new Odoo modules are installed.

## 2. Leverage Native Odoo Environment Security

In MCP tool dispatchers, always execute dynamic ORM calls using `.with_user(user)` rather than defaulting to `.sudo()` unless explicitly configured. This ensures Odoo's standard ACLs and Record Rules are automatically respected, raising `AccessError` on unauthorized queries.

## 3. Restricted safe_eval Sandbox for Scripting

Any dynamic execution tool (e.g., `execute_orm` or custom Python handlers) must evaluate Python code using Odoo's `safe_eval` library, blocking bytecode-level imports but exposing standard safe helper libraries:

- `requests` for HTTP
- `re` for regex
- `json`, `datetime`, `hashlib`, `hmac`
