"""Build a display-only evidence graph from independently validated demo rules.

This module never infers a real mechanical cause or invokes an AI provider.
It refuses dangling citations so the visualization cannot invent provenance.
"""

from __future__ import annotations


def _display_label(label: object) -> str:
    if not isinstance(label, str) or not label.strip():
        raise ValueError("malformed graph label")
    if any("\u202a" <= char <= "\u202e" or "\u2066" <= char <= "\u2069" for char in label):
        raise ValueError("direction control in graph label")
    return label


def build_graph(selected_evidence: list[dict], hypotheses: list[dict], contradictions: list[dict]) -> dict:
    if not all(isinstance(records, list) for records in (selected_evidence, hypotheses, contradictions)):
        raise ValueError("malformed graph collections")
    evidence_ids = set()
    nodes = []
    edges = []

    for evidence in selected_evidence:
        if not isinstance(evidence, dict):
            raise ValueError("malformed evidence record")
        identifier = evidence.get("id")
        if not isinstance(identifier, str) or not identifier or identifier in evidence_ids:
            raise ValueError("invalid or duplicate evidence id")
        evidence_ids.add(identifier)
        nodes.append({
            "id": f"e:{identifier}",
            "kind": "evidence",
            "label": _display_label(evidence.get("title") or identifier.upper()),
            "sourceId": identifier,
        })
    # The same evidence set should yield the same graph regardless of the
    # order in which a caller supplied its observations.
    nodes.sort(key=lambda node: node["id"])

    # Validate conflicts first: contradicted sources cannot endorse active hypotheses.
    conflicted_evidence_ids = set()
    contradiction_pairs = set()
    contradiction_edges = []
    for conflict in contradictions:
        if not isinstance(conflict, dict):
            raise ValueError("malformed contradiction")
        sources = conflict.get("evidenceIds")
        if not isinstance(sources, list) or any(not isinstance(source, str) for source in sources):
            raise ValueError("malformed contradiction")
        if len(sources) != 2 or sources[0] == sources[1] or any(source not in evidence_ids for source in sources):
            raise ValueError("unknown evidence on contradiction edge")
        pair = frozenset(sources)
        if pair in contradiction_pairs:
            raise ValueError("duplicate contradiction edge")
        contradiction_pairs.add(pair)
        conflicted_evidence_ids.update(sources)
        contradiction_edges.append({
            "source": f"e:{sources[0]}",
            "target": f"e:{sources[1]}",
            "relation": "CONTRADICTS",
            "evidenceIds": list(sources),
        })

    hypothesis_ids = set()
    for hypothesis in hypotheses:
        if not isinstance(hypothesis, dict):
            raise ValueError("malformed hypothesis")
        identifier = hypothesis.get("id")
        if not isinstance(identifier, str) or not identifier:
            raise ValueError("invalid hypothesis id")
        if identifier in hypothesis_ids:
            raise ValueError("duplicate hypothesis id")
        label = hypothesis.get("label")
        if not isinstance(label, str) or not label.strip():
            raise ValueError("malformed hypothesis label")
        label = _display_label(label)
        hypothesis_ids.add(identifier)
        sources = hypothesis.get("supportingEvidenceIds")
        if not isinstance(sources, list) or any(not isinstance(source, str) for source in sources):
            raise ValueError("malformed hypothesis")
        if len(sources) != len(set(sources)):
            raise ValueError("duplicate support is not independent evidence")
        if len(sources) < 2:
            raise ValueError("provisional hypothesis requires corroboration")
        if any(source not in evidence_ids for source in sources):
            raise ValueError("unknown evidence on hypothesis edge")
        if conflicted_evidence_ids.intersection(sources):
            continue
        target = f"h:{identifier}"
        nodes.append({
            "id": target,
            "kind": "hypothesis",
            "label": label,
            "status": "review_required" if contradictions else "unverified",
        })
        for source in sources:
            edges.append({"source": f"e:{source}", "target": target, "relation": "SUPPORTS", "evidenceId": source})

    edges.extend(contradiction_edges)

    if contradictions:
        nodes.append({"id": "review", "kind": "review", "label": "Qualified human review required"})

    return {
        "state": "HUMAN_REVIEW" if contradictions else ("PROVISIONAL" if hypotheses else "ABSTAIN"),
        "nodes": nodes,
        "edges": edges,
    }
