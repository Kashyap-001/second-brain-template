#!/usr/bin/env python3
# agy_scan.py
# Static analysis scanner to find legacy Odoo patterns in the current directory.

import os
import re
import sys

# Color codes for terminal output
RED = "\033[91m"
YELLOW = "\033[93m"
GREEN = "\033[92m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"

LEGACY_XML = [
    (re.compile(r'<tree\b'), "<tree> tag (Deprecated, use <list> in Odoo 19)", RED),
    (re.compile(r'\battrs\s*='), "attrs=\"...\" attribute (Deprecated, use direct attributes like invisible/readonly)", RED),
    (re.compile(r'\bstates\s*='), "states=\"...\" attribute (Deprecated, use invisible=\"state != '...'\" direct expression)", RED),
    (re.compile(r't-esc\b'), "t-esc directive (Deprecated, use t-out in QWeb templates)", YELLOW),
    (re.compile(r't-name=["\']kanban-box["\']'), "t-name=\"kanban-box\" (Deprecated, use t-name=\"card\" in Odoo 19 kanban)", RED),
    (re.compile(r'\bgroups_id\b'), "groups_id field (Renamed to group_ids in Odoo 19)", RED),
]

LEGACY_PY = [
    (re.compile(r'\bdef\s+unlink\b'), "def unlink() override (Deprecated delete validation, use @api.ondelete)", RED),
    (re.compile(r'\b_sql_constraints\s*='), "_sql_constraints (Not supported in Odoo 19, use models.Constraint)", RED),
    (re.compile(r'\bread_group\b'), "read_group() override (Deprecated, override _read_group or formatted_read_group)", YELLOW),
    (re.compile(r'@api\.multi\b'), "@api.multi decorator (Obsolete, remove it)", RED),
    (re.compile(r'\bgroup_operator\s*='), "group_operator= (Renamed to aggregator= in Odoo 19)", RED),
]

def scan_file(filepath):
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            for idx, line in enumerate(f, 1):
                rules = LEGACY_XML if filepath.endswith('.xml') else LEGACY_PY if filepath.endswith('.py') else []
                for pattern, desc, color in rules:
                    match = pattern.search(line)
                    if match:
                        issues.append((idx, line.strip(), desc, color))
    except Exception as e:
        pass
    return issues

def main():
    target_dir = os.getcwd()
    print(f"{BOLD}{BLUE}🔍 Scanning directory: {target_dir} for legacy Odoo patterns...{RESET}\n")
    
    total_issues = 0
    scanned_count = 0
    
    for root, _, files in os.walk(target_dir):
        # Skip git and cache directories
        if any(part.startswith('.') or part in ('__pycache__', 'static') for part in root.split(os.sep)):
            continue
            
        for file in files:
            if not file.endswith(('.py', '.xml')):
                continue
                
            filepath = os.path.join(root, file)
            relpath = os.path.relpath(filepath, target_dir)
            scanned_count += 1
            
            file_issues = scan_file(filepath)
            if file_issues:
                print(f"{BOLD}{YELLOW}📄 {relpath}{RESET}")
                for line_no, content, desc, color in file_issues:
                    print(f"  {color}Line {line_no:4d}: {desc}{RESET}")
                    print(f"            {BOLD}Code:{RESET} {content}")
                print()
                total_issues += len(file_issues)
                
    if total_issues > 0:
        print(f"{BOLD}{RED}❌ Scan failed: Found {total_issues} legacy Odoo patterns in {scanned_count} files.{RESET}")
        print(f"{BOLD}{YELLOW}💡 Tip: Use your AI agent (agy-migrate) to fix these patterns automatically!{RESET}")
        sys.exit(1)
    else:
        print(f"{BOLD}{GREEN}✅ Scan passed: No legacy patterns found in {scanned_count} files.{RESET}")
        sys.exit(0)

if __name__ == "__main__":
    main()
