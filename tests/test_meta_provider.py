import copy
import json
import os
import unittest
from unittest.mock import patch

from demo.reasoning import analyze
from demo.meta_provider import enrich


def _response():
    return {"choices": [{"finish_reason": "stop", "message": {"content": json.dumps({
        "hypotheses": [{"label": "Provisional thermal interaction", "supportingEvidenceIds": ["e1", "e2"]}]
    })}}]}


class MetaProviderTests(unittest.TestCase):
    def setUp(self):
        self.base = analyze("cabin-climate-01", ["e1", "e2"])
        self.case = {"id": "cabin-climate-01", "synthetic": True}
        self.flags = {
            "ECHKILI_META_ENABLED": "true",
            "ECHKILI_META_CREDITS_CONFIRMED": "true",
            "ECHKILI_META_MAX_CALLS_PER_PROCESS": "1",
            "META_MODEL_API_KEY": "unit-test-value-not-a-real-key",
            "ECHKILI_META_APPROVED_CASE": "cabin-climate-01",
        }
        self.counter = patch("demo.meta_provider._calls_made", 0)
        self.counter.start()
        self.addCleanup(self.counter.stop)

    def test_each_explicit_gate_required(self):
        for name in self.flags:
            with self.subTest(name=name), patch.dict(os.environ, {**self.flags, name: ""}):
                with patch("demo.meta_provider._request_json") as send:
                    result = enrich(self.case, copy.deepcopy(self.base))
                    self.assertEqual(result["inference"]["mode"], "deterministic-offline-demo")
                    send.assert_not_called()

    def test_valid_mock_adds_provisional_reference_without_safety_override(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", return_value=_response()) as send:
            result = enrich(self.case, copy.deepcopy(self.base))
        self.assertTrue(result["inference"]["metaCalled"])
        self.assertEqual(result["recommendedAction"], self.base["recommendedAction"])
        self.assertEqual(result["uncertainty"], self.base["uncertainty"])
        self.assertEqual(result["inference"]["model"], "muse-spark-1.3")
        self.assertEqual(result["hypotheses"][-1]["provenance"], "meta-standard-provisional")
        payload = send.call_args.args[0]
        self.assertEqual(payload["model"], "muse-spark-1.3")
        self.assertFalse(payload["store"])
        self.assertLessEqual(payload["max_completion_tokens"], 256)
        self.assertNotIn("customer", json.dumps(payload).lower())

    def test_hallucinated_references_rejected(self):
        invalid = {"choices": [{"finish_reason": "stop", "message": {"content": json.dumps({"hypotheses": [
            {"label": "Unknown source", "supportingEvidenceIds": ["invented"]}
        ]})}}]}
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", return_value=invalid):
            result = enrich(self.case, copy.deepcopy(self.base))
        self.assertEqual(result["inference"]["mode"], "deterministic-offline-demo")
        self.assertEqual(result["hypotheses"], self.base["hypotheses"])

    def test_network_exception_fails_closed(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", side_effect=TimeoutError):
            result = enrich(self.case, copy.deepcopy(self.base))
        self.assertEqual(result, self.base)

    def test_never_send_unapproved_case(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json") as send:
            result = enrich({"id": "other", "synthetic": True}, copy.deepcopy(self.base))
            self.assertEqual(result, self.base)
            send.assert_not_called()

    def test_single_attempt_per_process(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", return_value=_response()) as send:
            enrich(self.case, copy.deepcopy(self.base))
            skipped = enrich(self.case, copy.deepcopy(self.base))
            self.assertEqual(skipped, self.base)
            send.assert_called_once()


if __name__ == "__main__":
    unittest.main()
