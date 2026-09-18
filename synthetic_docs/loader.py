"""
Synthetic Document Pack Loader for Professional Services Admin Automation.
Provides ready-to-use DocumentRecord and ClientRecord instances for testing and pipeline execution.
Conforms strictly to contracts.py schemas.
"""
from pathlib import Path
import json
import sys
from typing import List, Dict, Any, Optional

# Ensure project root is on sys.path so contracts can be imported reliably
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from contracts import DocumentRecord, ClientRecord, ContactInfo, ChecklistConfig, ClientStatus

SYNTHETIC_DIR = Path(__file__).resolve().parent

# Standard filenames for the document set
INITIAL_DOC_NAMES = [
    "bank_statement",
    "prior_year_accounts",
    "payroll_summary",
    "director_id",
    "vat_certificate"
]

# Deliberately omitted item from the initial upload batch
OMITTED_DOC_NAME = "proof_of_address"


def load_document_record(name: str) -> DocumentRecord:
    """Load a DocumentRecord from its JSON metadata file."""
    json_path = SYNTHETIC_DIR / f"{name}.json"
    if not json_path.exists():
        raise FileNotFoundError(f"Synthetic document metadata not found: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return DocumentRecord.from_dict(data)


def load_raw_text(name: str) -> str:
    """Load raw text OCR / document content from its .txt file."""
    txt_path = SYNTHETIC_DIR / f"{name}.txt"
    if not txt_path.exists():
        raise FileNotFoundError(f"Synthetic document text not found: {txt_path}")
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read()


def get_initial_document_batch() -> List[DocumentRecord]:
    """
    Returns the initial batch of uploaded documents received from the client.
    CRITICAL REQUIREMENT: Deliberately OMITS 'proof_of_address' to test gap detection.
    """
    batch = [load_document_record(name) for name in INITIAL_DOC_NAMES]
    # Explicit assert to guarantee proof_of_address is NOT in initial batch
    assert not any(d.doc_type == "proof_of_address" for d in batch), (
        "Compliance error: proof_of_address must be omitted from initial batch!"
    )
    return batch


def get_followup_document_batch() -> List[DocumentRecord]:
    """
    Returns the follow-up document upload containing 'proof_of_address'
    to satisfy missing item requirements in step 2.
    """
    return [load_document_record(OMITTED_DOC_NAME)]


def get_all_documents() -> List[DocumentRecord]:
    """Returns the full set of clean documents (initial + follow-up)."""
    return get_initial_document_batch() + get_followup_document_batch()


def get_noisy_document() -> DocumentRecord:
    """Returns the low-confidence / noisy VAT certificate scan (confidence 0.65)."""
    return load_document_record("vat_certificate_noisy")


def get_synthetic_client_profile() -> ClientRecord:
    """
    Returns a standard synthetic ClientRecord for Apex Trading Ltd,
    reflecting an initial intake for Limited Company Year-End Accounts & Tax.
    """
    contact = ContactInfo(
        name="John David Smith",
        email="john.smith@apextrading.co.uk",
        phone="+44 20 7946 0912"
    )
    required_docs = [
        "bank_statement",
        "prior_year_accounts",
        "payroll_summary",
        "director_id",
        "vat_certificate",
        "proof_of_address"
    ]
    return ClientRecord(
        client_id="client_apex_001",
        business_type="Limited Company",
        service_requested="Year-End Accounts & Tax",
        turnover_band="£500k-£1m",
        employee_count=5,
        contact=contact,
        status=ClientStatus.AWAITING_DOCUMENTS.value,
        checklist_required=required_docs,
        documents_received=[],
        missing_items=list(required_docs)
    )


def get_accountancy_checklist_config() -> ChecklistConfig:
    """Returns the default ChecklistConfig for Limited Company Year-End Accounts & Tax."""
    return ChecklistConfig(
        business_type="Limited Company",
        service="Year-End Accounts & Tax",
        required_documents=[
            "bank_statement",
            "prior_year_accounts",
            "payroll_summary",
            "director_id",
            "vat_certificate",
            "proof_of_address"
        ],
        required_form_fields=[
            "company_name",
            "company_number",
            "contact_name",
            "contact_email",
            "contact_phone",
            "turnover_band",
            "employee_count"
        ]
    )


if __name__ == "__main__":
    print("=== SYNTHETIC DOCUMENT PACK VALIDATION ===")
    initial = get_initial_document_batch()
    print(f"✓ Loaded {len(initial)} initial documents (proof_of_address omitted as required):")
    for doc in initial:
        print(f"  - {doc.doc_type} (conf={doc.confidence}, review={doc.needs_human_review})")

    followup = get_followup_document_batch()
    print(f"✓ Loaded {len(followup)} follow-up documents:")
    for doc in followup:
        print(f"  - {doc.doc_type} (conf={doc.confidence}, review={doc.needs_human_review})")

    noisy = get_noisy_document()
    print(f"✓ Loaded noisy document: {noisy.doc_type} (conf={noisy.confidence}, review={noisy.needs_human_review})")

    client = get_synthetic_client_profile()
    print(f"✓ Loaded synthetic client: {client.client_id} ({client.contact.name})")
    print("All synthetic fixtures loaded successfully!")
