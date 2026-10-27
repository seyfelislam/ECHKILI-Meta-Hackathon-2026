"""Behavioral checks for localized result copy, not model-generated authority."""

import subprocess
import unittest


class ResultInternationalizationTests(unittest.TestCase):
    def test_exact_three_language_contract_and_bidi_free_templates(self):
        script = r"""
const assert = require('node:assert/strict');
const {locales, resultText} = require('./demo/static/result-i18n.js');
const expected = [
  'modeOffline','modeRemoteAccepted','modeRemoteRejected','cautionTitle',
  'cautionBody','findingsTitle','insufficientTitle','insufficientBody',
  'verificationUnverified','conflictTitle','conflictItem','safetyTitle',
  'safetyReview','safetyNotice','remoteNotesTitle','remoteNotesBody',
  'remoteNoteStatus','remoteCitations','changeTitle','addedIds','removedIds',
  'newFindingsCount','withdrawnFindingsCount','conflictDelta','sourceServerTrace',
  'sourceLocalComparison','cautionUpdate','analysisErrorTitle',
  'analyzeButton','analyzeBusy'
];
const placeholders = {addedIds:['ids'],removedIds:['ids'],newFindingsCount:['count'],
  withdrawnFindingsCount:['count'],conflictDelta:['delta'],cautionUpdate:['after','before']};
assert.deepEqual(Object.keys(locales).sort(), ['ar','en','fr']);
for (const lang of ['en','fr','ar']) {
  assert.deepEqual(Object.keys(locales[lang]).sort(), expected.slice().sort());
  for (const [key,str] of Object.entries(locales[lang])) {
    assert.equal(typeof str,'string');
    assert(str.trim().length > 3, `${lang}.${key} must be readable`);
    assert(!/[\u202a-\u202e\u2066-\u2069\u0000-\u001f]/.test(str), 'no direction-control injection in copy');
    assert(!/[<>]/.test(str), `${lang}.${key} must be plain text`);
    const names = [...str.matchAll(/\{([a-z]+)\}/g)].map(m => m[1]).sort();
    assert.deepEqual(names, placeholders[key] || [], `${lang}.${key} must preserve slots`);
    assert.equal(resultText(lang,key),str);
  }
}
assert.equal(resultText('unknown','findingsTitle'),locales.en.findingsTitle);
assert(!locales.ar.verificationUnverified.includes('مصدر خيالي واحد'),
  'unverified does not mean a canonical explanation only has one source');
assert(!locales.fr.verificationUnverified.includes('source unique'),
  'do not falsely say every unverified finding has a single citation');
assert(!locales.ar.remoteNotesBody.includes('معطَّل'),
  'an actually visible remote-note section must not claim it is disabled');
"""
        result = subprocess.run(["node", "-e", script], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
