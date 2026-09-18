"""
Authoritative Dynamic Admin Configuration Engine.
Everything in the system (Theme, Branding, Vertical Checklists, Form Fields,
OpenAI Model Settings, Escalating Reminder Templates, and Compliance Notices)
is dynamically managed, stored, and fetched from here.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import json
import os
from pathlib import Path

# Default Admin Configuration
DEFAULT_THEME = {
    "firm_name": "Apex Professional Advisory",
    "tagline": "Automated Administrative Onboarding & Verification",
    "portal_title": "Secure Client Intake & Document Portal",
    "primary_color": "#1e3a8a",       # Royal Blue
    "secondary_color": "#0284c7",     # Sky Blue
    "accent_color": "#f59e0b",        # Amber Gold
    "background_color": "#f8fafc",    # Light Slate
    "surface_color": "#ffffff",       # Pure White
    "card_border_color": "#e2e8f0",   # Border Grey
    "text_primary": "#0f172a",        # Slate 900
    "text_secondary": "#475569",      # Slate 600
    "success_color": "#16a34a",       # Emerald Green
    "warning_color": "#d97706",       # Amber 600
    "danger_color": "#dc2626",        # Crimson Red
    "font_family": "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "border_radius": "8px",
    "dark_mode": False
}

DEFAULT_OPENAI_SETTINGS = {
    "api_key_env_var": "OPENAI_API_KEY",
    "api_key": os.environ.get("OPENAI_API_KEY", ""),
    "model": "gpt-4o-mini",
    "fallback_model": "gpt-3.5-turbo",
    "temperature": 0.1,
    "max_tokens": 1500,
    "use_openai_for_extraction": True,
    "use_openai_for_summary": True,
    "use_openai_for_reminders": True
}

DEFAULT_COMPLIANCE_SETTINGS = {
    "strict_mode": True,
    "mandatory_disclaimer": "NOTICE: Information only — not professional tax, accounting, or legal advice. This administrative summary extracts factual data for review by licensed professionals.",
    "confidence_review_threshold": 0.85,
    "block_prescriptive_tax_advice": True,
    "block_prescriptive_legal_advice": True
}

DEFAULT_INTAKE_FIELDS = [
    {
        "field_id": "business_type",
        "label": "Business Structure",
        "field_type": "select",
        "options": ["Ltd", "Sole Trader", "Partnership", "LLP"],
        "required": True,
        "help_text": "Select your legal entity type."
    },
    {
        "field_id": "service_requested",
        "label": "Service Requested",
        "field_type": "select",
        "options": ["Year-end accounts", "VAT", "Payroll", "Self Assessment", "Conveyancing", "Corporate Advisory"],
        "required": True,
        "help_text": "Choose the primary administrative service you require."
    },
    {
        "field_id": "turnover_band",
        "label": "Annual Turnover Band",
        "field_type": "select",
        "options": ["Under £100k", "£100k - £250k", "£250k - £500k", "£500k - £1m", "£1m - £5m", "£5m+"],
        "required": True,
        "help_text": "Estimated gross revenue."
    },
    {
        "field_id": "employee_count",
        "label": "Employee Count",
        "field_type": "number",
        "required": True,
        "min": 0,
        "help_text": "Total number of employees on payroll."
    },
    {
        "field_id": "relevant_date",
        "label": "Accounting Year-End / Key Date",
        "field_type": "date",
        "required": False,
        "help_text": "Your company year-end date or target milestone."
    },
    {
        "field_id": "contact_name",
        "label": "Contact Full Name",
        "field_type": "text",
        "required": True,
        "placeholder": "e.g. John David Smith"
    },
    {
        "field_id": "contact_email",
        "label": "Contact Email Address",
        "field_type": "email",
        "required": True,
        "placeholder": "e.g. john@example.co.uk"
    },
    {
        "field_id": "contact_phone",
        "label": "Phone Number",
        "field_type": "tel",
        "required": True,
        "placeholder": "e.g. +44 20 7946 0912"
    },
    {
        "field_id": "existing_provider",
        "label": "Previous / Existing Provider",
        "field_type": "text",
        "required": False,
        "placeholder": "e.g. Prior Accountant Ltd or None"
    }
]

DEFAULT_CHECKLISTS = {
    "Ltd": {
        "Year-end accounts": {
            "required_documents": [
                "bank_statement",
                "prior_year_accounts",
                "payroll_summary",
                "id",
                "proof_of_address",
                "vat_certificate"
            ],
            "required_form_fields": ["business_type", "service_requested", "turnover_band", "employee_count", "contact"]
        },
        "VAT": {
            "required_documents": ["bank_statement", "vat_certificate", "id", "proof_of_address"],
            "required_form_fields": ["business_type", "service_requested", "turnover_band", "contact"]
        },
        "Payroll": {
            "required_documents": ["payroll_summary", "id", "bank_statement"],
            "required_form_fields": ["business_type", "service_requested", "employee_count", "contact"]
        }
    },
    "Sole Trader": {
        "Self Assessment": {
            "required_documents": ["bank_statement", "id", "proof_of_address", "expense_records"],
            "required_form_fields": ["business_type", "service_requested", "turnover_band", "contact"]
        },
        "Year-end accounts": {
            "required_documents": ["bank_statement", "id", "proof_of_address", "expense_records"],
            "required_form_fields": ["business_type", "service_requested", "turnover_band", "contact"]
        }
    },
    "Law Firm": {
        "Conveyancing": {
            "required_documents": ["id", "proof_of_address", "source_of_funds", "property_title_deeds"],
            "required_form_fields": ["business_type", "service_requested", "contact", "property_address", "transaction_value"]
        }
    }
}

DEFAULT_REMINDER_SCHEDULE = {
    "chase_tiers": [
        {
            "tier": 1,
            "days_elapsed": 2,
            "tone": "polite",
            "subject_template": "Action Required: Documents needed to complete your onboarding - {client_name}",
            "headline": "Welcome to {firm_name} — Initial Document Request",
            "message": "Thank you for starting your onboarding with us. To begin preparing your {service_requested}, our administrative intake team requires a few additional documents listed below."
        },
        {
            "tier": 2,
            "days_elapsed": 5,
            "tone": "firm",
            "subject_template": "Reminder: File review on hold pending outstanding documents - {client_name}",
            "headline": "Onboarding Review On Hold",
            "message": "We are writing to remind you that review of your {service_requested} file cannot begin until we receive the remaining required documents. Prompt submission ensures no deadline delays."
        },
        {
            "tier": 3,
            "days_elapsed": 9,
            "tone": "urgent",
            "subject_template": "FINAL NOTICE: Inactive file warning for {client_name} - Action required",
            "headline": "Final Administrative Notice — Immediate Action Required",
            "message": "This is our final follow-up regarding missing documentation for your {service_requested} onboarding. If these documents are not uploaded within 48 hours, your file will be marked inactive."
        }
    ]
}


class AdminConfigStore:
    """Persistent dynamic configuration store for all administrative settings."""

    def __init__(self, config_file: Optional[str] = None):
        if config_file:
            self.config_file = Path(config_file)
        else:
            self.config_file = Path(__file__).resolve().parent / "config" / "admin_dynamic_config.json"
        
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        self._data: Dict[str, Any] = {}
        self.load()

    def load(self):
        """Loads configuration from file or initializes defaults."""
        if self.config_file.exists():
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
                return
            except Exception:
                pass

        # Initialize defaults
        self._data = {
            "version": "2.0.0",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "theme": dict(DEFAULT_THEME),
            "openai": dict(DEFAULT_OPENAI_SETTINGS),
            "compliance": dict(DEFAULT_COMPLIANCE_SETTINGS),
            "intake_fields": list(DEFAULT_INTAKE_FIELDS),
            "checklists": dict(DEFAULT_CHECKLISTS),
            "reminder_schedule": dict(DEFAULT_REMINDER_SCHEDULE)
        }
        self.save()

    def save(self):
        """Persists current configuration atomically."""
        self._data["updated_at"] = datetime.now(timezone.utc).isoformat()
        tmp_file = self.config_file.with_suffix(".tmp")
        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2)
        tmp_file.replace(self.config_file)

    def get_all(self) -> Dict[str, Any]:
        """Returns the full dynamic configuration."""
        return dict(self._data)

    def get_theme(self) -> Dict[str, Any]:
        """Fetches dynamic theme and branding."""
        return dict(self._data.get("theme", DEFAULT_THEME))

    def update_theme(self, theme_updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates dynamic theme and saves."""
        current = self._data.setdefault("theme", dict(DEFAULT_THEME))
        current.update(theme_updates)
        self.save()
        return current

    def get_openai_settings(self) -> Dict[str, Any]:
        """Fetches dynamic OpenAI API configuration."""
        settings = dict(self._data.get("openai", DEFAULT_OPENAI_SETTINGS))
        # Always check environment override if key is not explicitly set in config
        if not settings.get("api_key"):
            settings["api_key"] = os.environ.get("OPENAI_API_KEY", "")
        return settings

    def update_openai_settings(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Updates OpenAI model and API parameters."""
        current = self._data.setdefault("openai", dict(DEFAULT_OPENAI_SETTINGS))
        current.update(settings)
        self.save()
        return current

    def get_compliance_settings(self) -> Dict[str, Any]:
        return dict(self._data.get("compliance", DEFAULT_COMPLIANCE_SETTINGS))

    def get_intake_fields(self) -> List[Dict[str, Any]]:
        return list(self._data.get("intake_fields", DEFAULT_INTAKE_FIELDS))

    def get_checklists(self) -> Dict[str, Any]:
        return dict(self._data.get("checklists", DEFAULT_CHECKLISTS))

    def get_checklist_for(self, business_type: str, service: str) -> Optional[Dict[str, Any]]:
        """Dynamic lookup of required documents for any vertical."""
        checklists = self.get_checklists()
        # Direct lookup
        by_type = checklists.get(business_type)
        if by_type and service in by_type:
            return by_type[service]
        # Fallback for aliases
        for btype, services in checklists.items():
            if btype.lower() == business_type.lower():
                for sname, cfg in services.items():
                    if sname.lower() == service.lower():
                        return cfg
        return None

    def get_reminder_schedule(self) -> Dict[str, Any]:
        return dict(self._data.get("reminder_schedule", DEFAULT_REMINDER_SCHEDULE))

    def generate_theme_css(self) -> str:
        """Dynamically generates CSS custom properties (variables) from admin theme."""
        theme = self.get_theme()
        return f"""
        :root {{
            --primary-color: {theme.get('primary_color', '#1e3a8a')};
            --secondary-color: {theme.get('secondary_color', '#0284c7')};
            --accent-color: {theme.get('accent_color', '#f59e0b')};
            --bg-color: {theme.get('background_color', '#f8fafc')};
            --surface-color: {theme.get('surface_color', '#ffffff')};
            --border-color: {theme.get('card_border_color', '#e2e8f0')};
            --text-primary: {theme.get('text_primary', '#0f172a')};
            --text-secondary: {theme.get('text_secondary', '#475569')};
            --success-color: {theme.get('success_color', '#16a34a')};
            --warning-color: {theme.get('warning_color', '#d97706')};
            --danger-color: {theme.get('danger_color', '#dc2626')};
            --font-family: {theme.get('font_family', "system-ui, sans-serif")};
            --radius: {theme.get('border_radius', '8px')};
        }}
        """

# Global singleton instance
admin_store = AdminConfigStore()
