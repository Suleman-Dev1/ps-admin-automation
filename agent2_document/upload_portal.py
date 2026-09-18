"""Secure Tokenized Upload Portal (Zero-dependency).

Provides secure token generation and validation for client document uploads.
No client login or password required — access is granted via cryptographic
HMAC-SHA256 signed tokens with expiration timestamps.
"""
import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Optional, Tuple
from urllib.parse import urlencode, urlparse, parse_qs, urlunparse

DEFAULT_SECRET_KEY = os.environ.get("UPLOAD_PORTAL_SECRET", "agy-ps-admin-secret-key-2026-secure")
DEFAULT_EXPIRY_SECONDS = 7 * 24 * 3600  # 7 days


def _urlsafe_b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _urlsafe_b64decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("utf-8"))


def generate_upload_token(
    client_id: str,
    secret_key: Optional[str] = None,
    expires_in_seconds: int = DEFAULT_EXPIRY_SECONDS,
) -> str:
    """Generate a secure, tamper-evident upload token for a specific client_id.

    Format: upload_token_<base64_payload>.<hmac_signature>
    """
    if not client_id or not client_id.strip():
        raise ValueError("client_id cannot be empty")

    secret = (secret_key or DEFAULT_SECRET_KEY).encode("utf-8")
    expires_at = int(time.time()) + expires_in_seconds
    nonce = secrets.token_hex(6)

    payload = {
        "client_id": client_id.strip(),
        "exp": expires_at,
        "nonce": nonce,
    }
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    payload_b64 = _urlsafe_b64encode(payload_json.encode("utf-8"))

    sig = hmac.new(secret, payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"upload_token_{payload_b64}.{sig}"


def verify_upload_token(
    token: str,
    secret_key: Optional[str] = None,
) -> Tuple[bool, Optional[str], Optional[str]]:
    """Verify an upload token.

    Returns:
        (is_valid: bool, client_id: Optional[str], error_message: Optional[str])
    """
    if not token or not isinstance(token, str):
        return False, None, "Token is missing or invalid type"

    cleaned_token = token.strip()
    if cleaned_token.startswith("upload_token_"):
        cleaned_token = cleaned_token[len("upload_token_"):]

    parts = cleaned_token.split(".")
    if len(parts) != 2:
        return False, None, "Malformed token structure"

    payload_b64, signature = parts
    secret = (secret_key or DEFAULT_SECRET_KEY).encode("utf-8")

    # Timing-safe comparison of HMAC signature
    expected_sig = hmac.new(secret, payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected_sig):
        return False, None, "Invalid token signature"

    # Decode and validate payload
    try:
        payload_bytes = _urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception as e:
        return False, None, f"Failed to decode token payload: {e}"

    client_id = payload.get("client_id")
    exp = payload.get("exp")

    if not client_id or not exp:
        return False, None, "Token payload missing required fields"

    if time.time() > exp:
        return False, client_id, "Token has expired"

    return True, client_id, None


def validate_upload_token(token: str, secret_key: Optional[str] = None) -> Optional[str]:
    """Validate upload token and return client_id if valid, None otherwise."""
    is_valid, client_id, _ = verify_upload_token(token, secret_key)
    return client_id if is_valid else None


def generate_upload_link(
    client_id: str,
    base_url: str = "/upload",
    secret_key: Optional[str] = None,
    expires_in_seconds: int = DEFAULT_EXPIRY_SECONDS,
) -> str:
    """Generate a complete URL / link containing the secure upload token."""
    token = generate_upload_token(client_id, secret_key, expires_in_seconds)
    parsed = urlparse(base_url)
    query = parse_qs(parsed.query)
    query["token"] = [token]
    new_query = urlencode(query, doseq=True)
    new_parsed = parsed._replace(query=new_query)
    return urlunparse(new_parsed)


def extract_token_from_url(url_or_query: str) -> Optional[str]:
    """Extract token parameter from a full URL or query string."""
    parsed = urlparse(url_or_query)
    query = parse_qs(parsed.query if parsed.query else url_or_query)
    tokens = query.get("token")
    if tokens:
        return tokens[0]
    return None
