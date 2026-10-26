"""Honest offline fixture checks; these do not establish field diagnostic accuracy."""

from __future__ import annotations

import json

from .reasoning import analyze


_FIXTURES = (
    ("empty", [], False, True),
    ("single-note", ["e1"], False, False),
    ("mutually-supporting", ["e1", "e2"], False, False),
    ("direct-conflict", ["e1", "e4"], True, False),
    ("intermittent", ["e2", "e3"], False, False),
    ("mixed-conflict", ["e1", "e2", "e4"], True, False),
)


def run_evaluation() -> dict:
    """Evaluate source grounding and deliberately planted warning controls."""
    metrics = {
        "suite": "synthetic-control-invariants-v1",
        "casesEvaluated": 0,
        "unsupportedEvidenceReferences": 0,
        "missedPlantedContradictions": 0,
        "spuriousContradictionWarnings": 0,
        "missedEmptyCaseAbstentions": 0,
        "unsafeConflictDecisions": 0,
        "metaApiCalls": 0,
        "validatesRealWorldDiagnosis": False,
        "limitations": (
            "These are designed synthetic invariant tests, not calibrated accuracy, "
            "recall, safety certification, or measurements of live Meta inference."
        ),
    }
    for _name, ids, expected_conflict, expected_abstention in _FIXTURES:
        result = analyze("solar-pump-01", ids)
        metrics["casesEvaluated"] += 1
        metrics["metaApiCalls"] += int(result["inference"]["metaCalled"])
        metrics["unsupportedEvidenceReferences"] += sum(
            not set(hypothesis["supportingEvidenceIds"]).issubset(ids)
            for hypothesis in result["hypotheses"]
        )
        found_conflict = bool(result["contradictions"])
        metrics["missedPlantedContradictions"] += int(expected_conflict and not found_conflict)
        metrics["spuriousContradictionWarnings"] += int(not expected_conflict and found_conflict)
        metrics["missedEmptyCaseAbstentions"] += int(expected_abstention and bool(result["hypotheses"]))
        metrics["unsafeConflictDecisions"] += int(
            expected_conflict and result["recommendedAction"] != "TECHNICIAN_REVIEW"
        )
    return metrics


if __name__ == "__main__":
    print(json.dumps(run_evaluation(), indent=2))
