"""Document Classifier for Administrative Professional Services.

Inspects document content (text, structured dict, or file) and classifies
the document type based on content indicators, domain keywords, and patterns.
"""
import re
from typing import Dict, Any, Tuple, Optional, List


# Defined keyword indicators for each document type
INDICATORS: Dict[str, Dict[str, Any]] = {
    "bank_statement": {
        "primary": [
            "bank statement", "statement of account", "account summary",
            "sort code", "account number", "closing balance", "opening balance",
            "balance brought forward", "balance carried forward", "transaction history"
        ],
        "secondary": [
            "barclays", "hsbc", "lloyds", "natwest", "santander", "monzo",
            "starling", "revolut", "credit", "debit", "overdraft", "iban", "bic"
        ],
        "weight": 1.0,
    },
    "prior_year_accounts": {
        "primary": [
            "balance sheet", "profit and loss", "income statement",
            "turnover", "net profit", "operating profit", "retained earnings",
            "statement of financial position", "for the year ended", "prior year accounts",
            "statutory accounts", "companies house", "company registration"
        ],
        "secondary": [
            "fixed assets", "current assets", "creditors", "debtors",
            "called up share capital", "shareholders funds", "ebitda", "gross profit"
        ],
        "weight": 1.0,
    },
    "payroll_summary": {
        "primary": [
            "payroll summary", "paye", "p32", "p60", "p45", "p11",
            "gross pay", "net pay", "employer paye reference", "tax period",
            "hmrc paye", "employee pay", "payroll report"
        ],
        "secondary": [
            "national insurance", "nic", "pension deductions", "statutory maternity",
            "student loan", "tax code", "total gross", "total tax"
        ],
        "weight": 1.0,
    },
    "vat_certificate": {
        "primary": [
            "vat certificate", "certificate of registration for value added tax",
            "vat registration number", "effective date of registration",
            "value added tax", "hm revenue & customs", "trader name",
            "c3rt1f1cat3 of valu3 add3d tax", "vat reg no"
        ],
        "secondary": [
            "hmrc", "customs and excise", "vat return", "output tax", "input tax",
            "trade classification", "vat registration", "stagger group", "sic code"
        ],
        "weight": 1.2,
    },
    "id": {
        "primary": [
            "passport", "driving licence", "identity card", "national identity",
            "document number", "holder signature", "place of birth", "date of birth",
            "date of expiry", "expiry date", "director id", "director's id",
            "british passport", "passeport"
        ],
        "secondary": [
            "nationality", "sex", "dob", "authority", "issuing country", "licence number",
            "driver number", "united kingdom passport", "full name", "given names", "surname"
        ],
        "weight": 1.1,
    },
    "proof_of_address": {
        "primary": [
            "proof of address", "council tax bill", "council tax demand",
            "utility bill", "water bill", "gas bill", "electricity bill",
            "broadband bill", "tenancy agreement", "billing address"
        ],
        "secondary": [
            "service address", "supply address", "account number", "meter reading",
            "billing period", "property reference", "local authority", "resident name"
        ],
        "weight": 1.0,
    },
    "expense_records": {
        "primary": [
            "expense records", "expense report", "business expenses",
            "allowable expenses", "mileage log", "receipts log", "travel expenses",
            "schedule of expenses", "allowable business expenses"
        ],
        "secondary": [
            "category breakdown", "receipt", "subsistence", "equipment", "motor expenses",
            "office costs", "tax deductible", "reimbursable"
        ],
        "weight": 1.0,
    },
    "source_of_funds": {
        "primary": [
            "source of funds", "origin of funds", "source of wealth",
            "funds declaration", "anti-money laundering", "aml verification",
            "aml declaration", "conveyancing — source of funds"
        ],
        "secondary": [
            "bank transfer confirmation", "conveyancing funds", "inheritance", "savings declaration",
            "sale of property", "completion funds", "funds amount", "remitting financial institution"
        ],
        "weight": 1.8,
    },
    "property_title_deeds": {
        "primary": [
            "title deeds", "official copy of register", "land registry",
            "title number", "property register", "proprietorship register", "charges register"
        ],
        "secondary": [
            "freehold", "leasehold", "registered owner", "hm land registry",
            "title plan", "covenants", "easements", "registered proprietor"
        ],
        "weight": 1.5,
    },
}

# Regex to detect noisy OCR scans or degraded documents
NOISE_PATTERNS = [
    r"[~#\$\^&*]{3,}",          # consecutive noise characters (excluding standard separators = or -)
    r"\[\s*(?:blurry|illegible|uncertain|unclear|corrupt|damaged|unreadable|obscured|smudge)[^\]]*\]",
    r"\?{2,}",                 # excessive question marks
    r"(?:confidence\s+low|bleed\s+through|resolution\s+120\s+dpi|resolution\s+72\s+dpi)",
    r"(?:\b[b-df-hj-np-tv-z]{7,}\b)",  # long consonant clusters typical of corrupted OCR
]


def detect_noise_ratio(text: str) -> float:
    """Calculate noise ratio (0.0 clean to 1.0 heavily noisy)."""
    if not text:
        return 1.0

    # Strip standard horizontal text dividers and MRZ lines for noise calculation
    filtered_lines = []
    for line in text.splitlines():
        stripped = line.strip()
        # Ignore horizontal rules like '====' or '----'
        if re.match(r"^[=\-_]{3,}$", stripped):
            continue
        # Ignore standard passport MRZ lines like 'P<GBR...'
        if re.match(r"^[A-Z0-9<]{25,}$", stripped) and "<" in stripped:
            continue
        filtered_lines.append(line)

    clean_text = "\n".join(filtered_lines)
    total_len = len(clean_text)
    if total_len == 0:
        return 0.0

    # Count explicitly matched noise indicators
    noise_count = 0
    for pat in NOISE_PATTERNS:
        matches = re.findall(pat, clean_text, flags=re.IGNORECASE)
        for m in matches:
            noise_count += len(m) * 2

    # Check corrupted OCR characters (excluding standard punctuation, symbols, currency, and dividers)
    strange_chars = len(re.findall(r"[^\w\s.,;:£$€\-\(\)/'\"%@&=<>+*#]", clean_text))
    # Also check leetspeak / corrupted digits in words (e.g. 'c3rt1f1cat3', 'b@nk', 'd3c3mb3r')
    corrupted_words = len(re.findall(r"\b[a-zA-Z]*[\d@$][a-zA-Z]+[\d@$]*\b", clean_text))
    noise_count += corrupted_words * 4

    noise_penalty = min(1.0, (noise_count + strange_chars * 1.5) / max(total_len, 50))
    return round(noise_penalty, 3)


def classify_document(text_or_dict: Any) -> Tuple[str, float, Dict[str, Any]]:
    """Classify the document type from text content or structured dictionary.

    Returns:
        (doc_type: str, classification_confidence: float, metadata: Dict[str, Any])
    """
    if isinstance(text_or_dict, dict):
        # If already specified in dict, inspect content inside
        explicit_type = text_or_dict.get("doc_type")
        raw_text = " ".join(str(v) for v in text_or_dict.values())
    else:
        explicit_type = None
        raw_text = str(text_or_dict or "")

    text_lower = raw_text.lower()
    noise_ratio = detect_noise_ratio(raw_text)

    scores: Dict[str, float] = {}
    matched_keywords: Dict[str, List[str]] = {}

    for dtype, cfg in INDICATORS.items():
        score = 0.0
        matches = []
        for kw in cfg["primary"]:
            if kw in text_lower:
                score += 2.0
                matches.append(kw)
        for kw in cfg["secondary"]:
            if kw in text_lower:
                score += 1.0
                matches.append(kw)
        
        # Apply type weight
        score *= cfg.get("weight", 1.0)
        scores[dtype] = score
        matched_keywords[dtype] = matches

    # Sort candidates by score descending
    sorted_candidates = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_type, best_score = sorted_candidates[0]
    runner_up_type, runner_up_score = sorted_candidates[1] if len(sorted_candidates) > 1 else (None, 0.0)

    # Determine classification confidence
    if best_score <= 0.0:
        return "unknown_document", 0.0, {
            "noise_ratio": noise_ratio,
            "matched_keywords": [],
            "candidates": scores,
        }

    # If explicit_type matches an indicator, give bonus
    if explicit_type and explicit_type in INDICATORS:
        if explicit_type == best_type:
            best_score += 2.0
        elif scores.get(explicit_type, 0) > 0:
            best_type = explicit_type
            best_score = scores[explicit_type]

    # Calculate confidence based on score strength and separation from runner up
    margin = best_score - runner_up_score
    if best_score >= 6.0 and margin >= 3.0:
        base_confidence = 0.95
    elif best_score >= 4.0:
        base_confidence = 0.88
    elif best_score >= 2.0:
        base_confidence = 0.75
    else:
        base_confidence = 0.60

    # Subtract noise penalty
    confidence = max(0.1, base_confidence - (noise_ratio * 0.5))
    confidence = round(min(1.0, confidence), 2)

    meta = {
        "noise_ratio": noise_ratio,
        "score": best_score,
        "runner_up_score": runner_up_score,
        "matched_keywords": matched_keywords.get(best_type, []),
    }
    return best_type, confidence, meta
