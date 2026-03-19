import test from "node:test";
import assert from "node:assert/strict";

import { restoreProtectedTokens, unmaskString } from "@/lib/masking/restore";
import { detectProtectedFragments, maskProtectedTokens, maskString } from "@/lib/masking/tokens";
import { TranslationPipelineError } from "@/types/translation";

test("masks XML tags and placeholders and restores them exactly", () => {
  const masked = maskProtectedTokens('Hello <x id="1"/> %1$s {{name}}');

  assert.equal(masked.maskedText, "Hello __TAG_1__ __VAR_1__ __VAR_2__");
  assert.equal(masked.tokens.length, 3);
  assert.deepEqual(masked.map, {
    __TAG_1__: '<x id="1"/>',
    __VAR_1__: "%1$s",
    __VAR_2__: "{{name}}"
  });

  const restored = restoreProtectedTokens(
    "Hallo __TAG_1__ __VAR_1__ __VAR_2__",
    masked.tokens
  );

  assert.equal(restored, 'Hallo <x id="1"/> %1$s {{name}}');
});

test("detects optional placeholders and nested tags in source order", () => {
  const masked = maskString('Hi <g id="2"><x id="1"/></g> :name $user {0}');

  assert.equal(
    masked.maskedText,
    "Hi __TAG_1____TAG_2____TAG_3__ __VAR_1__ __VAR_2__ __VAR_3__"
  );
  assert.deepEqual(Object.keys(masked.map), [
    "__TAG_1__",
    "__TAG_2__",
    "__TAG_3__",
    "__VAR_1__",
    "__VAR_2__",
    "__VAR_3__"
  ]);
});

test("prefers the longest placeholder form when patterns overlap", () => {
  const fragments = detectProtectedFragments("Hello {{name}} ${value} {0}");

  assert.deepEqual(
    fragments.map((fragment) => fragment.value),
    ["{{name}}", "${value}", "{0}"]
  );
});

test("throws when a protected token is missing in the AI output", () => {
  const masked = maskProtectedTokens("Hello %s");

  assert.throws(
    () => restoreProtectedTokens("Hallo", masked.tokens),
    (error: unknown) =>
      error instanceof TranslationPipelineError &&
      error.code === "placeholder_mismatch"
  );
});

test("warns when tokens are reordered but can still be restored", () => {
  const masked = maskString("Open <x id=\"1\"/> {name}");
  const result = unmaskString("__VAR_1__ __TAG_1__ offen", masked.map);

  assert.equal(result.text, "{name} <x id=\"1\"/> offen");
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0]?.code, "reordered_tokens");
});

test("throws when a protected token is duplicated in the model output", () => {
  const masked = maskString("Hello %s");

  assert.throws(
    () => unmaskString("Hallo __VAR_1__ __VAR_1__", masked.map),
    (error: unknown) =>
      error instanceof TranslationPipelineError &&
      error.code === "placeholder_mismatch"
  );
});
