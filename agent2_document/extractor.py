"""Key Field Extractor and Confidence Scoring Engine.

Extracts structured domain-specific key fields for classified documents,
computes overall confidence score, and flags documents requiring human review.
"""
import re
from typing import Dict, Any, Tuple, Optional, List

REQUIRED_FIELDS: Dict[str, List[str]] = {
    "bank_statement": ["bank_name", "closing_balance", "date_range"],
    "prior_year_accounts": ["turnover", "net_profit", "balance_sheet_total"],
    "vat_certificate": ["vat_number", "effective_date"],
    "id": ["full_name", "document_number", "expiry"],
    "director_id": ["full_name", "document_number", "expiry"],
    "payroll_summary": ["paye_reference", "total_gross_pay", "total_tax"],
    "proof_of_address": ["resident_name", "address", "issue_date"],
    "expense_records": ["total_expenses", "tax_year"],
    "source_of_funds": ["origin_of_funds", "amount"],
    "property_title_deeds": ["title_number", "property_address", "registered_owner"],
}

KNOWN_BANKS = [
    "Barclays Bank", "Barclays", "HSBC UK", "HSBC", "Lloyds Bank", "Lloyds",
    "NatWest", "Santander UK", "Santander", "Monzo Bank", "Monzo",
    "Starling Bank", "Starling", "Revolut", "Metro Bank", "Nationwide",
    "Royal Bank of Scotland", "RBS", "Clydesdale Bank", "TSB"
]


def _extract_regex(patterns: List[str], text: str, default: Any = None) -> Any:
    for pat in patterns:
        m = re.search(pat, text, flags=re.IGNORECASE | re.MULTILINE)
        if m:
            val = m.group(1).strip()
            # Clean up trailing punctuation
            val = re.sub(r"[\.,;]+$", "", val).strip()
            if val:
                return val
    return default


def extract_bank_statement_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # Bank Name
    if "bank_name" not in fields:
        for bank in KNOWN_BANKS:
            if re.search(rf"\b{re.escape(bank)}\b", text, re.IGNORECASE):
                fields["bank_name"] = bank
                break

    # Closing Balance
    if "closing_balance" not in fields:
        bal = _extract_regex([
            r"(?:closing\s+balance|balance\s+carried\s+forward|ending\s+balance|new\s+balance|final\s+balance)[:\s]*([£$€]?\s*[-+]?[\d,]+(?:\.\d{2})?)",
            r"(?:balance\s+on\s+[0-9A-Za-z\s]+)[:\s]*([£$€]?\s*[-+]?[\d,]+(?:\.\d{2})?)",
        ], text)
        if bal:
            fields["closing_balance"] = bal

    # Date Range / Period
    if "date_range" not in fields:
        rng = _extract_regex([
            r"(?:statement\s+period|date\s+range|period\s+covered|statement\s+dates?)[:\s]*([0-9]{1,2}[a-z]{0,2}\s+[A-Za-z]+\s+[0-9]{4}\s*(?:to|–|-)\s*[0-9]{1,2}[a-z]{0,2}\s+[A-Za-z]+\s+[0-9]{4})",
            r"(?:statement\s+period|date\s+range|period)[:\s]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}\s*(?:to|–|-)\s*[0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
            r"(?:statement\s+date|date)[:\s]*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})",
        ], text)
        if rng:
            fields["date_range"] = rng

    # Account and sort code if present
    if "account_number" not in fields:
        acc = _extract_regex([r"(?:account\s+(?:number|no))[:\s]*([0-9\s]{6,10})"], text)
        if acc:
            fields["account_number"] = re.sub(r"\s+", "", acc)
    if "sort_code" not in fields:
        sc = _extract_regex([r"(?:sort\s+code)[:\s]*([0-9]{2}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2})"], text)
        if sc:
            fields["sort_code"] = sc.strip()

    return fields


def extract_prior_accounts_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # Turnover
    if "turnover" not in fields:
        turnover = _extract_regex([
            r"(?:turnover|total\s+turnover|revenue|total\s+revenue)[:\s]*([£$€]?\s*[\d,]+(?:\.\d{2})?)",
        ], text)
        if turnover:
            fields["turnover"] = turnover

    # Net Profit
    if "net_profit" not in fields:
        profit = _extract_regex([
            r"(?:net\s+profit|profit\s+for\s+(?:the\s+)?(?:financial\s+)?year|profit\s+after\s+tax(?:ation)?|operating\s+profit)[:\s]*([£$€]?\s*[-+]?[\d,]+(?:\.\d{2})?)",
        ], text)
        if profit:
            fields["net_profit"] = profit

    # Balance Sheet Total
    if "balance_sheet_total" not in fields:
        bst = _extract_regex([
            r"(?:balance\s+sheet\s+total|total\s+assets\s+less\s+current\s+liabilities|total\s+net\s+assets|net\s+assets)[:\s]*([£$€]?\s*[-+]?[\d,]+(?:\.\d{2})?)",
        ], text)
        if bst:
            fields["balance_sheet_total"] = bst

    # Year ended / period
    if "period_covered" not in fields:
        period = _extract_regex([
            r"(?:for\s+the\s+year\s+ended|year\s+ended|period\s+ended)[:\s]*([0-9]{1,2}[a-z]{0,2}\s+[A-Za-z]+\s+[0-9]{4})",
            r"(?:for\s+the\s+year\s+ended|year\s+ended|period\s+ended)[:\s]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        ], text)
        if period:
            fields["period_covered"] = f"Year ended {period}"

    return fields


def extract_vat_certificate_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # VAT Number
    if "vat_number" not in fields:
        vat_num = _extract_regex([
            r"(?:vat\s+registration\s+number|vat\s+number|vat\s+no|registration\s+number)[:\s]*([A-Z]{2}\s*[0-9\s]{9,12}|[0-9\s]{9})",
            r"\b(GB\s*[0-9]{3}\s*[0-9]{4}\s*[0-9]{2})\b",
        ], text)
        if vat_num:
            fields["vat_number"] = re.sub(r"\s+", " ", vat_num).strip()

    # Effective Date
    if "effective_date" not in fields:
        eff_date = _extract_regex([
            r"(?:effective\s+date\s+of\s+registration|effective\s+date)[:\s]*([0-9]{1,2}[a-z]{0,2}\s+[A-Za-z]+\s+[0-9]{4})",
            r"(?:effective\s+date\s+of\s+registration|effective\s+date)[:\s]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        ], text)
        if eff_date:
            fields["effective_date"] = eff_date

    # Trader Name
    if "trader_name" not in fields:
        tname = _extract_regex([
            r"(?:trader\s+name|name\s+of\s+(?:registered\s+)?person|business\s+name)[:\s]*([^\n\r]+)",
        ], text)
        if tname:
            fields["trader_name"] = tname

    return fields


def extract_id_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # Full Name - check both direct and surname/given names formats
    if "full_name" not in fields:
        # Check bilingual surname + given names e.g. "Surname / Nom: SMITH \n Given Names / Prenoms: JOHN DAVID"
        s_match = re.search(r"Surname\s*(?:\/[^\n\r:]*)?:\s*([A-Za-z]+)", text, re.IGNORECASE)
        g_match = re.search(r"Given\s+Names?\s*(?:\/[^\n\r:]*)?:\s*([A-Za-z\s]+?)(?=\n|\r|$)", text, re.IGNORECASE)
        if s_match and g_match:
            s_val = s_match.group(1).strip().title()
            g_val = re.sub(r"\s+", " ", g_match.group(1)).strip().title()
            fields["full_name"] = f"{g_val} {s_val}".strip()
        else:
            name = _extract_regex([
                r"(?:full\s+name|holder\s+name)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
                r"^Name[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
            ], text)
            if name:
                fields["full_name"] = name

    # Document Number - e.g. "Passport No. / No.: 554981203" or "Passport No: 987654321"
    if "document_number" not in fields:
        doc_no = _extract_regex([
            r"(?:passport\s+no(?:\.|\s*\/[^\n\r:]*)?|document\s+no(?:\.|\s*\/[^\n\r:]*)?|licence\s+number|driver\s+number)[:\s]*([A-Za-z0-9]{7,18})",
            r"(?:Passport No|Document Number)[:\s]*([A-Za-z0-9]+)",
        ], text)
        if doc_no:
            fields["document_number"] = doc_no
        else:
            # Fallback 9-digit passport number in MRZ or document body
            mrz_doc = re.search(r"\b([0-9]{9})\b", text)
            if mrz_doc:
                fields["document_number"] = mrz_doc.group(1)

    # Expiry Date - e.g. "Date of Expiry / Date d'expiration: 14 MAY / MAI 2031"
    if "expiry" not in fields:
        exp = _extract_regex([
            r"(?:date\s+of\s+expiry(?:\s*\/[^\n\r:]*)?|expiry\s+date|expiry)[:\s]*([0-9]{1,2}[a-z]{0,2}\s+[A-Za-z\s\/]+\s+[0-9]{4})",
            r"(?:date\s+of\s+expiry|expiry\s+date|expiry)[:\s]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        ], text)
        if exp:
            # Clean bilingual month e.g. "14 MAY / MAI 2031" -> "14 May 2031"
            clean_exp = re.sub(r"\s*/\s*[A-Z]+", "", exp)
            fields["expiry"] = clean_exp.strip()

    return fields


def extract_payroll_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # PAYE Reference
    if "paye_reference" not in fields:
        paye = _extract_regex([
            r"(?:employer\s+paye\s+ref(?:erence)?|paye\s+ref(?:erence)?)[:\s]*([0-9]{3}\/[A-Za-z0-9]+)",
            r"\b([0-9]{3}\/[A-Z0-9]{5,10})\b",
        ], text)
        if paye:
            fields["paye_reference"] = paye

    # Total Gross Pay
    if "total_gross_pay" not in fields:
        gross = _extract_regex([
            r"(?:total\s+gross\s+pay|gross\s+pay|total\s+gross|total\s+pay)[:\s]*([£$€]?\s*[\d,]+(?:\.\d{2})?)",
        ], text)
        if gross:
            fields["total_gross_pay"] = gross

    # Total Tax
    if "total_tax" not in fields:
        tax = _extract_regex([
            r"(?:total\s+tax|tax\s+deducted|paye\s+tax|income\s+tax)[:\s]*([£$€]?\s*[\d,]+(?:\.\d{2})?)",
        ], text)
        if tax:
            fields["total_tax"] = tax

    # Employee count
    if "employee_count" not in fields:
        count = _extract_regex([
            r"(?:employee\s+count|number\s+of\s+employees|total\s+employees)[:\s]*(\d+)",
        ], text)
        if count:
            fields["employee_count"] = int(count)

    return fields


def extract_proof_of_address_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # Resident Name
    if "resident_name" not in fields:
        name = _extract_regex([
            r"(?:resident\s+name|account\s+holder|customer\s+name)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+?)(?=\n|\r|$)",
            r"Name[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+?)(?=\n|\r|$)",
        ], text)
        if name:
            fields["resident_name"] = name

    # Address
    if "address" not in fields:
        addr = _extract_regex([
            r"(?:property\s+address|service\s+address|billing\s+address)[:\s]*([^\n\r]+)",
            r"([0-9]+\s+[A-Za-z\s]+(?:Road|Street|Avenue|Lane|Way|Close|Hill|Court|Gardens|Drive|Square|Park),?\s*[A-Za-z\s]+,?\s*[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2})",
        ], text)
        if addr:
            fields["address"] = addr.strip()

    # Issue Date
    if "issue_date" not in fields:
        dt = _extract_regex([
            r"(?:bill\s+date|statement\s+date|issue\s+date|date\s+of\s+issue|date)[:\s]*([0-9]{1,2}[a-z]{0,2}\s+[A-Za-z]+\s+[0-9]{4})",
            r"(?:bill\s+date|statement\s+date|issue\s+date)[:\s]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4})",
        ], text)
        if dt:
            fields["issue_date"] = dt

    # Issuer
    if "issuer" not in fields:
        iss = _extract_regex([
            r"(Westminster\s+City\s+Council|Thames\s+Water|British\s+Gas|EDF\s+Energy|E\.ON|Octopus\s+Energy|Council\s+Tax)",
        ], text)
        if iss:
            fields["issuer"] = iss

    return fields


def extract_expense_records_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # Total Expenses
    if "total_expenses" not in fields:
        exp = _extract_regex([
            r"(?:total\s+expenses|total\s+allowable\s+expenses|total\s+business\s+expenses|total)[:\s]*([£$€]?\s*[\d,]+(?:\.\d{2})?)",
        ], text)
        if exp:
            fields["total_expenses"] = exp

    # Tax Year
    if "tax_year" not in fields:
        ty = _extract_regex([
            r"(?:tax\s+year|year)[:\s]*([0-9]{4}(?:[\/\-][0-9]{2,4})?)",
        ], text)
        if ty:
            fields["tax_year"] = ty

    return fields


def extract_source_of_funds_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # Origin of Funds
    if "origin_of_funds" not in fields:
        origin = _extract_regex([
            r"(?:origin\s+of\s+funds|funds\s+source|origin)[:\s]*([^\n\r]+)",
            r"(?:source\s+of\s+funds)[:\s]+([A-Za-z0-9\s,&]+?)(?=\n|\r|$)",
        ], text)
        if origin:
            fields["origin_of_funds"] = origin.strip()

    # Amount
    if "amount" not in fields:
        amt = _extract_regex([
            r"(?:funds\s+amount|amount|total\s+funds|declared\s+amount)[:\s]*([£$€]?\s*[\d,]+(?:\.\d{2})?)",
        ], text)
        if amt:
            fields["amount"] = amt

    # Bank Reference
    if "bank_reference" not in fields:
        ref = _extract_regex([
            r"(?:bank\s+reference|reference\s+no|reference)[:\s]*([A-Za-z0-9\-]+)",
        ], text)
        if ref:
            fields["bank_reference"] = ref

    return fields


def extract_property_deeds_fields(text: str, structured: Dict[str, Any]) -> Dict[str, Any]:
    fields = dict(structured)

    # Title Number
    if "title_number" not in fields:
        tn = _extract_regex([
            r"(?:title\s+number|title\s+no)[:\s]*([A-Z]{1,3}[0-9]{5,8})",
        ], text)
        if tn:
            fields["title_number"] = tn

    # Property Address
    if "property_address" not in fields:
        addr = _extract_regex([
            r"being:\s*([^\n\r]+)",
            r"(?:property\s+address)[:\s]*([^\n\r]+)",
            r"([0-9]+\s+[A-Za-z\s]+(?:Road|Street|Avenue|Lane|Hill|Way),?\s*[A-Za-z\s]+,?\s*[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2})",
        ], text)
        if addr:
            fields["property_address"] = addr.rstrip(".")

    # Registered Owner
    if "registered_owner" not in fields:
        owner = _extract_regex([
            r"(?:registered\s+proprietor\s*(?:\/\s*registered\s+owner)?|registered\s+owner)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
            r"(?:owner)[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        ], text)
        if owner:
            # Strip trailing " of" if captured from "Johnathan Vance of 10..."
            owner = re.sub(r"\s+of$", "", owner.strip())
            fields["registered_owner"] = owner

    return fields


EXTRACTOR_REGISTRY = {
    "bank_statement": extract_bank_statement_fields,
    "prior_year_accounts": extract_prior_accounts_fields,
    "vat_certificate": extract_vat_certificate_fields,
    "id": extract_id_fields,
    "director_id": extract_id_fields,
    "payroll_summary": extract_payroll_fields,
    "proof_of_address": extract_proof_of_address_fields,
    "expense_records": extract_expense_records_fields,
    "source_of_funds": extract_source_of_funds_fields,
    "property_title_deeds": extract_property_deeds_fields,
}


def extract_key_fields(
    doc_type: str,
    raw_content: Any,
    classification_confidence: float = 0.9,
    noise_ratio: float = 0.0,
) -> Tuple[Dict[str, Any], str, float, bool]:
    """Extract key fields for a classified document type and calculate confidence.

    Returns:
        (key_fields: Dict[str, Any], period_covered: str, confidence: float, needs_human_review: bool)
    """
    structured: Dict[str, Any] = {}
    if isinstance(raw_content, dict):
        structured = {k: v for k, v in raw_content.items() if k not in ("content", "doc_type")}
        text = str(raw_content.get("content", "")) + " " + " ".join(f"{k}: {v}" for k, v in raw_content.items())
    else:
        text = str(raw_content or "")

    extractor_fn = EXTRACTOR_REGISTRY.get(doc_type)
    if extractor_fn:
        key_fields = extractor_fn(text, structured)
    else:
        key_fields = structured

    # Determine period covered
    period_covered = ""
    if "date_range" in key_fields:
        period_covered = str(key_fields["date_range"])
    elif "period_covered" in key_fields:
        period_covered = str(key_fields["period_covered"])
    elif "tax_year" in key_fields:
        period_covered = f"Tax Year {key_fields['tax_year']}"
    elif "expiry" in key_fields:
        period_covered = f"Valid until {key_fields['expiry']}"
    elif "issue_date" in key_fields:
        period_covered = str(key_fields["issue_date"])
    elif "effective_date" in key_fields:
        period_covered = f"Effective from {key_fields['effective_date']}"

    # Calculate field extraction completeness ratio
    required = REQUIRED_FIELDS.get(doc_type, [])
    if required:
        extracted_count = sum(1 for f in required if f in key_fields and key_fields[f] is not None and str(key_fields[f]).strip() != "")
        completeness = extracted_count / len(required)
    else:
        completeness = 0.5 if doc_type == "unknown_document" else 0.85

    # Compute overall confidence score (0.0 to 1.0)
    if doc_type == "unknown_document":
        confidence = 0.20
    else:
        # Weighted blend of classification confidence and field extraction completeness
        raw_score = (classification_confidence * 0.45) + (completeness * 0.55) - (noise_ratio * 0.35)
        # If noise is substantial or critical fields are missing, ensure it drops below threshold
        if noise_ratio >= 0.15 or completeness < 0.60:
            raw_score = min(raw_score, 0.80)
        confidence = round(max(0.05, min(1.0, raw_score)), 2)

    # Strictly apply 0.85 threshold for human review flag
    needs_human_review = bool(confidence < 0.85)

    return key_fields, period_covered, confidence, needs_human_review
