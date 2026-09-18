"""Agent 1: Intake Service & Prospect Capture.

Provides intake handling, client ID generation, checklist provisioning,
and client record creation adhering strictly to contracts.py.
"""

from __future__ import annotations

import json
import os
import re
import secrets
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple, Union

# Ensure parent directory is in sys.path for contracts import
_PARENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _PARENT_DIR not in sys.path:
    sys.path.insert(0, _PARENT_DIR)

from contracts import ClientRecord, ContactInfo, ChecklistConfig, ClientStatus
from agent1_intake_crm.crm_store import CRMStore

# Default stub required by specification for Ltd + Year-end accounts
DEFAULT_LTD_YEAR_END_CHECKLIST = [
    "bank_statement",
    "prior_year_accounts",
    "payroll_summary",
    "id",
    "proof_of_address",
    "vat_certificate",
]

# Built-in checklist registry used when config file is absent or fallback needed
DEFAULT_CHECKLIST_CONFIG: Dict[Tuple[str, str], ChecklistConfig] = {
    ("ltd", "year-end accounts"): ChecklistConfig(
        business_type="Ltd",
        service="Year-end accounts",
        required_documents=list(DEFAULT_LTD_YEAR_END_CHECKLIST),
        required_form_fields=[
            "business_type",
            "service_requested",
            "turnover_band",
            "employee_count",
            "relevant_date",
            "contact",
        ],
    ),
    ("sole trader", "year-end accounts"): ChecklistConfig(
        business_type="Sole Trader",
        service="Year-end accounts",
        required_documents=[
            "bank_statement",
            "id",
            "proof_of_address",
            "prior_year_accounts",
        ],
        required_form_fields=[
            "business_type",
            "service_requested",
            "turnover_band",
            "contact",
        ],
    ),
    ("partnership", "year-end accounts"): ChecklistConfig(
        business_type="Partnership",
        service="Year-end accounts",
        required_documents=[
            "bank_statement",
            "partnership_agreement",
            "prior_year_accounts",
            "id",
            "proof_of_address",
        ],
        required_form_fields=[
            "business_type",
            "service_requested",
            "turnover_band",
            "contact",
        ],
    ),
    ("ltd", "vat"): ChecklistConfig(
        business_type="Ltd",
        service="VAT",
        required_documents=[
            "bank_statement",
            "sales_invoices",
            "purchase_receipts",
            "vat_certificate",
        ],
        required_form_fields=[
            "business_type",
            "service_requested",
            "relevant_date",
            "contact",
        ],
    ),
    ("ltd", "payroll"): ChecklistConfig(
        business_type="Ltd",
        service="Payroll",
        required_documents=[
            "payroll_summary",
            "p45_p46_forms",
            "pension_details",
            "id",
        ],
        required_form_fields=[
            "business_type",
            "service_requested",
            "employee_count",
            "contact",
        ],
    ),
}


@dataclass
class IntakePayload:
    """Incoming prospect intake form payload."""

    business_type: str
    service_requested: str
    turnover_band: str
    employee_count: int
    contact: Union[ContactInfo, Dict[str, str]]
    relevant_date: Optional[str] = None
    existing_provider: Optional[str] = None
    notes: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "IntakePayload":
        contact_raw = data.get("contact", {})
        if isinstance(contact_raw, dict):
            contact = ContactInfo(
                name=str(contact_raw.get("name", "")).strip(),
                email=str(contact_raw.get("email", "")).strip(),
                phone=str(contact_raw.get("phone", "")).strip(),
            )
        elif isinstance(contact_raw, ContactInfo):
            contact = contact_raw
        else:
            raise ValueError(f"Invalid contact format: expected dict or ContactInfo, got {type(contact_raw).__name__}")

        return cls(
            business_type=str(data.get("business_type", "")).strip(),
            service_requested=str(data.get("service_requested", "")).strip(),
            turnover_band=str(data.get("turnover_band", "")).strip(),
            employee_count=int(data.get("employee_count", 0)),
            contact=contact,
            relevant_date=str(data.get("relevant_date", "")).strip() or None,
            existing_provider=str(data.get("existing_provider", "")).strip() or "None",
            notes=str(data.get("notes", "")).strip() or None,
        )


@dataclass
class IntakeResult:
    """Detailed result of processing an intake submission."""

    client_record: ClientRecord
    intake_payload: IntakePayload
    checklist_config: Optional[ChecklistConfig] = None
    validation_warnings: List[str] = field(default_factory=list)


def generate_client_id(prefix: str = "CLI", date: Optional[datetime] = None) -> str:
    """Generate a unique client ID conforming to 'CLI-YYYYMMDD-XXXX'.

    Args:
        prefix: Custom prefix (default: 'CLI').
        date: Optional specific datetime (default: current UTC time).

    Returns:
        Formatted unique ID string, e.g. 'CLI-20260918-A7B9'.
    """
    dt = date or datetime.now(timezone.utc)
    date_str = dt.strftime("%Y%m%d")
    chars = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    suffix = "".join(secrets.choice(chars) for _ in range(4))
    return f"{prefix}-{date_str}-{suffix}"


def _normalize_key(business_type: str, service: str) -> Tuple[str, str]:
    """Normalize business_type and service names for consistent matching."""
    bt = business_type.lower().strip()
    if bt in {"ltd", "ltd.", "limited", "private limited company"}:
        bt = "ltd"
    elif bt in {"sole trader", "sole-trader", "sole proprietorship", "individual"}:
        bt = "sole trader"
    elif bt in {"partnership", "llp", "general partnership"}:
        bt = "partnership"

    srv = service.lower().strip()
    if "year-end" in srv or "year end" in srv or "annual accounts" in srv:
        srv = "year-end accounts"
    elif "vat" in srv:
        srv = "vat"
    elif "payroll" in srv:
        srv = "payroll"

    return bt, srv


def load_checklist_configs(
    config_path: Optional[str] = None,
) -> Dict[Tuple[str, str], ChecklistConfig]:
    """Load checklist configurations from a JSON file.

    Falls back to DEFAULT_CHECKLIST_CONFIG if file is missing or invalid.

    Args:
        config_path: Optional path to JSON configuration file.
                     Defaults to repo-root 'config/checklists.json'.

    Returns:
        Dictionary mapping normalized (business_type, service) -> ChecklistConfig.
    """
    if config_path is None:
        default_path = Path(_PARENT_DIR) / "config" / "checklists.json"
    else:
        default_path = Path(config_path)

    configs: Dict[Tuple[str, str], ChecklistConfig] = dict(DEFAULT_CHECKLIST_CONFIG)

    if default_path.exists():
        try:
            with open(default_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        cfg = ChecklistConfig.from_dict(item)
                        key = _normalize_key(cfg.business_type, cfg.service)
                        configs[key] = cfg
            elif isinstance(data, dict):
                for _, item in data.items():
                    if isinstance(item, dict):
                        cfg = ChecklistConfig.from_dict(item)
                        key = _normalize_key(cfg.business_type, cfg.service)
                        configs[key] = cfg
        except Exception:
            # Maintain fallback defaults on parse failure
            pass

    return configs


def resolve_checklist(
    business_type: str,
    service: str,
    custom_configs: Optional[Dict[Tuple[str, str], ChecklistConfig]] = None,
) -> Tuple[List[str], Optional[ChecklistConfig]]:
    """Determine required documents for a business type and service.

    Args:
        business_type: Business type (e.g. 'Ltd', 'Sole Trader').
        service: Service requested (e.g. 'Year-end accounts', 'VAT').
        custom_configs: Optional explicit dictionary of ChecklistConfig.

    Returns:
        Tuple of (list_of_required_document_types, ChecklistConfig or None).
    """
    configs = custom_configs if custom_configs is not None else load_checklist_configs()
    norm_key = _normalize_key(business_type, service)

    if norm_key in configs:
        cfg = configs[norm_key]
        return list(cfg.required_documents), cfg

    # Fallback to default stub for Ltd + Year-end accounts
    if norm_key == ("ltd", "year-end accounts"):
        return list(DEFAULT_LTD_YEAR_END_CHECKLIST), None

    # Generic fallback
    return ["bank_statement", "id", "proof_of_address"], None


def validate_intake_payload(payload: IntakePayload) -> List[str]:
    """Validate intake payload fields, returning a list of validation errors.

    Args:
        payload: IntakePayload to validate.

    Returns:
        List of error strings (empty if valid).
    """
    errors: List[str] = []

    if not payload.business_type:
        errors.append("business_type must not be empty.")

    if not payload.service_requested:
        errors.append("service_requested must not be empty.")

    if not payload.turnover_band:
        errors.append("turnover_band must not be empty.")

    if payload.employee_count < 0:
        errors.append(f"employee_count must be >= 0, got {payload.employee_count}.")

    contact = payload.contact
    if isinstance(contact, dict):
        name = str(contact.get("name", "")).strip()
        email = str(contact.get("email", "")).strip()
        phone = str(contact.get("phone", "")).strip()
    elif isinstance(contact, ContactInfo):
        name = contact.name.strip()
        email = contact.email.strip()
        phone = contact.phone.strip()
    else:
        name, email, phone = "", "", ""
        errors.append("contact must be a dict or ContactInfo instance.")

    if not name:
        errors.append("contact.name must not be empty.")

    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not email or not re.match(email_regex, email):
        errors.append(f"contact.email '{email}' is invalid.")

    if not phone:
        errors.append("contact.phone must not be empty.")

    if payload.relevant_date:
        # Check standard date formats like YYYY-MM-DD
        date_regex = r"^\d{4}-\d{2}-\d{2}"
        if not re.match(date_regex, payload.relevant_date):
            errors.append(
                f"relevant_date '{payload.relevant_date}' must follow ISO YYYY-MM-DD format."
            )

    return errors


class IntakeService:
    """Service handling prospect intake, validation, checklist provisioning, and CRM persistence."""

    def __init__(
        self,
        crm_store: Optional[CRMStore] = None,
        config_path: Optional[str] = None,
        checklist_configs: Optional[Dict[Tuple[str, str], ChecklistConfig]] = None,
    ):
        """Initialize IntakeService.

        Args:
            crm_store: Optional CRMStore repository instance.
            config_path: Optional path to checklists.json configuration.
            checklist_configs: Optional pre-loaded checklist configuration dictionary.
        """
        self.crm_store = crm_store
        self.config_path = config_path
        self._checklist_configs = (
            checklist_configs
            if checklist_configs is not None
            else load_checklist_configs(config_path)
        )

    def submit_intake(
        self,
        payload: Optional[Union[IntakePayload, Dict[str, Any]]] = None,
        **kwargs: Any,
    ) -> ClientRecord:
        """Process an intake submission and return a strictly conforming ClientRecord.

        Args:
            payload: IntakePayload or dict containing intake parameters.
            **kwargs: Can be used to provide intake fields directly as kwargs.

        Returns:
            ClientRecord strictly matching contracts.py.

        Raises:
            ValueError: If intake payload fails validation.
        """
        result = self.process_intake(payload=payload, **kwargs)
        return result.client_record

    def process_intake(
        self,
        payload: Optional[Union[IntakePayload, Dict[str, Any]]] = None,
        **kwargs: Any,
    ) -> IntakeResult:
        """Process an intake submission and return full IntakeResult details.

        Args:
            payload: IntakePayload or dict containing intake parameters.
            **kwargs: Direct field kwargs.

        Returns:
            IntakeResult containing ClientRecord and metadata.

        Raises:
            ValueError: If payload fails validation.
        """
        # Unify input into IntakePayload
        if payload is None:
            combined_data = dict(kwargs)
            intake = IntakePayload.from_dict(combined_data)
        elif isinstance(payload, dict):
            combined_data = dict(payload)
            combined_data.update(kwargs)
            intake = IntakePayload.from_dict(combined_data)
        elif isinstance(payload, IntakePayload):
            intake = payload
        else:
            raise TypeError(
                f"Expected IntakePayload or dict, got {type(payload).__name__}"
            )

        # Validate
        errors = validate_intake_payload(intake)
        if errors:
            raise ValueError(f"Intake validation failed: {'; '.join(errors)}")

        # Ensure contact is ContactInfo
        if isinstance(intake.contact, dict):
            contact_info = ContactInfo(
                name=str(intake.contact.get("name", "")).strip(),
                email=str(intake.contact.get("email", "")).strip(),
                phone=str(intake.contact.get("phone", "")).strip(),
            )
        else:
            contact_info = intake.contact

        # Generate unique client_id
        client_id = generate_client_id()
        if self.crm_store is not None:
            # Guard against potential collision
            while self.crm_store.get(client_id) is not None:
                client_id = generate_client_id()

        # Determine checklist_required
        required_docs, cfg = resolve_checklist(
            business_type=intake.business_type,
            service=intake.service_requested,
            custom_configs=self._checklist_configs,
        )

        now_iso = datetime.now(timezone.utc).isoformat()

        # Build ClientRecord strictly conforming to contracts.py
        client_record = ClientRecord(
            client_id=client_id,
            business_type=intake.business_type,
            service_requested=intake.service_requested,
            turnover_band=intake.turnover_band,
            employee_count=intake.employee_count,
            contact=contact_info,
            status=ClientStatus.NEW.value,  # Initial status strictly 'New'
            checklist_required=required_docs,
            documents_received=[],
            missing_items=list(required_docs),  # All required documents initially missing
            created_at=now_iso,
            updated_at=now_iso,
        )

        # Persist to CRM store if configured
        if self.crm_store is not None:
            metadata = {
                "relevant_date": intake.relevant_date,
                "existing_provider": intake.existing_provider,
                "notes": intake.notes,
            }
            self.crm_store.save(client_record, metadata=metadata)

        return IntakeResult(
            client_record=client_record,
            intake_payload=intake,
            checklist_config=cfg,
        )


def submit_client_intake(
    business_type: str,
    service_requested: str,
    turnover_band: str,
    employee_count: int,
    contact: Union[ContactInfo, Dict[str, str]],
    relevant_date: Optional[str] = None,
    existing_provider: Optional[str] = None,
    crm_store: Optional[CRMStore] = None,
    config_path: Optional[str] = None,
) -> ClientRecord:
    """Convenience functional wrapper to submit an intake and produce a ClientRecord."""
    service = IntakeService(crm_store=crm_store, config_path=config_path)
    payload = IntakePayload(
        business_type=business_type,
        service_requested=service_requested,
        turnover_band=turnover_band,
        employee_count=employee_count,
        contact=contact,
        relevant_date=relevant_date,
        existing_provider=existing_provider,
    )
    return service.submit_intake(payload)
