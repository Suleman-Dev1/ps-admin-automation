"""Agent 1: Intake & CRM Module.

Responsible for prospect capture, client record provisioning,
checklist resolution, and CRM storage conforming to the shared contract.
"""

from .crm_store import CRMStore
from .intake_service import (
    IntakeService,
    IntakePayload,
    IntakeResult,
    generate_client_id,
    resolve_checklist,
    load_checklist_configs,
    DEFAULT_CHECKLIST_CONFIG,
    DEFAULT_LTD_YEAR_END_CHECKLIST,
)

__all__ = [
    "CRMStore",
    "IntakeService",
    "IntakePayload",
    "IntakeResult",
    "generate_client_id",
    "resolve_checklist",
    "load_checklist_configs",
    "DEFAULT_CHECKLIST_CONFIG",
    "DEFAULT_LTD_YEAR_END_CHECKLIST",
]
