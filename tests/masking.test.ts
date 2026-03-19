import test from "node:test";
import assert from "node:assert/strict";

import { restoreProtectedTokens } from "@/lib/masking/restore";
import { maskProtectedTokens } from "@/lib/masking/tokens";
import { TranslationPipelineError } from "@/types/translation";

test("masks XML tags and placeholders and restores them exactly", () => {
  const masked = maskProtectedTokens('Hello <x id="1"/> %1$s {{name}}');

  assert.equal(masked.maskedText, "Hello __TAG_1__ __VAR_1__ __VAR_2__");
  assert.equal(masked.tokens.length, 3);

  const restored = restoreProtectedTokens(
    "Hallo __TAG_1__ __VAR_1__ __VAR_2__",
    masked.tokens
  );

  assert.equal(restored, 'Hallo <x id="1"/> %1$s {{name}}');
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
