# Ten-day sprint — October 26 to November 4, 2026

**Goal:** a reproducible, original, safe, visibly working *ECHKILI Evidence Lab* with credible use of a Meta AI model by final submission, ideally demonstrating hypotheses that change when evidence contradicts itself. Winning is a goal, not a promise.

## Judge-facing proposition

> Most AI assistants answer despite incomplete or contradictory observations. ECHKILI Evidence Lab forces evidence-to-hypothesis traceability, flags contradictions, and preserves human review instead of presenting polished certainty.

Theme candidate: **Build for Your World**. Track candidate: **Indie developer**, unless organizer confirms an unregistered founder can enter Startup. AI assistance does not count as another human participant. Verify official rules and exact event criteria before final submission.

| Date | Priority | Concrete deliverable | Acceptance evidence |
|---|---|---|---|
| Oct 26 — Day 1 | Scope and IP boundary | Public, isolated repository; runnable synthetic demo; baseline guardrails | Clean-room source review; offline tests pass |
| Oct 27 — Day 2 | Interaction | Show before-and-after evidence deltas and human-review state | Recorded scenario with/without a contradiction |
| Oct 28 — Day 3 | Reasoning reliability | Add test cases: contradictory, insufficient, duplicate, spurious evidence | Assertions for abstention, provenance and decision preservation |
| Oct 29 — Day 4 | Meta adapter | Confirm model IDs and required request/response fields; strict mock parsing | Mock transport tests, no live calls or secrets |
| Oct 30 — Day 5 | Evaluation | Create synthetic evaluation matrix with expected trace IDs and unsafe-output cases | Repeatable tests and baseline measurement |
| Oct 31 — Day 6 | Controlled Meta test | **Only if credit confirmed:** single, server-side Standard model call against a fictional case | Document actual provider, response behavior, approximate cost; otherwise keep blocked |
| Nov 1 — Day 7 | Robustness | Tighten unknown-input handling, user feedback and accessibility | Manual UI walkthrough and security regression tests |
| Nov 2 — Day 8 | Reproducibility | Package quickstart; evaluate safe shareable deployment and verify anonymous access | Fresh-clone run and public GitHub access |
| Nov 3 — Day 9 | Demo story | Record a real 3-minute walkthrough (not slides) showing the evidence update | Video can be viewed by the jury; all claims reproducible |
| Nov 4 — Day 10 | Submission | Verify track, eligibility, links, license/IP review, model usage, deadline | Official portal confirms submission before 9 PM US ET |

## Non-negotiable boundaries

- Main ECHKILI commercial code, manuals, internal documents, customer data, vehicle-identifying information, credentials, and proprietary fixtures **must not** enter this public repository.
- No claim of using Meta live until a recorded real provider call has happened.
- No real-world repair instructions, diagnosis certifications or automated safety clearance.
- Fail closed when the provider is unavailable, invalid, or gated off.
- Do not confuse a provider **usage alert** with a hard spending cap.
- No secrets in screenshots, videos, commit history, or browser bundles.

## Minimum measurable judging package

1. Working local prototype with one believable *fictional* vehicle-cabin issue.
2. Contradiction handling demonstrably changes both hypotheses and human-review status.
3. At least 20 synthetic automated tests plus manual UI checks by submission.
4. Clearly isolated actual Meta inference with strict evidence references, subject to credit verification.
5. Reproducible quickstart, 3-minute demo, dated changelog, public repository link.

## Contingencies

- Credits not active: continue fully offline and investigate an **official, authorized Meta AI** alternative; do not silently claim mock output as a Meta demonstration. Actual eligible Meta model use is essential for judging.
- Uncertain ownership/patent disclosure: narrow public demo, do not publish protected implementation.
- API outages: preserve verified deterministic baseline and disclose limitations.
