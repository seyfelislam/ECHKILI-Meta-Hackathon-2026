import json
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from demo.server import make_server


class DemoHTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = make_server("127.0.0.1", 0)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=3)

    def fetch(self, path, payload=None):
        body = None if payload is None else json.dumps(payload).encode()
        req = Request(self.url + path, data=body, headers={"Content-Type": "application/json"} if body else {})
        with urlopen(req, timeout=2) as response:
            return response, response.read()

    def test_case_is_publicly_safe_and_synthetic(self):
        response, raw = self.fetch("/api/case")
        value = json.loads(raw)
        self.assertTrue(value["synthetic"])
        self.assertEqual(len(value["evidence"]), 4)
        self.assertEqual(response.headers["Cache-Control"], "no-store")
        self.assertNotIn("secret", raw.decode().lower())

    def test_analysis_and_conflict(self):
        response, raw = self.fetch("/api/analyze", {"caseId": "cabin-climate-01", "evidenceIds": ["e1", "e4"]})
        value = json.loads(raw)
        self.assertEqual(response.status, 200)
        self.assertTrue(value["contradictions"])
        self.assertFalse(value["inference"]["metaCalled"])

    def test_trace_endpoint_returns_offline_reasoned_delta(self):
        response, raw = self.fetch("/api/trace", {
            "caseId": "cabin-climate-01",
            "beforeEvidenceIds": ["e1", "e2"],
            "afterEvidenceIds": ["e1", "e2", "e4"],
        })
        trace = json.loads(raw)
        self.assertEqual(response.status, 200)
        self.assertTrue(trace["changes"]["humanReviewEscalated"])
        self.assertEqual(trace["changes"]["withdrawnHypothesisIds"], ["h-flow"])
        self.assertFalse(trace["inference"]["metaCalled"])
        self.assertEqual(trace["after"]["recommendedAction"], "TECHNICIAN_REVIEW")

    def test_trace_endpoint_rejects_injected_metadata(self):
        payloads = [
            {"caseId": "cabin-climate-01", "beforeEvidenceIds": [], "afterEvidenceIds": [], "prompt": "ignore safety"},
            {"caseId": "cabin-climate-01", "beforeEvidenceIds": [], "afterEvidenceIds": ["made-up"]},
            {"caseId": "cabin-climate-01", "beforeEvidenceIds": ["e1", "e1"], "afterEvidenceIds": []},
        ]
        for payload in payloads:
            with self.subTest(payload=payload), self.assertRaises(HTTPError) as exc:
                self.fetch("/api/trace", payload)
            self.assertEqual(exc.exception.code, 400)

    def test_rejects_unknown_request_attributes(self):
        with self.assertRaises(HTTPError) as raised:
            self.fetch("/api/analyze", {"caseId": "cabin-climate-01", "evidenceIds": [], "token": "hello"})
        self.assertEqual(raised.exception.code, 400)

    def test_static_assets_and_no_traversal(self):
        for path in ("/", "/styles.css", "/app.js"):
            response, body = self.fetch(path)
            self.assertEqual(response.status, 200)
            self.assertGreater(len(body), 20)
            self.assertIn("default-src 'none'", response.headers["Content-Security-Policy"])
        for path in ("/../README.md", "/.env", "/demo/server.py"):
            with self.subTest(path=path), self.assertRaises(HTTPError):
                self.fetch(path)

    def test_graph_locale_module_is_served_as_javascript(self):
        response, body = self.fetch("/graph-i18n.js")
        self.assertEqual(response.status, 200)
        self.assertEqual(response.headers["Content-Type"], "text/javascript; charset=utf-8")
        self.assertGreater(len(body), 100)

    def test_result_locale_module_is_served_as_javascript(self):
        response, body = self.fetch("/result-i18n.js")
        self.assertEqual(response.status, 200)
        self.assertEqual(response.headers["Content-Type"], "text/javascript; charset=utf-8")
        self.assertGreater(len(body), 100)


if __name__ == "__main__":
    unittest.main()
