# ECHKILI Evidence Lab — Visual Graph sprint
**27 October – 4 November 2026** · Public demo roadmap · **No live Meta usage is authorized by this plan**

## North star

Demonstrate a defensible *evidence-aware visual diagnostics workflow*, not an auto-repair chatbot:
a fictional user adds one observation, sees a provisional graph hypothesis; adds supporting evidence;
then adds a contradiction and sees the hypothesis withdrawn with the explanation and human-review state.
Every visible claim must point to a known fictional evidence ID.

All work here is separate from the proprietary ECHKILI production repository.
This roadmap is a set of acceptance targets, **not claims of implemented capabilities**.

## Gate zero — legal and spending boundaries

- Meta's [Model API age requirement](https://dev.meta.ai/help/accounts-and-login/age-requirement): account access requires age **18+**. The [terms](https://dev.meta.ai/legal/terms-of-service) also require end users of integrated products to be at least 18. Do not activate or call Model API until these requirements and any hackathon eligibility requirements are satisfied.
- A screenshot/banner advertising "$150 free credits" does **not** independently establish that the *hackathon promotional grant* is actually applied in the Billing **Free credits** section, or that it is available to a particular entrant. The official claim form warns that charges may apply before credit is applied.
- A **Spend Limit** notification is **not a hard usage cap**, according to [Meta's help center](https://dev.meta.ai/help/billing/spend-limit-alert).
- Consequently: **offline only for now**. No API tokens, keys, credit-card workflows, age-limit workarounds, real repair data, or claims of live provider inference.
- Any eventual compliant Meta activity is a separate authorization and verification decision. Unspent credits are better than unplanned fees or violation of provider terms.
- Check the official event rules, publication/IP license, entrant eligibility, and deadline independently before submitting.

## Judge-facing product priorities

| Priority | Feature | What the judge sees | Minimum proof |
| --- | --- | --- | --- |
| P0 | Auditable evidence graph | Complaint, evidence, hypothesis and conflict edges change across the three-step journey | Every link validated against selected evidence; before/after diff |
| P0 | Transparent abstention | Conflicting or insufficient observations remove unjustified specificity | Contradiction and empty-input regression tests |
| P0 | Reproducible standalone demo | Runs from a clean checkout with no secrets | Offline CI, run instructions, short recording |
| P1 | Broader synthetic case portfolio | Multiple invented vehicle-system stories, not just one cabin-climate fixture | 20+ cases; held-out tests; no actual diagnosis claims |
| P1 | User-facing explanation | A newcomer can identify why a conclusion changed | Small consented usability comparison, report actual results |
| P2 | Provider adapters (mock only) | Visible separation between deterministic baseline and possible model annotation | Strict schema, known evidence IDs, fail-closed mock tests |
| P3 | Optional illustrative assets | Clear diagrams and fictional component illustrations | Asset rights and labeling audit; never claim engineering accuracy |

## Daily execution and acceptance gates (Algeria local date)

| Date | Deliverable | Acceptance condition |
| --- | --- | --- |
| **Oct 26** | Baseline already implemented | Public offline code, trace and tests remain verifiable |
| **Oct 27** | Finalize graph contract and sample storyboard | Schema for nodes/edges/status; exactly reproducible three-stage script |
| **Oct 28** | Visual Diagnostic Graph v1 | Clickable or selectable graph; hypothesis withdrawal visibly highlighted; accessible text equivalent |
| **Oct 29** | Evidence provenance & contradictions | Every graph edge points to allowed synthetic IDs; invalid or contradictory input never invents a source |
| **Oct 30** | Synthetic scenario suite | At least 20 independently authored fictional tests spanning insufficiency, support, conflict, and noisy input |
| **Oct 31** | Compare graph vs opaque-answer UX | Measure task success/interpretation with appropriate, consented volunteers; publish only aggregate observations |
| **Nov 1** | Mocked model boundary & failure testing | Malformed output, unknown citations and timeouts fail closed; no live calls |
| **Nov 2** | Mobile and keyboard usability | Fresh-run desktop/mobile checks; offline demo remains usable without deployment or account |
| **Nov 3** | Script, captures, rights review | 3-minute recording outline; no claims of real-model execution or clinical/automotive validity |
| **Nov 4** | Freeze, audit, submission decision | Public source audit; reproducible tests; eligibility and submission terms verified by human entrant before any portal action |

## Acceptance metrics, not marketing claims

- **Traceability:** 100% of rendered hypothesis/support/contradiction edges refer to known synthetic IDs.
- **Safety:** 0 cases where a conflict downgrades the need for qualified review; 0 invented safety clearance or repair instructions.
- **Abstention:** 100% of empty/unsupported fixtures produce an explicitly insufficient-evidence state.
- **Transitions:** Preserve the existing 32/32 directed one-observation transition invariants as changes are added.
- **Reproducibility:** Unit tests and offline CI must pass on each reviewed change.
- **Evidence portfolio:** 20+ synthetic fixtures, with a separate split for changed tests when practical.
- **Usability:** Report observed counts and limitations, not unsupported percentages.
- **API attribution:** Visible `metaCalled=false` for all offline flows; a mock never counts as evidence of Meta use.

## Architecture

`synthetic observations → deterministic validation → graph state + provenance → graph diff → accessible UI`

A future authorized inference adapter, if ever applicable, can supply **candidate annotations only**.
It must never silently change safety state, invent provenance, write private ECHKILI production data,
or be described as live unless logs establish an actual permitted call.

## Three-minute demonstration storyboard

1. **0:00–0:25 — Problem**: opaque answers hide uncertainty.
2. **0:25–1:00 — Initial signal**: reveal the fictional complaint/evidence graph.
3. **1:00–1:35 — Corroboration**: show support relationship and source ID.
4. **1:35–2:15 — Contradiction**: newly added record conflicts; withdraw provisional hypothesis; human review highlighted.
5. **2:15–2:40 — Verification**: run repeatable offline tests and show trace.
6. **2:40–3:00 — Limits & vision**: distinguish the mocked/offline demonstration from any future Meta-powered experience; no unverified claims.

## Stop / proceed rules

- **Stop publication** if private production files, secrets, identifiable vehicle/customer data, license-incompatible assets, or unreviewed invention disclosures appear.
- **Stop provider work** if age eligibility, billing credits, or conditions remain unclear.
- **Proceed** with synthetic examples, the standalone graph UI, tests, proof-of-work commits, and honest demonstrations.
