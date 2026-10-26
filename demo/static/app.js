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
let previousSelection = null;

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

function renderDelta(delta) {
  const details = [];
  if (delta.addedEvidenceIds.length) details.push(`Added evidence: ${delta.addedEvidenceIds.join(", ")}.`);
  if (delta.removedEvidenceIds.length) details.push(`Removed evidence: ${delta.removedEvidenceIds.join(", ")}.`);
  if (delta.introducedHypothesisIds.length) details.push(`New provisional hypotheses: ${delta.introducedHypothesisIds.join(", ")}.`);
  if (delta.retiredHypothesisIds.length) details.push(`No longer supported: ${delta.retiredHypothesisIds.join(", ")}.`);
  if (delta.newContradictions.length) details.push(`${delta.newContradictions.length} new contradiction(s) detected.`);
  if (delta.resolvedContradictions.length) details.push(`${delta.resolvedContradictions.length} contradiction(s) resolved.`);
  if (delta.actionChange) details.push(`Review decision changed to ${delta.actionChange[1].replaceAll("_", " ")}.`);
  const change = Math.round(delta.uncertaintyDelta * 100);
  details.push(`Illustrative uncertainty ${change > 0 ? "increased" : change < 0 ? "decreased" : "stayed unchanged"}${change !== 0 ? ` by ${Math.abs(change)} points` : ""}.`);
  nodes.results.prepend(block("EVIDENCE DELTA · PREVIOUS RUN", [
    finding("What changed after the new evidence?", details.join(" "), delta.addedEvidenceIds.concat(delta.removedEvidenceIds)),
  ]));
}

async function runAnalysis() {
  if (!scenario || busy) return;
  busy = true;
  refreshCount();
  const currentSelection = selectedIds();
  nodes.analyze.querySelector("span").textContent = "Analyzing…";
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({caseId: scenario.id, evidenceIds: currentSelection}),
    });
    if (!response.ok) throw new Error(`Analysis unavailable (${response.status})`);
    renderResult(await response.json());
    if (previousSelection !== null) {
      try {
        const comparison = await fetch("/api/compare", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({caseId: scenario.id, beforeIds: previousSelection, afterIds: currentSelection}),
        });
        if (comparison.ok) renderDelta(await comparison.json());
      } catch (_) {
        // The current analysis remains usable even if comparison fails.
      }
    }
    previousSelection = currentSelection;
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

async function loadEvaluation() {
  const grid = document.getElementById("evaluation-grid");
  try {
    const response = await fetch("/api/evaluation");
    if (!response.ok) return;
    const data = await response.json();
    const values = [
      [data.casesEvaluated, "Synthetic fixtures"],
      [data.unsupportedEvidenceReferences, "Unsupported source IDs"],
      [data.missedPlantedContradictions, "Missed planted conflicts"],
    ];
    for (const [value, label] of values) {
      const card = element("div", "metric-tile");
      card.append(element("span", "metric-value", String(value)), element("span", "metric-label", label));
      grid.append(card);
    }
  } catch (_) {
    grid.replaceChildren(element("p", "result-desc", "Offline fixture metrics unavailable."));
  }
}

document.getElementById("preset-converging").addEventListener("click", () => selectPreset(["e1", "e2", "e3"]));
document.getElementById("preset-conflict").addEventListener("click", () => selectPreset(["e1", "e4"]));
nodes.analyze.addEventListener("click", runAnalysis);
init();
loadEvaluation();
