# Judge-facing scorecard — ECHKILI Evidence Lab

**Status 2026-10-26: technical prototype only; no real Meta inference yet.**

The four percentages below are described in the event waiver and reported in third-party breakdowns. Verify the final official rules before submission. Sources: [event](https://events.cerebralvalley.ai/e/meta-ai-developer-hackathon) and [waiver](https://cerebralvalley.ai/e/meta-ai-developer-hackathon/waiver).

| Evaluation dimension | Weight | What a reviewer should *see* | Verifiable proof | Current gap |
| --- | ---: | --- | --- | --- |
| **Impact** | **30%** | A specific technician can compare conflicting records without an AI inventing certainty | Concrete user story, time-on-task study with volunteers, caveats, before/after workflow | No user study or quantitative business impact proven |
| **Meta AI tooling** | **25%** | A real Meta model suggests tentative, source-linked labels that cannot bypass the safety rules | Provider indicator, recorded legitimate Standard API inference, mock-vs-live separation, measured failure rate | Credits/model access not confirmed; **no live call** |
| **Demo** | **25%** | Three-minute real workflow: select evidence → inspect hypothesis → add contradiction → see revision + review warning | Runnable public demo, reproducible video, fresh-session verification | Public deployment and 3-min video not completed |
| **Technical depth** | **20%** | Validation of model outputs, traceability, fail-closed behavior, no secrets, repeatable tests | Source, offline CI, exhaustive fixture test, boundary review | Broader synthetic cases and real-model evaluation pending |

## Quality gates (targets, not independently validated product claims)

**Gate A — deterministic behavior** (ready for repeatable demonstration):
- All 16 evidence subsets must preserve valid provenance and safe human-review decisions.
- All 32 one-observation additions must correctly audit changes, preserve existing human-review escalation, and never generate a model request.
- Every hypothesis must point to an actually selected evidence ID.
- Selecting contradictory `e1` and `e4` must produce a conflict and `TECHNICIAN_REVIEW`.
- No selected evidence should yield no specific diagnosis.
- Unexpected API output must never weaken the deterministic decision or uncertainty.

**Gate B — Meta integration** (not satisfied):
- Verify the grant's appearance in Billing, any minimum-age/account constraints, and the exact eligible model and endpoint.
- Make a **single approved**, server-side Standard-model request against the *invented* fixture; disclose usage/cost without publishing keys.
- Collect at least 20 invented prompts, including contradictions and insufficient input, for real-vs-mock evaluation.
- Target zero invented evidence IDs, zero safety overrides, and at least 90% schema-valid responses across that *synthetic* collection. These are development targets, not verified results.

**Gate C — user-facing impact** (not satisfied):
- With appropriate participation/consent, observe three volunteers using the fictional workflow, comparing an opaque answer to evidence-linked reasoning.
- Record task completion, comprehension of conflicts, and errors with no real car repairs or personal data.
- Do not claim time savings, safety improvement, or automotive diagnostic accuracy without supporting results.

**Gate D — submission** (not satisfied):
- Public repo is runnable from scratch without secrets; UI tested manually on mobile and desktop.
- Real 3-minute unedited flow or clearly disclosed editing; claims match code and provider logs.
- Review official eligibility (including minimum age), submission license, right to publish, and final deadlines.

## Current measured data

`python -m evaluation.benchmark` exhaustively runs 16 synthetic input combinations and 32 directed single-evidence transitions. Its metrics are **software-contract checks only**, not predictive performance. Run `python -m unittest discover -s tests -v` for the independent unit/integration suite.

## Avoid overclaiming

- The local hypothesis rules are deliberately illustrative, not a trained model or the private ECHKILI engine.
- A clean mock test **does not** qualify as proof of using Meta AI in a live demo.
- Numerical uncertainty is a UI illustration and is **not calibrated**.
- The initial prototype does not establish competition eligibility or guarantee prizes.
