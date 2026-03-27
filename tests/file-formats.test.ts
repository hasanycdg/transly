import test from "node:test";
import assert from "node:assert/strict";

import JSZip from "jszip";

import { parseCsvDocument, serializeTranslatedCsv } from "@/lib/file-formats/csv";
import { parseOfficeDocument, serializeTranslatedOffice } from "@/lib/file-formats/office";
import { parsePoDocument, serializeTranslatedPo } from "@/lib/file-formats/po";
import { parseResxDocument, serializeTranslatedResx } from "@/lib/file-formats/resx";
import { parseStringsDocument, serializeTranslatedStrings } from "@/lib/file-formats/strings";
import { parseTxtDocument, serializeTranslatedTxt } from "@/lib/file-formats/txt";

const poFixture = `msgid ""
msgstr ""
"Project-Id-Version: Example\\n"

msgid "Hello %s"
msgstr ""

msgid "Save draft"
msgstr "Save draft"
`;

const stringsFixture = `"welcome" = "Hello %@";
"cta" = "Save draft";
`;

const csvFixture = `key,en,de
welcome,Hello world,
cta,"Save draft",`

const resxFixture = `<?xml version="1.0" encoding="utf-8"?>
<root>
  <data name="Welcome" xml:space="preserve">
    <value>Hello {name}</value>
  </data>
  <data name="Submit" xml:space="preserve">
    <value>Save draft</value>
  </data>
</root>`;

const docxDocumentFixture = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Hello world</w:t></w:r></w:p>
    <w:p><w:r><w:t>Save draft</w:t></w:r></w:p>
  </w:body>
</w:document>`;

const pptxSlideFixture = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Hello slide</a:t></a:r></a:p>
          <a:p><a:r><a:t>Save launch deck</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

test("parses and serializes PO files", () => {
  const parsed = parsePoDocument(poFixture);

  assert.equal(parsed.units.length, 2);
  assert.equal(parsed.units[0]?.sourceText, "Hello %s");

  const translated = serializeTranslatedPo(
    poFixture,
    parsed,
    new Map([
      ["po-1", "Hallo %s"],
      ["po-2", "Entwurf speichern"]
    ])
  );

  assert.match(translated, /msgstr "Hallo %s"/);
  assert.match(translated, /msgstr "Entwurf speichern"/);
});

test("parses and serializes Apple strings files", () => {
  const parsed = parseStringsDocument(stringsFixture);

  assert.equal(parsed.units.length, 2);
  assert.equal(parsed.units[0]?.sourceText, "Hello %@");

  const translated = serializeTranslatedStrings(
    stringsFixture,
    parsed,
    new Map([
      ["strings-1", "Hallo %@"],
      ["strings-2", "Entwurf speichern"]
    ])
  );

  assert.match(translated, /"welcome" = "Hallo %@";/);
  assert.match(translated, /"cta" = "Entwurf speichern";/);
});

test("parses and serializes CSV files", () => {
  const parsed = parseCsvDocument(csvFixture);

  assert.equal(parsed.units.length, 7);
  assert.equal(parsed.units[0]?.sourceText, "key");
  assert.equal(parsed.units[1]?.sourceText, "en");

  const translated = serializeTranslatedCsv(
    parsed,
    new Map([
      ["csv-1", "schluessel"],
      ["csv-2", "englisch"],
      ["csv-3", "deutsch"],
      ["csv-4", "willkommen"],
      ["csv-5", "Hallo Welt"],
      ["csv-6", "cta"],
      ["csv-7", "Entwurf speichern"]
    ])
  );

  assert.match(translated, /schluessel,englisch,deutsch/);
  assert.match(translated, /willkommen,Hallo Welt,/);
  assert.match(translated, /cta,Entwurf speichern,/);
});

test("parses and serializes RESX files", () => {
  const parsed = parseResxDocument(resxFixture);

  assert.equal(parsed.units.length, 2);
  assert.equal(parsed.units[0]?.sourceText, "Hello {name}");

  const translated = serializeTranslatedResx(
    resxFixture,
    parsed,
    new Map([
      ["resx-1", "Hallo {name}"],
      ["resx-2", "Entwurf speichern"]
    ])
  );

  assert.match(translated, /<value>Hallo \{name\}<\/value>/);
  assert.match(translated, /<value>Entwurf speichern<\/value>/);
});

test("parses and serializes TXT files", () => {
  const parsed = parseTxtDocument("Hello world");
  const translated = serializeTranslatedTxt(parsed, new Map([["txt-1", "Hallo Welt"]]));

  assert.equal(parsed.units.length, 1);
  assert.equal(translated, "Hallo Welt");
});

test("parses and serializes DOCX files", async () => {
  const archive = new JSZip();
  archive.file("word/document.xml", docxDocumentFixture);

  const buffer = await archive.generateAsync({ type: "arraybuffer" });
  const parsed = await parseOfficeDocument(buffer, "docx");

  assert.equal(parsed.units.length, 2);
  assert.match(parsed.previewText, /Hello world/);

  const translatedArchive = await serializeTranslatedOffice(
    buffer,
    parsed,
    new Map([
      ["docx-1", "Hallo Welt"],
      ["docx-2", "Entwurf speichern"]
    ])
  );
  const translatedZip = await JSZip.loadAsync(translatedArchive);
  const translatedXml = await translatedZip.file("word/document.xml")?.async("string");

  assert.match(translatedXml ?? "", /Hallo Welt/);
  assert.match(translatedXml ?? "", /Entwurf speichern/);
});

test("parses and serializes PPTX files", async () => {
  const archive = new JSZip();
  archive.file("ppt/slides/slide1.xml", pptxSlideFixture);

  const buffer = await archive.generateAsync({ type: "arraybuffer" });
  const parsed = await parseOfficeDocument(buffer, "pptx");

  assert.equal(parsed.units.length, 2);
  assert.match(parsed.previewText, /Hello slide/);

  const translatedArchive = await serializeTranslatedOffice(
    buffer,
    parsed,
    new Map([
      ["pptx-1", "Hallo Folie"],
      ["pptx-2", "Launch Deck speichern"]
    ])
  );
  const translatedZip = await JSZip.loadAsync(translatedArchive);
  const translatedXml = await translatedZip.file("ppt/slides/slide1.xml")?.async("string");

  assert.match(translatedXml ?? "", /Hallo Folie/);
  assert.match(translatedXml ?? "", /Launch Deck speichern/);
});
