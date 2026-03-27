import test from "node:test";
import assert from "node:assert/strict";

import JSZip from "jszip";

import {
  countMeaningfulTextContent,
  countMeaningfulWords,
  countWordsFromTranslationUnits,
  estimateBinaryTranslationFileWordCount,
  estimateTranslationFileWordCount
} from "@/lib/translation/word-count";
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

const poFixture = `msgid ""
msgstr ""

msgid "Hello %s"
msgstr ""

msgid "Save draft 2026"
msgstr ""
`;

const csvFixture = `key,en,de
welcome,Hello world,
cta,"Save draft",`;

const docxDocumentFixture = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Hello world</w:t></w:r></w:p>
    <w:p><w:r><w:t>Save draft 2026</w:t></w:r></w:p>
  </w:body>
</w:document>`;

const pptxSlideFixture = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Hello slide</a:t></a:r></a:p>
          <a:p><a:r><a:t>Save launch deck 2026</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

test("counts meaningful words while ignoring placeholders", () => {
  assert.equal(countMeaningfulWords("Hello %s from {name}"), 2);
  assert.equal(countMeaningfulWords("Save your draft now"), 4);
});

test("does not charge pure numeric tokens as words", () => {
  assert.equal(countMeaningfulWords("Version 2 ships in 2026"), 3);
  assert.equal(countMeaningfulWords("123 456 789"), 0);
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

test("counts PO files via translatable source units", () => {
  assert.equal(estimateTranslationFileWordCount("messages.po", poFixture), 3);
});

test("counts CSV files via translatable cells only", () => {
  assert.equal(estimateTranslationFileWordCount("messages.csv", csvFixture), 9);
});

test("counts DOCX files via translatable office runs", async () => {
  const archive = new JSZip();
  archive.file("word/document.xml", docxDocumentFixture);

  const buffer = await archive.generateAsync({ type: "arraybuffer" });

  assert.equal(await estimateBinaryTranslationFileWordCount("brief.docx", buffer), 4);
});

test("counts PPTX files via translatable slide runs", async () => {
  const archive = new JSZip();
  archive.file("ppt/slides/slide1.xml", pptxSlideFixture);

  const buffer = await archive.generateAsync({ type: "arraybuffer" });

  assert.equal(await estimateBinaryTranslationFileWordCount("deck.pptx", buffer), 5);
});
