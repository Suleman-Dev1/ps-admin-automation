"""Agent 2 — Document Processing Agent.

Provides swappable checklist config, tokenized upload portal,
document classification, extraction pipeline, and client ingestion engine.
"""
from agent2_document.upload_portal import (
    generate_upload_token,
    validate_upload_token,
    verify_upload_token,
    generate_upload_link,
    extract_token_from_url,
)
from agent2_document.classifier import (
    classify_document,
    detect_noise_ratio,
)
from agent2_document.extractor import (
    extract_key_fields,
    REQUIRED_FIELDS,
)
from agent2_document.pipeline import (
    process_document,
    process_document_batch,
)
from agent2_document.ingestion import (
    ingest_client_documents,
)
from agent2_document.config_loader import (
    load_checklists,
    get_checklist_for,
)

__all__ = [
    "generate_upload_token",
    "validate_upload_token",
    "verify_upload_token",
    "generate_upload_link",
    "extract_token_from_url",
    "classify_document",
    "detect_noise_ratio",
    "extract_key_fields",
    "REQUIRED_FIELDS",
    "process_document",
    "process_document_batch",
    "ingest_client_documents",
    "load_checklists",
    "get_checklist_for",
]
