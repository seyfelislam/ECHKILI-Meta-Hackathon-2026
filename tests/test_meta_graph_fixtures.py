"""Offline contract tests for a wholly fictional Meta-generated graph pack."""

import copy
import unittest

from evaluation.graph_fixtures import load_fixture_pack, validate_fixture_pack


class MetaGraphFixtureContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pack = load_fixture_pack()

    def test_six_fixtures_cover_caution_states(self):
        summary = validate_fixture_pack(self.pack)
        self.assertEqual(summary["total"], 6)
        self.assertEqual(summary["states"], {
            "PROVISIONAL": 2,
            "HUMAN_REVIEW": 2,
            "ABSTAIN": 2,
        })
        self.assertEqual(summary["unsupported_edges"], 0)

    def test_all_graph_edges_cite_known_evidence_in_same_fixture(self):
        for fixture in self.pack["fixtures"]:
            ids = {evidence["id"] for evidence in fixture["evidence"]}
            for edge in fixture["expected_edges"]:
                with self.subTest(fixture=fixture["id"], edge=edge):
                    self.assertIn(edge["evidence_id"], ids)

    def test_unknown_evidence_reference_fails_closed(self):
        bad = copy.deepcopy(self.pack)
        bad["fixtures"][0]["expected_edges"][0]["evidence_id"] = "unknown"
        with self.assertRaisesRegex(ValueError, "unknown evidence"):
            validate_fixture_pack(bad)

    def test_conflict_must_trigger_human_review(self):
        bad = copy.deepcopy(self.pack)
        bad["fixtures"][2]["expected_state"] = "PROVISIONAL"
        with self.assertRaisesRegex(ValueError, "HUMAN_REVIEW"):
            validate_fixture_pack(bad)

    def test_single_support_cannot_be_promoted_to_provisional(self):
        bad = copy.deepcopy(self.pack)
        bad["fixtures"][4]["expected_state"] = "PROVISIONAL"
        with self.assertRaisesRegex(ValueError, "ABSTAIN"):
            validate_fixture_pack(bad)

    def test_invalid_relationship_type_rejected(self):
        bad = copy.deepcopy(self.pack)
        bad["fixtures"][0]["expected_edges"][0]["relation"] = "CONFIRMS_CAUSE"
        with self.assertRaisesRegex(ValueError, "relation"):
            validate_fixture_pack(bad)

    def test_duplicate_ids_are_rejected(self):
        bad = copy.deepcopy(self.pack)
        bad["fixtures"][1]["id"] = bad["fixtures"][0]["id"]
        with self.assertRaisesRegex(ValueError, "duplicate fixture"):
            validate_fixture_pack(bad)

    def test_no_evidence_does_not_support_a_provisional_claim(self):
        bad = copy.deepcopy(self.pack)
        bad["fixtures"][0]["expected_edges"] = []
        with self.assertRaisesRegex(ValueError, "ABSTAIN"):
            validate_fixture_pack(bad)

    def test_repeated_edge_cannot_forge_independent_support(self):
        bad = copy.deepcopy(self.pack)
        target = bad["fixtures"][4]
        target["expected_edges"].append(copy.deepcopy(target["expected_edges"][0]))
        target["expected_state"] = "PROVISIONAL"
        with self.assertRaisesRegex(ValueError, "duplicate edge"):
            validate_fixture_pack(bad)


if __name__ == "__main__":
    unittest.main()
