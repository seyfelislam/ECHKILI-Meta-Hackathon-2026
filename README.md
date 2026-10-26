# ECHKILI Evidence Lab — Meta Hackathon 2026

An **offline-first, intentionally limited fictional vehicle-cabin diagnostics demo** for the Meta Global AI Developer Hackathon 2026.

> All observations, case identities, labels, and outcomes in this demo are fictional. This is **not** a validated diagnostic service. It does **not** suggest repairs, provide safety clearance, or diagnose real equipment.

## What it demonstrates

- Selecting simulated observations from distinct sources.
- Traceability: each proposed explanation links to the evidence that supports it.
- Explicit contradiction detection and cautious human review.
- A visible **before/after evidence update** when the selected records change between analyses.
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

1. **Try supporting evidence** to see tentative, referenced explanations.
2. **Try a contradiction** to see incompatible observations and mandatory human review.
3. Switch between the two presets and analyze again to see the evidence-delta trace.
4. Deselect everything to see the demo decline to infer a diagnosis.

## Reproducible tests and evaluation

```bash
python -m unittest discover -s tests -v
python -m evaluation.benchmark
```

The benchmark exhausts all 16 subsets of the **four fictional** observations and checks provenance, conflict escalation, and abstention. These are software-contract checks; they do **not** measure diagnostic accuracy, model quality, or business impact. See [judging scorecard](docs/JUDGING_SCORECARD.md).

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

Untrusted model text is accepted only as a small number of provisional labels referencing known evidence IDs. Model output cannot lower uncertainty, change the human-review decision, or recommend physical procedures.

## Technical boundary

- Python standard-library HTTP server bound to loopback.
- Exact static route allowlist and input/body-size validation.
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

See [the day-by-day sprint plan](docs/TEN_DAY_SPRINT.md), [Meta integration gates](docs/META_INTEGRATION.md), and the [build log](docs/BUILD_LOG.md). The public repository contains runnable demonstration code. It does not assert that a real Meta API call has happened or that a grant is activated.
