"""Invented scenario and observations. No ECHKILI production records are included."""

from __future__ import annotations

CASE = {
    "id": "cabin-climate-01",
    "title": "Fictional Vehicle Cabin Climate Module",
    "description": (
        "A fictional vehicle cabin climate module has inconsistent reports of airflow and outlet temperature. "
        "Explore how evidence changes the diagnostic conversation."
    ),
    "synthetic": True,
    "evidence": [
        {"id": "e1", "title": "Warm outlet report", "observation": "A simulated passenger note describes warmer-than-expected outlet air.", "source": "Invented passenger note"},
        {"id": "e2", "title": "Reduced airflow", "observation": "A synthetic comfort log reports lower-than-usual cabin airflow.", "source": "Fictional comfort log"},
        {"id": "e3", "title": "Intermittent sound", "observation": "An invented log reports a brief intermittent sound from the climate module.", "source": "Invented maintenance log"},
        {"id": "e4", "title": "Cool outlet report", "observation": "A second fictional note reports cool outlet air during the same interval.", "source": "Invented conflicting passenger note"},
    ],
}


def public_case() -> dict:
    """Return a copy so callers cannot mutate the shared fixture."""
    import copy

    return copy.deepcopy(CASE)
