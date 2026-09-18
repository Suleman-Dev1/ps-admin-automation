"""Classification and Extraction Pipeline for Administrative Automation.

Processes uploaded documents (raw text, file paths, or structured dictionaries)
and produces authoritative DocumentRecord objects strictly matching contracts.py.
"""
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import json
import uuid
import sys

# Ensure root workspace is on python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from contracts import DocumentRecord
from agent2_document.classifier import classify_document
from agent2_document.extractor import extract_key_fields


def _read_content_if_file(content: Any) -> Any:
    """If content is a file path (str or Path) that exists, read its contents."""
    if isinstance(content, (str, Path)):
        p = Path(content)
        try:
            if p.is_file() and p.exists():
                text = p.read_text(encoding="utf-8")
                # Try parsing as JSON if suffix is .json
                if p.suffix.lower() == ".json":
                    try:
                        return json.loads(text)
                    except Exception:
                        return text
                return text
        except (OSError, ValueError):
            pass
    return content


def process_document(
    content: Any,
    client_id: str,
    doc_id: Optional[str] = None,
    filename: Optional[str] = None,
    explicit_doc_type: Optional[str] = None,
) -> DocumentRecord:
    """Process a single document through classification and extraction pipeline.

    Args:
        content: Text string, JSON string, dict, or file path.
        client_id: Unique client identifier matching ClientRecord.
        doc_id: Optional custom doc_id (auto-generated if None).
        filename: Optional filename hint.
        explicit_doc_type: Optional pre-declared doc_type.

    Returns:
        DocumentRecord strictly matching contracts.py.
    """
    if not client_id or not str(client_id).strip():
        raise ValueError("client_id cannot be empty")

    # Load content if file path
    resolved_content = _read_content_if_file(content)

    # If resolved_content is a dict with explicit doc_type
    if isinstance(resolved_content, dict) and explicit_doc_type:
        resolved_content["doc_type"] = explicit_doc_type

    # 1. Classification
    doc_type, class_conf, meta = classify_document(resolved_content)
    if explicit_doc_type:
        doc_type = explicit_doc_type

    # 2. Key Field Extraction & Confidence Scoring
    noise_ratio = meta.get("noise_ratio", 0.0)
    key_fields, period_covered, confidence, needs_human_review = extract_key_fields(
        doc_type=doc_type,
        raw_content=resolved_content,
        classification_confidence=class_conf,
        noise_ratio=noise_ratio,
    )

    # Add metadata hints to key_fields if useful
    if filename and "filename" not in key_fields:
        key_fields["source_filename"] = filename

    # 3. Create DocumentRecord adhering strictly to contracts.py
    record_id = doc_id or f"doc_{uuid.uuid4().hex[:8]}"
    uploaded_at = datetime.now(timezone.utc).isoformat()

    return DocumentRecord(
        doc_id=record_id,
        client_id=client_id,
        doc_type=doc_type,
        period_covered=period_covered,
        key_fields=key_fields,
        confidence=confidence,
        needs_human_review=needs_human_review,
        uploaded_at=uploaded_at,
    )


def process_document_batch(
    documents: List[Any],
    client_id: str,
) -> List[DocumentRecord]:
    """Process a batch of documents for a client."""
    records: List[DocumentRecord] = []
    for doc in documents:
        if isinstance(doc, DocumentRecord):
            records.append(doc)
        elif isinstance(doc, dict) and "content" in doc:
            records.append(process_document(
                content=doc["content"],
                client_id=client_id,
                doc_id=doc.get("doc_id"),
                filename=doc.get("filename"),
                explicit_doc_type=doc.get("doc_type"),
            ))
        else:
            records.append(process_document(content=doc, client_id=client_id))
    return records
