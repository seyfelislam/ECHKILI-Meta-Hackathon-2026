# Muse Wonder 1.0 High — 360px evidence graph review

Date: 2026-10-27. Seventh Meta Playground experiment for the public, entirely
fictional ECHKILI Evidence Lab hackathon demo. The supplied prompt contained
only illustrative e1-e4, h1/h2 node IDs and three invented relationships. No
private algorithms, proprietary code, real evidence, customers, or vehicle data
were transmitted.

## Model request and review

- Model: `muse-wonder-1.0`, High reasoning, 8000 maximum tokens, temperature 0,
  no grounding or attachments. One paid Playground request.
- Playground reported 18.3 seconds, 539 input tokens, 1.3K visible output
  tokens and 2.0K reasoning tokens. The JSON response was complete and
  successfully parsed. See `evaluation/meta_wonder_seventh_mobile_raw_2026-10-27.json`.
- Asked to compare: A) desktop-style horizontal SVG scrolling at 360 CSS px
  versus B) mobile-first vertical relationship cards with SVG on desktop.
- Wonder recommended **B** for narrow layouts, noting its main drawback:
  the spatial overview is lost and card pages become taller. This proposal was
  independently reviewed; it is not proof of accessibility certification.

## Implemented, traceable subset

1. Keep desktop SVG and its source-cited relationship transcript intact.
2. At CSS widths of 700px or less, hide the wide SVG and present the **same
   already-rendered relationship transcript** as a single vertical card stack.
   No second graph construction algorithm, inferred links or Meta calls.
3. Each card is generated directly from a known graph edge and has stable
   source, relation and target attributes. SUPPORTS prose now includes both
   the cited evidence ID and the *target hypothesis ID plus label*.
4. The separate node list includes visibly marked withdrawn hypotheses; they
   never become relation cards or a link. Conflict cards have dashed non-color
   border styling and explicit localized conflict wording.
5. Arabic prose remains RTL while both evidence and hypothesis technical IDs
   use LTR Unicode isolates. The DOM's logical edge order remains unchanged.
6. Text wraps within fluid cards, rather than truncating long mobile labels.
   Graph legend, global human-review banner and fictional disclaimer remain.
7. Only edges with two existing graph endpoints contribute to cards **and**
   the spoken SVG edge count. Dangling input links are skipped and cannot
   suppress the no-relations message.

## Test evidence and honest limitations

- Test-driven mobile contract initially failed because no relation cards were
  generated; passed after implementation. A second red-green case caught an
  invalid endpoint hiding the no-relations summary.
- `tests/mobile_graph_contract.js` runs the real JS controller on invented
  inputs, checking e2→h2, e3→h2, e1↔e4; h1 withdrawal, Arabic Unicode
  isolation, zero evidence and dangling endpoint abstention.
- Full local Python/Node/HTTP suite: **62/62 tests pass**. Verify GitHub CI
  after uploading the branch.
- Pixel-level testing at 360px and at 200% browser text zoom, device
  screen-reader announcements, forced-colors mode, and quantitative contrast
  checks remain **unperformed**: this environment has no local Chromium binary.
  The 700px CSS breakpoint and wrap rules have been added but **not certified**
  for every device or locale.
- This is a demo of displaying uncertainty, not real vehicle diagnosis,
  repair guidance, a calibrated probability, or safety assurance.
