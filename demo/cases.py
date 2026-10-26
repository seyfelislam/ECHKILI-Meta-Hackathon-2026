"""Invented scenario and observations. No ECHKILI production records are included."""

from __future__ import annotations

CASE = {
    "id": "solar-pump-01",
    "title": "Fictional Solar Irrigation Pump",
    "description": (
        "A simulated pump station has inconsistent reported performance. "
        "Explore how evidence changes the diagnostic conversation."
    ),
    "synthetic": True,
    "evidence": [
        {"id": "e1", "title": "Warm enclosure", "observation": "A fictional surface-temperature note reports an elevated reading.", "source": "Simulated visual inspection note"},
        {"id": "e2", "title": "Reduced output", "observation": "A mock daily report shows less delivered water than expected.", "source": "Synthetic operator report"},
        {"id": "e3", "title": "Intermittent noise", "observation": "A test log mentions occasional clicking during operation.", "source": "Invented maintenance log"},
        {"id": "e4", "title": "Cool enclosure", "observation": "A second fictional note reports a normal temperature for the same interval.", "source": "Conflicting simulated inspection note"},
    ],
}


def public_case() -> dict:
    """Return a copy so callers cannot mutate the shared fixture."""
    import copy

    return copy.deepcopy(CASE)
