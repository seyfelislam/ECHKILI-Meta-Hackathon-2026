"""Fail-closed checks for a non-diagnostic, fictional graph evaluation pack.

These checks validate provenance and cautious presentation states only. They
cannot establish mechanical truth, diagnostic accuracy, or model quality.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ALLOWED_COMPONENTS = {"fan", "control", "sensor", "wire"}
ALLOWED_RELATIONS = {"SUPPORTS", "CONTRADICTS"}
ALLOWED_STATES = {"PROVISIONAL", "ABSTAIN", "HUMAN_REVIEW"}


def load_fixture_pack() -> dict:
    """Load the committed synthetic fixtures without any network/model call."""
    path = Path(__file__).with_name("meta_graph_fixtures.json")
    return json.loads(path.read_text(encoding="utf-8"))


def validate_fixture_pack(pack: dict) -> dict:
    """Validate local citations and conservative state invariants.

    Raise ValueError on malformed or unsafe model-produced output.
    """
    if not isinstance(pack, dict) or not isinstance(pack.get("fixtures"), list):
        raise ValueError("fixtures must be a list")

    ids = set()
    states = Counter()
    for fixture in pack["fixtures"]:
        if not isinstance(fixture, dict):
            raise ValueError("fixture must be an object")
        identifier = fixture.get("id")
        if not isinstance(identifier, str) or not identifier:
            raise ValueError("fixture id must be a non-empty string")
        if identifier in ids:
            raise ValueError(f"duplicate fixture id: {identifier}")
        ids.add(identifier)

        if fixture.get("component_id") not in ALLOWED_COMPONENTS:
            raise ValueError(f"{identifier}: unknown component")
        if not isinstance(fixture.get("hypothesis_id"), str) or not fixture["hypothesis_id"]:
            raise ValueError(f"{identifier}: missing hypothesis id")
        evidence = fixture.get("evidence")
        edges = fixture.get("expected_edges")
        missing = fixture.get("missing_evidence")
        state = fixture.get("expected_state")
        if not isinstance(evidence, list) or not isinstance(edges, list):
            raise ValueError(f"{identifier}: evidence and edges must be arrays")
        if not isinstance(missing, list) or not all(isinstance(item, str) and item for item in missing):
            raise ValueError(f"{identifier}: missing_evidence must be strings")
        if state not in ALLOWED_STATES:
            raise ValueError(f"{identifier}: invalid expected state")

        evidence_ids = set()
        for item in evidence:
            if not isinstance(item, dict):
                raise ValueError(f"{identifier}: malformed evidence")
            eid, observation = item.get("id"), item.get("observation")
            if not isinstance(eid, str) or not eid or eid in evidence_ids:
                raise ValueError(f"{identifier}: invalid or duplicate evidence id")
            if not isinstance(observation, str) or not observation.strip():
                raise ValueError(f"{identifier}: empty observation")
            evidence_ids.add(eid)

        support_count = 0
        conflicts = 0
        edge_sources = set()
        for edge in edges:
            if not isinstance(edge, dict):
                raise ValueError(f"{identifier}: malformed edge")
            if edge.get("evidence_id") not in evidence_ids:
                raise ValueError(f"{identifier}: unknown evidence on graph edge")
            if edge["evidence_id"] in edge_sources:
                raise ValueError(f"{identifier}: duplicate edge for evidence")
            edge_sources.add(edge["evidence_id"])
            relation = edge.get("relation")
            if relation not in ALLOWED_RELATIONS:
                raise ValueError(f"{identifier}: invalid edge relation")
            support_count += relation == "SUPPORTS"
            conflicts += relation == "CONTRADICTS"

        if conflicts and state != "HUMAN_REVIEW":
            raise ValueError(f"{identifier}: contradiction requires HUMAN_REVIEW")
        if not conflicts and support_count < 2 and state != "ABSTAIN":
            raise ValueError(f"{identifier}: insufficient support requires ABSTAIN")
        if state == "ABSTAIN" and not missing:
            raise ValueError(f"{identifier}: ABSTAIN requires missing_evidence")
        if state == "HUMAN_REVIEW" and not conflicts:
            raise ValueError(f"{identifier}: HUMAN_REVIEW requires contradiction")
        states[state] += 1

    return {
        "total": len(ids),
        "states": dict(states),
        "unsupported_edges": 0,
        "synthetic_only": True,
    }
