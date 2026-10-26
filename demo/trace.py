"""Auditable, deterministic before/after evidence transitions for an invented case.

This trace is a behavioral demonstration, not a clinical or automotive validation.
It never invokes a remote provider. Changes are recomputed server-side from
allowlisted fixture IDs, not accepted as model-provided explanations.
"""

from __future__ import annotations

from .reasoning import analyze


def compare(case_id: str, before_ids: list[str], after_ids: list[str]) -> dict:
    before = analyze(case_id, before_ids)
    after = analyze(case_id, after_ids)
    previous_ids = set(before_ids)
    current_ids = set(after_ids)
    before_hypotheses = {item["id"]: item for item in before["hypotheses"]}
    after_hypotheses = {item["id"]: item for item in after["hypotheses"]}
    before_conflicts = {tuple(conflict["evidenceIds"]) for conflict in before["contradictions"]}
    after_conflicts = {tuple(conflict["evidenceIds"]) for conflict in after["contradictions"]}

    new_conflicts = [list(ids) for ids in sorted(after_conflicts - before_conflicts)]
    resolved_conflicts = [list(ids) for ids in sorted(before_conflicts - after_conflicts)]
    actions = {"CONTINUE_DIAGNOSIS", "TECHNICIAN_REVIEW"}
    if before["recommendedAction"] not in actions or after["recommendedAction"] not in actions:
        raise ValueError("Unsupported safety decision")

    changes = {
        "addedEvidenceIds": sorted(current_ids - previous_ids),
        "removedEvidenceIds": sorted(previous_ids - current_ids),
        "newHypothesisIds": sorted(set(after_hypotheses) - set(before_hypotheses)),
        "withdrawnHypothesisIds": sorted(set(before_hypotheses) - set(after_hypotheses)),
        "newContradictions": new_conflicts,
        "resolvedContradictions": resolved_conflicts,
        "beforeAction": before["recommendedAction"],
        "afterAction": after["recommendedAction"],
        "humanReviewEscalated": (before["recommendedAction"] != "TECHNICIAN_REVIEW"
                                 and after["recommendedAction"] == "TECHNICIAN_REVIEW"),
        "uncertaintyBefore": before["uncertainty"],
        "uncertaintyAfter": after["uncertainty"],
        "uncertaintyDelta": round(after["uncertainty"] - before["uncertainty"], 3),
    }
    observations = []
    if changes["addedEvidenceIds"]:
        observations.append("New observations were added to the selected evidence set.")
    if changes["removedEvidenceIds"]:
        observations.append("Some previously selected observations were removed.")
    if changes["withdrawnHypothesisIds"]:
        observations.append("A previously offered illustrative hypothesis was withdrawn.")
    if new_conflicts:
        observations.append("Conflicting synthetic records were detected; a qualified review is required.")
    if changes["newHypothesisIds"]:
        observations.append("Additional provisional, evidence-linked hypotheses appeared.")
    if resolved_conflicts:
        observations.append("A previous record disagreement is no longer present in the selected evidence.")
    if not observations:
        observations.append("There is no material change in the selected evidence or trace.")

    return {
        "caseId": case_id,
        "synthetic": True,
        "before": before,
        "after": after,
        "changes": changes,
        "observations": observations,
        "inference": {"mode": "deterministic-offline-comparison", "metaCalled": False},
        "interpretation": "An explanation of programmed responses to invented evidence; not real-world diagnostic accuracy.",
    }
