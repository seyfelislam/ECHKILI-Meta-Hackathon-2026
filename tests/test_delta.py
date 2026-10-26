import unittest

from demo.delta import compare


class EvidenceDeltaTests(unittest.TestCase):
    def test_conflicting_new_evidence_retires_unsupported_hypothesis(self):
        value = compare("solar-pump-01", ["e1", "e2"], ["e1", "e2", "e4"])
        self.assertEqual(value["addedEvidenceIds"], ["e4"])
        self.assertEqual(value["removedEvidenceIds"], [])
        self.assertEqual(value["retiredHypothesisIds"], ["h-flow"])
        self.assertEqual(value["newContradictions"], [["e1", "e4"]])
        self.assertEqual(value["uncertaintyDelta"], 0.12)
        self.assertEqual(value["actionChange"], ["CONTINUE_DIAGNOSIS", "TECHNICIAN_REVIEW"])

    def test_reconciling_conflicting_evidence_resolves_warning(self):
        value = compare("solar-pump-01", ["e1", "e2", "e4"], ["e1", "e2"])
        self.assertEqual(value["removedEvidenceIds"], ["e4"])
        self.assertEqual(value["introducedHypothesisIds"], ["h-flow"])
        self.assertEqual(value["resolvedContradictions"], [["e1", "e4"]])

    def test_unchanged_evidence_produces_empty_delta(self):
        value = compare("solar-pump-01", ["e2"], ["e2"])
        self.assertEqual(value["addedEvidenceIds"], [])
        self.assertEqual(value["removedEvidenceIds"], [])
        self.assertEqual(value["uncertaintyDelta"], 0)
        self.assertIsNone(value["actionChange"])

    def test_rejects_invalid_snapshot_without_partial_comparison(self):
        with self.assertRaises(ValueError):
            compare("solar-pump-01", ["e1"], ["e4", "imaginary"])


if __name__ == "__main__":
    unittest.main()
