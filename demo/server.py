"""A loopback-only, standard-library web interface for synthetic case exploration."""

from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .cases import public_case
from .meta_provider import enrich
from .reasoning import analyze
from .trace import compare

STATIC = Path(__file__).resolve().parent / "static"
FILES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/styles.css": ("styles.css", "text/css; charset=utf-8"),
    "/graph-i18n.js": ("graph-i18n.js", "text/javascript; charset=utf-8"),
    "/result-i18n.js": ("result-i18n.js", "text/javascript; charset=utf-8"),
    "/site-i18n.js": ("site-i18n.js", "text/javascript; charset=utf-8"),
    "/app.js": ("app.js", "text/javascript; charset=utf-8"),
}
MAX_BODY = 2048
CSP = "default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"


class DemoHandler(BaseHTTPRequestHandler):
    server_version = "SyntheticDemo/1.0"
    sys_version = ""

    def log_message(self, format, *args):
        # No requests, keys, or case content in terminal logs.
        pass

    def _send(self, status: int, data: bytes, content_type: str = "application/json; charset=utf-8"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(data)

    def _json(self, status: int, value: dict):
        self._send(status, json.dumps(value, ensure_ascii=False).encode("utf-8"))

    def do_GET(self):
        if self.path == "/api/case":
            return self._json(200, public_case())
        if self.path in FILES:
            name, content_type = FILES[self.path]
            return self._send(200, (STATIC / name).read_bytes(), content_type)
        return self._json(404, {"error": "Not found"})

    def do_POST(self):
        if self.path not in {"/api/analyze", "/api/trace"}:
            return self._json(404, {"error": "Not found"})
        if self.headers.get("Content-Type", "").split(";")[0].strip().lower() != "application/json":
            return self._json(415, {"error": "Expected application/json"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 1 <= length <= MAX_BODY:
                return self._json(413, {"error": "Request body out of bounds"})
            body = json.loads(self.rfile.read(length))
            if not isinstance(body, dict):
                raise ValueError("Expected a JSON object")
            if self.path == "/api/trace":
                if set(body) != {"caseId", "beforeEvidenceIds", "afterEvidenceIds"}:
                    raise ValueError("Unsupported trace fields")
                result = compare(body["caseId"], body["beforeEvidenceIds"], body["afterEvidenceIds"])
            else:
                if set(body) != {"caseId", "evidenceIds"}:
                    raise ValueError("Unsupported request fields")
                result = analyze(body["caseId"], body["evidenceIds"])
        except (ValueError, TypeError, KeyError, UnicodeDecodeError, json.JSONDecodeError):
            return self._json(400, {"error": "Invalid synthetic case or evidence IDs"})
        if self.path == "/api/analyze":
            result = enrich({"id": "cabin-climate-01", "synthetic": True}, result)
        return self._json(200, result)


def make_server(host: str = "127.0.0.1", port: int = 8765) -> ThreadingHTTPServer:
    if host not in {"127.0.0.1", "localhost", "::1"}:
        raise ValueError("Loopback-only demo server")
    return ThreadingHTTPServer((host, port), DemoHandler)


if __name__ == "__main__":
    print("ECHKILI synthetic demo: http://127.0.0.1:8765 (local only)")
    make_server().serve_forever()
