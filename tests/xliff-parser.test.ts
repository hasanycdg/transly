import test from "node:test";
import assert from "node:assert/strict";

import { parseXliffDocument } from "@/lib/xliff/parser";
import { serializeTranslatedXliff } from "@/lib/xliff/serializer";
import { TranslationPipelineError } from "@/types/translation";

const xliff12Fixture = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file original="messages.php" source-language="en" target-language="de">
    <body>
      <trans-unit id="welcome">
        <source>Hello <x id="1"/> %s</source>
      </trans-unit>
      <trans-unit id="cta">
        <source>Save {name}</source>
        <target>Speichern {name}</target>
      </trans-unit>
    </body>
  </file>
</xliff>`;

const xliff20Fixture = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.0" srcLang="en" trgLang="de" xmlns="urn:oasis:names:tc:xliff:document:2.0">
  <file id="f1">
    <unit id="u1">
      <segment id="s1">
        <source>Hello <pc id="1">world</pc></source>
      </segment>
    </unit>
  </file>
</xliff>`;

test("parses XLIFF 1.2 units and preserves inline markup", () => {
  const parsed = parseXliffDocument(xliff12Fixture);

  assert.equal(parsed.version, "1.2");
  assert.equal(parsed.sourceLanguage, "en");
  assert.equal(parsed.units.length, 2);
  assert.equal(parsed.units[0]?.sourceXml, 'Hello <x id="1"/> %s');
  assert.equal(parsed.units[0]?.unitId, "welcome");
});

test("parses XLIFF 2.x segment-based units", () => {
  const parsed = parseXliffDocument(xliff20Fixture);

  assert.equal(parsed.version, "2.x");
  assert.equal(parsed.sourceLanguage, "en");
  assert.equal(parsed.units.length, 1);
  assert.equal(parsed.units[0]?.metadata.segmentId, "s1");
  assert.match(parsed.units[0]?.sourceXml ?? "", /<pc id="1"/);
});

test("rejects malformed XML", () => {
  assert.throws(
    () => parseXliffDocument("<xliff><file><trans-unit><source>Hello</file></xliff>"),
    (error: unknown) =>
      error instanceof TranslationPipelineError && error.code === "malformed_xml"
  );
});

test("creates missing target nodes during serialization without touching source", () => {
  const parsed = parseXliffDocument(xliff12Fixture);
  const serialized = serializeTranslatedXliff({
    originalXml: xliff12Fixture,
    parsedDocument: parsed,
    translations: [
      {
        unitInternalId: parsed.units[0]!.internalId,
        translatedXml: 'Hallo <x id="1"/> %s'
      },
      {
        unitInternalId: parsed.units[1]!.internalId,
        translatedXml: 'Speichern {name}'
      }
    ],
    targetLanguage: "de"
  });

  assert.match(serialized, /<source>Hello <x id="1"\/> %s<\/source>/);
  assert.match(serialized, /<target>Hallo <x id="1"\/> %s<\/target>/);
  assert.match(serialized, /target-language="de"/);
});
