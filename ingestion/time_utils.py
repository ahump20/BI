"""Utility helpers for working with timezone-aware timestamps."""

from __future__ import annotations

from datetime import datetime, timezone


def utc_now_isoformat() -> str:
    """Return the current UTC time as an ISO 8601 string with a trailing ``Z``."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def ensure_utc(dt: datetime) -> datetime:
    """Ensure ``dt`` is timezone-aware and normalised to UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

