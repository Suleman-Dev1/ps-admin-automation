"""CRM Repository / Store for Agent 1 (Intake & CRM).

Provides persistent JSON-backed and in-memory storage for ClientRecord objects
strictly adhering to contracts.py.
"""

from __future__ import annotations

import json
import os
import sys
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional

# Ensure parent directory is in sys.path for contracts import
_PARENT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _PARENT_DIR not in sys.path:
    sys.path.insert(0, _PARENT_DIR)

from contracts import ClientRecord, ClientStatus, VALID_STATUSES


class CRMStore:
    """Persistent or in-memory CRM store for ClientRecord entities."""

    def __init__(self, storage_path: Optional[str] = None, in_memory: bool = False):
        """Initialize CRMStore.

        Args:
            storage_path: Optional path to JSON file for persistence.
                          If None and in_memory is False, defaults to
                          'data/crm_clients.json' relative to repository root.
            in_memory: If True, forces pure in-memory mode without disk I/O.
        """
        self._lock = threading.RLock()
        self._clients: Dict[str, ClientRecord] = {}
        self._metadata: Dict[str, Dict[str, Any]] = {}
        self.in_memory = in_memory

        if in_memory:
            self.storage_path = None
        else:
            if storage_path:
                self.storage_path = Path(storage_path).resolve()
            else:
                default_data_dir = Path(_PARENT_DIR) / "data"
                self.storage_path = default_data_dir / "crm_clients.json"

            self._load_from_disk()

    def _load_from_disk(self) -> None:
        """Load client records and metadata from the JSON persistence file."""
        if not self.storage_path or not self.storage_path.exists():
            return

        try:
            with open(self.storage_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return
                data = json.loads(content)

            with self._lock:
                self._clients.clear()
                self._metadata.clear()

                # Supports both {"clients": {...}, "metadata": {...}} and flat {client_id: {...}}
                clients_raw = data.get("clients", data) if isinstance(data, dict) else {}
                metadata_raw = data.get("metadata", {}) if isinstance(data, dict) else {}

                for cid, raw in clients_raw.items():
                    if cid == "metadata" and "clients" in data:
                        continue
                    if isinstance(raw, dict) and "client_id" in raw:
                        self._clients[cid] = ClientRecord.from_dict(raw)

                if isinstance(metadata_raw, dict):
                    self._metadata = {k: v for k, v in metadata_raw.items() if isinstance(v, dict)}

        except Exception as err:
            raise IOError(f"Failed to load CRM store from {self.storage_path}: {err}") from err

    def _persist_to_disk(self) -> None:
        """Persist current state atomically to disk using a temporary file."""
        if self.in_memory or not self.storage_path:
            return

        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.storage_path.with_suffix(".tmp")

        payload = {
            "clients": {cid: record.to_dict() for cid, record in self._clients.items()},
            "metadata": self._metadata,
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }

        try:
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2, ensure_ascii=False)
            os.replace(tmp_path, self.storage_path)
        except Exception as err:
            if tmp_path.exists():
                try:
                    tmp_path.unlink()
                except OSError:
                    pass
            raise IOError(f"Failed to write CRM store to {self.storage_path}: {err}") from err

    def save(self, record: ClientRecord, metadata: Optional[Dict[str, Any]] = None) -> ClientRecord:
        """Save or insert a client record, with optional supplementary metadata.

        Args:
            record: ClientRecord instance strictly adhering to contracts.py.
            metadata: Optional dictionary with supplementary fields (e.g. relevant_date, existing_provider).

        Returns:
            The saved ClientRecord instance.
        """
        if not isinstance(record, ClientRecord):
            raise TypeError(f"Expected ClientRecord, got {type(record).__name__}")

        if record.status not in VALID_STATUSES:
            raise ValueError(f"Invalid status: {record.status}. Must be one of {VALID_STATUSES}")

        with self._lock:
            self._clients[record.client_id] = record
            if metadata:
                self._metadata[record.client_id] = dict(metadata)
            self._persist_to_disk()

        return record

    def get(self, client_id: str) -> Optional[ClientRecord]:
        """Retrieve a client record by ID. Returns None if not found."""
        with self._lock:
            record = self._clients.get(client_id)
            if record is None:
                return None
            # Return a freshly deserialized copy to prevent accidental external mutation
            return ClientRecord.from_dict(record.to_dict())

    def get_metadata(self, client_id: str) -> Dict[str, Any]:
        """Retrieve supplementary intake metadata for a given client_id."""
        with self._lock:
            return dict(self._metadata.get(client_id, {}))

    def update(self, record: ClientRecord) -> ClientRecord:
        """Update an existing client record.

        Args:
            record: ClientRecord instance to update.

        Returns:
            The updated ClientRecord.

        Raises:
            KeyError: If the client record does not exist.
            ValueError: If the status is invalid.
        """
        if not isinstance(record, ClientRecord):
            raise TypeError(f"Expected ClientRecord, got {type(record).__name__}")

        if record.status not in VALID_STATUSES:
            raise ValueError(f"Invalid status: {record.status}. Must be one of {VALID_STATUSES}")

        with self._lock:
            if record.client_id not in self._clients:
                raise KeyError(f"Client '{record.client_id}' not found in CRM store.")

            record.updated_at = datetime.now(timezone.utc).isoformat()
            self._clients[record.client_id] = record
            self._persist_to_disk()

        return record

    def update_status(self, client_id: str, new_status: str) -> ClientRecord:
        """Update the status of an existing client record.

        Args:
            client_id: Target client ID.
            new_status: New status string (must be in VALID_STATUSES).

        Returns:
            The updated ClientRecord.

        Raises:
            KeyError: If the client is not found.
            ValueError: If new_status is not a valid status in contracts.py.
        """
        if new_status not in VALID_STATUSES:
            raise ValueError(f"Invalid status '{new_status}'. Must be one of {VALID_STATUSES}")

        with self._lock:
            record = self._clients.get(client_id)
            if record is None:
                raise KeyError(f"Client '{client_id}' not found in CRM store.")

            record.status = new_status
            record.updated_at = datetime.now(timezone.utc).isoformat()
            self._clients[client_id] = record
            self._persist_to_disk()
            return ClientRecord.from_dict(record.to_dict())

    def list_all(self) -> List[ClientRecord]:
        """List all client records in the CRM store."""
        with self._lock:
            return [ClientRecord.from_dict(r.to_dict()) for r in self._clients.values()]

    def filter_by_status(self, status: str) -> List[ClientRecord]:
        """Filter client records by status.

        Args:
            status: Status string to filter by.

        Returns:
            List of matching ClientRecord objects.
        """
        with self._lock:
            return [
                ClientRecord.from_dict(r.to_dict())
                for r in self._clients.values()
                if r.status == status
            ]

    def delete(self, client_id: str) -> bool:
        """Delete a client record by ID.

        Returns:
            True if deleted, False if client was not found.
        """
        with self._lock:
            if client_id in self._clients:
                del self._clients[client_id]
                self._metadata.pop(client_id, None)
                self._persist_to_disk()
                return True
            return False

    def count(self) -> int:
        """Return total number of clients in the store."""
        with self._lock:
            return len(self._clients)

    def clear(self) -> None:
        """Clear all clients and metadata (primarily for test teardown)."""
        with self._lock:
            self._clients.clear()
            self._metadata.clear()
            self._persist_to_disk()
