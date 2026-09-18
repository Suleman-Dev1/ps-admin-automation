"""Gap-Detection Logic for Agent 3 (Follow-up & Reminders).

Compares client_record.checklist_required against received document types,
identifies missing items, and manages status transitions.
"""

from datetime import datetime, timezone
from typing import List

import sys
import os

# Ensure contracts can be imported cleanly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from contracts import ClientRecord, ClientStatus


def detect_gaps(client_record: ClientRecord, auto_transition_ready: bool = True) -> List[str]:
    """Detect missing documents required for onboarding.

    Compares `client_record.checklist_required` against
    `[d.doc_type for d in client_record.documents_received]`.

    Returns the list of missing item names.
    Updates `client_record.missing_items` with this list.
    Updates status: if missing items exist and status is not already "Chasing",
    transitions status to "Chasing".
    If no missing items exist and auto_transition_ready is True, transitions
    from "Chasing" or "Awaiting Documents" to "Ready".
    Always updates `client_record.updated_at`.
    """
    received_types = {d.doc_type for d in client_record.documents_received}
    
    def _is_satisfied(required_item: str) -> bool:
        if required_item in received_types:
            return True
        if required_item in ("id", "director_id") and any(t in received_types for t in ("id", "director_id")):
            return True
        return False

    # Preserve order of checklist_required while filtering missing items
    missing = [item for item in client_record.checklist_required if not _is_satisfied(item)]
    
    # Deduplicate while maintaining order
    seen = set()
    unique_missing: List[str] = []
    for item in missing:
        if item not in seen:
            seen.add(item)
            unique_missing.append(item)

    # Update missing items on client record
    client_record.missing_items = unique_missing
    
    now_iso = datetime.now(timezone.utc).isoformat()
    client_record.updated_at = now_iso

    # Status transition logic
    if unique_missing:
        if client_record.status != ClientStatus.CHASING.value:
            client_record.status = ClientStatus.CHASING.value
    else:
        # All required items received
        if auto_transition_ready and client_record.status in {
            ClientStatus.CHASING.value,
            ClientStatus.AWAITING_DOCUMENTS.value,
            ClientStatus.NEW.value,
        }:
            client_record.status = ClientStatus.READY.value

    return unique_missing
