import type {
  InsufficientCreditsErrorDetails,
  PipelineErrorCode,
  TranslationApiErrorShape
} from "@/types/translation";

export type TranslationErrorAction = {
  href: string;
  kind: "billing" | "upgrade";
};

export type TranslationUiError = {
  code: PipelineErrorCode;
  message: string;
  insufficientCredits?: InsufficientCreditsErrorDetails;
  actions: TranslationErrorAction[];
};

export function buildTranslationUiError(
  error: TranslationApiErrorShape["error"],
  options?: {
    insufficientCreditsMessage?: (details: InsufficientCreditsErrorDetails) => string;
  }
): TranslationUiError {
  const insufficientCredits = parseInsufficientCreditsErrorDetails(error.details);

  if (error.code === "insufficient_credits" && insufficientCredits) {
    const actions: TranslationErrorAction[] = [];

    if (typeof insufficientCredits.billingPath === "string" && insufficientCredits.billingPath.length > 0) {
      actions.push({
        href: insufficientCredits.billingPath,
        kind: "billing"
      });
    }

    if (typeof insufficientCredits.upgradePath === "string" && insufficientCredits.upgradePath.length > 0) {
      actions.push({
        href: insufficientCredits.upgradePath,
        kind: "upgrade"
      });
    }

    return {
      code: error.code,
      message: options?.insufficientCreditsMessage?.(insufficientCredits) ?? error.message,
      insufficientCredits,
      actions
    };
  }

  return {
    code: error.code,
    message: error.message,
    actions: []
  };
}

function parseInsufficientCreditsErrorDetails(
  value: Record<string, unknown> | undefined
): InsufficientCreditsErrorDetails | undefined {
  if (!value) {
    return undefined;
  }

  const requiredCredits = getFiniteNumber(value.requiredCredits);
  const remainingCredits = getFiniteNumber(value.remainingCredits);
  const creditsLimit = getFiniteNumber(value.creditsLimit);
  const creditsUsed = getFiniteNumber(value.creditsUsed);

  if (
    requiredCredits === null ||
    remainingCredits === null ||
    creditsLimit === null ||
    creditsUsed === null
  ) {
    return undefined;
  }

  return {
    requiredCredits,
    remainingCredits,
    creditsLimit,
    creditsUsed,
    billingPath:
      typeof value.billingPath === "string" && value.billingPath.trim().length > 0
        ? value.billingPath.trim()
        : undefined,
    upgradePath:
      typeof value.upgradePath === "string" && value.upgradePath.trim().length > 0
        ? value.upgradePath.trim()
        : undefined
  };
}

function getFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
