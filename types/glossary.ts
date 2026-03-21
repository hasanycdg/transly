export type GlossaryStatus = "Draft" | "Review" | "Approved" | "Archived";

export interface GlossaryMetricItem {
  label: string;
  value: string;
  meta: string;
}

export interface GlossaryTranslationItem {
  locale: string;
  term: string;
}

export interface GlossaryTermItem {
  id: string;
  source: string;
  sourceLanguage: string;
  translations: GlossaryTranslationItem[];
  translationsLabel: string;
  status: GlossaryStatus;
  project: string;
  projectSlugs: string[];
  collectionId: string | null;
  collectionName: string | null;
  isProtected: boolean;
}

export interface GlossaryCollectionItem {
  id: string;
  name: string;
  count: string;
  detail: string;
}

export interface GlossaryProjectOption {
  id: string;
  slug: string;
  name: string;
}

export interface GlossaryScreenData {
  metrics: GlossaryMetricItem[];
  terms: GlossaryTermItem[];
  collections: GlossaryCollectionItem[];
  projects: GlossaryProjectOption[];
}

export interface NewGlossaryTranslationInput {
  locale: string;
  term: string;
}

export interface NewGlossaryTermInput {
  source: string;
  sourceLanguage: string;
  status: GlossaryStatus;
  collectionId?: string | null;
  projectSlug?: string | null;
  isProtected: boolean;
  translations: NewGlossaryTranslationInput[];
}

export interface ImportGlossaryCsvInput {
  csv: string;
}

export interface ImportedGlossaryTermResult {
  source: string;
  sourceLanguage: string;
}

export interface ImportGlossaryCsvResult {
  importedCount: number;
  collectionCount: number;
  projectLinkCount: number;
  importedTerms: ImportedGlossaryTermResult[];
}
