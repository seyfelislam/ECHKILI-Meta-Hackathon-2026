import unittest

from demo.reasoning import analyze


class EvidenceReasoningTests(unittest.TestCase):
    def test_empty_case_abstains(self):
        result = analyze("cabin-climate-01", [])
        self.assertEqual(result["hypotheses"], [])
        self.assertGreaterEqual(result["uncertainty"], 0.9)
        self.assertEqual(result["inference"]["mode"], "deterministic-offline-demo")

    def test_hypotheses_require_selected_evidence(self):
        result = analyze("cabin-climate-01", ["e1", "e2", "e3"])
        self.assertTrue(result["hypotheses"])
        self.assertTrue(all(set(h["supportingEvidenceIds"]).issubset({"e1", "e2", "e3"}) for h in result["hypotheses"]))
        self.assertTrue(all(h["provenance"] == "illustrative-rule" for h in result["hypotheses"]))
        self.assertFalse(result["inference"]["metaCalled"])

    def test_conflicting_reading_is_explained_and_escalated(self):
        result = analyze("cabin-climate-01", ["e1", "e4"])
        self.assertTrue(result["contradictions"])
        self.assertEqual(result["recommendedAction"], "TECHNICIAN_REVIEW")
        self.assertGreaterEqual(result["uncertainty"], 0.65)

    def test_unknown_evidence_rejected(self):
        with self.assertRaises(ValueError):
            analyze("cabin-climate-01", ["e1", "not-a-real-id"])

    def test_duplicate_evidence_rejected(self):
        with self.assertRaises(ValueError):
            analyze("cabin-climate-01", ["e1", "e1"])

    def test_verification_is_noninvasive_and_uncertainty_visible(self):
        result = analyze("cabin-climate-01", ["e1", "e2", "e3"])
        self.assertTrue(all(h["verificationGoal"] for h in result["hypotheses"]))
        self.assertIn(result["recommendedAction"], {"CONTINUE_DIAGNOSIS", "TECHNICIAN_REVIEW"})
        self.assertTrue(0 <= result["uncertainty"] <= 1)
        self.assertTrue(result["limitations"])


    def test_new_conflicting_evidence_withdraws_explanation_and_raises_uncertainty(self):
        from demo.reasoning import analyze
        first = analyze("cabin-climate-01", ["e1", "e2"])
        second = analyze("cabin-climate-01", ["e1", "e2", "e4"])
        self.assertIn("h-flow", {h["id"] for h in first["hypotheses"]})
        self.assertNotIn("h-flow", {h["id"] for h in second["hypotheses"]})
        self.assertEqual(second["recommendedAction"], "TECHNICIAN_REVIEW")
        self.assertGreater(second["uncertainty"], first["uncertainty"])
        self.assertEqual(second["inference"]["metaCalled"], False)


if __name__ == "__main__":
    unittest.main()
