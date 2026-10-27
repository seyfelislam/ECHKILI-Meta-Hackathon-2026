# Ninth Meta Playground review — isolated remote annotations

Date: 27 October 2026. Scope: wholly invented ECHKILI Evidence Lab observations `e1`–`e4`. No customer, vehicle, confidential repository, API key, or production data was sent to Meta.

## Experiment

- User expressly approved one paid Playground request immediately before execution.
- Model: `muse-wonder-1.0`, reasoning `High`, `max_tokens=8000`, temperature `0`, top-p `1`, search grounding off.
- One successful generation: ~35.8 s; Playground display: input ~814 tokens, output ~4.7K tokens, reasoning ~2.7K tokens. These usage figures are displayed by the Playground, **not** independently reconciled billing.
- Output: valid JSON with **8 prioritized findings and 19 offline threat-model test proposals**. The proposals have been manually filtered; they must not be conflated with 19 tests implemented in this codebase.
- Full literal JSON response: [`evaluation/meta_wonder_adapter_run9_raw_2026-10-27.json`](../evaluation/meta_wonder_adapter_run9_raw_2026-10-27.json); unlike the preceding eighth experiment, this ninth output parsed as JSON without manual normalization.

## Architecture choice

Meta compared these options:

| Approach | Trade-off | Decision |
| --- | --- | --- |
| A: accept two-citation remote text as canonical hypotheses | A cited label may still be wrong or unsupported by canonical graph edges | Reject |
| B: isolate remote labels in `metaAnnotations`, with separate visual treatment | More explicit contract and UI code, but preserves offline graph semantics | Selected, **opt-in only** |
| C: disable all remote enrichment | Smallest operational risk but no optional annotation experiment | Default and kill-switch fallback |

This choice is a defensive educational design, **not** proof of real model reliability. Two distinct fictional citations do not establish independent corroboration. The offline rules remain the sole authors of the hypothesis list, graph, safety status, and numerical caution score.

## Changes accepted and exercised offline

1. `analyze()` always initializes an empty `metaAnnotations` list and distinct `metaCalled`, `metaCompleted`, and `metaAccepted` booleans. It does not auto-call a model.
2. The optional adapter returns candidate text **only** in `metaAnnotations`, never `hypotheses`. Its `inference.mode` stays `deterministic-offline-demo`. An attempted timed-out call is reported as attempted, not completed or accepted.
3. Candidate response parsing requires exactly one completed `finish_reason=stop` choice, an `annotations` JSON array with no extra fields, no more than two notes, labels of 3–100 printable characters without specified action verbs, and 2–4 **distinct** selected IDs. Bad shape, unknown or duplicated citations, a control/bidi label, truncated output, or an injected `graph` key fails closed. Duplicate identical notes do not generate duplicate display cards. This narrow filter cannot guarantee that arbitrary prompt-injection text is harmless; isolation and default-off gating are essential.
4. Call budget reservation happens only after the selected fictional observation IDs are validated. The five explicit consent/credential/case/limit gates, six-second timeout, fixed destination, redirect refusal, response limit, no-store payload, and per-process cap remain. The cap is not an account-wide financial limit.
5. The client renders accepted notes in **REMOTE MODEL NOTES · UNVERIFIED**, with cited IDs explicitly described as not independently verified. They never become graph nodes, relationship cards, canonical hypotheses, or a claimed diagnosis.

## Test evidence and remaining limitations

- Test-first failures were observed in the provider suite when the new `metaAnnotations` contract was absent and in the Node UI contract when no independent note section existed; then implementation was added.
- Additional Python regression tests cover accepted remote notes, fake one-source corroboration, duplicate IDs, malformed or overlong candidate arrays, bidi/control labels, unknown IDs, fake graph injection, truncated or malformed completion, and network failures.
- The offline Node UI contract checks segregated note rendering, lack of fabricated graph links, and the unverified summary label. None of these tests calls Meta.
- All 19 scenarios in the Meta JSON are proposals; existing and added tests cover core branches but this work **does not claim a 19/19 execution of that proposed suite**. Provider-specific HTTP limits and real browser reflow/screen-reader behavior require separate verified testing.
- Per-process limit resets on restart and does not cover multiple instances. Runtime prices, external behavior, and reliability are not certified. Keep enrichment off for deployment unless independent global spend and security controls are established.

No protected/private ECHKILI repository, deployment, or production branch was changed by this experiment. Changes are limited to the fictional public demo's draft review branch.
