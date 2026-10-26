# What we need from Meta — access and integration checklist

Official documentation: https://dev.meta.ai/docs/overview

## Required from the participant account

- [x] Confirm the hackathon application is **accepted**. Cerebral Valley's October 20, 2026 email explicitly reports status **APPROVED**; the exact registered track still needs checking in the entrant portal.
- [ ] Claim promotional credits using the organizer-provided October 26 email link **by November 4, 9:00 p.m. ET**. The claim must be made by the participant, not someone acting on their behalf.
- [ ] Open the Meta Model API dashboard: https://dev.meta.ai/ and verify the correct signed-in account.
- [ ] Confirm that the **$150 promotional credit** has actually appeared and its expiry/billing conditions.
- [ ] Read the participant's billing terms: the organizer email says a **credit card is required to make a Model API call** even after promo-credit approval. Adding a card is a founder-controlled payment decision, not an automated action.
- [ ] Confirm whether a pay-as-you-go fallback is enabled and set a safe account-level spending limit if the provider supports one. The event email mentions a **Spend Limit notification**; a notification alone is not a hard cap.
- [ ] Generate a Meta Model API key in the dashboard, **store it as a server secret only**; never send it via email, issue, chat, GitHub, or the browser.
- [ ] Confirm account availability for `muse-spark-1.3` in **Standard mode** (not the `-contributor` model).
- [ ] Make one **approved, low-cost** connectivity test and inspect usage; document the actual model ID/endpoint.
- [ ] Record account rate limits and any special contest credit terms.

## Models and what they contribute

| Meta capability | Role in the demo | Priority |
|---|---|---|
| `muse-spark-1.3` Standard via Meta Model API | Generate tentative evidence-bound hypotheses and verification questions | **Required for competitive real-Meta proof** |
| SAM 3.1 via Meta Model API | Optional segmentation of synthetic/licensed equipment imagery | Stretch only if core tests pass |
| Muse Code | Optional developer tooling for sprint speed | Not required in the product |
| Muse Image | Not needed for core reasoning; decorative generation is not a priority | Skip |

Meta officially documents `https://api.meta.ai/v1` as the API base URL; the Chat Completions quickstart uses `muse-spark-1.3`. Standard mode content is not used to train Meta's models; Contributor mode may be used for training, so the app will not choose Contributor automatically.

Sources: https://dev.meta.ai/docs/models, https://dev.meta.ai/docs/cookbook/quickstart-chat-completions, https://dev.meta.ai/docs/pricing-rate-limits

## Security and testing gates

1. Keep all browser requests on our own backend, never directly to Meta.
2. Only send the explicitly invented fixture for now. No customer documents, personal information, source code, private logs, or patent-sensitive prompts.
3. Require explicit feature enablement and proof of activated credits before a model request.
4. Record local attempts, duration, usage and limits **without saving API keys or user inputs in logs**.
5. Use strict schema and source-ID validation for model output. Reject invented IDs and instructions to bypass safety.
6. Timeout and fail closed to honest offline mode; do not falsely mark a request as successful.
7. Run offline unit/integration tests on every change and do a controlled live test only after activation.

## Exact questions still open

1. Application approval is confirmed; **which track was selected** in the application?
2. Has the Meta promo-credit balance actually appeared in the dashboard? What is its expiry?
3. Does the organizer require any particular Meta product or video/repo hosting format beyond the published rules?
4. Can the organizer confirm whether a founder without a registered company is eligible for the Startup track? Until then, prefer Indie.

**Never place a screenshot of private API credentials in public materials.**
