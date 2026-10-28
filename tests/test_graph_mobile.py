"""Executable graph-card contracts proposed in the seventh Wonder exercise."""

import subprocess
import unittest


class GraphMobileTests(unittest.TestCase):
    def test_mobile_relation_cards_reuse_actual_graph_edges_without_invention(self):
        result = subprocess.run(
            ["node", "tests/mobile_graph_contract.js"],
            capture_output=True, text=True, check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
