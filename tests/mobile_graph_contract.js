"use strict";

// Exercising the actual graph controller with a complete, synthetic DOM surface.
// A changed relation branch, missing withdrawal or bidi regression must fail.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const i18n = require("../demo/static/graph-i18n.js");

class Node {
  constructor(tag = "div") {
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.handlers = {};
    this.textContent = "";
    this.value = "en";
    this.dir = "";
    this.lang = "";
    this.className = "";
    this.hidden = false;
    this.firstChild = {textContent: ""};
    this.style = {};
  }
  setAttribute(key, value) {this.attributes[key] = String(value);}
  append(...items) {this.children.push(...items);}
  replaceChildren(...items) {this.children = [...items];}
  addEventListener(key, callback) {this.handlers[key] = callback;}
  querySelectorAll() {return [];}
  querySelector() {return {textContent: ""};}
}

const items = new Map();
function id(name) {
  if (!items.has(name)) items.set(name, new Node());
  return items.get(name);
}
const doc = {
  getElementById: id,
  createElement: (tag) => new Node(tag),
  createElementNS: (_ns, tag) => new Node(tag),
};
const ctx = {
  document: doc,
  window: {ECHKILI_GRAPH_I18N: i18n},
  fetch: () => new Promise(() => {}),
  console,
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("demo/static/app.js", "utf8"), ctx);

const graph = {
  state: "HUMAN_REVIEW",
  nodes: [
    {id: "e:e1", kind: "evidence", sourceId: "e1", label: "Record A"},
    {id: "e:e2", kind: "evidence", sourceId: "e2", label: "Record B"},
    {id: "e:e3", kind: "evidence", sourceId: "e3", label: "Record C"},
    {id: "e:e4", kind: "evidence", sourceId: "e4", label: "Record D"},
    {id: "h:h2", kind: "hypothesis", label: "Explanation B", status: "review_required"},
  ],
  edges: [
    {source: "e:e2", target: "h:h2", relation: "SUPPORTS", evidenceId: "e2"},
    {source: "e:e3", target: "h:h2", relation: "SUPPORTS", evidenceId: "e3"},
    {source: "e:e1", target: "e:e4", relation: "CONTRADICTS", evidenceIds: ["e1", "e4"]},
  ],
};
const data = {graph, hypotheses: [{id: "h2", label: "Explanation B"}]};
const earlier = {hypotheses: [{id: "h1", label: "Explanation A"}]};
ctx.__input = data;
ctx.__earlier = earlier;
vm.runInContext('drawGraph(__input,__earlier,{withdrawnHypothesisIds:["h1"]})', ctx);

function relationCards() {
  return id("graph-links").children.filter(item => item.className.includes("graph-relation-card"));
}

// Correctness and source/target ordering, independently derived from fixture.
let cards = relationCards();
assert.equal(cards.length, 3, "each actual graph edge needs exactly one relation card");
assert.deepEqual(cards.map(card => [card.attributes["data-source"], card.attributes["data-relation"], card.attributes["data-target"]]), [
  ["e:e2", "SUPPORTS", "h:h2"],
  ["e:e3", "SUPPORTS", "h:h2"],
  ["e:e1", "CONTRADICTS", "e:e4"],
]);
assert(cards[0].textContent.includes("e2") && cards[0].textContent.includes("h2"),
  "support card must expose the target h2 reference, not only a display label");
assert(cards[2].textContent.includes("e1") && cards[2].textContent.includes("e4"),
  "conflict card must expose both endpoints");
assert(cards[0].textContent.includes("Human review required"),
  "a retained explanation in a conflicted case must not read as an actionable provisional result");
assert(id("graph-links").children.some(item => item.className.includes("graph-transcript-node") &&
  item.textContent.includes("Explanation B") && item.textContent.includes("Human review required")),
"the text graph node must expose the independent hypothesis's review state");
assert(!cards.some(card => Object.values(card.attributes).some(value => value.includes("h1"))),
  "a withdrawn hypothesis must never appear as an active relationship endpoint");
const withdrawn = id("graph-links").children.filter(item => item.className.includes("graph-transcript-withdrawn"));
assert.equal(withdrawn.length, 1, "separate withdrawn state must be visible");
assert(withdrawn[0].textContent.includes("h1") && /withdrawn/i.test(withdrawn[0].textContent),
  "the withdrawn entry must name its ID and state without color");

// The localized prose may be RTL, but IDs remain readable and edge order stable.
id("graph-locale").value = "ar";
id("graph-locale").handlers.change();
cards = relationCards();
assert.equal(id("graph-panel").dir, "rtl");
assert.deepEqual(cards.map(card => [card.attributes["data-source"],card.attributes["data-target"]]), [
  ["e:e2", "h:h2"], ["e:e3", "h:h2"], ["e:e1", "e:e4"],
]);
assert(cards[0].textContent.includes("\u2066e2\u2069"), "Arabic source ID must be isolated");
assert(cards[0].textContent.includes("\u2066h2\u2069"), "Arabic target ID must be isolated");
assert(cards[0].textContent.includes("تلزم مراجعة بشرية"),
  "Arabic relationship card must name the review state, not rely on the banner alone");
assert(cards[2].textContent.includes("\u2066e1 + e4\u2069"), "Arabic conflict pair must be isolated");

// A truly empty graph must not create cards, connector placeholders or claims.
ctx.__input = {graph:{state:"ABSTAIN",nodes:[],edges:[]},hypotheses:[]};
vm.runInContext("drawGraph(__input,null,null)",ctx);
assert.equal(relationCards().length, 0);
assert.equal(id("graph-links").children.length, 1);
assert.equal(id("graph-links").children[0].textContent, i18n.locales.ar.messages.noEdges);
assert.equal(id("graph-state").textContent,i18n.locales.ar.messages.statusAbstain);

// A malformed, dangling edge must not suppress the empty-state message or
// inflate the SVG's spoken relation count (never invent a missing endpoint).
ctx.__input = {
  graph: {
    state: "HUMAN_REVIEW",
    nodes: [{id: "e:e1", kind: "evidence", sourceId: "e1", label: "Record A"}],
    edges: [{source: "e:missing", target: "e:e1", relation: "CONTRADICTS", evidenceIds: ["e9", "e1"]}],
  },
  hypotheses: [],
};
vm.runInContext("drawGraph(__input,null,null)",ctx);
assert.equal(relationCards().length, 0, "unknown endpoints must not become mobile relation cards");
assert(id("graph-links").children.some(n => n.textContent === i18n.locales.ar.messages.noEdges),
  "no rendered relations must be announced as no links");
const svgDesc = id("graph-canvas").children[0].children.find(n => n.tag === "desc");
assert(svgDesc.textContent.includes("0"), "spoken graph relation count excludes skipped links");

// A valid endpoint is insufficient when edge citations disagree with it.
// Those forged claims must not be shown as if they came from selected evidence.
ctx.__input = {
  graph: {
    state: "PROVISIONAL",
    nodes: [
      {id: "e:e1", kind: "evidence", sourceId: "e1", label: "Record A"},
      {id: "e:e2", kind: "evidence", sourceId: "e2", label: "Record B"},
      {id: "h:h2", kind: "hypothesis", label: "Explanation B"},
    ],
    edges: [{source: "e:e1", target: "h:h2", relation: "SUPPORTS", evidenceId: "e2"}],
  },
  hypotheses: [{id: "h2", label: "Explanation B"}],
};
vm.runInContext("drawGraph(__input,null,null)",ctx);
assert.equal(relationCards().length, 0, "mismatched support evidenceId must be rejected");
assert(id("graph-links").children.some(n => n.textContent === i18n.locales.ar.messages.noEdges));

ctx.__input = {
  graph: {
    state: "HUMAN_REVIEW",
    nodes: [
      {id: "e:e1", kind: "evidence", sourceId: "e1", label: "Record A"},
      {id: "e:e2", kind: "evidence", sourceId: "e2", label: "Record B"},
    ],
    edges: [{source: "e:e1", target: "e:e2", relation: "CONTRADICTS", evidenceIds: ["e1", "e3"]}],
  },
  hypotheses: [],
};
vm.runInContext("drawGraph(__input,null,null)",ctx);
assert.equal(relationCards().length, 0, "mismatched conflict evidenceIds must be rejected");
assert(id("graph-links").children.some(n => n.textContent === i18n.locales.ar.messages.noEdges));

// A fictional caution signal is not a scientific probability or confidence
// percentage, including when the interface narrates an evidence update.
ctx.__input = {
  graph: {state: "ABSTAIN", nodes: [], edges: []},
  hypotheses: [], selectedEvidence: [{id: "e1"}], contradictions: [],
  inference: {metaCalled: false}, uncertainty: 0.66,
  recommendedAction: "CONTINUE_DIAGNOSIS", limitations: ["Fictional only."],
};
vm.runInContext("renderResult(__input)", ctx);
const cautionBlock = id("results").children.find(part => part.className === "result-section" &&
  part.children[0].textContent.includes("UNCERTAINTY"));
assert(cautionBlock, "a visible uncertainty explanation must remain available");
assert(cautionBlock.children[0].textContent.includes("NOT A PROBABILITY"),
  "the caution score must deny probabilistic calibration next to its value");
assert.equal(cautionBlock.children[1].textContent, "0.66 / 1.00",
  "do not display the illustrative numerical score as 66% confidence");
assert(!cautionBlock.children.some(part => part.className === "meter"),
  "a progress meter would visually imply scientifically calibrated precision");

ctx.__input = {
  graph: {state: "HUMAN_REVIEW", nodes: [], edges: []},
  hypotheses: [], selectedEvidence: [{id: "e1"}, {id: "e4"}],
  contradictions: [{evidenceIds: ["e1", "e4"]}],
  inference: {metaCalled: false}, uncertainty: 0.78,
  recommendedAction: "TECHNICIAN_REVIEW", limitations: ["Fictional only."],
};
vm.runInContext("renderResult(__input)", ctx);
const changeBlock = id("results").children.find(part => part.children[0].textContent.includes("EVIDENCE UPDATE"));
assert(changeBlock, "a changed synthetic evidence selection needs an audit delta");
assert(!changeBlock.children[1].children[1].textContent.includes("%"),
  "the comparison must not re-introduce probability-like percentages");

console.log("Mobile graph synthetic contract: relationships, withdrawal, RTL IDs and abstention verified");
