# Public synthetic evidence-graph integrity audit

Date: 2026-10-27. Target: ECHKILI Evidence Lab **public fictional demo** draft
branch only. This audit introduced no new Meta requests and did not modify
private ECHKILI source code.

## Provenance mismatch fixed at the visualization boundary

Before the change, the SVG renderer accepted an edge when both endpoints
existed, even if the edge's `evidenceId`/`evidenceIds` metadata cited different
observations. The line could connect e1 and h2 while the spoken transcript
claimed e2 had supported h2. A synthetic Node-based test reproduced the bug.

The renderer now displays only edges that satisfy all relevant conditions:

- Both endpoint nodes exist in the graph.
- A SUPPORTS link connects an evidence node to a hypothesis node and cites
  that exact evidence node's `sourceId`.
- A CONTRADICTS link joins two evidence nodes and cites exactly those two
  distinct source IDs (in either order).
- Unknown relation types, nonexistent endpoints, and inconsistent metadata
  are ignored in the graph, the mobile cards, and the spoken edge count.
- If all links are invalid, the visible no-relations message appears.

The back-end graph builder already validated legitimate source references;
this is independent defensive validation for the public rendering boundary.

## Malformed input validation

Four new test-first cases show that scalar contradiction entries, null
contradiction references, scalar hypothesis entries, and null hypothesis
sources produce a consistent ValueError rather than unhandled TypeError.
Successful graph behavior and real evidence linking remain unchanged.

## Language-control accessible name

The graph's language selector originally had a correct visible label in
English, French, and Arabic but an additional English-only aria-label that
overrode it. A focused markup test failed, then the redundant aria-label was
removed; the multilingual native HTML label remains authoritative.

## Verification limits

All graph inputs and tests here use **invented IDs and labels**. These tests
verify code behavior, not screen-reader pronunciation or pixel-level 360px
layout. Browser policy prevented a local-file rendering preview in this
environment; it was not bypassed. The demo is not a real diagnostic or
mechanical safety system. Check full local tests and GitHub Actions before
merging this draft.
