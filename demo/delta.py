"""Compare two reproducible synthetic evidence snapshots without model calls."""

from __future__ import annotations

from .reasoning import analyze


def compare(case_id: str, before_ids: list[str], after_ids: list[str]) -> dict:
    """Explain which evidence, warnings and provisional hypotheses changed."""
    before = analyze(case_id, before_ids)
    after = analyze(case_id, after_ids)

    old_hypotheses = {item["id"] for item in before["hypotheses"]}
    new_hypotheses = {item["id"] for item in after["hypotheses"]}
    old_conflicts = {tuple(item["evidenceIds"]) for item in before["contradictions"]}
    new_conflicts = {tuple(item["evidenceIds"]) for item in after["contradictions"]}

    return {
        "caseId": case_id,
        "addedEvidenceIds": [id for id in after_ids if id not in before_ids],
        "removedEvidenceIds": [id for id in before_ids if id not in after_ids],
        "introducedHypothesisIds": sorted(new_hypotheses - old_hypotheses),
        "retiredHypothesisIds": sorted(old_hypotheses - new_hypotheses),
        "newContradictions": [list(ids) for ids in sorted(new_conflicts - old_conflicts)],
        "resolvedContradictions": [list(ids) for ids in sorted(old_conflicts - new_conflicts)],
        "beforeUncertainty": before["uncertainty"],
        "afterUncertainty": after["uncertainty"],
        "uncertaintyDelta": round(after["uncertainty"] - before["uncertainty"], 2),
        "actionChange": [before["recommendedAction"], after["recommendedAction"]]
        if before["recommendedAction"] != after["recommendedAction"] else None,
        "method": "deterministic-offline-delta",
    }
