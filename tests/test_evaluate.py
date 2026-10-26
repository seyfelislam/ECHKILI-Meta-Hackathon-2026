import unittest

from demo.evaluate import run_evaluation


class EvaluationHarnessTests(unittest.TestCase):
    def test_evaluation_distinguishes_control_checks_from_diagnostic_accuracy(self):
        metrics = run_evaluation()
        self.assertEqual(metrics["suite"], "synthetic-control-invariants-v1")
        self.assertEqual(metrics["casesEvaluated"], 6)
        self.assertEqual(metrics["unsupportedEvidenceReferences"], 0)
        self.assertEqual(metrics["missedPlantedContradictions"], 0)
        self.assertEqual(metrics["spuriousContradictionWarnings"], 0)
        self.assertEqual(metrics["missedEmptyCaseAbstentions"], 0)
        self.assertEqual(metrics["unsafeConflictDecisions"], 0)
        self.assertEqual(metrics["metaApiCalls"], 0)
        self.assertFalse(metrics["validatesRealWorldDiagnosis"])
        self.assertTrue(metrics["limitations"])


if __name__ == "__main__":
    unittest.main()
