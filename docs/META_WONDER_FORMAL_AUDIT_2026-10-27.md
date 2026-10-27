# Muse Wonder 1.0 — eighth synthetic ECHKILI formal audit (2026-10-27)

## Scope and provenance

- User-approved **one** Meta Model API Playground request to `muse-wonder-1.0`, High reasoning, temperature 0, 8,000 output-token cap.
- Synthetic-only abstract contract: four invented observations `e1`–`e4`, two rule-based provisional hypotheses, one fictional contradiction, evidence graphs, Arabic/mobile accessibility.
- No private production code, real vehicle record, customer data, keys, or proprietary implementation was shared. Meta was asked for critical review and independently falsifiable tests, not real diagnoses.
- Playground completion shown as **43.9 s · Input 828 · Output 4.7K · Reasoning 3.2K**.
- Retained raw response as `evaluation/meta_wonder_formal_run8_raw_2026-10-27.txt`. Meta returned one extra closing `}` in test T18's `fixtureInput`, so the literal raw output is **not valid JSON**; a clearly marked normalized copy removes that single character and escapes an embedded hostile bidi override (`U+202E`) for readable code review, without changing the parsed value. It is not passed off as raw.

## Human-reviewed findings and changes

1. **Independent hypothesis under global HUMAN_REVIEW (accepted).** The synthetic `e1,e2,e3,e4` case still supports `h-intermittent` from `e2,e3`; it does not magically become proven or actionable because its evidence does not overlap with the `e1/e4` conflict. It now carries `review_required` in both the API hypothesis and graph node, and the graph's English/French/Arabic transcript and relationship cards explicitly name human review. The benchmark actively rejects an unqualified hypothesis under global review.
2. **Confidence-like percentage from an uncalibrated formula (accepted).** The synthetic caution signal is now returned with `uncertaintyCalibrated: false`; the UI displays `0.xx / 1.00` as a fictional, non-probabilistic caution score, does not portray it as a percentage, and removes the progress meter. This remains an invented indicator, not a scientific measure of uncertainty.
3. **Exact provenance and duplicate conflict handling (already covered).** Existing graph validation refuses dangling citations, reverse-duplicate conflict pairs, and repeated support IDs. The mobile text and SVG rely on the same vetted relations.
4. **Accessible mobile cards, withdrawn status, bidi references (already partly covered).** The existing mobile transcript includes visible relationship cards, withdrawal, and Arabic LTR ID isolation. Genuine screen-reader and 360px/200% browser pixel tests are **still pending**; offline Node/HTML contracts do not replace them.
5. **Additional schema controls and claimed source independence (deferred).** The model suggested rejecting hypothetical client-injected graph fields and using distinct source-label text to prove independent evidence. The toy HTTP API already rejects unknown request keys and derives hypotheses itself; distinct labels are **not sufficient evidence of real-world independence**. No speculative new policy was accepted.

## Verification and limitations

- TDD RED observed for backend hypothesis status and uncalibrated signal, frontend review wording/score presentation, and the benchmark's status-sensitive safety gate; GREEN observed after minimal fixes.
- Full local offline suite: **70/70 passing** on 2026-10-27; `node tests/mobile_graph_contract.js`, `node --check demo/static/app.js`, and `git diff --check` also passed.
- Evaluation is exhaustive only over **16 combinations of invented observations** and **32 one-step transitions**. It proves the synthetic contract, not real diagnostic accuracy, user comprehension, accessibility certification, or Meta model quality.
- Meta's proposed fixture JSON contained a syntactic error and some overly categorical severity/independence claims. Recommendations were judged against the actual implementation, not installed automatically.
- Review gate remains: genuine 360px and 200% browser/reflow observation, Arabic screen-reader review, IP review, and explicit merge/deployment decision.
