# ECHKILI × Meta Global AI Developer Hackathon 2026

> **Status:** Public showcase initialized on October 26, 2026. A working hackathon demo and judging video are **not yet submitted**.

ECHKILI is an AI-assisted technical diagnostics project. For the Meta Global AI Developer Hackathon, the goal is to prototype a **new, evidence-grounded diagnostic interaction** that makes uncertainty visible, notices conflicting observations, and encourages safe human verification before a repair decision.

## Challenge

Technical troubleshooting is often reduced to a confident-sounding answer drawn from incomplete observations. Our hackathon exploration focuses on a better interface between **observations, competing hypotheses, verification, and user safety**.

## Hackathon work (October 26 – November 4, 2026)

We intend to demonstrate:

1. A synthetic repair scenario with explicit observations and traceable evidence IDs.
2. A Meta Model API-assisted reasoning step that cannot override the application's safety boundary.
3. Competing provisional hypotheses, contradictions, and clear follow-up checks.
4. A reproducible demonstration of what changed when new evidence was provided.

**Local demonstration implemented; remote Meta inference remains disabled until the account credits and key are verified.** Progress and scope are tracked in [the build log](docs/BUILD_LOG.md), the [10-day sprint plan](docs/TEN_DAY_SPRINT.md), and the [Meta API setup checklist](docs/META_SETUP.md).

## Run the synthetic prototype

Requires Python 3.10+ and no third-party packages. From the repository root:

```bash
python -m demo.server
```

Open `http://127.0.0.1:8765`. Use **Try supporting evidence** and **Try a contradiction** to show the difference. Run offline tests with `python -m unittest discover -s tests -v`. The server binds to loopback by default.

The `demo/meta_provider.py` integration uses **Muse Spark 1.3 Standard** only when independent environment gates are explicitly activated. It has not made a real API request; see [Meta setup](docs/META_SETUP.md).

## Project boundaries

- This is a separate, public **hackathon showcase**. The full ECHKILI product repository remains private.
- Only newly written, cleared-for-publication hackathon code and synthetic fixtures belong here.
- No customer records, private manuals, paid/proprietary datasets, credentials, internal source files, or protected assets.
- The demo is decision support, not a certified repair diagnosis or an instruction to perform unsafe work.
- Never put a Meta API key in a browser bundle. Any live API use must go through a server-side integration, with credit and spending safeguards verified first.
- We will disclose which features use an actual model and which are deterministic or mocked.

## Participation

- Event: [Meta Global AI Developer Hackathon](https://dev.meta.ai/events/global-hackathon)
- Venue and submission: [Cerebral Valley](https://cerebralvalley.ai/e/meta-ai-developer-hackathon)
- Suggested theme: **Build for Your World**; potentially **Push the Frontier** if the technical evidence supports that claim.
- Conservative proposed track: **Indie Developer**. The founder has not incorporated ECHKILI; the final submitted track must match organizer eligibility and the accepted application.
- Human entrant: an individual founder; coding assistance is not an additional official teammate.

## Submission

See [submission checklist](docs/SUBMISSION_CHECKLIST.md). Required judging materials include a public repository and a three-minute demo of work built during the event, submitted by the deadline.

## Licensing and safety

No license has been granted for the contents of this repository by default. Any third-party material must have suitable permissions before inclusion. We reserve the right to keep ECHKILI production internals private.
