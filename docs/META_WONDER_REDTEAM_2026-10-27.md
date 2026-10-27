# Muse Wonder synthetic adversarial graph review — 2026-10-27

This note covers a **public, fictional** graph contract. It contains no ECHKILI private-repository implementation, real vehicle data, customer information, OEM content, private diagnosis, or physical repair instructions.

## Experiment

- Provider interface: Meta Model API Playground, Chat, **Muse Wonder 1.0**.
- One approved request, max output setting **4,000** tokens, reasoning **Low**, no search grounding.
- UI usage: **326 input**, **~1.3K output**, **~2.0K reasoning** tokens; wall time **16.0 s**. These are display-rounded figures, not a billing receipt.
- Model returned **10 parseable test objects**: 3 marked `VALID`, 4 `REJECT`, 3 `TRANSITION`.
- Original fictional test content is preserved in `evaluation/meta_wonder_redteam_2026-10-27.json` with formatting condensed.

## Independent contract review

| IDs | Assessment | Observable value |
| --- | --- | --- |
| `t02`, `t10` | Compatible | Two distinct selected citations activate provisional hypothesis; ordering does not alter semantic outcome. |
| `t03`, `t09` | Compatible; **caught a gap** | Contradictory evidence must withdraw only hypotheses citing affected evidence, while unrelated ones remain; state remains `HUMAN_REVIEW`. |
| `t04`–`t07` | Compatible rejection category | Reject unknown or unselected citations, duplicate selections, and duplicate support; exact error keywords are illustrative and differ from local Python `ValueError` messages. |
| `t01`, `t08` | **Requires adapter; not accepted as literal builder inputs** | The model supplied an under-supported candidate hypothesis yet expected `ABSTAIN`. The strict `build_graph` rejects such malformed candidates. At the reasoning layer, the right behavior is to omit the candidate, then abstain. Never relax the builder's validation to make these pass. |

The model supplied **test proposals**, not authoritative ground truth. Their classifications were reviewed manually against the public toy contract before selecting assertions. In particular `t01` is mislabeled as `VALID` for the strict builder boundary.

## Verified graph correction

The original `build_graph` validated corroboration and citations but emitted `SUPPORTS` edges for every valid-looking hypothesis **before** examining contradiction edges. This could leave a contradictory hypothesis visually active, even while the graph state already said `HUMAN_REVIEW`.

Two independent regression tests (`t03` and `t09`) were added and observed **failing** on that behavior. The builder now validates contradiction references first, identifies conflicted evidence, and omits the affected hypothesis nodes and supporting edges. It still emits the contradiction and `HUMAN_REVIEW` marker, and retains unrelated provisional hypotheses. Invalid candidate citations still raise `ValueError` even if the candidate would be withdrawn.

These tests exercise the **display-only synthetic graph**, not real automotive reasoning. The canonical private ECHKILI repository remains out of scope; the public demonstration must never be treated as a validated diagnostic product.

## Spend and next use

Illustrative pricing estimate based on rounded UI counts and contemporaneous Wonder rate ($4/M input and $20/M output/reasoning): approximately **$0.067**. This is a model-based estimate, **not confirmed billing**; verify the Meta Usage and Billing ledger later. No further provider request is authorized by this experiment.

Next valuable paid test: ask Wonder for a typed API-boundary review of these already-public synthetic fixtures, with explicit contradiction filtering, error classification, and metamorphic tests, or use the appropriate Meta image/segmentation model only with deliberately fabricated visual assets. Confirm a separate spend estimate before each provider call.
