# Cross-Vertical Portability Specification
**System Architecture:** Professional Services Admin Automation  
**Enforcement Authority:** Agent 5 — Compliance & QA Agent  
**Shared Contract Reference:** `contracts.py` (`ChecklistConfig`, `ClientRecord`, `DocumentRecord`)

---

## 1. Overview & Portability Principle
The administrative pipeline is architecturally decoupled from specific domain knowledge or industry-specific logic. The system operates on an abstracted declarative contract:

$$\text{Missing Items} = \text{ChecklistConfig.required\_documents} \setminus \{\text{DocumentRecord.doc\_type}\}$$

Because all document taxonomy, intake form validation, and gap detection evaluate `ChecklistConfig` at runtime, changing between **Accountancy**, **Legal (Conveyancing/Commercial Lease)**, and **Management Consulting** requires **ZERO lines of code modification**—only swapping a configuration file (JSON or YAML).

---

## 2. Declarative Configurations Across Verticals

### Vertical A: Accountancy Firm (Year-End Accounts & Tax)

#### JSON Configuration (`config_accountancy.json`)
```json
{
  "business_type": "Limited Company",
  "service": "Year-End Accounts & Tax",
  "required_documents": [
    "bank_statement",
    "prior_year_accounts",
    "payroll_summary",
    "director_id",
    "vat_certificate",
    "proof_of_address"
  ],
  "required_form_fields": [
    "company_name",
    "company_number",
    "contact_name",
    "contact_email",
    "contact_phone",
    "turnover_band",
    "employee_count"
  ]
}
```

#### YAML Configuration (`config_accountancy.yaml`)
```yaml
business_type: Limited Company
service: Year-End Accounts & Tax
required_documents:
  - bank_statement
  - prior_year_accounts
  - payroll_summary
  - director_id
  - vat_certificate
  - proof_of_address
required_form_fields:
  - company_name
  - company_number
  - contact_name
  - contact_email
  - contact_phone
  - turnover_band
  - employee_count
```

---

### Vertical B: Law Firm (Commercial Lease / Conveyancing)

#### JSON Configuration (`config_law_firm.json`)
```json
{
  "business_type": "Commercial Property Purchaser",
  "service": "Commercial Lease Conveyancing",
  "required_documents": [
    "title_deeds_register",
    "draft_commercial_lease",
    "headlease_copy",
    "proof_of_funds",
    "director_id_kyc",
    "commercial_energy_performance_certificate"
  ],
  "required_form_fields": [
    "property_address",
    "title_number",
    "proposed_term_years",
    "passing_rent_annual",
    "use_class",
    "landlord_solicitor_contact"
  ]
}
```

#### YAML Configuration (`config_law_firm.yaml`)
```yaml
business_type: Commercial Property Purchaser
service: Commercial Lease Conveyancing
required_documents:
  - title_deeds_register
  - draft_commercial_lease
  - headlease_copy
  - proof_of_funds
  - director_id_kyc
  - commercial_energy_performance_certificate
required_form_fields:
  - property_address
  - title_number
  - proposed_term_years
  - passing_rent_annual
  - use_class
  - landlord_solicitor_contact
```

---

### Vertical C: Management Consultancy (Digital Strategy Onboarding)

#### JSON Configuration (`config_consultancy.json`)
```json
{
  "business_type": "Corporate Enterprise",
  "service": "Digital Transformation Strategy Onboarding",
  "required_documents": [
    "signed_master_services_agreement",
    "statement_of_work_sow",
    "client_org_chart",
    "target_architecture_blueprint",
    "mutual_nda_counterpart",
    "billing_entity_ap_setup"
  ],
  "required_form_fields": [
    "executive_sponsor_name",
    "executive_sponsor_title",
    "procurement_po_number",
    "target_kickoff_date",
    "primary_cost_center",
    "security_clearance_level"
  ]
}
```

#### YAML Configuration (`config_consultancy.yaml`)
```yaml
business_type: Corporate Enterprise
service: Digital Transformation Strategy Onboarding
required_documents:
  - signed_master_services_agreement
  - statement_of_work_sow
  - client_org_chart
  - target_architecture_blueprint
  - mutual_nda_counterpart
  - billing_entity_ap_setup
required_form_fields:
  - executive_sponsor_name
  - executive_sponsor_title
  - procurement_po_number
  - target_kickoff_date
  - primary_cost_center
  - security_clearance_level
```

---

## 3. Zero-Code Engine Verification Proof

The Python snippet below proves how the exact same pipeline code operates on all three verticals indiscriminately:

```python
import json
from contracts import ChecklistConfig, ClientRecord, DocumentRecord, ContactInfo, ClientStatus

def evaluate_gap_and_provision(config_data: dict, uploaded_doc_types: list[str]) -> dict:
    """Core administrative engine logic: zero code changes required per vertical."""
    config = ChecklistConfig.from_dict(config_data)
    received_set = set(uploaded_doc_types)
    missing = [doc for doc in config.required_documents if doc not in received_set]
    is_ready = (len(missing) == 0)
    
    return {
        "service": config.service,
        "total_required": len(config.required_documents),
        "received_count": len(received_set),
        "missing_count": len(missing),
        "missing_items": missing,
        "status": ClientStatus.READY.value if is_ready else ClientStatus.CHASING.value
    }

# Demonstration on Law Firm
law_config = {
    "business_type": "Commercial Property Purchaser",
    "service": "Commercial Lease Conveyancing",
    "required_documents": ["title_deeds_register", "draft_commercial_lease", "proof_of_funds", "director_id_kyc"],
    "required_form_fields": ["property_address", "title_number"]
}
# Client only uploaded deeds & ID
result_law = evaluate_gap_and_provision(law_config, ["title_deeds_register", "director_id_kyc"])
print("Law Firm Gap Evaluation:", result_law)
# Output: status='Chasing', missing_items=['draft_commercial_lease', 'proof_of_funds']
```

---

## 4. Verification Matrix

| Evaluation Criteria | Accountancy Firm | Law Firm (Conveyancing) | Management Consultancy |
|:---|:---|:---|:---|
| **Config Interchangeability** | Pure JSON / YAML | Pure JSON / YAML | Pure JSON / YAML |
| **Pipeline Code Changes** | 0 Lines | 0 Lines | 0 Lines |
| **Document Record Schema** | `DocumentRecord` | `DocumentRecord` | `DocumentRecord` |
| **Gap Detection Logic** | Set difference | Set difference | Set difference |
| **Compliance Enforced** | Administrative Only | Administrative Only | Administrative Only |

This confirms 100% architectural portability across regulated professional services domains.
