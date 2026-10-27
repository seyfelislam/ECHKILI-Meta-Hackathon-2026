"""Spark vision findings checked against rendered synthetic graph semantics."""

from html.parser import HTMLParser
from pathlib import Path
import subprocess
import unittest


class GraphCanvasParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canvas = None

    def handle_starttag(self, tag, attrs):
        if tag == "div" and dict(attrs).get("id") == "graph-canvas":
            self.canvas = dict(attrs)


class GraphVisionTests(unittest.TestCase):
    def test_canvas_is_keyboard_navigable_with_named_scroll_region(self):
        parser = GraphCanvasParser()
        parser.feed(Path("demo/static/index.html").read_text(encoding="utf-8"))
        self.assertIsNotNone(parser.canvas)
        self.assertEqual(parser.canvas.get("role"), "region")
        self.assertEqual(parser.canvas.get("tabindex"), "0")
        self.assertEqual(parser.canvas.get("aria-labelledby"), "graph-title")

    def test_live_graph_has_conflict_endpoints_with_text_only_parity_and_withdrawal_label(self):
        # Breaks if an edge dot, graph node narration, or explicit withdrawn label is removed.
        script = r"""
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const i18n = require('./demo/static/graph-i18n.js');
const resultI18n = require('./demo/static/result-i18n.js');

class El {
  constructor(tag='div') {
    this.tag=tag; this.children=[]; this.attributes={}; this.handlers={};
    this.textContent=''; this.value='en'; this.dir=''; this.lang='';
    this.className=''; this.hidden=false; this.firstChild={textContent:''};
  }
  setAttribute(name,value){this.attributes[name]=String(value);}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=[...children];}
  addEventListener(event,fn){this.handlers[event]=fn;}
  querySelectorAll(){return [];}
  querySelector(){return {textContent:''};}
}
const map = new Map();
const el = id => {if(!map.has(id))map.set(id,new El());return map.get(id)};
const doc = {getElementById:el,createElement:tag=>new El(tag),createElementNS:(_ns,tag)=>new El(tag)};
const context = {document:doc,window:{ECHKILI_GRAPH_I18N:i18n,ECHKILI_RESULT_I18N:resultI18n},fetch:()=>new Promise(()=>{}),console};
vm.createContext(context);
vm.runInContext(fs.readFileSync('demo/static/app.js','utf8'),context);
const input = {
  graph: {state:'HUMAN_REVIEW',nodes:[
    {id:'e:e1',kind:'evidence',sourceId:'e1',label:'Record A'},
    {id:'e:e2',kind:'evidence',sourceId:'e2',label:'Record B'},
    {id:'e:e3',kind:'evidence',sourceId:'e3',label:'Record C'},
    {id:'h:h2',kind:'hypothesis',label:'Explanation B'}
  ],edges:[
    {source:'e:e2',target:'h:h2',relation:'SUPPORTS',evidenceId:'e2'},
    {source:'e:e1',target:'e:e3',relation:'CONTRADICTS',evidenceIds:['e1','e3']}
  ]}, hypotheses:[{id:'h2',label:'Explanation B'}]
};
const earlier = {hypotheses:[{id:'h1',label:'Explanation A'}]};
vm.runInContext('drawGraph(__input,__earlier,{withdrawnHypothesisIds:["h1"]})',
  Object.assign(context,{__input:input,__earlier:earlier}));

function walk(item){return [item,...item.children.flatMap(walk)];}
const svg = el('graph-canvas').children[0];
const all = walk(svg);
const dots = all.filter(n=>n.tag==='circle' && n.attributes['data-relation']==='CONTRADICTS');
assert.equal(dots.length,2,'both endpoints of a conflict must have visible anchor dots');
const svgText = all.filter(n=>n.tag==='text').map(n=>n.textContent);
assert(svgText.some(t=>String(t).includes('h1') && /withdrawn/i.test(t)),
  'withdrawn ghost must say withdrawn, not just be a peach dashed card');
const transcript = el('graph-links').children.map(n=>n.textContent);
for(const fragment of ['e1','Record A','h2','Explanation B','e2','e3','Explanation A']) {
  assert(transcript.some(t=>t.includes(fragment)),`transcript omits ${fragment}`);
}
assert(transcript.some(t=>t.includes('e1') && t.includes('e3') && /conflict/i.test(t)),
  'conflict pair must be explicit in transcript');

el('graph-locale').value='ar'; el('graph-locale').handlers.change();
const arabic = el('graph-links').children.map(n=>n.textContent);
assert(arabic.some(t=>t.includes('\u2066e1 + e3\u2069')),
  'Arabic conflict pair must keep LTR technical IDs isolated');
"""
        result = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
