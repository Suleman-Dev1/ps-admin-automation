"""Re-export config_loader utilities from config.config_loader for agent2_document."""
from config.config_loader import (
    load_checklists,
    get_checklist_for,
    load_raw_data,
    DEFAULT_JSON_PATH,
    DEFAULT_YAML_PATH,
)

__all__ = [
    "load_checklists",
    "get_checklist_for",
    "load_raw_data",
    "DEFAULT_JSON_PATH",
    "DEFAULT_YAML_PATH",
]
