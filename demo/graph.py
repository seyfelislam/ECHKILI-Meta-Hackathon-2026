"""Build a display-only evidence graph from independently validated demo rules.

This module never infers a real mechanical cause or invokes an AI provider.
It refuses dangling citations so the visualization cannot invent provenance.
"""

from __future__ import annotations


def build_graph(selected_evidence: list[dict], hypotheses: list[dict], contradictions: list[dict]) -> dict:
    evidence_ids = set()
    nodes = []
    edges = []

    for evidence in selected_evidence:
        identifier = evidence["id"]
        if not isinstance(identifier, str) or not identifier or identifier in evidence_ids:
            raise ValueError("invalid or duplicate evidence id")
        evidence_ids.add(identifier)
        nodes.append({
            "id": f"e:{identifier}",
            "kind": "evidence",
            "label": evidence.get("title") or identifier.upper(),
            "sourceId": identifier,
        })

    hypothesis_ids = set()
    for hypothesis in hypotheses:
        identifier = hypothesis["id"]
        if identifier in hypothesis_ids:
            raise ValueError("duplicate hypothesis id")
        hypothesis_ids.add(identifier)
        sources = hypothesis["supportingEvidenceIds"]
        if len(sources) != len(set(sources)):
            raise ValueError("duplicate support is not independent evidence")
        if len(sources) < 2:
            raise ValueError("provisional hypothesis requires corroboration")
        if any(source not in evidence_ids for source in sources):
            raise ValueError("unknown evidence on hypothesis edge")
        target = f"h:{identifier}"
        nodes.append({
            "id": target,
            "kind": "hypothesis",
            "label": hypothesis["label"],
            "status": "unverified",
        })
        for source in sources:
            edges.append({"source": f"e:{source}", "target": target, "relation": "SUPPORTS", "evidenceId": source})

    for conflict in contradictions:
        sources = conflict["evidenceIds"]
        if len(sources) != 2 or sources[0] == sources[1] or any(source not in evidence_ids for source in sources):
            raise ValueError("unknown evidence on contradiction edge")
        edges.append({
            "source": f"e:{sources[0]}",
            "target": f"e:{sources[1]}",
            "relation": "CONTRADICTS",
            "evidenceIds": list(sources),
        })

    if contradictions:
        nodes.append({"id": "review", "kind": "review", "label": "Qualified human review required"})

    return {
        "state": "HUMAN_REVIEW" if contradictions else ("PROVISIONAL" if hypotheses else "ABSTAIN"),
        "nodes": nodes,
        "edges": edges,
    }
