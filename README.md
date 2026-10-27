# ECHKILI Evidence Lab — Meta Hackathon 2026

An **offline-first, intentionally limited fictional vehicle-cabin diagnostics demo** for the Meta Global AI Developer Hackathon 2026.

> All observations, case identities, labels, and outcomes in this demo are fictional. This is **not** a validated diagnostic service. It does **not** suggest repairs, provide safety clearance, or diagnose real equipment.

## What it demonstrates

- Selecting simulated observations from distinct sources.
- Traceability: each proposed explanation links to the evidence that supports it.
- Explicit contradiction detection and cautious human review.
- A server-audited **before/after evidence trace** that explicitly names new evidence, newly surfaced conflicts, and withdrawn hypotheses.
- A **three-step judge demo** (initial observations → corroboration → conflicting report and human review), with no Meta requests.
- A visual, source-cited **evidence graph and analysis-result panel** sharing one language switch for **English, French, and Arabic**; Arabic copy uses RTL while technical IDs and changing numeric tokens stay LTR.
- An always-visible uncertainty indicator (illustrative, **not** calibrated).
- A separate, optional Meta Model API enrichment path that is **disabled by default**.

The demo contains no ECHKILI production algorithms, real customer information, unreleased commercial datasets, or private monorepo code. **The commercial ECHKILI platform remains separate and private.**

## Run locally

Requires Python 3.10+; no third-party packages.

```bash
python -m demo.server
```

Open **http://127.0.0.1:8765** on the same machine. The server refuses non-loopback addresses.

Try:

1. Click **Start guided demonstration** to run an auditable, three-step fictional story. Use **Next evidence step** twice, then **Replay** to restart.
2. Observe a tentative `h-flow` hypothesis; later add a new report that conflicts with `e1`. The previously surfaced `h-flow` explanation is **withdrawn**, uncertainty rises, and the system requires qualified review.
3. To explore manually, use **Try supporting evidence** or **Try a contradiction**, then click **Analyze selected evidence**.
4. Deselect everything to see the demo decline to infer a diagnosis.
5. After an analysis, scroll to the evidence graph and switch **Language · Langue · اللغة** to review the same fictional relations in three languages without another model call.

The guided comparison calls `/api/trace` and **never sends a Meta API request**. Manual `/api/analyze` also stays offline unless the explicit server-only opt-ins are enabled.

## Reproducible tests and evaluation

```bash
python -m unittest discover -s tests -v
python -m evaluation.benchmark
```

The benchmark exhausts all 16 subsets of the **four fictional** observations plus all **32 directed one-evidence additions**, checking provenance, conflict escalation, abstention, and stable human-review safeguards. These are software-contract checks; they do **not** measure diagnostic accuracy, model quality, or business impact. See [judging scorecard](docs/JUDGING_SCORECARD.md).

The additional [six-case synthetic graph pack](evaluation/meta_graph_fixtures.json) was generated during a **separate, manually authorized Meta Playground experiment** on 27 October 2026 and checked with nine offline tests. Its graph references and cautious presentation states are validated by [`evaluation/graph_fixtures.py`](evaluation/graph_fixtures.py); none of its observations should be mistaken for real measurements. See the [experiment log](docs/META_GRAPH_LIVE_TEST_2026-10-27.md).

The graph language pack came from a **Muse Spark 1.3** synthetic-copy experiment ([Spark review](docs/META_SPARK_GRAPH_I18N_2026-10-27.md)). The **results panel** uses the human-reviewed **Muse Wonder 1.0** three-language pack ([tenth review](docs/META_WONDER_RESULT_I18N_2026-10-27.md)), with LTR `<bdi>` elements for Arabic technical references. The **public demo landing copy, fictional scenario observations, guided story and fixture-specific result explanations** now use a separately reviewed Muse Wonder pack ([eleventh review](docs/META_WONDER_SITE_I18N_2026-10-27.md)) without changing evidence identifiers, graph topology, or safety decisions. A few fixed interface labels and raw graph-node labels remain English, and real Arabic screen-reader/360px/200% visual QA remains outstanding: this is **not** a claim of complete internationalization or accessibility certification.

No model calls are made during tests. Integration tests only use a local loopback HTTP server.

## Optional Meta Model API experiment — strictly off until activated

For an approved single synthetic case only, the server has a provisional Standard-model annotation adapter. Five independent settings must be present before any request can be attempted:

```text
ECHKILI_META_ENABLED=true
ECHKILI_META_CREDITS_CONFIRMED=true
ECHKILI_META_APPROVED_CASE=cabin-climate-01
ECHKILI_META_MAX_CALLS_PER_PROCESS=1
META_MODEL_API_KEY=<valid key; server-side only>
```

**Do not enable the adapter until** the correct API account, official endpoint/model availability, promo credits, billing guard, and any event-specific processing terms have been checked. The per-process call count is *not an account-wide spending limit*. There is no command in this repository that enables it automatically. No real data is accepted by the UI.

Untrusted model text is parsed as at most two **unverified remote notes** in a separate `metaAnnotations` result field. These notes must cite at least two distinct selected fictional IDs, but a citation is **not** verification. They are never canonical `hypotheses`, never graph nodes or edges, and cannot alter the human-review decision or the uncalibrated caution score. The client shows a separate, plainly labeled section only when a note was accepted. The API separately reports whether a request was attempted, a response completed, and a note was accepted. See the [ninth Meta adapter audit](docs/META_WONDER_ADAPTER_AUDIT_2026-10-27.md).

## Technical boundary

- Python standard-library HTTP server bound to loopback.
- Exact static route allowlist and input/body-size validation; `/api/trace` refuses arbitrary metadata and recomputes results from allowlisted identifiers.
- No external dependencies, cookies, storage, log analytics, or customer accounts.
- Content-Security-Policy, no-store, clickjacking protection.
- UI inserts text as text nodes rather than HTML.

## Ownership and publishing

Public visibility is **not** equivalent to waiving copyright. No open-source license is granted by this repository at present. Read the official hackathon submission terms separately: they contain broad, ongoing rights for organizers over submitted materials. Public GitHub forks and external copies may survive later visibility changes.

Commercial product and intellectual property remain with their respective rights holders. No broad open-source license is granted.

## Roadmap

- Verify the model-account credit and official terms before any live adapter call.
- Record a judge-friendly demonstration of contradictory evidence behavior.
- Publish this isolated demo *only after* a final IP boundary review.
- Continue the production platform's engineering exclusively in the separate private repository.

## Ten-day delivery and validation

See [the day-by-day sprint plan](docs/TEN_DAY_SPRINT.md), [Meta integration gates](docs/META_INTEGRATION.md), and the [build log](docs/BUILD_LOG.md). The public repository contains runnable offline demonstration code. The separately documented manual Playground experiment is **not** a live call made by this demo, proof of production integration, or evidence of diagnostic accuracy.
