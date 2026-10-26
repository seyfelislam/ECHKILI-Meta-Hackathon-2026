"""Evidence transition tests, all using made-up data and no remote API."""
import itertools
import unittest
from unittest.mock import patch

from demo.cases import CASE
from demo.trace import compare


class EvidenceTraceTests(unittest.TestCase):
    def test_evidence_addition_withdraws_explanation_and_escalates(self):
        with patch("demo.meta_provider._request_json", side_effect=AssertionError("unexpected Meta call")):
            trace = compare(CASE["id"], ["e1", "e2"], ["e1", "e2", "e4"])
        changes = trace["changes"]
        self.assertEqual(changes["addedEvidenceIds"], ["e4"])
        self.assertEqual(changes["withdrawnHypothesisIds"], ["h-flow"])
        self.assertEqual(changes["newContradictions"], [["e1", "e4"]])
        self.assertTrue(changes["humanReviewEscalated"])
        self.assertGreater(changes["uncertaintyDelta"], 0)
        self.assertFalse(trace["inference"]["metaCalled"])
        self.assertEqual(trace["after"]["recommendedAction"], "TECHNICIAN_REVIEW")

    def test_removed_evidence_resolves_conflict(self):
        trace = compare(CASE["id"], ["e1", "e2", "e4"], ["e1", "e2"])
        self.assertEqual(trace["changes"]["removedEvidenceIds"], ["e4"])
        self.assertEqual(trace["changes"]["resolvedContradictions"], [["e1", "e4"]])
        self.assertFalse(trace["changes"]["humanReviewEscalated"])
        self.assertIn("h-flow", trace["changes"]["newHypothesisIds"])

    def test_same_evidence_is_stable(self):
        trace = compare(CASE["id"], ["e2", "e3"], ["e2", "e3"])
        self.assertEqual(trace["changes"]["uncertaintyDelta"], 0)
        self.assertFalse(trace["changes"]["newContradictions"])
        self.assertFalse(trace["changes"]["withdrawnHypothesisIds"])
        self.assertEqual(len(trace["observations"]), 1)

    def test_invalid_ids_and_duplicates_rejected(self):
        for before, after in [(["absent"], []), ([], ["e2", "e2"]), (None, []), ([], {"e1": True})]:
            with self.subTest(before=before, after=after), self.assertRaises(ValueError):
                compare(CASE["id"], before, after)

    def test_all_directed_single_additions_preserve_safety(self):
        ids = [e["id"] for e in CASE["evidence"]]
        seen = 0
        for bits in itertools.product((False, True), repeat=len(ids)):
            initial = [identifier for identifier, present in zip(ids, bits) if present]
            for identifier in ids:
                if identifier in initial:
                    continue
                after = initial + [identifier]
                result = compare(CASE["id"], initial, after)
                change = result["changes"]
                self.assertEqual(change["addedEvidenceIds"], [identifier])
                if {"e1", "e4"}.issubset(after):
                    self.assertEqual(change["afterAction"], "TECHNICIAN_REVIEW")
                    self.assertNotIn("h-flow", {h["id"] for h in result["after"]["hypotheses"]})
                self.assertFalse(result["inference"]["metaCalled"])
                seen += 1
        self.assertEqual(seen, 32)


if __name__ == "__main__":
    unittest.main()
