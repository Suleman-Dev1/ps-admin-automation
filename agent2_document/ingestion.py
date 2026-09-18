"""Client Document Ingestion Engine.

Ingests batches of documents for a client, appends them to ClientRecord.documents_received,
recalculates missing_items against the checklist, and transitions status:
  - From "New" or "Awaiting Documents" -> "Chasing" (if missing items remain)
  - From "New", "Awaiting Documents", or "Chasing" -> "Ready" (if checklist is complete)
Strictly adheres to contracts.py.
"""
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import sys

# Ensure root workspace is on python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from contracts import ClientRecord, DocumentRecord, ClientStatus, ChecklistConfig
from agent2_document.pipeline import process_document
from config.config_loader import get_checklist_for


def ingest_client_documents(
    client: ClientRecord,
    documents: List[Union[DocumentRecord, Dict[str, Any], str, Path]],
    checklist_config: Optional[ChecklistConfig] = None,
    config_path: Optional[Union[str, Path]] = None,
) -> ClientRecord:
    """Ingest a batch of documents for a client record.

    1. Ensures client.checklist_required is initialized from configuration if empty.
    2. Converts all incoming documents into authoritative DocumentRecord instances.
    3. Appends them to client.documents_received.
    4. Computes client.missing_items = checklist_required - received_types.
    5. Transitions client.status:
       - "Ready" if missing_items is empty.
       - "Chasing" if missing_items remain and status was "New" or "Awaiting Documents".
    6. Updates client.updated_at timestamp.

    Returns:
        The updated ClientRecord.
    """
    if not isinstance(client, ClientRecord):
        raise TypeError("client must be an instance of contracts.ClientRecord")

    # 1. Initialize checklist if not already present on client
    if not client.checklist_required:
        cfg = checklist_config or get_checklist_for(
            business_type=client.business_type,
            service=client.service_requested,
            file_path=config_path,
        )
        if cfg:
            client.checklist_required = list(cfg.required_documents)

    # 2. Process and append incoming documents
    for doc in documents:
        if isinstance(doc, DocumentRecord):
            record = doc
            if record.client_id != client.client_id:
                # Align client_id to current client record
                record.client_id = client.client_id
        elif isinstance(doc, dict):
            # Check if it's already a serialized DocumentRecord dict
            if "doc_id" in doc and "doc_type" in doc and "confidence" in doc:
                record = DocumentRecord.from_dict(doc)
                record.client_id = client.client_id
            else:
                record = process_document(
                    content=doc.get("content", doc),
                    client_id=client.client_id,
                    doc_id=doc.get("doc_id"),
                    filename=doc.get("filename"),
                    explicit_doc_type=doc.get("doc_type"),
                )
        else:
            # String or file path
            record = process_document(
                content=doc,
                client_id=client.client_id,
            )

        client.documents_received.append(record)

    # 3. Recalculate missing items
    # Collect all received document types
    received_types = {d.doc_type for d in client.documents_received}

    def _is_satisfied(required_item: str) -> bool:
        if required_item in received_types:
            return True
        # Equivalence rule: "id" and "director_id" fulfill each other
        if required_item in ("id", "director_id") and any(t in received_types for t in ("id", "director_id")):
            return True
        return False

    client.missing_items = [
        item for item in client.checklist_required
        if not _is_satisfied(item)
    ]

    # 4. Status Transition Logic
    if len(client.missing_items) == 0 and len(client.checklist_required) > 0:
        # Complete checklist fulfilled!
        client.status = ClientStatus.READY.value
    elif len(client.missing_items) > 0:
        # Missing items still remain
        if client.status in (ClientStatus.NEW.value, ClientStatus.AWAITING_DOCUMENTS.value):
            client.status = ClientStatus.CHASING.value
        # If already CHASING, it stays CHASING.
        # If status was MEETING_BOOKED or SUMMARY_SENT, we preserve staff progress.

    # 5. Timestamp update
    client.updated_at = datetime.now(timezone.utc).isoformat()

    return client
