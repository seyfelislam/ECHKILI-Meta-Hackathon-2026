# Eleventh Meta review — finish priority public-demo translations

27 October 2026. The user approved **one** paid Muse Wonder 1.0 experiment (High, 8,000-token cap, temperature 0, top-p 1, no search grounding), using invented public `e1`–`e4` observations and fabricated teaching labels only. The model displayed ~29.3 seconds, input ~1.4K, output ~3.1K, reasoning ~3.5K tokens; these are UI-reported, not independently billed figures.

The full response is preserved as [`evaluation/meta_wonder_site_run11_raw_2026-10-27.json`](../evaluation/meta_wonder_site_run11_raw_2026-10-27.json). It was valid JSON, containing **32 French and 32 Arabic static UI keys**, nine fictional fixture objects per locale, eight invariants, six suggested RTL/accessibility checks and 12 proposed offline tests. These model-suggested tests were not all individually executed; the implemented contracts are specified below.

## Fast, bounded implementation

- `site-i18n.js` stores the English originals plus reviewed French and Arabic display text. A single existing locale selector refreshes translated leaves in the static landing page, the three-step guided story, an illustrative selection count, and fake source cards; the canonical evidence IDs and underlying Python fixture do **not** change.
- A language toggle rebuilds only the displayed observation cards **while preserving the selected input IDs**, then re-renders the last successful results using the original previous-evidence comparison. It neither calls Meta nor requests another offline analysis.
- The two fictional hypothesis display labels and their verification goals, as well as contradiction explanations, receive localized **presentation copy**; the canonical graph, hypothesis arrays, safety action and uncertainty value still come from the unchanged deterministic Python rules.
- We manually softened two descriptions: the French and Arabic case introductions said "diagnostic discussion"; the displayed versions say analysis discussion instead. No output claims a verified cause, repair recommendation, or real-world decision.
- The module's keys, placeholder-preservation and Unicode-control exclusions are exercised using real Node evaluation. The fake-DOM controller test verifies Arabic card labels, preserved checkbox selection and localized story state. The HTTP test verifies the extra static script route. Test changes were introduced and observed failing before implementation.

## Review boundary

This is the **last planned dedicated translation experiment**. Further Meta use should focus on architecture, algorithm validation, efficient reasoning, visual design and robustness instead of additional translation rounds.

Remaining issues: some graph-rendered fixture label text, static annotations and accessibility details are still English; a production localization system would also require professional linguistic review, real 360px/200% responsive testing, screen-reader and keyboard evaluation. No real vehicle cases, production software or protected/private ECHKILI repository were altered. Changes remain in a public fictional demo's draft pull request.
