# Tenth Meta Playground experiment — multilingual result semantics

Date: 27 October 2026. Scope: English, French and Modern Standard Arabic copy for the results panel of the wholly synthetic, public ECHKILI Evidence Lab demo.

## Approved model call

- The user explicitly approved the tenth paid request at action time.
- `muse-wonder-1.0`; reasoning `High`; `max_tokens=8000`; temperature `0`; top-p `1`; search grounding off.
- One completed Playground generation: ~41.9 s; displayed input ~873 tokens, output ~3.4K tokens, reasoning ~4.2K tokens. These are UI-reported model statistics, not a verified provider bill.
- Strict JSON parsed without normalization: **30 keys each for French and Arabic**, 12 proposed deterministic test scenarios, six proposed accessibility checks and six rejected misleading phrases. The full literal output is stored at [`evaluation/meta_wonder_result_run10_raw_2026-10-27.json`](../evaluation/meta_wonder_result_run10_raw_2026-10-27.json).
- The model saw **only an invented interface contract**, not private source code, real user data, API keys or automotive diagnoses.

## Design decisions and manual review

Chosen approach: a dedicated `result-i18n.js` module containing exactly 30 Meta-proposed common copy keys per locale, plus five separately identified human-written first-load/waiting strings, separate from the existing `graph-i18n.js`, with the **same visible language selector** controlling both components. The existing offline inference, graph source IDs and safety state remain unmodified.

Two model strings were corrected before integration:

1. It called every unverified explanation a "single fictional source" in French and Arabic. This falsely implies one evidence citation even where the canonical rule requires two. The accepted copy now says independently unverified without asserting a source count.
2. It described optional remote notes as "disabled by default" inside the section **while that section is visible after opt-in**. The accepted copy says notes are optional and outside canonical hypotheses/graph; default-off behavior remains separately documented.

Other careful copy adjustments avoid implying that an API timeout necessarily means the model rejected a note, that `HUMAN_REVIEW` is a verified diagnosis, or that the numeric caution score is a probability.

## Implemented surface

- The results-panel copy, empty/waiting presentation, uncalibrated caution explanation, active/withdrawn change counters, contradictory-record heading, global human-review banner, remote-note headings, graph jump link and analyze button reflect the chosen French/Arabic language. Canonical observations and graph edges are unchanged.
- Arabic results use `dir=rtl` and `lang=ar`; each mixed-script ID and numeric placeholder in the evidence-update summary is emitted as a **separate `<bdi dir="ltr">` node**. These values are inserted as text nodes, not HTML, and remain in the original array order.
- A locale change re-renders the last **successful** analysis with its original prior-evidence comparison, **without issuing another analysis API request** and without inventing graph relationships. If the most recent request failed, changing language preserves the visible failure rather than resurrecting stale prior results. An optional remote note still lives only in `metaAnnotations` and never in the `hypotheses` array.
- The English text/labels for the two fictional hypothesis names, their verification goals, conflict-detail source prose, scenario and broader page are not localized yet. This limitation is explicit so the user cannot mistake the work for a fully Arabic/French product.

## Offline verification and release gates

- Test-driven regressions were introduced before creating the result module and before wiring the analyze control to the language switch. Both failures were seen, then corrected.
- A new language-pack contract verifies exact keys, matching placeholders, absence of stored direction-control characters/HTML, and removal of the two misleading source-count/default-off phrases.
- The Node fake-DOM contract exercises the real controller: language changes across English/French/Arabic, remote-note separation, numerical caution wording, prior-evidence change preservation, `<bdi>` technical IDs, unchanged graph edges and no new HTTP analysis request.
- The Python HTTP tests verify that `/result-i18n.js` is served with the correct JavaScript MIME type; the markup contract verifies loading the pack before the controller.
- The 12 Meta-proposed cases and six accessibility checks are **review suggestions**, not assertions that every one was independently executed. Genuine 360-CSS-pixel browser, 200% zoom, Arabic screen-reader/keyboard, contrast, and broader IP review remain mandatory before merging or publishing. The restricted browser environment did not support a genuine local-page visual audit, so no accessibility conformance is claimed.

All work remains in the **public fictional demo's draft PR**. No private ECHKILI repository or production deployment was changed. Optional remote enrichment remains disabled by default.
