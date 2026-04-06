export type GlossaryRule = {
  sourceLanguage: string;
  targetLanguage: string;
  sourceTerm: string;
  translatedTerm: string;
  caseSensitive?: boolean;
};

export class GlossaryService {
  async getRules(siteUrl: string, sourceLanguage: string, targetLanguage: string): Promise<GlossaryRule[]> {
    // TODO: Load glossary rules scoped by workspace/site and language pair.
    void siteUrl;
    void sourceLanguage;
    void targetLanguage;
    return [];
  }

  applyRules(text: string, rules: GlossaryRule[]): string {
    // TODO: Apply deterministic glossary substitutions before/after provider calls.
    void rules;
    return text;
  }
}
