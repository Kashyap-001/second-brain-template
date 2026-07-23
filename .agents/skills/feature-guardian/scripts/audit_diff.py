import os
import ast
import xml.etree.ElementTree as ET
import sys

def parse_py_file(filepath):
    """Extract models, fields, and methods from a Python file using AST parsing."""
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            node = ast.parse(f.read(), filename=filepath)
    except Exception as e:
        return {}
    
    models = {}
    for item in node.body:
        if isinstance(item, ast.ClassDef):
            is_model = False
            for base in item.bases:
                # Basic check for base class names matching Odoo models
                if isinstance(base, ast.Attribute) and base.attr in ('Model', 'TransientModel', 'AbstractModel'):
                    is_model = True
                elif isinstance(base, ast.Name) and base.id in ('Model', 'TransientModel', 'AbstractModel'):
                    is_model = True
            
            if not is_model:
                # Also fallback check if class has _name or inherit attribute
                has_odoo_attr = False
                for subitem in item.body:
                    if isinstance(subitem, ast.Assign):
                        for target in subitem.targets:
                            if isinstance(target, ast.Name) and target.id in ('_name', '_inherit'):
                                has_odoo_attr = True
                if not has_odoo_attr:
                    continue
                
            model_name = None
            fields = []
            methods = []
            
            for subitem in item.body:
                if isinstance(subitem, ast.Assign):
                    for target in subitem.targets:
                        if isinstance(target, ast.Name):
                            if target.id == '_name':
                                if isinstance(subitem.value, ast.Constant):
                                    model_name = subitem.value.value
                            elif not target.id.startswith('_'):
                                if isinstance(subitem.value, ast.Call):
                                    func = subitem.value.func
                                    if isinstance(func, ast.Attribute) and isinstance(func.value, ast.Name) and func.value.id == 'fields':
                                        fields.append((target.id, func.attr))
                elif isinstance(subitem, ast.FunctionDef):
                    methods.append(subitem.name)
            
            if not model_name:
                # For inherited classes without _name (e.g. extension classes)
                for subitem in item.body:
                    if isinstance(subitem, ast.Assign):
                        for target in subitem.targets:
                            if isinstance(target, ast.Name) and target.id == '_inherit':
                                if isinstance(subitem.value, ast.Constant):
                                    model_name = subitem.value.value
                                elif isinstance(subitem.value, ast.List):
                                    if len(subitem.value.elts) > 0 and isinstance(subitem.value.elts[0], ast.Constant):
                                        model_name = subitem.value.elts[0].value
            
            if model_name:
                models[model_name] = {
                    'fields': fields,
                    'methods': methods
                }
    return models

def audit(old_dir, new_dir):
    # Parse Python files
    old_models = {}
    for root, _, files in os.walk(old_dir):
        for file in files:
            if file.endswith(".py"):
                old_models.update(parse_py_file(os.path.join(root, file)))
                
    new_models = {}
    for root, _, files in os.walk(new_dir):
        for file in files:
            if file.endswith(".py"):
                new_models.update(parse_py_file(os.path.join(root, file)))
                
    # Compare Python structures
    missing_models = []
    missing_fields = []
    missing_methods = []
    
    for m_name, m_data in old_models.items():
        if m_name not in new_models:
            missing_models.append(m_name)
        else:
            new_data = new_models[m_name]
            old_fields = dict(m_data['fields'])
            new_fields = dict(new_data['fields'])
            for f_name, f_type in old_fields.items():
                if f_name not in new_fields:
                    missing_fields.append((m_name, f_name, f_type))
            for method in m_data['methods']:
                if method not in new_data['methods']:
                    if method not in ('create', 'write', 'unlink', '__init__'):
                        missing_methods.append((m_name, method))
                        
    # Output formatting
    print("### STRUCTURAL AUDIT RESULTS ###\n")
    if missing_models:
        print("CRITICAL: Missing Models:")
        for m in missing_models:
            print(f"  - {m}")
    else:
        print("✅ No missing models.")
        
    if missing_fields:
        print("\nCRITICAL: Missing Fields:")
        for m, f, t in missing_fields:
            print(f"  - {m}.{f} ({t})")
    else:
        print("✅ No missing fields.")
        
    if missing_methods:
        print("\nWARNING: Missing Methods:")
        for m, meth in missing_methods:
            print(f"  - {m}.{meth}()")
    else:
        print("✅ No missing methods.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 audit_diff.py <old_module_dir> <new_module_dir>")
        sys.exit(1)
    audit(sys.argv[1], sys.argv[2])
