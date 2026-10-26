# Meta Model API integration — exact safety and spending gates

The local `demo/meta_provider.py` adapter is **disabled by default**. No API key belongs in the repository or the browser. To prevent unintended payments, do not turn it on until the provider account shows the promotional credits in Billing, their expiration and grant eligibility, and the team approves the test scope.

## Official product choice

- Base URL: `https://api.meta.ai/v1`
- Chat Completions endpoint: `https://api.meta.ai/v1/chat/completions`
- Standard model: `muse-spark-1.3` (not `muse-spark-1.3-contributor`).
- This prototype is **not** powered by Meta when `metaCalled` is false. Local rules are explicitly labeled as illustrative.
- References: https://dev.meta.ai/docs/overview and https://dev.meta.ai/docs/quickstart

## What a real inference should add

Only low-authority, provisional explanations referencing evidence IDs that the local engine already selected. No change to safety, uncertainty, recommended action, or real-world verification guidance. Responses without valid citations are discarded. The model does not see production ECHKILI inputs.

## Five independent gates for a *single authorized synthetic case*

1. `ECHKILI_META_ENABLED=true`: explicit opt-in (off by default).
2. `ECHKILI_META_CREDITS_CONFIRMED=true`: set **only after** seeing activated credit in Billing.
3. `ECHKILI_META_APPROVED_CASE=cabin-climate-01`: exact synthetic fixture.
4. `ECHKILI_META_MAX_CALLS_PER_PROCESS=1`: guard for a single demonstration process, not a billing limit.
5. `META_MODEL_API_KEY`: server-side only; never commit, screenshot or transmit in chat.

Leave all of the above absent for normal development and tests.

## Budget proposal for up to $150 *if and only if* grant is active

| Phase | Maximum planning envelope |
|---|---:|
| Provider smoke test and schema verification | $10 |
| Controlled prompt/schema iterations | $35 |
| Synthetic quality and contradiction evaluation | $55 |
| Final recorded demonstration and reserve reruns | $20 |
| Reserved for unexpected needs | $30 |
| **Total planned** | **$150** |

These are planning allowances, **not** hard spending caps, and not confirmed credit balances. Record actual token counts and charges after each request. Disable the service between sessions; never expose a production-wide paid endpoint or assume one process-level counter limits a multi-worker deployment.

## Privacy and provenance

Only pre-reviewed, wholly invented observations may leave the local service. Standard mode is selected to avoid Contributor training terms. This is not an assertion of data sovereignty, legal compliance, or suitability for customer documents. Consult official current provider rules before changing scopes.
