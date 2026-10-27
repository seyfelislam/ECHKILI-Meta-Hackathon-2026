"""Observable graph-state contracts, independent of any browser or model call."""

import itertools
import unittest

from demo.graph import build_graph
from demo.reasoning import analyze


class GraphStateTests(unittest.TestCase):
    def test_supporting_case_has_cited_edges(self):
        graph = analyze("cabin-climate-01", ["e1", "e2"])["graph"]
        self.assertEqual(graph["state"], "PROVISIONAL")
        self.assertEqual({node["id"] for node in graph["nodes"]}, {"e:e1", "e:e2", "h:h-flow"})
        self.assertEqual({(edge["source"], edge["target"], edge["relation"]) for edge in graph["edges"]}, {
            ("e:e1", "h:h-flow", "SUPPORTS"),
            ("e:e2", "h:h-flow", "SUPPORTS"),
        })

    def test_conflict_removes_withdrawn_hypothesis_and_requires_review(self):
        graph = analyze("cabin-climate-01", ["e1", "e2", "e4"])["graph"]
        self.assertEqual(graph["state"], "HUMAN_REVIEW")
        ids = {node["id"] for node in graph["nodes"]}
        self.assertNotIn("h:h-flow", ids)
        self.assertIn("review", ids)
        self.assertIn(("e:e1", "e:e4", "CONTRADICTS"), {
            (edge["source"], edge["target"], edge["relation"]) for edge in graph["edges"]
        })

    def test_no_evidence_abstains_with_no_fabricated_nodes(self):
        graph = analyze("cabin-climate-01", [])["graph"]
        self.assertEqual(graph, {"state": "ABSTAIN", "nodes": [], "edges": []})

    def test_all_16_selections_have_traceable_edges(self):
        for length in range(5):
            for ids in itertools.combinations(("e1", "e2", "e3", "e4"), length):
                with self.subTest(ids=ids):
                    graph = analyze("cabin-climate-01", list(ids))["graph"]
                    nodes = {node["id"] for node in graph["nodes"]}
                    self.assertTrue(all(edge["source"] in nodes and edge["target"] in nodes for edge in graph["edges"]))
                    self.assertEqual({node["id"][2:] for node in graph["nodes"] if node["kind"] == "evidence"}, set(ids))

    def test_graph_builder_rejects_unknown_evidence_reference(self):
        with self.assertRaisesRegex(ValueError, "unknown evidence"):
            build_graph(
                selected_evidence=[{"id": "e1", "title": "Invented observation"}],
                hypotheses=[{"id": "h-unknown", "label": "Unverified", "supportingEvidenceIds": ["e1", "e42"]}],
                contradictions=[],
            )

    def test_graph_builder_rejects_duplicate_source_as_fake_corroboration(self):
        with self.assertRaisesRegex(ValueError, "duplicate support"):
            build_graph(
                selected_evidence=[{"id": "e1", "title": "Invented observation"}],
                hypotheses=[{"id": "h-invalid", "label": "Unverified", "supportingEvidenceIds": ["e1", "e1"]}],
                contradictions=[],
            )

    def test_wonder_t03_conflict_withdraws_only_dependent_hypothesis(self):
        graph = build_graph(
            selected_evidence=[{"id": identifier, "title": identifier} for identifier in ("e1", "e2", "e3", "e4")],
            hypotheses=[
                {"id": "h1", "label": "Conflict dependent", "supportingEvidenceIds": ["e1", "e2"]},
                {"id": "h2", "label": "Independent", "supportingEvidenceIds": ["e3", "e4"]},
            ],
            contradictions=[{"evidenceIds": ["e1", "e2"]}],
        )
        self.assertEqual(graph["state"], "HUMAN_REVIEW")
        self.assertEqual({node["id"] for node in graph["nodes"] if node["kind"] == "hypothesis"}, {"h:h2"})
        self.assertEqual({edge["target"] for edge in graph["edges"] if edge["relation"] == "SUPPORTS"}, {"h:h2"})

    def test_wonder_t09_new_conflict_withdraws_other_dependent_hypothesis(self):
        evidence = [{"id": identifier, "title": identifier} for identifier in ("e1", "e2", "e3", "e4")]
        hypotheses = [
            {"id": "h1", "label": "Independent", "supportingEvidenceIds": ["e1", "e2"]},
            {"id": "h2", "label": "Conflict dependent", "supportingEvidenceIds": ["e3", "e4"]},
        ]
        before = build_graph(evidence, hypotheses, [])
        after = build_graph(evidence, hypotheses, [{"evidenceIds": ["e3", "e4"]}])
        self.assertEqual({node["id"] for node in before["nodes"] if node["kind"] == "hypothesis"}, {"h:h1", "h:h2"})
        self.assertEqual(after["state"], "HUMAN_REVIEW")
        self.assertEqual({node["id"] for node in after["nodes"] if node["kind"] == "hypothesis"}, {"h:h1"})
        self.assertEqual({edge["target"] for edge in after["edges"] if edge["relation"] == "SUPPORTS"}, {"h:h1"})


if __name__ == "__main__":
    unittest.main()
