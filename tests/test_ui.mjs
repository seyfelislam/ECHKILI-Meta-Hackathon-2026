import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import test from "node:test";

class FakeElement {
  constructor(tag = "div") {
    this.tagName = tag;
    this.children = [];
    this.handlers = {};
    this.checked = false;
    this.value = "";
    this.disabled = false;
    this.textContent = "";
    this.style = {};
  }
  append(...nodes) { this.children.push(...nodes); }
  prepend(...nodes) { this.children.unshift(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  addEventListener(event, callback) { this.handlers[event] = callback; }
  focus() {}
  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      if (selector === "input" && node.tagName === "input") results.push(node);
      if (selector === "input:checked" && node.tagName === "input" && node.checked) results.push(node);
      node.children.forEach(walk);
    };
    this.children.forEach(walk);
    return results;
  }
  querySelector(selector) {
    const walk = (node) => {
      if (node.tagName === selector) return node;
      for (const child of node.children) {
        const found = walk(child);
        if (found) return found;
      }
      return null;
    };
    return walk(this);
  }
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

test("a second analysis shows what new evidence changed", async () => {
  const ids = ["case-title", "case-desc", "evidence-list", "selection-count", "analyze-button", "results", "result-mode", "preset-converging", "preset-conflict", "evaluation-grid"];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement()]));
  elements["analyze-button"].append(new FakeElement("span"));
  const calls = [];
  const scenario = {id: "solar-pump-01", title: "Fixture", description: "Fictional", evidence: ["e1", "e2", "e3", "e4"].map((id) => ({id, title: id, observation: "Fictional observation", source: "Fixture"}))};
  const analysis = {inference: {metaCalled: false}, uncertainty: 0.78, hypotheses: [], contradictions: [], recommendedAction: "TECHNICIAN_REVIEW", limitations: ["Fictional"]};
  const compare = {addedEvidenceIds: ["e4"], removedEvidenceIds: [], introducedHypothesisIds: [], retiredHypothesisIds: ["h-flow"], newContradictions: [["e1", "e4"]], resolvedContradictions: [], uncertaintyDelta: 0.12, actionChange: ["CONTINUE_DIAGNOSIS", "TECHNICIAN_REVIEW"]};
  const evaluation = {casesEvaluated: 6, unsupportedEvidenceReferences: 0, missedPlantedContradictions: 0, validatesRealWorldDiagnosis: false};
  const fetch = async (path, options) => {
    calls.push({path, payload: options ? JSON.parse(options.body) : null});
    return {ok: true, json: async () => path === "/api/case" ? scenario : path === "/api/analyze" ? analysis : path === "/api/evaluation" ? evaluation : compare};
  };
  const document = {getElementById: (id) => elements[id], createElement: (tag) => new FakeElement(tag)};
  const script = readFileSync(new URL("../demo/static/app.js", import.meta.url), "utf8");
  runInNewContext(script, {document, fetch});
  await tick();

  const inputs = elements["evidence-list"].querySelectorAll("input");
  inputs[0].checked = true;
  inputs[1].checked = true;
  await elements["analyze-button"].handlers.click();
  inputs[3].checked = true;
  await elements["analyze-button"].handlers.click();

  const difference = calls.find((call) => call.path === "/api/compare");
  assert.ok(difference, "second analysis must request a source-backed evidence comparison");
  assert.deepEqual(difference.payload.beforeIds, ["e1", "e2"]);
  assert.deepEqual(difference.payload.afterIds, ["e1", "e2", "e4"]);
  assert.equal(elements.results.children[0].children[0].textContent, "EVIDENCE DELTA · PREVIOUS RUN");
  assert.ok(calls.some((call) => call.path === "/api/evaluation"), "metrics must come from executable fixture checks");
  assert.equal(elements["evaluation-grid"].children.length, 3, "three measured control cards should render");
});
