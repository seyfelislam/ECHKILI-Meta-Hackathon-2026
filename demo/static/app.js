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
  graphPanel: document.getElementById("graph-panel"),
  graphCanvas: document.getElementById("graph-canvas"),
  graphLinks: document.getElementById("graph-links"),
  graphState: document.getElementById("graph-state"),
  graphJump: document.getElementById("graph-jump"),
  graphLocale: document.getElementById("graph-locale"),
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
let graphLocale = "en";
let lastGraphArgs = null;
const graphI18n = window.ECHKILI_GRAPH_I18N;

function graphCopy(key, values = {}) {
  return graphI18n.graphText(graphLocale, key, values);
}

function graphStateKey(state) {
  return state === "HUMAN_REVIEW" ? "statusHumanReview" :
    state === "PROVISIONAL" ? "statusProvisional" : "statusAbstain";
}

function setGraphLanguage(locale) {
  graphLocale = graphI18n.applyGraphLocale(document, locale);
  if (lastGraphArgs) drawGraph(lastGraphArgs.data, lastGraphArgs.earlier, lastGraphArgs.comparison);
}

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

const SVG_NS = "http://www.w3.org/2000/svg";

function svgElement(tag, attributes = {}, text = null) {
  const item = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) item.setAttribute(name, String(value));
  if (text !== null) item.textContent = text;
  return item;
}

function drawGraph(data, earlier, comparison) {
  const graph = data.graph;
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    lastGraphArgs = null;
    nodes.graphPanel.hidden = true;
    nodes.graphJump.hidden = true;
    return;
  }
  lastGraphArgs = {data, earlier, comparison};

  const activeIds = new Set(data.hypotheses.map((item) => item.id));
  const withdrawnIds = Array.isArray(comparison?.withdrawnHypothesisIds)
    ? comparison.withdrawnHypothesisIds
    : (earlier?.hypotheses || []).filter((item) => !activeIds.has(item.id)).map((item) => item.id);
  const ghosts = withdrawnIds.map((id) => earlier?.hypotheses.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({id: `withdrawn:${item.id}`, kind: "withdrawn", label: item.label}));

  const all = [...graph.nodes, ...ghosts];
  const evidence = all.filter((item) => item.kind === "evidence");
  const conclusions = all.filter((item) => item.kind !== "evidence");
  const height = Math.max(300, 88 + 70 * Math.max(evidence.length, conclusions.length));
  const position = new Map();
  const spread = (array, x) => array.forEach((item, index) => position.set(item.id, {
    x,
    y: Math.round(height * (index + 1) / (array.length + 1)),
  }));
  spread(evidence, 175);
  spread(conclusions, 638);
  // An edge must agree with both its node endpoints AND the cited evidence
  // IDs. Mismatched metadata could otherwise draw one pair but narrate a
  // different pair — a dangerous failure for an evidence-focused interface.
  const nodeById = new Map(all.map((item) => [item.id, item]));
  const visibleEdges = graph.edges.filter((edge) => {
    if (!edge || typeof edge !== "object") return false;
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target || !position.has(edge.source) || !position.has(edge.target)) return false;
    if (edge.relation === "SUPPORTS") {
      return source.kind === "evidence" && target.kind === "hypothesis" &&
        source.id === `e:${source.sourceId}` && edge.evidenceId === source.sourceId;
    }
    if (edge.relation === "CONTRADICTS") {
      if (source.kind !== "evidence" || target.kind !== "evidence" ||
          source.id !== `e:${source.sourceId}` || target.id !== `e:${target.sourceId}` ||
          !Array.isArray(edge.evidenceIds) || edge.evidenceIds.length !== 2) return false;
      return (edge.evidenceIds[0] === source.sourceId && edge.evidenceIds[1] === target.sourceId) ||
        (edge.evidenceIds[1] === source.sourceId && edge.evidenceIds[0] === target.sourceId);
    }
    return false;
  });

  const svg = svgElement("svg", {
    viewBox: `0 0 900 ${height}`,
    role: "img",
    direction: "ltr",
    "aria-labelledby": "evidence-graph-svg-title evidence-graph-svg-desc",
  });
  svg.append(svgElement("title", {id: "evidence-graph-svg-title"}, graphCopy("svgTitle")));
  svg.append(svgElement("desc", {id: "evidence-graph-svg-desc"},
    graphCopy("svgDescription", {count: all.length, edges: visibleEdges.length, state: graphCopy(graphStateKey(graph.state))})));

  const labels = new Map(all.map((item) => [item.id, item.label]));
  nodes.graphLinks.replaceChildren();
  // The transcript contains every node as well as every edge, even when the
  // diagram is off-screen, zoomed, or horizontally scrolled on a small phone.
  for (const item of all) {
    const ref = item.kind === "evidence" ? item.sourceId : item.id.replace(/^(h:|withdrawn:)/, "");
    const printedRef = graphLocale === "ar" ? `\u2066${ref}\u2069` : ref;
    const nodeLine = item.kind === "withdrawn"
      ? graphCopy("ghostWithdrawn", {label: `${printedRef} — ${item.label}`})
      : `${graphCopy(item.kind === "evidence" ? "legendObservation" :
        item.kind === "hypothesis" ? "legendHypothesis" : "statusHumanReview")}: ${printedRef} — ${item.label}`;
    nodes.graphLinks.append(element("li", `graph-transcript-node${item.kind === "withdrawn" ? " graph-transcript-withdrawn" : ""}`, nodeLine));
  }
  for (const edge of visibleEdges) {
    const source = position.get(edge.source);
    const target = position.get(edge.target);
    if (!source || !target) continue; // Never draw a fabricated endpoint.
    const conflict = edge.relation === "CONTRADICTS";
    const d = conflict
      ? `M ${source.x - 123} ${source.y} C 18 ${source.y}, 18 ${target.y}, ${target.x - 123} ${target.y}`
      : `M ${source.x + 123} ${source.y} C 400 ${source.y}, 425 ${target.y}, ${target.x - 141} ${target.y}`;
    svg.append(svgElement("path", {
      d, fill: "none", stroke: conflict ? "#f7b8a6" : "#56dccf",
      "stroke-width": conflict ? 3.5 : 2.4,
      "stroke-dasharray": conflict ? "7 6" : "none",
      opacity: conflict ? "1" : ".74",
    }));
    if (conflict) {
      for (const endpoint of [
        {x: source.x - 123, y: source.y},
        {x: target.x - 123, y: target.y},
      ]) {
        svg.append(svgElement("circle", {
          cx: endpoint.x, cy: endpoint.y, r: 4.2,
          fill: "#0d172b", stroke: "#f7b8a6", "stroke-width": 2.5,
          "data-relation": "CONTRADICTS", "aria-hidden": "true",
        }));
      }
    }
    const ref = edge.evidenceId || (edge.evidenceIds || []).join(" + ");
    const targetRef = edge.target.replace(/^[eh]:/, "");
    const visibleTarget = graphLocale === "ar" ? `\u2066${targetRef}\u2069` : targetRef;
    const sentence = conflict
      ? graphCopy("edgeConflict", {ref})
      : graphCopy("edgeSupports", {ref, label: `${visibleTarget} — ${labels.get(edge.target)}`});
    // The mobile relation card and desktop SVG share the SAME validated edge.
    const card = element("li", `graph-relation-card ${conflict ? "relation-conflict" : "relation-support"}`, sentence);
    card.setAttribute("data-source", edge.source);
    card.setAttribute("data-relation", edge.relation);
    card.setAttribute("data-target", edge.target);
    nodes.graphLinks.append(card);
  }

  for (const item of all) {
    const {x, y} = position.get(item.id);
    const isEvidence = item.kind === "evidence";
    const width = isEvidence ? 246 : 282;
    const palette = {
      evidence: ["#1e2444", "#a992ff"],
      hypothesis: ["#112d36", "#56dccf"],
      review: ["#402726", "#f7b8a6"],
      withdrawn: ["#2f2530", "#f7b8a6"],
    }[item.kind];
    const group = svgElement("g");
    group.append(svgElement("rect", {
      x: x - width / 2, y: y - 31, width, height: 62, rx: 11,
      fill: palette[0], stroke: palette[1],
      "stroke-width": item.kind === "review" ? 2.4 : 1.4,
      "stroke-dasharray": item.kind === "withdrawn" ? "6 5" : "none",
    }));
    const kicker = item.kind === "evidence" ? item.sourceId.toUpperCase() :
      item.kind === "hypothesis" ? graphCopy("legendHypothesis") :
      item.kind === "withdrawn" ? graphCopy("ghostWithdrawn", {label: item.id.replace("withdrawn:", "")}) :
      graphCopy("statusHumanReview");
    group.append(svgElement("text", {x: x - width / 2 + 14, y: y - 11, fill: palette[1],
      "font-size": 10, "font-weight": 750, "letter-spacing": .8},
    kicker.length > 32 ? `${kicker.slice(0, 31)}…` : kicker));
    const label = String(item.label || item.id);
    const limit = isEvidence ? 29 : 35;
    group.append(svgElement("text", {x: x - width / 2 + 14, y: y + 12, fill: "#f3f5ff", "font-size": 12.5},
      label.length > limit ? `${label.slice(0, limit - 1)}…` : label));
    svg.append(group);
  }

  if (!visibleEdges.length) nodes.graphLinks.append(element("li", "", graphCopy("noEdges")));
  nodes.graphCanvas.replaceChildren(svg);
  nodes.graphState.textContent = graphCopy(graphStateKey(graph.state));
  nodes.graphState.className = `graph-state ${graph.state.toLowerCase()}`;
  nodes.graphPanel.hidden = false;
  nodes.graphJump.hidden = false;
}

function renderResult(data, comparison = null) {
  const earlier = previousResult;
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
  drawGraph(data, earlier, comparison);
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
nodes.graphLocale.addEventListener("change", () => setGraphLanguage(nodes.graphLocale.value));
setGraphLanguage(nodes.graphLocale.value);
document.getElementById("preset-converging").addEventListener("click", () => selectPreset(["e1", "e2", "e3"]));
document.getElementById("preset-conflict").addEventListener("click", () => selectPreset(["e1", "e4"]));
nodes.analyze.addEventListener("click", runAnalysis);
init();
