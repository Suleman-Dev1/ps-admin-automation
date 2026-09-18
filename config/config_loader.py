"""Checklist Configuration Loader (Zero-dependency with PyYAML support).

Loads checklist configurations from JSON or YAML files and returns
authoritative ChecklistConfig objects conforming to contracts.py.
"""
from pathlib import Path
from typing import List, Optional, Dict, Any
import json
import re
import sys

# Ensure root workspace is on python path for contracts import
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from contracts import ChecklistConfig

DEFAULT_CONFIG_DIR = ROOT_DIR / "config"
DEFAULT_JSON_PATH = DEFAULT_CONFIG_DIR / "checklists.json"
DEFAULT_YAML_PATH = DEFAULT_CONFIG_DIR / "checklists.yaml"


def _parse_simple_yaml(text: str) -> Dict[str, Any]:
    """Lightweight zero-dependency YAML parser for nested lists and dicts.

    Supports comments, key-value mappings, list items with strings and dicts.
    Used when PyYAML is not installed.
    """
    lines = text.splitlines()
    checklists = []
    current_item: Optional[Dict[str, Any]] = None
    current_list_key: Optional[str] = None

    for raw_line in lines:
        # Strip trailing newline and strip inline comments if not in quotes
        line = raw_line.rstrip()
        if not line.strip() or line.strip().startswith("#"):
            continue

        stripped = line.strip()
        indent = len(line) - len(line.lstrip())

        # Check for item start in list: e.g. "- business_type: 'Ltd'"
        item_match = re.match(r"^-\s+([A-Za-z0-9_]+):\s*(.*)$", stripped)
        if item_match:
            current_item = {}
            checklists.append(current_item)
            k, v = item_match.group(1), item_match.group(2).strip("\"'")
            current_item[k] = v
            current_list_key = None
            continue

        # Check for standalone list item under current_list_key: e.g. "- 'bank_statement'"
        list_elem_match = re.match(r"^-\s+(.*)$", stripped)
        if list_elem_match and current_item is not None and current_list_key is not None:
            val = list_elem_match.group(1).strip().strip("\"'")
            current_item[current_list_key].append(val)
            continue

        # Check for key-value pair or list header: e.g. "service: 'Year-end accounts'" or "required_documents:"
        kv_match = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", stripped)
        if kv_match and current_item is not None:
            k, v = kv_match.group(1), kv_match.group(2).strip()
            if v == "":
                # Header for a list
                current_list_key = k
                current_item[k] = []
            else:
                current_item[k] = v.strip("\"'")
                current_list_key = None

    return {"checklists": checklists}


def load_raw_data(file_path: Optional[Path | str] = None) -> Dict[str, Any]:
    """Load raw config dictionary from JSON or YAML file."""
    if file_path is None:
        if DEFAULT_JSON_PATH.exists():
            path = DEFAULT_JSON_PATH
        elif DEFAULT_YAML_PATH.exists():
            path = DEFAULT_YAML_PATH
        else:
            raise FileNotFoundError(f"Neither {DEFAULT_JSON_PATH} nor {DEFAULT_YAML_PATH} found.")
    else:
        path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Checklist config file not found: {path}")

    content = path.read_text(encoding="utf-8")
    ext = path.suffix.lower()

    if ext == ".json":
        return json.loads(content)
    elif ext in (".yaml", ".yml"):
        try:
            import yaml
            return yaml.safe_load(content)
        except ImportError:
            return _parse_simple_yaml(content)
    else:
        # Try JSON first, then YAML parser
        try:
            return json.loads(content)
        except Exception:
            return _parse_simple_yaml(content)


def load_checklists(file_path: Optional[Path | str] = None) -> List[ChecklistConfig]:
    """Load all ChecklistConfig entries from file."""
    data = load_raw_data(file_path)
    if isinstance(data, dict):
        raw_list = data.get("checklists", [])
    elif isinstance(data, list):
        raw_list = data
    else:
        raw_list = []
    
    configs: List[ChecklistConfig] = []
    for item in raw_list:
        if isinstance(item, dict):
            configs.append(ChecklistConfig.from_dict(item))
    return configs


def get_checklist_for(business_type: str, service: str, file_path: Optional[Path | str] = None) -> Optional[ChecklistConfig]:
    """Look up ChecklistConfig for a given business_type and service.

    Case-insensitive and whitespace-tolerant matching.
    """
    configs = load_checklists(file_path)
    bt_norm = business_type.strip().lower()
    srv_norm = service.strip().lower()

    for cfg in configs:
        if cfg.business_type.strip().lower() == bt_norm and cfg.service.strip().lower() == srv_norm:
            return cfg
    return None
