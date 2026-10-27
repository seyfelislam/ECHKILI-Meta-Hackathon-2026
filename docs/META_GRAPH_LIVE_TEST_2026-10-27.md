# Meta Playground — synthetic graph contract experiment

**Date:** 27 October 2026 · **Scope:** external, manually invoked test only

## What was actually run

- A person-authorized request was submitted through the Meta Model API **Chat Playground**.
- Model: `muse-spark-1.3`, Standard; reasoning effort `Low`, output token cap `2400`.
- Input: a wholly fictional prompt asking for exactly six evidence-graph regression fixtures for **ECHKILI Evidence Lab**, with evidence IDs, support/contradiction edges, abstention states, human-review states, and missing evidence.
- Result: six JSON fixtures, committed unchanged in substance to [`evaluation/meta_graph_fixtures.json`](../evaluation/meta_graph_fixtures.json).
- Playground displayed **5.7 seconds**, **187 input tokens**, approximately **1.1K output tokens**, and **828 reasoning tokens**. The usage display is not a confirmed billing charge.
- An earlier experimental request was incomplete after its reasoning exhausted a lower token limit; it produced no usable graph fixture.

This live call happened **outside** the demo. The repository's web server, benchmark, and tests still make **zero** Meta requests by default.

## Offline evaluation

`python -m unittest discover -s tests -v`

The six fixtures cover:

| State | Count | Meaning in this toy contract |
| --- | ---: | --- |
| `PROVISIONAL` | 2 | Multiple synthetic support links, no cited contradiction |
| `HUMAN_REVIEW` | 2 | Synthetic contradiction prevents an automatic claim |
| `ABSTAIN` | 2 | A single support link is insufficient to justify specificity |

The independent validator rejects out-of-pack evidence IDs, duplicate edge references, disallowed relationship types, duplicate fixture IDs, unsafe state downgrades, and unsupported provisional claims. Nine additional tests cover these invariants. Validating a JSON schema is **not** proof that the underlying hypothesis or cause is correct. Human experts must review any real diagnostic application.

## Explicit boundaries

- No private ECHKILI source, production calibration, customer or vehicle records, secrets, OEM data, or real repair instructions were sent.
- The promotional-credit billing UI indicated that content sent while using free credits **may be used for product improvement**. Keep private material away from this experiment path.
- This repository does not contain an API key and does not turn on provider calls.
- Meta account balances and charged amounts may be delayed in the usage dashboard. Do not infer exact cost or expiry from the displayed token counts.
- **Do not** combine the synthetic examples with private product datasets or claim validated automotive diagnoses.

## Engineering decision

Use model-generated output as **untrusted candidate test data**. Enforce traceability, contradiction escalation, and abstention **deterministically** at ECHKILI's boundary. Let graph UI highlight missing measurements and source IDs; never allow model output alone to reduce uncertainty or issue repair/safety clearance.
