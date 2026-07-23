---
description: Search for code patterns across codebase
argument-hint: <pattern> [file-type]
allowed-tools: [Read, Bash, Grep, Glob]
---

Search codebase for patterns using optimized tools.

## Usage

```
/search-pattern "functionName" py
/search-pattern "import.*from" ts
/search-pattern "TODO:|FIXME:"
```

## Workflow

### 1. Parse Arguments
- $1 = pattern (required)
- $2 = file extension filter (optional: py, js, ts, md, xml, etc.)

### 2. Execute Search

With file type:
```bash
grep -r "$1" . --include="*.$2" -n
```

Without file type:
```bash
grep -r "$1" . -n --exclude-dir=".git" --exclude-dir="node_modules" --exclude-dir="__pycache__"
```

With context (3 lines around match):
```bash
grep -r "$1" . --include="*.$2" -n -C 3
```

### 3. Analyze Results

Report:
- Total matches and files
- Common patterns noticed
- Potential refactoring opportunities
- Outliers or unusual usage

## Common Searches

```bash
# Find TODO/FIXME debt
/search-pattern "TODO:|FIXME:|HACK:" 

# Find all imports of a module
/search-pattern "from module_name import"  py

# Find function callers (before refactoring)
/search-pattern "function_name\(" py

# Find hardcoded credentials/secrets
/search-pattern "password|secret|api_key|token" py

# Find error handling patterns
/search-pattern "except|try:" py

# Find Odoo model definitions
/search-pattern "class.*models.Model" py
```

## Success Criteria

- Pattern found and categorized
- Usage context understood
- Actionable insights provided
