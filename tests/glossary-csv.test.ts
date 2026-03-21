import test from "node:test";
import assert from "node:assert/strict";

import {
  mergeGlossaryTranslations,
  normalizeGlossaryStatus,
  parseGlossaryBoolean,
  parseGlossaryCsv
} from "@/lib/glossary/csv";

test("parses glossary CSV locale columns and merges repeated rows", () => {
  const rows = parseGlossaryCsv(`source,source_language,status,collection,project,de,fr
Checkout,en,approved,Commerce,storefront,Kasse,
Checkout,en,approved,Commerce,storefront,,Paiement
"Brand, Kit",en,draft,,,Brand Kit,Kit de marque`);

  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.source, "Checkout");
  assert.equal(rows[0]?.status, "Approved");
  assert.equal(rows[0]?.collectionName, "Commerce");
  assert.equal(rows[0]?.projectRef, "storefront");
  assert.deepEqual(rows[0]?.translations, [
    { locale: "de", term: "Kasse" },
    { locale: "fr", term: "Paiement" }
  ]);
  assert.equal(rows[1]?.source, "Brand, Kit");
});

test("supports translation-prefixed headers and protected booleans", () => {
  const rows = parseGlossaryCsv(`source,translation:de,translation_fr,protected
Brand Kit,Brand Kit,Kit de marque,yes`);

  assert.equal(rows[0]?.isProtected, true);
  assert.deepEqual(rows[0]?.translations, [
    { locale: "de", term: "Brand Kit" },
    { locale: "fr", term: "Kit de marque" }
  ]);
});

test("throws when the source column is missing", () => {
  assert.throws(
    () => parseGlossaryCsv("de,fr\nKasse,Paiement"),
    /source column/i
  );
});

test("normalizes glossary statuses and booleans", () => {
  assert.equal(normalizeGlossaryStatus("approved"), "Approved");
  assert.equal(normalizeGlossaryStatus(""), "Draft");
  assert.equal(parseGlossaryBoolean("yes"), true);
  assert.equal(parseGlossaryBoolean("0"), false);
});

test("deduplicates translations by locale using the latest value", () => {
  assert.deepEqual(
    mergeGlossaryTranslations([
      { locale: "de", term: "Kasse" },
      { locale: "fr", term: "Paiement" },
      { locale: "de", term: "Checkout" }
    ]),
    [
      { locale: "de", term: "Checkout" },
      { locale: "fr", term: "Paiement" }
    ]
  );
});
