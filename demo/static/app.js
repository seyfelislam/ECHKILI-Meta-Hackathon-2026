"use strict";

const nodes = {
  caseTitle: document.getElementById("case-title"),
  caseDesc: document.getElementById("case-desc"),
  evidenceList: document.getElementById("evidence-list"),
  count: document.getElementById("selection-count"),
  analyze: document.getElementById("analyze-button"),
  results: document.getElementById("results"),
  resultsTitle: document.getElementById("results-title"),
  emptyTitle: document.getElementById("empty-state-title"),
  emptyDescription: document.getElementById("empty-state-description"),
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
let lastResultArgs = null;
let resultViewState = "waiting";
const graphI18n = window.ECHKILI_GRAPH_I18N;
const resultI18n = window.ECHKILI_RESULT_I18N;
const siteI18n = window.ECHKILI_SITE_I18N;

function siteCopy(key, values = {}) {
  return siteI18n.siteText(graphLocale, key, values);
}

function graphCopy(key, values = {}) {
  return graphI18n.graphText(graphLocale, key, values);
}

function graphStateKey(state) {
  return state === "HUMAN_REVIEW" ? "statusHumanReview" :
    state === "PROVISIONAL" ? "statusProvisional" : "statusAbstain";
}

function resultCopy(key) {
  return resultI18n.resultText(graphLocale, key);
}

// Safe placeholder fragments: Arabic IDs and numbers receive actual BDI
// elements instead of embedding invisible direction controls into copy.
function resultPhrase(key, values = {}) {
  const container = element("span");
  const template = resultCopy(key);
  const slots = /\{(ids|count|delta|before|after)\}/g;
  let index = 0;
  for (const match of template.matchAll(slots)) {
    if (match.index > index) container.append(element("span", "", template.slice(index, match.index)));
    const name = match[1];
    const raw = values[name];
    const entries = name === "ids" && Array.isArray(raw) ? [...raw] : [raw];
    if (!entries.length) entries.push("—");
    entries.forEach((value, offset) => {
      if (offset) container.append(element("span", "", " · "));
      const text = value === undefined || value === null ? "—" : String(value);
      const item = element(graphLocale === "ar" ? "bdi" : "span", "", text);
      if (graphLocale === "ar") item.setAttribute("dir", "ltr");
      container.append(item);
    });
    index = match.index + match[0].length;
  }
  if (index < template.length) container.append(element("span", "", template.slice(index)));
  return container;
}

function setGraphLanguage(locale) {
  graphLocale = graphI18n.applyGraphLocale(document, locale);
  siteI18n.applySiteStaticCopy(document, graphLocale);
  if (scenario) {
    nodes.caseTitle.textContent = siteI18n.fixtureText(graphLocale, "caseTitle");
    nodes.caseDesc.textContent = siteI18n.fixtureText(graphLocale, "caseDescription");
    renderEvidenceOptions();
  }
  updateStoryLabel();
  refreshCount();
  nodes.resultsTitle.textContent = resultI18n.resultShellText(graphLocale, "resultsTitle");
  nodes.emptyTitle.textContent = resultI18n.resultShellText(graphLocale, "emptyTitle");
  nodes.emptyDescription.textContent = resultI18n.resultShellText(graphLocale, "emptyBody");
  nodes.graphJump.firstChild.textContent = `${resultI18n.resultShellText(graphLocale, "graphJump")} `;
  if (resultViewState === "waiting") nodes.mode.textContent = resultI18n.resultShellText(graphLocale, "waiting");
  nodes.results.lang = graphLocale;
  nodes.results.dir = graphLocale === "ar" ? "rtl" : "ltr";
  if (!busy) nodes.analyze.querySelector("span").textContent = resultCopy("analyzeButton");
  if (resultViewState === "analyzed" && lastResultArgs) {
    renderResult(lastResultArgs.data, lastResultArgs.comparison, true);
  }
  else if (lastGraphArgs) drawGraph(lastGraphArgs.data, lastGraphArgs.earlier, lastGraphArgs.comparison);
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
  nodes.count.textContent = siteCopy("selectionCount", {selected:n, total:scenario?.evidence.length ?? 0});
  nodes.analyze.disabled = !scenario || busy;
  nodes.storyButton.disabled = !scenario || busy;
}

function createEvidence(item) {
  const translated = siteI18n.fixtures[graphLocale]?.[item.id] || item;
  const label = element("label", "evidence-option");
  const check = element("input");
  check.type = "checkbox";
  check.value = item.id;
  check.name = "evidence";
  check.addEventListener("change", refreshCount);
  const body = element("span", "evidence-body");
  const top = element("span", "evidence-top");
  top.append(element("span", "evidence-id", item.id.toUpperCase()), element("span", "evidence-title", translated.title));
  const sourceLabel = graphLocale === "ar" ? "المصدر" : "SOURCE";
  body.append(top, element("span", "evidence-detail", translated.observation), element("span", "evidence-source", `${sourceLabel}: ${translated.source}`));
  label.append(check, body);
  return label;
}

function renderEvidenceOptions() {
  if (!scenario) return;
  const active = new Set(selectedIds());
  nodes.evidenceList.replaceChildren();
  for (const item of scenario.evidence) {
    const option = createEvidence(item);
    option.children[0].checked = active.has(item.id);
    nodes.evidenceList.append(option);
  }
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
    nodes.storyProgress.textContent = siteCopy("storyReady");
    nodes.storyButton.firstChild.textContent = `${siteCopy("storyButtonStart")} `;
  } else {
    nodes.storyProgress.textContent = siteCopy(`storyStep${storyIndex + 1}`);
    nodes.storyButton.firstChild.textContent = `${siteCopy(storyIndex === STORY.length - 1 ? "storyButtonReplay" : "storyButtonNext")} `;
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
    const kindLabel = item.kind === "evidence" ? graphCopy("legendObservation") :
      item.kind === "hypothesis" ? (graph.state === "HUMAN_REVIEW"
        ? `${graphCopy("legendHypothesis")} · ${graphCopy("statusHumanReview")}`
        : graphCopy("legendHypothesis")) : graphCopy("statusHumanReview");
    const nodeLine = item.kind === "withdrawn"
      ? graphCopy("ghostWithdrawn", {label: `${printedRef} — ${item.label}`})
      : `${kindLabel}: ${printedRef} — ${item.label}`;
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
      : graphCopy("edgeSupports", {ref, label: `${visibleTarget} — ${labels.get(edge.target)}`}) +
        (graph.state === "HUMAN_REVIEW" ? ` ${graphCopy("statusHumanReview")}.` : "");
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
      item.kind === "hypothesis" ? graphCopy(graph.state === "HUMAN_REVIEW" ? "statusHumanReview" : "legendHypothesis") :
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

function renderResult(data, comparison = null, retranslate = false) {
  const earlier = retranslate && lastResultArgs ? lastResultArgs.earlier : previousResult;
  nodes.results.replaceChildren();
  nodes.results.lang = graphLocale;
  nodes.results.dir = graphLocale === "ar" ? "rtl" : "ltr";
  if (earlier) {
    const previousIds = new Set(earlier.selectedEvidence.map((item) => item.id));
    const currentIds = new Set(data.selectedEvidence.map((item) => item.id));
    const added = [...currentIds].filter((id) => !previousIds.has(id));
    const removed = [...previousIds].filter((id) => !currentIds.has(id));
    const previousHypotheses = new Set(earlier.hypotheses.map((hypothesis) => hypothesis.id));
    const currentHypotheses = new Set(data.hypotheses.map((hypothesis) => hypothesis.id));
    const appeared = [...currentHypotheses].filter((id) => !previousHypotheses.has(id));
    const disappeared = [...previousHypotheses].filter((id) => !currentHypotheses.has(id));
    const newConflicts = data.contradictions.length - earlier.contradictions.length;
    if (added.length || removed.length || appeared.length || disappeared.length || newConflicts) {
      const backed = comparison && Array.isArray(comparison.addedEvidenceIds);
      const changed = finding(resultCopy("changeTitle"), "", added, newConflicts > 0);
      const prose = changed.children[1];
      const phrases = [
        resultPhrase("addedIds", {ids: added}),
        resultPhrase("removedIds", {ids: removed}),
        resultPhrase("newFindingsCount", {count: appeared.length}),
        resultPhrase("withdrawnFindingsCount", {count: disappeared.length}),
        resultPhrase("conflictDelta", {delta: `${newConflicts > 0 ? "+" : ""}${newConflicts}`}),
        resultPhrase("cautionUpdate", {before: earlier.uncertainty.toFixed(2), after: data.uncertainty.toFixed(2)}),
        element("span", "", resultCopy(backed ? "sourceServerTrace" : "sourceLocalComparison")),
      ];
      phrases.forEach((phrase, i) => {
        if (i) prose.append(element("span", "", ". "));
        prose.append(phrase);
      });
      nodes.results.append(block(resultCopy("changeTitle"), [changed]));
    }
  }
  if (!retranslate) {
    lastResultArgs = {data, comparison, earlier};
    previousResult = data;
    resultViewState = "analyzed";
  }
  drawGraph(data, earlier, comparison);
  nodes.mode.textContent = resultCopy(data.inference.metaAccepted ? "modeRemoteAccepted" :
    data.inference.metaCalled ? "modeRemoteRejected" : "modeOffline");
  const number = element("div", "uncertainty-number", `${data.uncertainty.toFixed(2)} / 1.00`);
  number.dir = "ltr";
  nodes.results.append(block(resultCopy("cautionTitle"), [number,
    element("p", "result-desc", resultCopy("cautionBody")),
  ]));

  const findings = data.hypotheses.length ? data.hypotheses.map((hypothesis) => finding(
    siteI18n.fixtureText(graphLocale, hypothesis.id, "label") || hypothesis.label,
    `${siteI18n.fixtureText(graphLocale, hypothesis.id, "goal") || hypothesis.verificationGoal} · ${hypothesis.provenance} · ${resultCopy("verificationUnverified")}.`,
    hypothesis.supportingEvidenceIds
  )) : [finding(resultCopy("insufficientTitle"), resultCopy("insufficientBody"), [])];
  nodes.results.append(block(resultCopy("findingsTitle"), findings));

  // Optional model text is not a hypothesis, graph node, evidence edge or
  // second opinion. Keep it physically and semantically separate from both.
  const remoteNotes = Array.isArray(data.metaAnnotations) && data.inference.metaAccepted
    ? data.metaAnnotations : [];
  if (remoteNotes.length) {
    const children = [element("p", "result-desc", resultCopy("remoteNotesBody"))];
    for (const note of remoteNotes) {
      const card = element("div", "finding");
      const refs = element("div", "evidence-refs");
      refs.append(element("span", "", `${resultCopy("remoteCitations")}: `));
      note.citations.forEach((id, index) => {
        if (index) refs.append(element("span", "", " · "));
        const ref = element("bdi", "", id);
        ref.setAttribute("dir", "ltr");
        refs.append(ref);
      });
      card.append(element("h4", "", note.label),
        element("p", "", resultCopy("remoteNoteStatus")), refs);
      children.push(card);
    }
    nodes.results.append(block(resultCopy("remoteNotesTitle"), children));
  }

  if (data.contradictions.length) {
    nodes.results.append(block(resultCopy("conflictTitle"), data.contradictions.map((conflict) => finding(
      resultCopy("conflictItem"),
      `${siteI18n.fixtureText(graphLocale,"conflict","reason") || conflict.reason} ${siteI18n.fixtureText(graphLocale,"conflict","nextStep") || conflict.nextStep}`,
      conflict.evidenceIds, true
    ))));
  }

  nodes.results.append(block(resultCopy("safetyTitle"), [
    element("div", "safety-banner", resultCopy(data.recommendedAction === "TECHNICIAN_REVIEW" ? "safetyReview" : "safetyNotice")),
    element("p", "result-desc", resultCopy("safetyNotice") + (graphLocale === "en" ? ` ${data.limitations.join(" ")}` : "")),
  ]));
}

async function runAnalysis() {
  if (!scenario || busy) return;
  storyIndex = -1;
  updateStoryLabel();
  busy = true;
  refreshCount();
  nodes.analyze.querySelector("span").textContent = resultCopy("analyzeBusy");
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({caseId: scenario.id, evidenceIds: selectedIds()}),
    });
    if (!response.ok) throw new Error(`Analysis unavailable (${response.status})`);
    renderResult(await response.json());
  } catch (error) {
    nodes.results.replaceChildren(finding(resultCopy("analysisErrorTitle"), error.message, []));
    nodes.mode.textContent = "ERROR";
    resultViewState = "error";
  } finally {
    busy = false;
    nodes.analyze.querySelector("span").textContent = resultCopy("analyzeButton");
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
    setGraphLanguage(graphLocale);
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
