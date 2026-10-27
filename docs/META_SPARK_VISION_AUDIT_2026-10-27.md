# Muse Spark 1.3 visual review — fictional ECHKILI graph

Date: 2026-10-27. Scope: PUBLIC synthetic hackathon demo ONLY. All graph labels,
IDs, links, and hypotheses in the submitted 900×620 PNG were invented. No
production ECHKILI code, private evidence, customer information or vehicle data
was transmitted to Meta.

## Request and fidelity

- Model: `muse-spark-1.3` (Standard), reasoning **High**, max **6000** tokens,
  temperature **0.2**, search grounding off, single synthetic PNG attached.
- Playground reported **29.4 seconds**, **1.1K input tokens**, **2.6K visible
  output tokens**, **3.4K reasoning tokens**. One paid request only.
- The model stopped with **"Response incomplete — max output tokens reached"**.
  Output is **not valid JSON** (also contains an early malformed identifier);
  it must not be parsed or automatically incorporated as machine-authored truth.
  The unmodified UI response is archived as a `.txt` audit fixture.
- Concrete visual evidence in the PNG: two solid teal arrows from fictional
  e2/e3 toward h2; a peach dashed arc apparently joining e1/e4 with unclear
  anchors; h1 labeled withdrawn; human-review state. Some crossing/association
  ambiguity is real in this deliberately flawed teaching diagram.

## Validated proposals incorporated into the real demo

1. **Traceable conflict anchors:** the live graph's dashed `CONTRADICTS` path
   already routes outside the evidence boxes. Added visible endpoint circles
   without changing its actual edge data or constructing fabricated endpoints.
2. **Not color alone:** conflict legend uses a dashed diamond-outline cue;
   withdrawn ghost now carries an explicit localized withdrawn label in SVG,
   while retaining a different border style. Existing legend/transcript remain.
3. **Text equivalence:** visible transcript now names *all* rendered nodes,
   including withdrawn hypotheses, along with supported/conflicting edges;
   conflict copy explicitly introduces the two referenced evidence IDs.
4. **Small viewport/keyboard:** SVG remains horizontally pannable rather than
   shrinking 900 coordinate units to illegible 360px text. The scroll container
   is a keyboard-focusable labeled region with a clear focus outline; the text
   transcript does not require horizontal scrolling.
5. **Bidi handling:** SVG geometry stays left-to-right regardless of locale,
   while explanatory text follows its localized direction. Arabic transcript
   node IDs and existing edge `ref` placeholders use Unicode LTR isolates.

## Suggestions deliberately not applied

- **No false WCAG failure claim.** Spark flagged contrast but did not measure
  contrast ratios. Before stating WCAG compliance or failure, measure every
  actual foreground/background pair and check rendered results.
- **No blanket mirroring of technical graph layout.** Directionality of
  evidence-to-hypothesis relations must be consistent in all languages; only
  prose direction changes. Directionality is explained in the transcript.
- **No forced 360px stacked re-layout.** Automatic re-routing is a larger
  design project and could misrepresent links. Intentional panning plus a
  full-width textual equivalent is safer at this stage.
- **No invented conflict links.** The test fixture explicitly contains an
  e1/e3 contradiction. The artificial PNG illustrates e1/e4. Neither may be
  silently copied into production input.

## Verification and limits

- Test-driven proof: both new graph-vision contracts initially failed; both
  passed after implementation. Node VM runs the real rendering controller
  against a synthetic graph and checks visual anchor elements, transcript
  parity, withdrawn labeling, and Arabic technical references.
- Full local offline suite: **61 tests pass** on 2026-10-27 when local socket
  permission is granted to the HTTP route tests. Also check remote GitHub CI.
- Browser screenshot/pixel-level inspection of the *updated real demo* was not
  performed here (a local headless Chromium runtime was unavailable).
- The synthetic image assessment is a design review, not safety engineering,
  real-world diagnosis, calibration, or accessibility certification.
