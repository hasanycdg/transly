import test from "node:test";
import assert from "node:assert/strict";

import { countMeaningfulTextContent, countMeaningfulWords, countWordsFromTranslationUnits } from "@/lib/translation/word-count";
import { countXliffTranslationWords } from "@/lib/xliff/metrics";
import { parseXliffDocument } from "@/lib/xliff/parser";

const xliffFixture = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file original="messages.php" source-language="en" target-language="de">
    <body>
      <trans-unit id="welcome">
        <source>Hello <x id="1"/> %s from {name}</source>
      </trans-unit>
      <trans-unit id="cta">
        <source>Save <g id="2">your draft</g> now</source>
      </trans-unit>
    </body>
  </file>
</xliff>`;

test("counts meaningful words while ignoring placeholders", () => {
  assert.equal(countMeaningfulWords("Hello %s from {name}"), 2);
  assert.equal(countMeaningfulWords("Save your draft now"), 4);
});

test("counts words from parsed XLIFF translation units", () => {
  const parsed = parseXliffDocument(xliffFixture);

  assert.equal(countWordsFromTranslationUnits(parsed.units), 6);
});

test("counts translatable words from XLIFF source nodes only", () => {
  assert.equal(countXliffTranslationWords(xliffFixture), 6);
});

test("falls back to plain text counting when stripping markup", () => {
  assert.equal(countMeaningfulTextContent("<root>Hello <b>world</b> {{name}}</root>"), 2);
});
