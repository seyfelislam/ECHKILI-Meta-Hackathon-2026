"""Transparent illustrative rules, not a validated fault-detection system."""

from __future__ import annotations

from .cases import CASE
from .graph import build_graph


def _hypothesis(identifier: str, label: str, supports: list[str], goal: str) -> dict:
    return {
        "id": identifier,
        "label": label,
        "supportingEvidenceIds": supports,
        "provenance": "illustrative-rule",
        "verificationGoal": goal,
        "status": "unverified",
    }


def analyze(case_id: str, evidence_ids: list[str]) -> dict:
    """Explain selected synthetic observations, without directing physical repairs."""
    if case_id != CASE["id"]:
        raise ValueError("Unknown synthetic case")
    if not isinstance(evidence_ids, list) or not all(isinstance(item, str) for item in evidence_ids):
        raise ValueError("Evidence must be an array of identifiers")
    if len(evidence_ids) != len(set(evidence_ids)):
        raise ValueError("Duplicate evidence identifier")

    fixture = {item["id"]: item for item in CASE["evidence"]}
    if any(identifier not in fixture for identifier in evidence_ids):
        raise ValueError("Unknown evidence identifier")

    active = set(evidence_ids)
    contradictions = []
    if {"e1", "e4"}.issubset(active):
        contradictions.append({
            "evidenceIds": ["e1", "e4"],
            "reason": "Two synthetic reports disagree on the outlet-air temperature for the same interval.",
            "nextStep": "Have a qualified reviewer reconcile the records before any conclusion.",
        })

    hypotheses = []
    if {"e1", "e2"}.issubset(active) and not contradictions:
        hypotheses.append(_hypothesis(
            "h-flow", "Temperature-and-airflow interaction (illustrative)", ["e1", "e2"],
            "Have a qualified reviewer compare the synthetic outlet-temperature and airflow records.",
        ))
    if {"e2", "e3"}.issubset(active):
        hypotheses.append(_hypothesis(
            "h-intermittent", "Intermittent cabin-comfort condition (illustrative)", ["e2", "e3"],
            "Review fictional time-stamped comfort logs for consistency; no physical intervention is requested.",
        ))

    # An unaffected teaching hypothesis may remain visible during a separate
    # conflict, but the global HUMAN_REVIEW state must govern its status too.
    if contradictions:
        for hypothesis in hypotheses:
            hypothesis["status"] = "review_required"

    uncertainty = 0.95 if not active else round(max(0.5, 0.9 - 0.12 * len(active)), 2)
    if contradictions:
        uncertainty = max(0.78, uncertainty)

    return {
        "caseId": case_id,
        "synthetic": True,
        "selectedEvidence": [dict(fixture[identifier]) for identifier in evidence_ids],
        "hypotheses": hypotheses,
        "metaAnnotations": [],
        "contradictions": contradictions,
        "graph": build_graph([dict(fixture[identifier]) for identifier in evidence_ids], hypotheses, contradictions),
        "uncertainty": uncertainty,
        "uncertaintyCalibrated": False,
        "recommendedAction": "TECHNICIAN_REVIEW" if contradictions else "CONTINUE_DIAGNOSIS",
        "inference": {"mode": "deterministic-offline-demo", "metaCalled": False,
                      "metaCompleted": False, "metaAccepted": False, "model": None},
        "limitations": [
            "This is invented data and illustrative logic, not a validated diagnosis.",
            "No repair instructions, safety clearance, or real-world decisions are provided.",
        ],
    }
