# Agent 1 — Intake & CRM Agent

Part of the multi-agent administrative automation pipeline for professional services firms.

## Mission
Agent 1 is the front-door intake engine and CRM repository. It captures prospect details, validates input parameters, generates standardized client IDs, provisions service-specific document collection checklists, creates strictly conforming `ClientRecord` entities, and persists them in the CRM store.

## Hard Boundary
> **ADMINISTRATIVE AUTOMATION ONLY**
> This system automates administrative intake, document collection, gap detection, reminder scheduling, and pre-meeting factual summaries. It **never** generates, implies, or simulates autonomous tax, accounting, legal, or regulated professional advice. All client-facing and staff-facing outputs carry a non-negotiable notice to this effect.

---

## Shared Contract Conformance
All data structures and outputs strictly adhere to `/Users/macrorld/ps-admin-automation/contracts.py`:

- **Entity**: Produces instances of `contracts.ClientRecord` with embedded `contracts.ContactInfo`.
- **Initial Status**: Always strictly initialized to `"New"` (`contracts.ClientStatus.NEW.value`).
- **Client ID Format**: `CLI-YYYYMMDD-XXXX` (e.g., `CLI-20260918-A7B9`), ensuring uniqueness.
- **Checklist Provisioning**:
  - Dynamically loaded from `config/checklists.json` matching `contracts.ChecklistConfig`.
  - Built-in fallback stub for **Ltd + 'Year-end accounts'**:
    ```python
    [
      "bank_statement",
      "prior_year_accounts",
      "payroll_summary",
      "id",
      "proof_of_address",
      "vat_certificate"
    ]
    ```
  - Initializes `client_record.checklist_required` with the resolved document types.
  - Initializes `client_record.missing_items` to match `checklist_required`.
  - Leaves `client_record.documents_received` empty `[]` ready for Agent 2 ingestion.

---

## Modular Components

### 1. `intake_service.py`
Provides form validation, ID generation, checklist mapping, and record creation.
- Supported input parameters:
  - `business_type`: e.g. `'Ltd'`, `'Sole Trader'`, `'Partnership'`
  - `service_requested`: e.g. `'Year-end accounts'`, `'VAT'`, `'Payroll'`
  - `turnover_band`: e.g. `'£100k - £250k'`, `'£250k - £500k'`, `'£500k - £1m'`
  - `employee_count`: integer `>= 0`
  - `contact`: `{ name, email, phone }` or `ContactInfo`
  - `relevant_date`: e.g. year-end date `'2025-12-31'`
  - `existing_provider`: optional string (e.g. `'Previous Accountant Ltd'` or `'None'`)
  - `notes`: optional administrative notes

### 2. `crm_store.py`
Persistent or in-memory repository for `ClientRecord` entities.
- Atomic file-based JSON persistence (`data/crm_clients.json`) with `.tmp` staging to prevent file corruption.
- Thread-safe in-memory caching with `threading.RLock()`.
- Supplementary metadata persistence (`relevant_date`, `existing_provider`).
- Methods:
  - `save(record, metadata=None) -> ClientRecord`
  - `get(client_id) -> Optional[ClientRecord]`
  - `get_metadata(client_id) -> Dict[str, Any]`
  - `update(record) -> ClientRecord`
  - `update_status(client_id, new_status) -> ClientRecord` (validates against `VALID_STATUSES`)
  - `list_all() -> List[ClientRecord]`
  - `filter_by_status(status) -> List[ClientRecord]`
  - `delete(client_id) -> bool`

### 3. `test_agent1.py`
Standard library test suite (`unittest`, zero third-party dependencies) covering:
- Schema validation and round-trip serialization with `contracts.py`.
- Form validation (email syntax, negative employee counts, empty fields).
- Checklist resolution and fallback mechanisms.
- CRMStore CRUD, persistence reload, and status transitions.
- Downstream interoperability with Agent 3 gap detector.

---

## Quickstart

```python
from contracts import ClientRecord, ClientStatus
from agent1_intake_crm.crm_store import CRMStore
from agent1_intake_crm.intake_service import IntakeService

# Initialize persistent CRM store
store = CRMStore()  # saves to data/crm_clients.json

# Initialize intake service
service = IntakeService(crm_store=store)

# Submit intake
client = service.submit_intake({
    "business_type": "Ltd",
    "service_requested": "Year-end accounts",
    "turnover_band": "£250k - £500k",
    "employee_count": 4,
    "relevant_date": "2025-12-31",
    "contact": {
        "name": "Jane Smith",
        "email": "jane@techcorp.co.uk",
        "phone": "+44 20 7123 4567"
    },
    "existing_provider": "Prior Accountants LLP"
})

print(f"Created Client: {client.client_id} (Status: {client.status})")
print(f"Checklist Required: {client.checklist_required}")
print(f"Missing Items: {client.missing_items}")
```

---

## Running Tests

```bash
# From repository root
python3 agent1_intake_crm/test_agent1.py

# Or via unittest discovery
python3 -m unittest discover -s agent1_intake_crm -p "test_*.py"
```
