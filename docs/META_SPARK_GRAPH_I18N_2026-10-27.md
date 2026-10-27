# Meta Muse Spark 1.3: public graph localization pilot — 2026-10-27

This pilot uses only the **PUBLIC fictional ECHKILI Evidence Lab** contract. No proprietary algorithm, commercial dataset, credentials, OEM material, real observations, diagnosis, or repair instructions were submitted to Meta.

## One approved Spark experiment

- Meta Model API Playground, `muse-spark-1.3` **Standard** (not Contributor), High reasoning, temperature `0.2`, max `6,000` tokens, search grounding disabled.
- Task: produce 16 matching graph-panel copy keys in English, international French, and Modern Standard Arabic, with six accessibility/RTL checks.
- UI summary: **13.9 s**, **417 input**, **837 visible output**, approximately **3.0K reasoning** tokens. The estimated cost using public standard rates ($1.25/M input, $4.25/M output) is about **$0.017**, subject to display rounding and final billing reconciliation.
- Original unedited output: `evaluation/meta_spark_1_3_graph_locales_raw_2026-10-27.json` (candidate language data, not automatically deployed copy).

## Integration decisions

The original model JSON parsed and contained the same 16 keys and template placeholders for all three locales. Human review changed several terms to avoid weak or misleading phrasing. For example, Arabic `نص بديل` became `شرح نصّي للعلاقات بين الأدلة`, and conflict sentences explicitly require human review. No medical, automotive, or physical advice was introduced.

Implemented only within the **graph panel**:

1. `demo/static/graph-i18n.js`: reviewed copy, complete placeholder matching, fallback to English, and Unicode LTR isolation around technical evidence references embedded in Arabic.
2. `demo/static/index.html`: a labeled `en` / `fr` / `ar` selector, localized text targets, explicit `lang` and `dir`, readable legend and text transcript, and a live status.
3. `demo/static/app.js`: updates captions, edge descriptions, SVG title/description, withdrawn explanations and graph status **without another API request or analysis**. The evidence canvas preserves LTR coordinates even for Arabic copy. This uses plain text rendering, never HTML injection.
4. `demo/server.py`: an explicit allowlisted route for `/graph-i18n.js`; content security policy remains unchanged.
5. `demo/static/styles.css`: responsive language control styling and RTL text layout.

## Test-first verification

- Four tests in `tests/test_graph_i18n.py`: matching translations/placeholders; isolated technical IDs; localized text and RTL/LTR assignment; real controller event changes copy without requesting a new analysis.
- One test in `tests/test_server.py`: the locale script is actually served as JavaScript, not HTTP 404.
- The new module and wiring tests were run **before implementation and failed**, then passed after the corresponding changes. The HTTP route similarly failed with 404 first, then passed once allowlisted.
- Run the full Python suite and JavaScript syntax checks before merging. These validate contract and static behavior, **not visual pixel layout**.

## Limits and follow-up

- The page outside the graph panel remains English, including the evidence-selection flow and several fictional case labels. This is a scoped i18n pilot, not a complete global launch.
- A local headless visual-preview attempt was blocked because a Playwright Chromium binary is not installed. Browser visual QA is still required before public release, especially mobile RTL.
- As always, manually inspect all AI-generated copy and retain a qualified-human review state for contradictory evidence; a translated graph cannot establish mechanical truth.
