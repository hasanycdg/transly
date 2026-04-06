import { z } from "zod";

const languageCodeSchema = z
  .string()
  .trim()
  .min(2)
  .max(16)
  .regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/i, "Language must use a locale-like format, e.g. en or de-DE.");

const translationOptionsSchema = z
  .object({
    translateSlugs: z.boolean().optional(),
    translateUrls: z.boolean().optional()
  })
  .optional();

const commonPayloadSchema = z.object({
  siteUrl: z.string().trim().url().max(2048),
  postId: z.union([z.string().trim().min(1).max(128), z.number().int(), z.bigint()]).transform((value) => String(value)),
  postType: z.string().trim().min(1).max(128),
  sourceLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
  title: z.string().max(100_000).optional(),
  excerpt: z.string().max(200_000).optional(),
  content: z.string().max(2_000_000).optional(),
  meta: z.record(z.unknown()).optional(),
  acf: z.record(z.unknown()).optional(),
  raw: z.union([z.record(z.unknown()), z.array(z.unknown())]).optional(),
  options: translationOptionsSchema
});

export const translateRequestSchema = commonPayloadSchema.superRefine((value, ctx) => {
  const hasTranslatableSegment =
    typeof value.title === "string" ||
    typeof value.excerpt === "string" ||
    typeof value.content === "string" ||
    value.meta !== undefined ||
    value.acf !== undefined ||
    value.raw !== undefined;

  if (!hasTranslatableSegment) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [],
      message: "At least one translatable segment is required (title, excerpt, content, meta, acf, raw)."
    });
  }
});

export const bulkTranslateRequestSchema = z.object({
  jobs: z.array(translateRequestSchema).min(1).max(25),
  continueOnError: z.boolean().default(true)
});

export type TranslateRequestDto = z.infer<typeof translateRequestSchema>;
export type BulkTranslateRequestDto = z.infer<typeof bulkTranslateRequestSchema>;
