import copy
import json
import os
import unittest
from unittest.mock import patch

from demo.reasoning import analyze
from demo.meta_provider import enrich


def _response():
    return {"choices": [{"finish_reason": "stop", "message": {"content": json.dumps({
        "annotations": [{"label": "Provisional thermal interaction", "citations": ["e1", "e2"]}]
    })}}]}


def _mock_annotations(items, *, finish="stop"):
    return {"choices": [{"finish_reason": finish, "message": {"content": json.dumps({
        "annotations": items,
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

    def test_valid_remote_note_is_not_a_canonical_hypothesis_or_graph_edge(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", return_value=_response()) as send:
            result = enrich(self.case, copy.deepcopy(self.base))
        self.assertTrue(result["inference"]["metaCalled"])
        self.assertTrue(result["inference"]["metaCompleted"])
        self.assertTrue(result["inference"]["metaAccepted"])
        self.assertEqual(result["recommendedAction"], self.base["recommendedAction"])
        self.assertEqual(result["uncertainty"], self.base["uncertainty"])
        self.assertEqual(result["hypotheses"], self.base["hypotheses"])
        self.assertEqual(result["graph"], self.base["graph"])
        self.assertEqual(result["inference"]["mode"], "deterministic-offline-demo")
        self.assertEqual(result["inference"]["model"], "muse-spark-1.3")
        self.assertEqual(len(result["metaAnnotations"]), 1)
        self.assertEqual(result["metaAnnotations"][0]["citations"], ["e1", "e2"])
        self.assertEqual(result["metaAnnotations"][0]["provenance"], "remote-unverified")
        self.assertFalse(result["metaAnnotations"][0]["verified"])
        payload = send.call_args.args[0]
        self.assertEqual(payload["model"], "muse-spark-1.3")
        self.assertFalse(payload["store"])
        self.assertLessEqual(payload["max_completion_tokens"], 256)
        self.assertNotIn("customer", json.dumps(payload).lower())

    def test_untrusted_single_or_repeated_citation_is_never_accepted(self):
        for citations in (["e1"], ["e1", "e1"]):
            with self.subTest(citations=citations), patch.dict(os.environ, self.flags), patch("demo.meta_provider._calls_made", 0), patch(
                "demo.meta_provider._request_json", return_value=_mock_annotations([
                    {"label": "Only a single fictional source", "citations": citations},
                ])
            ):
                result = enrich(self.case, copy.deepcopy(self.base))
            self.assertEqual(result["metaAnnotations"], [])
            self.assertEqual(result["hypotheses"], self.base["hypotheses"])
            self.assertEqual(result["graph"], self.base["graph"])
            self.assertTrue(result["inference"]["metaCalled"])
            self.assertTrue(result["inference"]["metaCompleted"])
            self.assertFalse(result["inference"]["metaAccepted"])

    def test_untrusted_output_schema_and_direction_controls_fail_closed(self):
        invalid = [
            _mock_annotations([{"label": "Bidi \u202e spoof", "citations": ["e1", "e2"]}]),
            _mock_annotations([{"label": "Some remote note", "citations": ["e1", "e2"]}], finish="length"),
            _mock_annotations([{"label": "Some remote note", "citations": ["e1", "e2"]}], finish=None),
            _mock_annotations([{"label": "Some remote note", "citations": ["e1", "e9"]}]),
            _mock_annotations([{"label": "Some remote note", "citations": ["e1", "e2"]}] * 3),
            {"choices": [{"finish_reason": "stop", "message": {"content": json.dumps({
                "annotations": [{"label": "Valid note", "citations": ["e1", "e2"]}],
                "graph": {"edges": [{"source": "e1", "target": "h-fake"}]},
            })}}]},
        ]
        for response in invalid:
            with self.subTest(response=response), patch.dict(os.environ, self.flags), patch(
                "demo.meta_provider._request_json", return_value=response
            ), patch("demo.meta_provider._calls_made", 0):
                result = enrich(self.case, copy.deepcopy(self.base))
                self.assertEqual(result["metaAnnotations"], [])
                self.assertEqual(result["graph"], self.base["graph"])
                self.assertEqual(result["hypotheses"], self.base["hypotheses"])
                self.assertTrue(result["inference"]["metaCompleted"])
                self.assertFalse(result["inference"]["metaAccepted"])

    def test_hallucinated_references_rejected(self):
        invalid = _mock_annotations([{"label": "Unknown source", "citations": ["invented", "e2"]}])
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", return_value=invalid):
            result = enrich(self.case, copy.deepcopy(self.base))
        self.assertEqual(result["inference"]["mode"], "deterministic-offline-demo")
        self.assertEqual(result["hypotheses"], self.base["hypotheses"])

    def test_network_exception_fails_closed(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", side_effect=TimeoutError):
            result = enrich(self.case, copy.deepcopy(self.base))
        self.assertEqual(result["graph"], self.base["graph"])
        self.assertEqual(result["hypotheses"], self.base["hypotheses"])
        self.assertTrue(result["inference"]["metaCalled"])
        self.assertFalse(result["inference"]["metaCompleted"])
        self.assertFalse(result["inference"]["metaAccepted"])
        self.assertEqual(result["metaAnnotations"], [])

    def test_never_send_unapproved_case(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json") as send:
            result = enrich({"id": "other", "synthetic": True}, copy.deepcopy(self.base))
            self.assertEqual(result, self.base)
            send.assert_not_called()

    def test_conflicting_observations_never_trigger_meta_call(self):
        conflict = analyze("cabin-climate-01", ["e1", "e2", "e4"])
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json") as send:
            self.assertEqual(enrich(self.case, conflict), conflict)
            send.assert_not_called()

    def test_empty_observations_never_trigger_meta_call(self):
        empty = analyze("cabin-climate-01", [])
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json") as send:
            self.assertEqual(enrich(self.case, empty), empty)
            send.assert_not_called()

    def test_single_attempt_per_process(self):
        with patch.dict(os.environ, self.flags), patch("demo.meta_provider._request_json", return_value=_response()) as send:
            enrich(self.case, copy.deepcopy(self.base))
            skipped = enrich(self.case, copy.deepcopy(self.base))
            self.assertEqual(skipped, self.base)
            send.assert_called_once()


if __name__ == "__main__":
    unittest.main()
