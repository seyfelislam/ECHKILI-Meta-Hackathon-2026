"""Synthetic public scenario display translations do not change evidence IDs."""

import subprocess
import unittest


class SiteCopyTests(unittest.TestCase):
    def test_static_and_fixture_translation_contract(self):
        script = r"""
const assert = require('node:assert/strict');
const pack = require('./demo/static/site-i18n.js');
const {staticCopy, fixtures, siteText, fixtureText} = pack;
const keys = ['heroEyebrow','heroLine1','heroLine2','heroLead','chipSource',
  'chipConflict','chipHuman','workspaceTitle','syntheticBadge','storyEyebrow',
  'storyTitle','storyReady','storyStep1','storyStep2','storyStep3',
  'storyButtonStart','storyButtonNext','storyButtonReplay','evidenceTitle',
  'evidenceIntro','scenarioLabel','observationLegend','presetSupport',
  'presetConflict','selectionCount','resultsIntro','principle1Title',
  'principle1Body','principle2Title','principle2Body','principle3Title','principle3Body'];
for(const lang of ['en','fr','ar']){
  assert.deepEqual(Object.keys(staticCopy[lang]).sort(),keys.slice().sort());
  for(const key of keys){
    const value=siteText(lang,key);
    assert.equal(typeof value,'string');
    assert(value.length>1);
    assert(!/[\u202a-\u202e\u2066-\u2069\u0000-\u001f]/.test(value));
    assert(!/[<>]/.test(value));
    const placeholders=[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
    assert.deepEqual(placeholders,key==='selectionCount'?['selected','total']:[]);
  }
  assert.deepEqual(Object.keys(fixtures[lang]).sort(),
    ['caseTitle','caseDescription','e1','e2','e3','e4','h-flow','h-intermittent','conflict'].sort());
  for(const id of ['e1','e2','e3','e4']){
    assert.deepEqual(Object.keys(fixtures[lang][id]).sort(),['observation','source','title']);
    assert.equal(typeof fixtureText(lang,id,'observation'),'string');
  }
  assert.equal(typeof fixtureText(lang,'h-flow','label'),'string');
  assert.equal(typeof fixtureText(lang,'conflict','reason'),'string');
}
assert.equal(fixtureText('ar','e1','title'),'تقرير عن هواء دافئ عند المخرج');
assert(siteText('ar','selectionCount',{selected:2,total:4}).includes('2'));
assert.equal(siteText('unknown','heroLine1'),staticCopy.en.heroLine1);
assert(!fixtureText('ar','caseDescription').includes('النقاش التشخيصي'),
  'fictional scenario must not imply a real diagnostic conversation');
"""
        outcome = subprocess.run(["node", "-e", script], capture_output=True, text=True)
        self.assertEqual(outcome.returncode, 0, outcome.stderr)


if __name__ == "__main__":
    unittest.main()
