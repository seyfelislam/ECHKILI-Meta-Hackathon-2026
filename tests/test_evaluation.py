"""Benchmark checks are deterministic, complete, and make no paid API calls."""
import unittest
from unittest.mock import patch

from demo.reasoning import analyze as real_analyze
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

    def test_all_32_one_step_transitions(self):
        self.assertEqual(self.report["transitionMetrics"]["total"], 32)
        self.assertEqual(self.report["transitionMetrics"]["audit_pass"], 32)
        self.assertEqual(self.report["transitionMetrics"]["new_conflict_escalations"], 8)
        self.assertGreater(self.report["transitionMetrics"]["withdrawn_hypothesis_events"], 0)

    def test_has_no_contract_failures(self):
        self.assertFalse(self.report["failures"])
        self.assertEqual(self.report["metrics"]["contract_pass"], 16)

    def test_benchmark_rejects_unqualified_hypothesis_during_human_review(self):
        def unsafe_analyze(case_id, evidence_ids):
            result = real_analyze(case_id, evidence_ids)
            if set(evidence_ids) == {"e1", "e2", "e3", "e4"}:
                result["hypotheses"][0]["status"] = "unverified"
            return result

        with patch("evaluation.benchmark.analyze", side_effect=unsafe_analyze):
            report = evaluate()
        self.assertEqual(report["metrics"]["traceable"], 15)
        self.assertTrue(any(failure.get("selectedEvidenceIds") == ["e1", "e2", "e3", "e4"]
                            for failure in report["failures"]))


if __name__ == "__main__":
    unittest.main()
