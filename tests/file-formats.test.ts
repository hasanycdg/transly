import test from "node:test";
import assert from "node:assert/strict";

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

const resxFixture = `<?xml version="1.0" encoding="utf-8"?>
<root>
  <data name="Welcome" xml:space="preserve">
    <value>Hello {name}</value>
  </data>
  <data name="Submit" xml:space="preserve">
    <value>Save draft</value>
  </data>
</root>`;

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
