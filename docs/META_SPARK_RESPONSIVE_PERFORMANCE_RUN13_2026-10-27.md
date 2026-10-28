# Muse Spark 1.3 — thirteenth synthetic responsive-graph audit (2026-10-27)

## Paid experiment and provenance

- User approved continuation after the proposed Spark 1.3 graph-performance/mobile-accessibility experiment.
- Meta Playground model: **`muse-spark-1.3` standard**, High reasoning, temperature `0`, top-p `1`, max tokens `6000`, search grounding **off**.
- Prompt described only a **public, fictional** graph-view contract, scaling example and 360px/200% responsive considerations. No private code, keys, customer data, real vehicles or telemetry sent.
- Playground completed **16.3 s · input 743 · output 1.4K · reasoning 3.2K**. Full valid JSON with five findings, three patch proposals, eight test cases, six accessibility checks and four rejected shortcuts is preserved verbatim in `evaluation/meta_spark_graph_run13_raw_2026-10-27.json`.

## Accepted model suggestions, verified with implementation

1. **Do not build the CSS-hidden SVG on compact view (F1/M1).** At `max-width:700px`, `drawGraph` now creates the existing **full same-edge-backed node/relation transcript**, but no SVG, `<path>` or extra hidden graphics. The model received no actual browser screenshot and no claims of measured device time are made.
2. **Restore the SVG after crossing the breakpoint (F2/M2).** A single `matchMedia('(max-width: 700px)')` change handler redraws only from the already cached graph arguments when compact state changes. It does not call `/api/analyze`, change the canonical graph/IDs, or lose relation cards. This also follows the CSS breakpoint when a browser zoom change changes the effective viewport width; actual 200% zoom remains a live-QA gate.
3. **No hidden truncation of a large graph.** A new test feeds 200 synthetic evidence nodes, 300 synthetic hypothesis nodes and 600 synthetic cited support edges to the actual client renderer. In simulated compact mode all **500 node transcript entries and 600 relation cards** remain; the SVG has zero children. Simulated expansion restores 600 SVG paths; shrinking removes the SVG and retains every card.

## Suggestions deferred or already covered

- **Unbounded desktop SVG height (F3):** the existing full spatial overview can be very tall for 300 hypothesis nodes. The model proposed a constrained scroll region and other work, but that needs genuine browser/keyboard exploration before changing UX; no arbitrary cap or omission was introduced.
- **Arabic isolates (F4):** technical ID isolation and localized graph copy already exist, and existing Node tests cover the fictional `e1`/`h2` relations. Actual Arabic screen-reader reading order is not certified.
- **Accessible semantics/focus (F5):** SVG has a text title/description and transcript cards are the same validated edges. Real focus, reflow, assistive technology, and reduced-motion verification remain open. The model's claim of guaranteed lost focus was not adopted without reproducing it.
- We intentionally **did not** add a second graph algorithm, a heavy graph library, virtualized relation cards, reanalysis on resize, or made-up performance improvements in milliseconds.

## Red-green verification

- RED: The new Node DOM contract failed on the real controller because a compact graph still appended an SVG (`expected 0, got 1`).
- GREEN: `node tests/mobile_graph_contract.js` now passes with simulated mobile, desktop, return-to-mobile, complete 600-edge transcript and zero extra fetch calls.
- Full offline Python suite **83/83**, `node --check demo/static/app.js`, and `git diff --check` all passed. The remote GitHub Actions result is checked separately at the updated head.
- Scope is a **draft public fictional demo PR only**; no merge, live production publish, quantified speedup claim, diagnosis or safety approval.

## Remaining explicit release gates

Real 360px and 200% browser layout tests, browser resize focus testing, Arabic/French assistive-technology review, large desktop scroll interaction, reduced-motion review, and IP review are still needed before any production release.
