"""Opt-in server-only Meta experiment for one wholly invented case.

Offline mode is the default. Attempted API calls require five independent gates.
This per-process guard is NOT a substitute for a provider billing limit.
"""

from __future__ import annotations

import copy
import json
import os
from threading import Lock
from urllib.request import HTTPRedirectHandler, Request, build_opener

_URL = "https://api.meta.ai/v1/chat/completions"
_MODEL = "muse-spark-1.3"
_lock = Lock()
_calls_made = 0


def _ready(case: dict, result: dict) -> bool:
    return (
        case == {"id": "solar-pump-01", "synthetic": True}
        and result.get("caseId") == "solar-pump-01"
        and result.get("synthetic") is True
        and result.get("inference", {}).get("mode") == "deterministic-offline-demo"
        and os.environ.get("ECHKILI_META_ENABLED") == "true"
        and os.environ.get("ECHKILI_META_CREDITS_CONFIRMED") == "true"
        and os.environ.get("ECHKILI_META_APPROVED_CASE") == "solar-pump-01"
        and bool(os.environ.get("META_MODEL_API_KEY", "").strip())
    )


def _reserve() -> bool:
    global _calls_made
    try:
        limit = int(os.environ.get("ECHKILI_META_MAX_CALLS_PER_PROCESS", "0"))
    except ValueError:
        return False
    if not 1 <= limit <= 10:
        return False
    with _lock:
        if _calls_made >= limit:
            return False
        _calls_made += 1
        return True


def _request_json(payload: dict) -> dict:
    """Fixed destination; redirect refusal, size and timeout bounds."""
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request = Request(_URL, data=data, headers={
        "Authorization": f"Bearer {os.environ['META_MODEL_API_KEY']}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }, method="POST")

    class NoRedirect(HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    with build_opener(NoRedirect).open(request, timeout=6) as response:
        body = response.read(32_769)
    if len(body) > 32_768:
        raise ValueError("Oversized response")
    parsed = json.loads(body)
    if not isinstance(parsed, dict):
        raise ValueError("Malformed API response")
    return parsed


def _candidates(response: dict, allowed: set[str]) -> list[dict]:
    choices = response.get("choices")
    if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
        return []
    first = choices[0]
    if first.get("finish_reason", "stop") != "stop":
        return []
    message = first.get("message")
    if not isinstance(message, dict) or not isinstance(message.get("content"), str):
        return []
    raw = message["content"]
    if len(raw) > 5000:
        return []
    parsed = json.loads(raw)
    if not isinstance(parsed, dict) or not isinstance(parsed.get("hypotheses"), list):
        return []

    results = []
    for index, candidate in enumerate(parsed["hypotheses"][:2]):
        if not isinstance(candidate, dict):
            continue
        label = candidate.get("label")
        ids = candidate.get("supportingEvidenceIds")
        if (
            not isinstance(label, str) or not 3 <= len(label) <= 100
            or not label.isprintable() or any(x in label.lower() for x in ("repair", "replace", "disable", "bypass"))
            or not isinstance(ids, list) or not ids
            or not all(isinstance(item, str) and item in allowed for item in ids)
        ):
            continue
        results.append({
            "id": f"meta-provisional-{index + 1}",
            "label": label,
            "supportingEvidenceIds": list(dict.fromkeys(ids)),
            "provenance": "meta-standard-provisional",
            "verificationGoal": "A qualified reviewer must corroborate these simulated observations independently.",
            "status": "unverified",
        })
    return results


def enrich(case: dict, result: dict) -> dict:
    """Append tentative labels only; never change deterministic safety or uncertainty."""
    if not _ready(case, result) or not _reserve():
        return result

    observations = [{"id": item["id"], "observation": item["observation"]}
                    for item in result.get("selectedEvidence", [])]
    if not observations or len(observations) > 4:
        return result
    allowed = {item["id"] for item in observations}
    if not allowed.issubset({"e1", "e2", "e3", "e4"}):
        return result

    payload = {
        "model": _MODEL,
        "messages": [
            {"role": "system", "content": (
                "These observations are wholly fictional. Generate at most two provisional, "
                "non-actionable hypothesis labels as JSON {hypotheses:[{label,supportingEvidenceIds}]}. "
                "Only cite supplied evidence IDs. No repairs or safety instructions."
            )},
            {"role": "user", "content": json.dumps({"syntheticEvidence": observations}, ensure_ascii=False)},
        ],
        "max_completion_tokens": 256,
        "response_format": {"type": "json_object"},
        "store": False,
        "stream": False,
    }
    try:
        candidates = _candidates(_request_json(payload), allowed)
    except (ValueError, TypeError, KeyError, OSError, TimeoutError, json.JSONDecodeError):
        return result
    if not candidates:
        return result
    enhanced = copy.deepcopy(result)
    enhanced["hypotheses"].extend(candidates)
    enhanced["inference"] = {"mode": "offline-plus-optional-meta", "metaCalled": True, "model": _MODEL}
    enhanced["limitations"].append("Meta annotations are unverified and do not override deterministic safety decisions.")
    return enhanced
