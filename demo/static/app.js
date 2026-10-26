"use strict";

const nodes = {
  caseTitle: document.getElementById("case-title"),
  caseDesc: document.getElementById("case-desc"),
  evidenceList: document.getElementById("evidence-list"),
  count: document.getElementById("selection-count"),
  analyze: document.getElementById("analyze-button"),
  results: document.getElementById("results"),
  mode: document.getElementById("result-mode"),
  storyButton: document.getElementById("story-button"),
  storyProgress: document.getElementById("story-progress"),
};
const STORY = [
  {name: "Initial evidence", ids: ["e1", "e2"], aim: "First evidence-linked possibility"},
  {name: "New supporting record", ids: ["e1", "e2", "e3"], aim: "A second provisional explanation appears"},
  {name: "Conflicting report", ids: ["e1", "e2", "e3", "e4"], aim: "Withdraw the affected explanation; require review"},
];
let storyIndex = -1;
let scenario = null;
let busy = false;
let previousResult = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function selectedIds() {
  return [...nodes.evidenceList.querySelectorAll("input:checked")].map((input) => input.value);
}

function refreshCount() {
  const n = selectedIds().length;
  nodes.count.textContent = `${n} of ${scenario?.evidence.length ?? 0} observations selected · Fictional scenario only`;
  nodes.analyze.disabled = !scenario || busy;
  nodes.storyButton.disabled = !scenario || busy;
}

function createEvidence(item) {
  const label = element("label", "evidence-option");
  const check = element("input");
  check.type = "checkbox";
  check.value = item.id;
  check.name = "evidence";
  check.addEventListener("change", refreshCount);
  const body = element("span", "evidence-body");
  const top = element("span", "evidence-top");
  top.append(element("span", "evidence-id", item.id.toUpperCase()), element("span", "evidence-title", item.title));
  body.append(top, element("span", "evidence-detail", item.observation), element("span", "evidence-source", `SOURCE: ${item.source}`));
  label.append(check, body);
  return label;
}

function setSelection(ids) {
  for (const input of nodes.evidenceList.querySelectorAll("input")) input.checked = ids.includes(input.value);
  refreshCount();
}

function selectPreset(ids) {
  storyIndex = -1;
  updateStoryLabel();
  setSelection(ids);
  nodes.analyze.focus();
}

function updateStoryLabel() {
  if (storyIndex === -1) {
    nodes.storyProgress.textContent = "Ready: supporting evidence → corroboration → contradiction & human review";
    nodes.storyButton.firstChild.textContent = "Start guided demonstration ";
  } else {
    const active = STORY[storyIndex];
    nodes.storyProgress.textContent = `Step ${storyIndex + 1}/3: ${active.name} — ${active.aim}. Offline comparison; no Meta call.`;
    nodes.storyButton.firstChild.textContent = storyIndex === STORY.length - 1 ? "Replay guided demonstration " : "Next evidence step ";
  }
}

function block(label, children) {
  const section = element("section", "result-section");
  section.append(element("div", "result-label", label));
  for (const child of children) section.append(child);
  return section;
}

function finding(title, description, refs, warning = false) {
  const div = element("div", `finding${warning ? " warning" : ""}`);
  div.append(element("h4", "", title), element("p", "", description));
  if (refs?.length) div.append(element("div", "evidence-refs", `TRACE: ${refs.join(" · ")}`));
  return div;
}

function renderResult(data, comparison = null) {
  nodes.results.replaceChildren();
  if (previousResult) {
    const previousIds = new Set(previousResult.selectedEvidence.map((item) => item.id));
    const currentIds = new Set(data.selectedEvidence.map((item) => item.id));
    const added = [...currentIds].filter((id) => !previousIds.has(id));
    const removed = [...previousIds].filter((id) => !currentIds.has(id));
    const previousHypotheses = new Set(previousResult.hypotheses.map((hypothesis) => hypothesis.id));
    const currentHypotheses = new Set(data.hypotheses.map((hypothesis) => hypothesis.id));
    const appeared = [...currentHypotheses].filter((id) => !previousHypotheses.has(id));
    const disappeared = [...previousHypotheses].filter((id) => !currentHypotheses.has(id));
    const newConflicts = data.contradictions.length - previousResult.contradictions.length;
    if (added.length || removed.length || appeared.length || disappeared.length || newConflicts) {
      const backed = comparison && Array.isArray(comparison.addedEvidenceIds);
      const source = backed ? "SERVER-VERIFIED OFFLINE TRACE" : "LOCAL VIEW COMPARISON";
      const changed = finding(
        "What changed after new evidence?",
        `Added: ${added.join(", ") || "none"}. Removed: ${removed.join(", ") || "none"}. ` +
        `New explanations: ${appeared.length}; withdrawn explanations: ${disappeared.length}. ` +
        `Contradiction change: ${newConflicts > 0 ? "+" : ""}${newConflicts}. ` +
        `Illustrative uncertainty: ${Math.round(previousResult.uncertainty * 100)}% → ${Math.round(data.uncertainty * 100)}%. ` +
        `${source}.`,
        added,
        newConflicts > 0,
      );
      nodes.results.append(block("EVIDENCE UPDATE · SINCE LAST ANALYSIS", [changed]));
    }
  }
  previousResult = data;
  nodes.mode.textContent = data.inference.metaCalled ? "META ASSIST · PROVISIONAL" : "TRANSPARENT OFFLINE RULES";
  const number = element("div", "uncertainty-number", `${Math.round(data.uncertainty * 100)}%`);
  const meter = element("div", "meter");
  const fill = element("span", "meter-fill");
  fill.style.width = `${Math.round(data.uncertainty * 100)}%`;
  meter.append(fill);
  nodes.results.append(block("ESTIMATED UNCERTAINTY · ILLUSTRATIVE", [number, meter, element("p", "result-desc", "A design signal, not a calibrated scientific probability. Higher means less confidence in the available evidence.")]));

  const findings = data.hypotheses.length ? data.hypotheses.map((hypothesis) => finding(
    hypothesis.label, `${hypothesis.verificationGoal} · ${hypothesis.provenance} · Unverified.`, hypothesis.supportingEvidenceIds
  )) : [finding("Not enough consistent evidence", "The example abstains from producing a specific hypothesis. Select more observations or request human review.", [])];
  nodes.results.append(block("PROVISIONAL HYPOTHESES", findings));

  if (data.contradictions.length) {
    nodes.results.append(block("CONTRADICTIONS DETECTED", data.contradictions.map((conflict) => finding(
      "Conflicting observations", `${conflict.reason} ${conflict.nextStep}`, conflict.evidenceIds, true
    ))));
  }

  nodes.results.append(block("SAFETY & LIMITATIONS", [
    element("div", "safety-banner", data.recommendedAction === "TECHNICIAN_REVIEW" ? "Qualified human review is required before forming a conclusion." : "This exercise is informational only. A qualified expert must verify any real-world interpretation."),
    element("p", "result-desc", data.limitations.join(" ")),
  ]));
}

async function runAnalysis() {
  if (!scenario || busy) return;
  storyIndex = -1;
  updateStoryLabel();
  busy = true;
  refreshCount();
  nodes.analyze.querySelector("span").textContent = "Analyzing…";
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({caseId: scenario.id, evidenceIds: selectedIds()}),
    });
    if (!response.ok) throw new Error(`Analysis unavailable (${response.status})`);
    renderResult(await response.json());
  } catch (error) {
    nodes.results.replaceChildren(finding("Analysis unavailable", error.message, []));
    nodes.mode.textContent = "ERROR";
  } finally {
    busy = false;
    nodes.analyze.querySelector("span").textContent = "Analyze selected evidence";
    refreshCount();
  }
}

async function advanceStory() {
  if (!scenario || busy) return;
  const next = (storyIndex + 1) % STORY.length;
  // Each replay starts from no selected evidence, never from a previous manual run.
  const from = storyIndex === -1 || next === 0 ? [] : STORY[storyIndex].ids;
  const target = STORY[next];
  busy = true;
  setSelection(target.ids);
  try {
    const response = await fetch("/api/trace", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({caseId: scenario.id, beforeEvidenceIds: from, afterEvidenceIds: target.ids}),
    });
    if (!response.ok) throw new Error(`Guided trace unavailable (${response.status})`);
    const result = await response.json();
    // Never show a delta against a prior manual session as though it were the guided trace.
    if (next === 0) previousResult = result.before;
    renderResult(result.after, result.changes);
    storyIndex = next;
    updateStoryLabel();
    nodes.mode.textContent = "OFFLINE · AUDITABLE TRACE";
  } catch (error) {
    nodes.results.replaceChildren(finding("Guided trace unavailable", error.message, []));
    nodes.mode.textContent = "ERROR";
  } finally {
    busy = false;
    refreshCount();
  }
}

async function init() {
  try {
    const response = await fetch("/api/case");
    if (!response.ok) throw new Error("Scenario service unavailable");
    scenario = await response.json();
    nodes.caseTitle.textContent = scenario.title;
    nodes.caseDesc.textContent = scenario.description;
    for (const item of scenario.evidence) nodes.evidenceList.append(createEvidence(item));
    refreshCount();
  } catch (error) {
    nodes.caseTitle.textContent = "Could not load the fictional case";
    nodes.caseDesc.textContent = error.message;
    nodes.count.textContent = "Local server is required to run this demo.";
  }
}

nodes.storyButton.addEventListener("click", advanceStory);
document.getElementById("preset-converging").addEventListener("click", () => selectPreset(["e1", "e2", "e3"]));
document.getElementById("preset-conflict").addEventListener("click", () => selectPreset(["e1", "e4"]));
nodes.analyze.addEventListener("click", runAnalysis);
init();
