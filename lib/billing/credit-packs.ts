export type CreditPackId = "credit_10k" | "credit_30k" | "credit_50k";

export type CreditPackDefinition = {
  id: CreditPackId;
  name: string;
  credits: number;
  priceCents: number;
  description: string;
};

export const BILLING_CREDIT_PACKS: CreditPackDefinition[] = [
  {
    id: "credit_10k",
    name: "Credit 10K",
    credits: 10_000,
    priceCents: 499,
    description: "Top-up for smaller translation bursts near your monthly limit."
  },
  {
    id: "credit_30k",
    name: "Credit 30K",
    credits: 30_000,
    priceCents: 990,
    description: "Balanced top-up for medium-size localization pushes."
  },
  {
    id: "credit_50k",
    name: "Credit 50K",
    credits: 50_000,
    priceCents: 1499,
    description: "Largest top-up to keep high-volume deliveries moving."
  }
];

export function getCreditPackDefinition(packIdOrName: string): CreditPackDefinition | null {
  const normalizedValue = packIdOrName.trim().toLowerCase();

  return (
    BILLING_CREDIT_PACKS.find(
      (pack) => pack.id === normalizedValue || pack.name.trim().toLowerCase() === normalizedValue
    ) ?? null
  );
}
