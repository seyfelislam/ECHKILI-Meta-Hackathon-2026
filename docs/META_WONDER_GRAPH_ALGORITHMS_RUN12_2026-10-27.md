# Muse Wonder 1.0 — twelfth synthetic graph-algorithm audit (2026-10-27)

## Provenance and limitations of the model output

- The user explicitly authorized one new Meta Playground experiment: `muse-wonder-1.0`, High reasoning, temperature `0`, top-p `1`, 8,000 output-token cap, search grounding disabled, and entirely invented graph/evidence IDs.
- The prompt described the **public fictional contract**, not ECHKILI production code, real cases, passwords, private records or telemetry.
- The Playground reported **62.5 s, input 1.1K, visible output 2.4K, reasoning 5.6K**. It explicitly said **"Response incomplete — max output tokens reached"**. The raw text is therefore a **truncated, invalid JSON fragment**. It is retained unmodified under `evaluation/meta_wonder_graph_run12_partial_2026-10-27.txt`. We did not repeat the paid request.
- The completed risk-register portion offers eight proposals. Later sections, including the requested complete executable offline-test list, were cut off and must not be presented as delivered.

## Model suggestions evaluated against the actual implementation

1. **R3: non-deterministic graph serialization — confirmed and fixed.** Previously only evidence nodes were sorted. Permuting hypotheses, support citation order, contradictory pair direction, or contradiction-list order changed the serialized graph. Canonical node/edge ordering and ordered contradiction endpoints now make equivalent inputs compare byte-for-byte equal. The separate API `selectedEvidence` still preserves user selection order; no graph inference or score is changed.
2. **R4 / R7: hostile or ambiguous raw identifiers — confirmed and hardened.** Both evidence and hypothesis IDs now reject colon delimiters and non-printable characters (including bidi-control and line-break characters). This is an intentional **input-acceptance change**; an untrusted raw ID such as `h:alias` that previously passed now fails with `ValueError`. Ordinary fixture IDs and Arabic display labels continue to work.
3. **R6: contradiction-pair orientation — partially confirmed and fixed.** Reverse duplicate pairs already raised errors. However, a single `(e4,e1)` pair was serialized in the opposite direction to `(e1,e4)`. They now render the same canonical endpoints and `evidenceIds` list. The relation remains logically undirected.
4. **R1: scoped withdrawal and independent human-reviewed hypothesis — already handled.** Conflicted hypotheses are withheld; unrelated supported hypotheses remain visible with `review_required` during global `HUMAN_REVIEW`. Adding new `withdrawn` graph nodes would materially change this contract, and was not adopted.
5. **R2 / R5: unknown citations and duplicate support — already handled.** The builder rejects references absent from selected evidence, duplicates and support sets below two distinct records. No speculative behavior change was added.
6. **R8: potential quadratic scans — not established in current code.** The implementation already uses sets for source IDs, contradiction pairs and conflicted-evidence membership. No unmeasured complexity optimization was copied from the model.

## Test-first verification

- RED was observed for three new independent tests (eight expected assertion failures in their subtests): hypothesis/support permutation, undirected contradiction-pair serialization, and unsafe identifier rejection.
- GREEN was observed after the minimal `demo/graph.py` change.
- Local full Python suite: **83/83 passed** on 2026-10-27.
- `node tests/mobile_graph_contract.js`, `git diff --check`, and `python -m evaluation.benchmark` also returned exit code 0. The benchmark enumerates all 16 subsets of the four fictional observations and their 32 one-step evidence additions.
- Independent GitHub Actions status must be checked at the final updated branch head. PR remains a **draft**, not merged or published to production.

## Review gate

This is deterministic toy-graph contract validation, **not evidence that the system performs real-world diagnosis**. The model output was incomplete; the suggestions are hypotheses independently evaluated against executable code. Real 360px/200% browser verification, Arabic assistive-technology review, and IP review remain pending.
