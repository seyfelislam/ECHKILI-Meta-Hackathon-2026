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

    def test_independent_hypothesis_requires_review_under_global_conflict(self):
        result = analyze("cabin-climate-01", ["e1", "e2", "e3", "e4"])
        self.assertEqual(result["graph"]["state"], "HUMAN_REVIEW")
        self.assertEqual([(h["id"], h["status"]) for h in result["hypotheses"]], [
            ("h-intermittent", "review_required"),
        ])
        self.assertEqual([
            (n["id"], n["status"]) for n in result["graph"]["nodes"] if n["kind"] == "hypothesis"
        ], [("h:h-intermittent", "review_required")])
        self.assertEqual({(e["source"], e["target"]) for e in result["graph"]["edges"]
                          if e["relation"] == "SUPPORTS"}, {
            ("e:e2", "h:h-intermittent"), ("e:e3", "h:h-intermittent"),
        })

    def test_illustrative_uncertainty_is_explicitly_uncalibrated(self):
        result = analyze("cabin-climate-01", ["e1", "e3"])
        self.assertEqual(result["graph"]["state"], "ABSTAIN")
        self.assertEqual(result["uncertainty"], 0.66)
        self.assertIs(result.get("uncertaintyCalibrated"), False)

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

    def test_wonder_high_t06_rejects_empty_hypothesis_id(self):
        with self.assertRaisesRegex(ValueError, "invalid hypothesis id"):
            build_graph(
                selected_evidence=[{"id": "e1"}, {"id": "e2"}],
                hypotheses=[{"id": "", "label": "Fictional", "supportingEvidenceIds": ["e1", "e2"]}],
                contradictions=[],
            )

    def test_wonder_high_t16_rejects_numeric_hypothesis_id(self):
        with self.assertRaisesRegex(ValueError, "invalid hypothesis id"):
            build_graph(
                selected_evidence=[{"id": "e1"}, {"id": "e2"}],
                hypotheses=[{"id": 123, "label": "Fictional", "supportingEvidenceIds": ["e1", "e2"]}],
                contradictions=[],
            )

    def test_wonder_high_t02_rejects_reversed_duplicate_contradiction(self):
        with self.assertRaisesRegex(ValueError, "duplicate contradiction"):
            build_graph(
                selected_evidence=[{"id": identifier} for identifier in ("e1", "e2", "e3", "e4")],
                hypotheses=[{"id": "h1", "label": "Unrelated", "supportingEvidenceIds": ["e3", "e4"]}],
                contradictions=[{"evidenceIds": ["e1", "e2"]}, {"evidenceIds": ["e2", "e1"]}],
            )

    def test_wonder_high_t10_rejects_scalar_evidence_with_value_error(self):
        try:
            build_graph(selected_evidence=[123, {"id": "e1"}], hypotheses=[], contradictions=[])
        except ValueError:
            return
        except (TypeError, KeyError) as exc:
            self.fail(f"Unvalidated input leaked {type(exc).__name__} instead of ValueError")
        self.fail("Scalar evidence input was accepted")

    def test_malformed_scalar_contradiction_is_a_validation_error(self):
        with self.assertRaisesRegex(ValueError, "malformed contradiction"):
            build_graph(
                selected_evidence=[{"id": "e1"}, {"id": "e2"}],
                hypotheses=[], contradictions=[123],
            )

    def test_null_contradiction_references_are_a_validation_error(self):
        with self.assertRaisesRegex(ValueError, "malformed contradiction"):
            build_graph(
                selected_evidence=[{"id": "e1"}, {"id": "e2"}],
                hypotheses=[], contradictions=[{"evidenceIds": None}],
            )

    def test_scalar_hypothesis_is_a_validation_error(self):
        with self.assertRaisesRegex(ValueError, "malformed hypothesis"):
            build_graph(
                selected_evidence=[{"id": "e1"}, {"id": "e2"}],
                hypotheses=[123], contradictions=[],
            )

    def test_null_hypothesis_sources_are_a_validation_error(self):
        with self.assertRaisesRegex(ValueError, "malformed hypothesis"):
            build_graph(
                selected_evidence=[{"id": "e1"}, {"id": "e2"}],
                hypotheses=[{"id": "h1", "supportingEvidenceIds": None}],
                contradictions=[],
            )


if __name__ == "__main__":
    unittest.main()
