"use strict";

const nodes = {
  caseTitle: document.getElementById("case-title"),
  caseDesc: document.getElementById("case-desc"),
  evidenceList: document.getElementById("evidence-list"),
  count: document.getElementById("selection-count"),
  analyze: document.getElementById("analyze-button"),
  results: document.getElementById("results"),
  mode: document.getElementById("result-mode"),
};
let scenario = null;
let busy = false;

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

function selectPreset(ids) {
  for (const input of nodes.evidenceList.querySelectorAll("input")) input.checked = ids.includes(input.value);
  refreshCount();
  nodes.analyze.focus();
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

function renderResult(data) {
  nodes.results.replaceChildren();
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

document.getElementById("preset-converging").addEventListener("click", () => selectPreset(["e1", "e2", "e3"]));
document.getElementById("preset-conflict").addEventListener("click", () => selectPreset(["e1", "e4"]));
nodes.analyze.addEventListener("click", runAnalysis);
init();
