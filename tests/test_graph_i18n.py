"""Executable multilingual graph-copy contracts using the real browser JS module."""

from html.parser import HTMLParser
from pathlib import Path
import subprocess
import unittest


def run_js(script):
    return subprocess.run(["node", "-e", script], capture_output=True, text=True, check=False)


class GraphMarkupParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
        self.locale_options = []
        self.in_locale_select = False
        self.locale_select_attributes = None
        self.in_locale_label = False
        self.locale_label_parts = []

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if "id" in props:
            self.ids.add(props["id"])
        if tag == "script":
            self.scripts.append(props.get("src"))
        if tag == "select" and props.get("id") == "graph-locale":
            self.in_locale_select = True
            self.locale_select_attributes = props
        if tag == "label" and props.get("for") == "graph-locale":
            self.in_locale_label = True
        if tag == "option" and self.in_locale_select:
            self.locale_options.append(props.get("value"))

    def handle_endtag(self, tag):
        if tag == "select":
            self.in_locale_select = False
        if tag == "label":
            self.in_locale_label = False

    def handle_data(self, data):
        if self.in_locale_label:
            self.locale_label_parts.append(data)


class GraphInternationalizationTests(unittest.TestCase):
    def test_spark_locale_pack_has_matched_placeholders_and_safe_technical_references(self):
        script = r"""
const assert = require('node:assert/strict');
const {locales, graphText} = require('./demo/static/graph-i18n.js');
const keys = [
  'graphTitle','graphIntro','legendObservation','legendHypothesis','legendConflict',
  'transcriptTitle','disclaimer','statusAbstain','statusProvisional',
  'statusHumanReview','svgTitle','svgDescription','edgeSupports',
  'edgeConflict','ghostWithdrawn','noEdges'
];
assert.deepEqual(Object.keys(locales).sort(), ['ar','en','fr']);
for (const locale of ['en','fr','ar']) {
  assert.deepEqual(Object.keys(locales[locale].messages).sort(), [...keys].sort());
  assert.equal(locales[locale].dir, locale === 'ar' ? 'rtl' : 'ltr');
  for (const key of keys) {
    const slots = [...locales[locale].messages[key].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    const english = [...locales.en.messages[key].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(slots, english, `${locale}.${key} placeholder mismatch`);
  }
}
const arabic = graphText('ar','edgeSupports',{ref:'e1',label:'Alpha'});
assert(arabic.includes('\u2066e1\u2069'), 'RTL technical evidence ID must remain isolated LTR');
assert(arabic.includes('Alpha'));
assert.equal(graphText('unknown','statusAbstain'),locales.en.messages.statusAbstain);
"""
        result = run_js(script)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_graph_markup_exposes_three_locales_and_loads_copy_before_controller(self):
        html = Path("demo/static/index.html").read_text(encoding="utf-8")
        parser = GraphMarkupParser()
        parser.feed(html)
        self.assertEqual(parser.locale_options, ["en", "fr", "ar"])
        self.assertTrue({"graph-title", "graph-intro", "graph-locale", "graph-legend-observation",
                         "graph-legend-hypothesis", "graph-legend-conflict", "graph-transcript-title",
                         "graph-disclaimer"}.issubset(parser.ids))
        self.assertLess(parser.scripts.index("/graph-i18n.js"), parser.scripts.index("/app.js"))
        self.assertLess(parser.scripts.index("/result-i18n.js"), parser.scripts.index("/app.js"))
        self.assertLess(parser.scripts.index("/site-i18n.js"), parser.scripts.index("/app.js"))

    def test_language_control_uses_visible_multilingual_label_as_accessible_name(self):
        parser = GraphMarkupParser()
        parser.feed(Path("demo/static/index.html").read_text(encoding="utf-8"))
        self.assertIsNotNone(parser.locale_select_attributes)
        # An English aria-label would override the visible English/French/Arabic
        # label in the browser's accessible-name computation.
        self.assertNotIn("aria-label", parser.locale_select_attributes)
        visible_label = " ".join(parser.locale_label_parts)
        for part in ("Language", "Langue", "اللغة"):
            self.assertIn(part, visible_label)

    def test_controller_switches_graph_language_without_network_analysis(self):
        script = r"""
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const i18n = require('./demo/static/graph-i18n.js');
const resultI18n = require('./demo/static/result-i18n.js');
const siteI18n = require('./demo/static/site-i18n.js');
const elements = new Map();
function node(id) {
  if (!elements.has(id)) elements.set(id, {
    id, textContent:'', dir:'', lang:'', value:'en', handlers:{},
    addEventListener(event,fn){ this.handlers[event]=fn; },
    querySelectorAll(){return [];}, querySelector(){return {textContent:''};},
    append(){}, replaceChildren(){}, firstChild:{textContent:''}
  });
  return elements.get(id);
}
const doc = {getElementById:node, createElement:() => node('created'), querySelectorAll:()=>[]};
let analysisRequests = 0;
const context = {
  document:doc, window:{ECHKILI_GRAPH_I18N:i18n,ECHKILI_RESULT_I18N:resultI18n,ECHKILI_SITE_I18N:siteI18n},
  fetch:() => { analysisRequests++; return new Promise(()=>{}); },
  console
};
vm.runInNewContext(fs.readFileSync('demo/static/app.js','utf8'),context);
const select = node('graph-locale');
assert.equal(typeof select.handlers.change,'function','locale selector must be wired');
select.value='ar'; select.handlers.change();
assert.equal(node('graph-title').textContent,i18n.locales.ar.messages.graphTitle);
assert.equal(node('graph-panel').dir,'rtl');
assert.equal(node('graph-canvas').dir,'ltr');
select.value='fr'; select.handlers.change();
assert.equal(node('graph-title').textContent,i18n.locales.fr.messages.graphTitle);
assert.equal(analysisRequests,1,'switching locale must not request another analysis');
"""
        result = run_js(script)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_locale_switch_changes_graph_copy_but_preserves_ltr_canvas(self):
        script = r"""
const assert = require('node:assert/strict');
const {locales, applyGraphLocale} = require('./demo/static/graph-i18n.js');
const ids = ['graph-panel','graph-canvas','graph-locale','graph-title','graph-intro',
  'graph-legend-observation','graph-legend-hypothesis','graph-legend-conflict',
  'graph-transcript-title','graph-disclaimer'];
const els = Object.fromEntries(ids.map(id => [id, {textContent:'',dir:'',lang:'',value:''}]));
const doc = {getElementById: id => els[id]};
assert.equal(applyGraphLocale(doc,'ar'),'ar');
assert.equal(els['graph-panel'].dir,'rtl');
assert.equal(els['graph-panel'].lang,'ar');
assert.equal(els['graph-canvas'].dir,'ltr');
assert.equal(els['graph-title'].textContent, locales.ar.messages.graphTitle);
assert.equal(els['graph-transcript-title'].textContent, locales.ar.messages.transcriptTitle);
assert.equal(els['graph-locale'].value,'ar');
assert.equal(applyGraphLocale(doc,'fr'),'fr');
assert.equal(els['graph-panel'].dir,'ltr');
assert.equal(els['graph-title'].textContent, locales.fr.messages.graphTitle);
"""
        result = run_js(script)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
