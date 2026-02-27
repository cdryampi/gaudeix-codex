"""Integration adapters for the festes app.

Decoupled interfaces for external integrations: iCal export, map links,
ticketing URL validation, and notification gateway.  All adapters are
designed as pure functions or lightweight classes so domain logic never
depends on a specific external provider.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime
from typing import Any
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# iCal Export
# ---------------------------------------------------------------------------

_UNSAFE_ICAL_RE = re.compile(r"[\r\n]+")


def _ical_escape(value: str) -> str:
    """Escape special characters for iCal text fields (RFC 5545 section 3.3.11)."""
    value = value.replace("\\", "\\\\")
    value = value.replace(";", "\\;")
    value = value.replace(",", "\\,")
    return _UNSAFE_ICAL_RE.sub("\\n", value)


def _format_dt(dt: datetime) -> str:
    """Format a datetime as iCal UTC DATETIME value (``YYYYMMDDTHHMMSSZ``)."""
    utc = dt.utctimetuple() if hasattr(dt, "utctimetuple") else dt.timetuple()
    return (
        f"{utc.tm_year:04d}{utc.tm_mon:02d}{utc.tm_mday:02d}"
        f"T{utc.tm_hour:02d}{utc.tm_min:02d}{utc.tm_sec:02d}Z"
    )


def activity_to_vevent(
    *,
    uid: str,
    title: str,
    start_at: datetime,
    end_at: datetime | None = None,
    summary: str = "",
    description: str = "",
    location: str = "",
    url: str = "",
    category: str = "",
) -> str:
    """Return a single VEVENT block for a festa event.

    The result is a standalone text block (no surrounding VCALENDAR) so
    callers can batch multiple events into one calendar file.

    Parameters
    ----------
    uid:
        Globally unique identifier for this event (for example ``event.slug``).
    title:
        Human-readable title (maps to SUMMARY).
    start_at:
        Start datetime (required).
    end_at:
        End datetime.  When *None* only DTSTART is emitted.
    summary:
        Short text appended to DESCRIPTION.
    description:
        Full description text.
    location:
        Free-text location string.
    url:
        Public URL for the event.
    category:
        Event category label.

    Returns
    -------
    str
        RFC 5545 VEVENT block.
    """
    lines: list[str] = [
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTART:{_format_dt(start_at)}",
    ]
    if end_at:
        lines.append(f"DTEND:{_format_dt(end_at)}")
    lines.append(f"SUMMARY:{_ical_escape(title)}")

    desc_parts = [p for p in (summary, description) if p]
    if desc_parts:
        lines.append(f"DESCRIPTION:{_ical_escape(' - '.join(desc_parts))}")

    if location:
        lines.append(f"LOCATION:{_ical_escape(location)}")
    if url:
        lines.append(f"URL:{url}")
    if category:
        lines.append(f"CATEGORIES:{_ical_escape(category)}")

    lines.append(f"DTSTAMP:{_format_dt(datetime.utcnow())}")
    lines.append("END:VEVENT")
    return "\r\n".join(lines)


def wrap_vcalendar(vevents: list[str], cal_name: str = "Festes") -> str:
    """Wrap one or more VEVENT blocks in a VCALENDAR envelope.

    Parameters
    ----------
    vevents:
        List of VEVENT text blocks (from ``activity_to_vevent``).
    cal_name:
        Human-readable calendar name.

    Returns
    -------
    str
        Complete iCalendar document (``text/calendar``).
    """
    header = "\r\n".join(
        [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Gaudeix//Festes//CA",
            f"X-WR-CALNAME:{_ical_escape(cal_name)}",
        ]
    )
    footer = "END:VCALENDAR"
    body = "\r\n".join(vevents)
    return f"{header}\r\n{body}\r\n{footer}\r\n"


# ---------------------------------------------------------------------------
# Map Link Generation
# ---------------------------------------------------------------------------

_GMAPS_URL = "https://www.google.com/maps/search/?api=1&query={lat},{lng}"
_OSM_URL = "https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map=17/{lat}/{lng}"


def google_maps_url(latitude: float, longitude: float) -> str:
    """Return a Google Maps search URL for the given coordinates."""
    return _GMAPS_URL.format(lat=latitude, lng=longitude)


def osm_url(latitude: float, longitude: float) -> str:
    """Return an OpenStreetMap URL for the given coordinates."""
    return _OSM_URL.format(lat=latitude, lng=longitude)


def venue_map_links(
    latitude: float | None,
    longitude: float | None,
) -> dict[str, str]:
    """Return map links for a venue.

    Returns an empty dict when coordinates are not available.
    """
    if latitude is None or longitude is None:
        return {}
    return {
        "google_maps": google_maps_url(latitude, longitude),
        "openstreetmap": osm_url(latitude, longitude),
    }


# ---------------------------------------------------------------------------
# Ticketing URL Validation
# ---------------------------------------------------------------------------

_ALLOWED_TICKET_SCHEMES = {"http", "https"}


def validate_ticket_url(url: str | None) -> tuple[bool, str]:
    """Validate a ticketing URL for basic safety.

    Checks
    ------
    - Non-empty string.
    - Uses ``http`` or ``https`` scheme.
    - Has a valid hostname.

    Returns
    -------
    tuple[bool, str]
        ``(is_valid, reason)`` where *reason* is empty on success.
    """
    if not url:
        return True, ""  # null / blank is acceptable (free events)

    try:
        parsed = urlparse(url)
    except Exception:
        return False, "URL could not be parsed."

    if parsed.scheme not in _ALLOWED_TICKET_SCHEMES:
        return False, f"Scheme '{parsed.scheme}' not allowed. Use http or https."

    if not parsed.netloc:
        return False, "URL has no hostname."

    # Basic domain pattern check (no IP-only, no localhost in prod)
    if "." not in parsed.netloc and "localhost" not in parsed.netloc:
        return False, "Hostname does not look like a valid domain."

    return True, ""


# ---------------------------------------------------------------------------
# Notification Gateway (stub)
# ---------------------------------------------------------------------------


class NotificationGateway:
    """Thin facade over the notifications app.

    Keeps festes domain logic decoupled from the concrete notification
    implementation.  In production the methods delegate to
    ``notifications.utils``; in tests they can be replaced by a mock.
    """

    def notify_festa_event_published(self, activity: Any) -> None:
        """Send a notification when a festa event is published.

        Parameters
        ----------
        activity:
            A festa event-like object.
        """
        title = getattr(activity, "title", "Activity")
        try:
            from notifications.utils import (  # pyright: ignore[reportImplicitRelativeImport]
                send_broadcast_notification,
            )

            send_broadcast_notification(
                title=f"Nova activitat: {title}",
                body=getattr(activity, "summary", "") or "",
                notification_type="activity_published",
                data={"activity_slug": getattr(activity, "slug", "")},
            )
            logger.info("Notification sent for activity '%s'", title)
        except ImportError:
            logger.warning(
                "notifications app not available - skipping notification for '%s'",
                title,
            )
        except Exception:
            logger.exception("Failed to send notification for activity '%s'", title)

    def notify_activity_published(self, activity: Any) -> None:
        """Backward-compatible wrapper for legacy callers."""
        self.notify_festa_event_published(activity)

    def notify_program_published(self, program: Any) -> None:
        """Send a notification when a program is published.

        Parameters
        ----------
        program:
            A ``Program`` model instance.
        """
        title = getattr(program, "title", "Program")
        try:
            from notifications.utils import (  # pyright: ignore[reportImplicitRelativeImport]
                send_broadcast_notification,
            )

            send_broadcast_notification(
                title=f"Programa publicat: {title}",
                body=getattr(program, "description", "") or "",
                notification_type="program_published",
                data={"program_slug": getattr(program, "slug", "")},
            )
            logger.info("Notification sent for program '%s'", title)
        except ImportError:
            logger.warning(
                "notifications app not available - skipping notification for '%s'",
                title,
            )
        except Exception:
            logger.exception("Failed to send notification for program '%s'", title)


# Module-level default gateway instance
notification_gateway = NotificationGateway()
