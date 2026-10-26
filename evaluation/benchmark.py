"""Exhaustive four-observation contract evaluation for the fictional demo.

This checks program behavior, not clinical accuracy, user impact, or Meta model quality.
Run: python -m evaluation.benchmark
"""

from __future__ import annotations

import itertools
import json
from collections import Counter

from demo.cases import CASE
from demo.reasoning import analyze
from demo.trace import compare


def evaluate() -> dict:
    ids = tuple(item["id"] for item in CASE["evidence"])
    outcomes = Counter()
    failures = []
    cases = []
    for mask in itertools.product((False, True), repeat=len(ids)):
        selected = [item for item, on in zip(ids, mask) if on]
        result = analyze(CASE["id"], selected)
        conflict = {"e1", "e4"}.issubset(selected)
        linked = all(
            hypothesis["supportingEvidenceIds"]
            and set(hypothesis["supportingEvidenceIds"]).issubset(selected)
            and hypothesis["status"] == "unverified"
            for hypothesis in result["hypotheses"]
        )
        guard = (
            (bool(result["contradictions"]) == conflict)
            and (result["recommendedAction"] == "TECHNICIAN_REVIEW") == conflict
        )
        abstained = not selected and not result["hypotheses"]
        offline = result["inference"]["metaCalled"] is False
        safe = linked and guard and offline and 0 <= result["uncertainty"] <= 1
        outcomes["total"] += 1
        outcomes["traceable"] += int(linked)
        outcomes["correct_conflict_gate"] += int(guard)
        outcomes["no_meta_calls"] += int(offline)
        if not selected:
            outcomes["empty_input_abstentions"] += int(abstained)
            safe = safe and abstained
        outcomes["contract_pass"] += int(safe)
        if not safe:
            failures.append({"selectedEvidenceIds": selected, "reason": "contract violation"})
        cases.append({
            "evidenceIds": selected,
            "hypothesisIds": [h["id"] for h in result["hypotheses"]],
            "contradiction": conflict,
            "recommendedAction": result["recommendedAction"],
            "passed": safe,
        })
    # One newly supplied observation can change a conclusion, or introduce a conflict.
    # Exhausting all such directed additions (4 * 2^3 = 32) also verifies that a
    # previously mandated technician review never gets downgraded by adding evidence.
    transitions = Counter()
    for mask in itertools.product((False, True), repeat=len(ids)):
        before = [item for item, on in zip(ids, mask) if on]
        for added in ids:
            if added in before:
                continue
            updated = [*before, added]
            trace = compare(CASE["id"], before, updated)
            changes = trace["changes"]
            audit_pass = (
                changes["addedEvidenceIds"] == [added]
                and not changes["removedEvidenceIds"]
                and not trace["inference"]["metaCalled"]
                and (changes["beforeAction"] != "TECHNICIAN_REVIEW"
                     or changes["afterAction"] == "TECHNICIAN_REVIEW")
                and (not changes["newContradictions"]
                     or (changes["humanReviewEscalated"]
                         and changes["afterAction"] == "TECHNICIAN_REVIEW"
                         and changes["uncertaintyDelta"] >= 0))
            )
            transitions["total"] += 1
            transitions["audit_pass"] += int(audit_pass)
            transitions["new_conflict_escalations"] += int(bool(changes["newContradictions"]))
            transitions["withdrawn_hypothesis_events"] += int(bool(changes["withdrawnHypothesisIds"]))
            if not audit_pass:
                failures.append({"beforeEvidenceIds": before, "addedEvidenceId": added,
                                 "reason": "transition audit violation"})

    return {
        "benchmark": "fictional-evidence-contract-v2",
        "scope": "All 16 subsets of four invented observations; rules are evaluated against their own stated contract, not real faults.",
        "metrics": dict(outcomes),
        "transitionMetrics": dict(transitions),
        "failures": failures,
        "cases": cases,
        "interpretation": "PASS verifies deterministic invariants only. It is not diagnostic accuracy or Meta model effectiveness.",
    }


def main() -> None:
    report = evaluate()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report["failures"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
