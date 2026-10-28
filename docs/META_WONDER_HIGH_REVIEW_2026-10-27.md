# Muse Wonder High: synthetic graph hardening review — 2026-10-27

This is a public, toy-contract exercise. The prompt and response contain **no private ECHKILI implementation, user information, real vehicle measurements, OEM specifications, secrets, diagnostic claims, or repair instructions**. Meta's free-credit terms may allow content use for product improvement; keep any later production inputs out of this workflow.

## Approved fourth model request

- Meta Model API Playground, model `muse-wonder-1.0`, reasoning **High**, temperature `0.2`, max tokens **8,000**, no search grounding.
- Response: **16 valid JSON cases** plus eight invariant proposals and five priority-fix suggestions. UI indicated **31.9 seconds**, **643 input**, **about 2.3K visible output** and **about 5.3K reasoning tokens**.
- Estimate at public standard Wonder rates ($4/M input, $20/M output) is roughly **$0.15–0.16**; usage counts are rounded and this is *not* a settled billing receipt. Expected request spend stays below the approved ~**$0.25** estimate.
- The complete model-generated JSON, before human edits, is stored as `evaluation/meta_wonder_high_raw_2026-10-27.json`. Treat it as untrusted candidate test data.

## Decision record: accept only independently checked semantics

| Cases | Decision | Reason |
| --- | --- | --- |
| `t01`, `t03`, `t04`, `t14` | Keep as positive adversarial examples | Overlapping conflicts, no-hypothesis escalation, unaffected supports, and withdrawal even with additional clean supports are consistent with the public contract. |
| `t05`, `t13` | Keep with transition-boundary note | Evidence removal is handled by **caller normalization** before strict builder invocation; changing order must preserve semantic edges/state, not serialized node order. |
| `t06`, `t16` | **Implemented guard** | Non-string and empty hypothesis identifiers previously created addressable nodes (`h:123` or `h:`) instead of rejecting. |
| `t02` | **Implemented new hardening** | Duplicate contradictions with reversed endpoints previously produced redundant edges. This uniqueness rule is an intentional *additional* public-demo guarantee, not a pre-existing requirement despite the model labeling it `CONTRACT_REQUIRED`. |
| `t10` | **Implemented guard** | A scalar in the evidence array previously leaked `TypeError`; the toy graph boundary now gives controlled `ValueError`. |
| `t08`, `t09`, `t11`, `t12`, `t15` | Existing rejection paths | Invalid pair/source, duplicate evidence or hypothesis, null citation, or unselected contradiction endpoint already reject at the applicable typed boundary. `t09` uses evidence objects directly despite the other cases using ID shorthand. |
| `t07` | **Declined pending ID-policy design** | `e1` and `E1` are distinct **case-sensitive** identifiers under the current contract. Changing this to case-insensitive deduplication would introduce a new normalization policy that the model cannot authorize. |

### TDD evidence

The following new `tests/test_graph.py` cases were run against the existing implementation and **failed for the expected behavior gap**, then were run again and passed after the smallest corresponding change:

- `test_wonder_high_t06_rejects_empty_hypothesis_id`
- `test_wonder_high_t16_rejects_numeric_hypothesis_id`
- `test_wonder_high_t02_rejects_reversed_duplicate_contradiction`
- `test_wonder_high_t10_rejects_scalar_evidence_with_value_error`

No model-generated numeric confidence scores, mechanical causes, or inferred edge relationships are accepted. The graph remains display-only; high-stakes interpretations require qualified humans.

## Future checks

- Define a separate, explicit identifier normalization policy before accepting mixed-case collisions.
- Validate complete nested input shapes at the API boundary if non-demo callers are ever added; these changes harden selected cases, not every possible malformed Python object.
- Keep a strict distinction between rejected malformed *builder* candidates and omitted/withdrawn *caller* hypotheses.
- Check future model outputs against the repository's tests and invariants before adopting them; model labeling (`CONTRACT_REQUIRED`) is not an authority on actual contracts.
