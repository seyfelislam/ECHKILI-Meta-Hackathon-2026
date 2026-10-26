"""Benchmark checks are deterministic, complete, and make no paid API calls."""
import unittest
from unittest.mock import patch

from evaluation.benchmark import evaluate


class BenchmarkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with patch("demo.meta_provider._request_json", side_effect=AssertionError("network attempt")):
            cls.report = evaluate()

    def test_exhaustive_16_sets(self):
        self.assertEqual(self.report["metrics"]["total"], 16)
        self.assertEqual(len(self.report["cases"]), 16)

    def test_all_traceable(self):
        self.assertEqual(self.report["metrics"]["traceable"], 16)

    def test_all_conflicts_detected_and_escalated(self):
        self.assertEqual(self.report["metrics"]["correct_conflict_gate"], 16)

    def test_no_meta_requests(self):
        self.assertEqual(self.report["metrics"]["no_meta_calls"], 16)

    def test_abstains_without_evidence(self):
        self.assertEqual(self.report["metrics"]["empty_input_abstentions"], 1)

    def test_has_no_contract_failures(self):
        self.assertFalse(self.report["failures"])
        self.assertEqual(self.report["metrics"]["contract_pass"], 16)


if __name__ == "__main__":
    unittest.main()
