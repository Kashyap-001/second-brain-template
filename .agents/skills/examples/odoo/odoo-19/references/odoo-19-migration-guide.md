# Odoo 19 Migration Guide

Guide for migrating modules from Odoo 17/18 to Odoo 19.

## Table of Contents
- [Migration Overview](#migration-overview)
- [Key Changes](#key-changes)
- [Migration Scripts](#migration-scripts)
- [Module Hooks](#module-hooks)
- [Common Migrations](#common-migrations)
- [Testing](#testing)

---

## Migration Overview

### When to Migrate

- **Major version upgrade**: Odoo 17 → 18 → 19
- **Module dependencies changed**
- **API breaking changes**

### Migration Strategy

1. Review changelog and breaking changes
2. Update `__manifest__.py` version
3. Run migration scripts
4. Test thoroughly
5. Update documentation

---

## Key Changes

### Odoo 19 Key Changes

| Area | Change |
|------|--------|
| **List view** | Use `<list>` instead of `<tree>` |
| **Dynamic attributes** | Use direct attributes instead of `attrs` |
| **Delete validation** | Use `@api.ondelete` instead of overriding `unlink()` |
| **Field aggregation** | Use `aggregator=` instead of `group_operator=` |
| **SQL queries** | Use `odoo.tools.SQL` class |
| **Batch create** | Use list of dicts instead of single dict |
| **Decimal Precision** | Do not import `decimal_precision`. Use string name directly (e.g. `digits='Product Price'`) |
| **fields.Datetime** | Capitalized `fields.Datetime` is case-sensitive. Use `default=fields.Datetime.now` |
| **hr_contract module** | Merged into core `hr`. Remove `hr_contract` from manifest dependencies |
| **stock.valuation.layer** | Removed. Valuation fields are now stored directly on `stock.move` |
| **xmlrpc_port** | Renamed to `http_port` in configurations and commands |
| **any! / not any!** | New operators to bypass ACLs and record rules for server workflows |
| **web_editor** | Asset module renamed to `html_builder` |
| **Kanban layout** | Stricter card validation. Requires `<t t-name="card">` |

### Odoo 18 Key Changes

| Area | Change |
|------|--------|
| **Views** | Use `<list>` instead of `<tree>` |
| **attrs** | Deprecated, use direct attributes |
| **ondelete** | New `@api.ondelete` decorator |

---

## Migration Scripts

### Migration Script Location

```
my_module/
└── migrations/
    └── 19.0.1.0/
        ├── pre-migration.py
        ├── end-migration.py
        └── post-migration.py
```

### Migration Script Naming

| Script | When it runs |
|--------|--------------|
| `pre-migration.py` | Before module update |
| `post-migration.py` | After module update |
| `end-migration.py` | After all migrations |

### Migration Script Template

```python
def migrate(cr, version):
    """
    Migration script for Odoo 19
    """
    # Your migration code here
    pass
```

---

## Common Migrations

### Tree to List View

**Odoo 17 and earlier**:

```xml
<tree string="Records">
    <field name="name"/>
</tree>
```

**Odoo 18+**:

```xml
<list string="Records">
    <field name="name"/>
</list>
```

### attrs to Direct Attributes

**Odoo 17 and earlier**:

```xml
<field name="state" attrs="{'invisible': [('state', '!=', 'draft')]}"/>
```

**Odoo 18+**:

```xml
<field name="state" invisible="state != 'draft'"/>
```

### Delete Validation

**Odoo 17 and earlier**:

```python
def unlink(self):
    for record in self:
        if record.state != 'draft':
            raise UserError("Cannot delete non-draft records")
    return super().unlink()
```

**Odoo 18+**:

```python
@api.ondelete(at_uninstall=False)
def _unlink_if_not_draft(self):
    if any(rec.state != 'draft' for rec in self):
        raise UserError("Cannot delete non-draft records")
```

### Field Aggregation

**Odoo 17 and earlier**:

```python
amount_total = fields.Monetary(group_operator="sum")
```

**Odoo 18+**:

```python
amount_total = fields.Monetary(aggregator="sum")
```

### Decimal Precision

**Odoo 18 and earlier**:

```python
from odoo.addons import decimal_precision as dp
price = fields.Float(digits=dp.get_precision('Product Price'))
```

**Odoo 19**:

```python
price = fields.Float(digits='Product Price')
```

### Datetime Defaults

**Odoo 18 and earlier**:

```python
# Error-prone or legacy patterns:
date = fields.datetime.now()
date_field = fields.Datetime(default=fields.datetime.now())
```

**Odoo 19**:

```python
# Capitalized fields.Datetime is case-sensitive, pass function reference:
date_field = fields.Datetime(default=fields.Datetime.now)
```

### Kanban Layout

**Odoo 18 and earlier**:

```xml
<kanban>
    <templates>
        <t t-name="kanban-box">
            <div>...</div>
        </t>
    </templates>
</kanban>
```

**Odoo 19**:

```xml
<kanban>
    <templates>
        <t t-name="card">
            <div>...</div>
        </t>
    </templates>
</kanban>
```

---

## Module Hooks

### pre_init_hook

```python
def pre_init_hook(env):
    """Called before module installation"""
    # Create custom tables, etc.
    pass
```

### post_init_hook

```python
def post_init_hook(env):
    """Called after module installation"""
    # Set default values, create records, etc.
    pass
```

### uninstall_hook

```python
def uninstall_hook(env):
    """Called after module uninstallation"""
    # Clean up custom tables, files, etc.
    pass
```

### Register Hooks in Manifest

```python
{
    ...
    'pre_init_hook': 'my_module.pre_init_hook',
    'post_init_hook': 'my_module.post_init_hook',
    'uninstall_hook': 'my_module.uninstall_hook',
}
```

---

## Migration Checklist

- [ ] Review Odoo 19 changelog
- [ ] Update `__manifest__.py` version
- [ ] Update dependencies (remove `hr_contract` and ensure base `hr` dependency is correct)
- [ ] Rename `<tree>` to `<list>`
- [ ] Replace `attrs` with direct attributes
- [ ] Replace `unlink()` override with `@api.ondelete`
- [ ] Update field aggregators
- [ ] Update SQL queries to use `odoo.tools.SQL`
- [ ] Remove all legacy `decimal_precision` imports and convert to string names in `digits` parameter
- [ ] Check `fields.Datetime` calls for case-sensitivity and correct default methods (e.g. `default=fields.Datetime.now`)
- [ ] Wrap Kanban cards explicitly in `<t t-name="card">`
- [ ] Run migration scripts
- [ ] Test all functionality
- [ ] Update documentation

---

## Testing Migrations

### Test Migration Script

```python
from odoo.tests import TransactionCase

class TestMigration(TransactionCase):
    def test_migration(self):
        # Test migration script
        pass
```

### Manual Testing

1. Install previous version with sample data
2. Update to Odoo 19
3. Verify all data migrated correctly
4. Test all features

---

## References

- Odoo 19 changelog
- Odoo 18 changelog
