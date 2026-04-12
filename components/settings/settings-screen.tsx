"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { WorkspaceMembersPanel } from "@/components/settings/workspace-members-panel";
import { getAppLocaleOptions } from "@/lib/i18n";
import { getLanguageOptions } from "@/lib/languages";
import { createClient } from "@/lib/supabase/client";
import type {
  SettingsFilenameFormat,
  SettingsPreferencesData,
  SettingsProfileData,
  SettingsQualityPreset,
  SettingsScreenData,
  SettingsSectionId,
  SettingsToneStyle,
  SettingsTranslationData
} from "@/types/workspace";

type SettingsScreenProps = {
  data: SettingsScreenData;
  initialSection?: SettingsSectionId;
};

type SectionMeta = {
  id: SettingsSectionId;
  label: string;
  eyebrow: string;
  sidebarDescription: string;
  heading: string;
  description: string;
  icon: (props: IconProps) => ReactNode;
};

type IconProps = {
  className?: string;
};

const SECTION_ITEMS: SectionMeta[] = [
  {
    id: "profile",
    label: "Profile",
    eyebrow: "/ Profile",
    sidebarDescription: "Name, email, and password access.",
    heading: "Profile",
    description: "Keep your personal account details simple, clean, and easy to update.",
    icon: ProfileIcon
  },
  {
    id: "translation",
    label: "Translation",
    eyebrow: "/ Translation Settings",
    sidebarDescription: "Language, tone, tags, glossary, and AI defaults.",
    heading: "Translation Settings",
    description: "Define the defaults Translayr should apply before a project or file introduces its own rules.",
    icon: TranslationIcon
  },
  {
    id: "preferences",
    label: "Preferences",
    eyebrow: "/ Preferences",
    sidebarDescription: "Delivery and export naming defaults.",
    heading: "Preferences",
    description: "Small delivery defaults that reduce repetitive setup after each translation run.",
    icon: PreferencesIcon
  },
  {
    id: "danger",
    label: "Danger Zone",
    eyebrow: "/ Danger Zone",
    sidebarDescription: "Permanent account actions.",
    heading: "Danger Zone",
    description: "Sensitive actions stay visually separated from the rest of your workspace settings.",
    icon: DangerIcon
  }
];

const TONE_OPTIONS: Array<{ value: SettingsToneStyle; description: string }> = [
  { value: "Neutral", description: "Balanced and clear for general product copy." },
  { value: "Formal", description: "More structured language with a restrained tone." },
  { value: "Informal", description: "Light, direct phrasing for conversational flows." },
  { value: "Marketing", description: "Sharper wording for launch, growth, and campaign copy." },
  { value: "Technical", description: "Precise language for docs, UI strings, and specs." }
];

const AI_BEHAVIOR_OPTIONS: Array<{ value: SettingsQualityPreset; description: string }> = [
  { value: "Fast", description: "Prioritize lower latency for quick iteration and previews." },
  { value: "Balanced", description: "A calm middle ground for most SaaS translation work." },
  { value: "High Quality", description: "Favor stronger phrasing and nuance over raw speed." }
];

const FILENAME_OPTIONS: Array<{ value: SettingsFilenameFormat; description: string }> = [
  { value: "Original + target locale", description: "Example: homepage.de.xlf" },
  { value: "Original + source + target", description: "Example: homepage.en-de.xlf" },
  { value: "Project slug + locale", description: "Example: translayr-web.de.xlf" }
];

const INPUT_CLASS_NAME =
  "h-11 w-full rounded-[12px] border border-[var(--border)] bg-white px-3 text-[13px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]";

export function SettingsScreen({ data, initialSection = "translation" }: SettingsScreenProps) {
  const providerLocale = useAppLocale();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [draft, setDraft] = useState(data);
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(initialSection);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const screenLocale = draft.preferences.locale ?? providerLocale;
  const languageOptions = getLanguageOptions(screenLocale, [
    draft.translation.sourceLanguage,
    draft.translation.targetLanguage
  ]);
  const localeOptions = getAppLocaleOptions(screenLocale);
  const toneOptions =
    screenLocale === "de"
      ? TONE_OPTIONS.map((option) => ({
          ...option,
          description:
            option.value === "Neutral"
              ? "Ausgewogen und klar für allgemeine Produkttexte."
              : option.value === "Formal"
                ? "Strukturiertere Sprache mit zurückhaltendem Ton."
                : option.value === "Informal"
                  ? "Leichte, direkte Formulierungen für konversationelle Flows."
                  : option.value === "Marketing"
                    ? "Schärfere Formulierungen für Launch-, Growth- und Kampagnen-Texte."
                    : "Präzise Sprache für Doku, UI-Texte und Spezifikationen."
        }))
      : TONE_OPTIONS;
  const aiBehaviorOptions =
    screenLocale === "de"
      ? AI_BEHAVIOR_OPTIONS.map((option) => ({
          ...option,
          description:
            option.value === "Fast"
              ? "Niedrige Latenz für schnelle Iteration und Vorschauen priorisieren."
              : option.value === "Balanced"
                ? "Ein ruhiger Mittelweg für die meisten SaaS-Übersetzungsaufgaben."
                : "Bessere Formulierungen und Nuancen statt maximaler Geschwindigkeit."
        }))
      : AI_BEHAVIOR_OPTIONS;
  const filenameOptions =
    screenLocale === "de"
      ? FILENAME_OPTIONS.map((option) => ({
          ...option,
          description:
            option.value === "Original + target locale"
              ? "Beispiel: homepage.de.xlf"
              : option.value === "Original + source + target"
                ? "Beispiel: homepage.en-de.xlf"
                : "Beispiel: translayr-web.de.xlf"
        }))
      : FILENAME_OPTIONS;
  const sectionItems =
    screenLocale === "de"
      ? SECTION_ITEMS.map((section) => ({
          ...section,
          label:
            section.id === "profile"
              ? "Profil"
              : section.id === "translation"
                ? "Übersetzung"
                : section.id === "preferences"
                  ? "Präferenzen"
                  : "Gefahrenzone",
          eyebrow:
            section.id === "profile"
              ? "/ Profil"
              : section.id === "translation"
                ? "/ Übersetzung"
                : section.id === "preferences"
                  ? "/ Präferenzen"
                  : "/ Gefahrenzone",
          sidebarDescription:
            section.id === "profile"
              ? "Name, E-Mail und Passwortzugang."
              : section.id === "translation"
                ? "Sprache, Ton, Tags, Glossar und KI-Standards."
                : section.id === "preferences"
                  ? "Liefer- und Export-Standards."
                  : "Dauerhafte Kontoaktionen.",
          heading:
            section.id === "profile"
              ? "Profil"
              : section.id === "translation"
                ? "Übersetzungseinstellungen"
                : section.id === "preferences"
                  ? "Präferenzen"
                  : "Gefahrenzone",
          description:
            section.id === "profile"
              ? "Halte deine Kontodaten einfach, klar und leicht aktualisierbar."
              : section.id === "translation"
                ? "Lege die Standards fest, die Translayr anwenden soll, bevor ein Projekt oder eine Datei eigene Regeln mitbringt."
                : section.id === "preferences"
                  ? "Kleine Liefer-Standards, die wiederholtes Setup nach jeder Übersetzung reduzieren."
                  : "Sensible Aktionen bleiben visuell vom Rest der Workspace-Einstellungen getrennt."
        }))
      : SECTION_ITEMS;
  const activeSectionMeta = sectionItems.find((section) => section.id === activeSection) ?? sectionItems[0];
  const copy =
    screenLocale === "de"
      ? {
          saveSuccess: "Einstellungen gespeichert.",
          saveError: "Einstellungen konnten nicht gespeichert werden.",
          settingsEyebrow: "/ Einstellungen",
          heading: "Einstellungen",
          intro:
            "Eine fokussierte Oberfläche für Kontodaten, Übersetzungsstandards, Liefer-Präferenzen und sensible Workspace-Aktionen.",
          reset: "Zurücksetzen",
          saving: "Speichert...",
          saveChanges: "Änderungen speichern",
          sections: "/ Bereiche",
          sectionsIntro: "Minimale Kontrollen, gruppiert in vier klare Einstellungsbereiche.",
          language: "Sprache",
          appLanguage: "App-Sprache",
          appLanguageDesc: "Lege fest, ob die Oberfläche standardmäßig auf Englisch oder Deutsch erscheinen soll.",
          keepSimple: "Einfach halten"
        }
      : {
          saveSuccess: "Settings saved.",
          saveError: "Settings could not be saved.",
          settingsEyebrow: "/ Settings",
          heading: "Settings",
          intro:
            "A focused control surface for account details, translation defaults, delivery preferences, and sensitive workspace actions.",
          reset: "Reset",
          saving: "Saving...",
          saveChanges: "Save changes",
          sections: "/ Sections",
          sectionsIntro: "Minimal controls, grouped into four clear settings areas.",
          language: "Language",
          appLanguage: "App language",
          appLanguageDesc: "Choose whether the interface should default to English or German.",
          keepSimple: "Keep it simple"
        };
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(data);

  useEffect(() => {
    setDraft(data);
  }, [data]);

  useEffect(() => {
    if (!saveMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSaveMessage(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [saveMessage]);

  async function handleSave() {
    if (!hasChanges || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(draft)
      });

      const payload = (await response.json().catch(() => null)) as SettingsScreenData | { error?: string } | null;

      if (!response.ok || !isSettingsPayload(payload)) {
        throw new Error(payload && "error" in payload ? payload.error ?? "Settings could not be saved." : "Settings could not be saved.");
      }

      setDraft(payload);
      setSaveMessage(copy.saveSuccess);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  function updateProfile<Key extends keyof SettingsProfileData>(key: Key, value: SettingsProfileData[Key]) {
    setDraft((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [key]: value
      }
    }));
  }

  function updateTranslation<Key extends keyof SettingsTranslationData>(
    key: Key,
    value: SettingsTranslationData[Key]
  ) {
    setDraft((current) => ({
      ...current,
      translation: {
        ...current.translation,
        [key]: value
      }
    }));
  }

  function updatePreferences<Key extends keyof SettingsPreferencesData>(
    key: Key,
    value: SettingsPreferencesData[Key]
  ) {
    setDraft((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [key]: value
      }
    }));
  }

  async function handlePasswordReset() {
    if (isSendingPasswordReset) {
      return;
    }

    try {
      setIsSendingPasswordReset(true);
      setErrorMessage(null);
      setSaveMessage(null);
      const appUrl = getClientAppUrl();

      const { error } = await supabase.auth.resetPasswordForEmail(draft.profile.email, {
        redirectTo: `${appUrl}/reset-password`
      });

      if (error) {
        throw error;
      }

      setSaveMessage(
        screenLocale === "de"
          ? "Ein Passwort-Reset-Link wurde an die hinterlegte E-Mail-Adresse gesendet."
          : "A password reset link has been sent to the saved email address."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : screenLocale === "de"
            ? "Passwort-Reset konnte nicht gestartet werden."
            : "Password reset could not be started."
      );
    } finally {
      setIsSendingPasswordReset(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="flex flex-col gap-4 px-7 py-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[680px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.settingsEyebrow}
            </span>
            <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
              {copy.heading}
            </h1>
            <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">
              {copy.intro}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-[11.5px] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />
              {activeSectionMeta.label}
            </div>
            <button
              type="button"
              onClick={() => {
                setDraft(data);
                setErrorMessage(null);
                setSaveMessage(null);
              }}
              disabled={!hasChanges || isSaving}
              className="rounded-[12px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {copy.reset}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSave();
              }}
              disabled={!hasChanges || isSaving}
              className="rounded-[12px] bg-[var(--foreground)] px-4 py-2.5 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving ? copy.saving : copy.saveChanges}
            </button>
          </div>
        </div>
      </header>

      <div className="px-7 py-6">
        {saveMessage ? (
          <div className="mb-4 rounded-[16px] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-[12.5px] text-[var(--success)]">
            {saveMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-4 rounded-[16px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[12.5px] text-[var(--danger)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="self-start xl:sticky xl:top-[102px]">
            <div className="rounded-[18px] border border-[var(--border)] bg-white p-3">
              <div className="border-b border-[var(--border-light)] px-3 pb-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">{copy.sections}</p>
                <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">{copy.sectionsIntro}</p>
              </div>

              <div className="space-y-1 pt-3">
                {sectionItems.map((section) => {
                  const Icon = section.icon;
                  const active = section.id === activeSection;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        startTransition(() => setActiveSection(section.id));
                      }}
                      className={[
                        "flex w-full items-start gap-3 rounded-[14px] border px-3 py-3 text-left transition",
                        active
                          ? "border-[var(--border)] bg-[var(--background)]"
                          : "border-transparent bg-white hover:border-[var(--border-light)] hover:bg-[var(--background-strong)]"
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mt-[2px] flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border transition",
                          active
                            ? "border-[var(--border)] bg-white text-[var(--foreground)]"
                            : "border-[var(--border-light)] bg-[var(--background)] text-[var(--muted)]"
                        ].join(" ")}
                      >
                        <Icon className="h-[15px] w-[15px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-[var(--foreground)]">{section.label}</span>
                        <span className="mt-1 block text-[11.5px] leading-5 text-[var(--muted)]">
                          {section.sidebarDescription}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className={["min-w-0 transition-opacity", isPending ? "opacity-70" : "opacity-100"].join(" ")}>
            <SectionIntroCard
              eyebrow={activeSectionMeta.eyebrow}
              title={activeSectionMeta.heading}
              description={activeSectionMeta.description}
            />

            <div className="mt-5">
              {activeSection === "profile" ? (
                <div className="space-y-5">
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)]">
                    <SettingsCard
                      eyebrow="/ Identity"
                      title="Personal details"
                      description={
                        screenLocale === "de"
                          ? "Halte deine Kontodaten leichtgewichtig und im ganzen Workspace gut lesbar."
                          : "Keep your account details lightweight and easy to scan across the workspace."
                      }
                    >
                      <div className="space-y-5">
                        <FieldBlock
                          label="Name"
                          description="Shown in internal activity, handoff notes, and review ownership."
                        >
                          <input
                            type="text"
                            value={draft.profile.name}
                            onChange={(event) => updateProfile("name", event.target.value)}
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldBlock>

                        <FieldBlock
                          label="Email"
                          description="Primary login address for password recovery and account access."
                        >
                          <input
                            type="email"
                            value={draft.profile.email}
                            onChange={(event) => updateProfile("email", event.target.value)}
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldBlock>

                        <FieldBlock
                          label={screenLocale === "de" ? "Firma" : "Company"}
                          description={
                            screenLocale === "de"
                              ? "Name der Firma oder des Teams, der für Rechnungen und Workspace-Kontext genutzt wird."
                              : "Company or team name used for billing context and workspace identity."
                          }
                        >
                          <input
                            type="text"
                            value={draft.profile.company}
                            onChange={(event) => updateProfile("company", event.target.value)}
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldBlock>

                        <FieldBlock
                          label={screenLocale === "de" ? "Rechnungsadresse" : "Billing address"}
                          description={
                            screenLocale === "de"
                              ? "Mehrzeilige Adresse für Rechnungsversand und interne Billing-Prozesse."
                              : "Multi-line address for invoice handling and billing operations."
                          }
                        >
                          <textarea
                            value={draft.profile.billingAddress}
                            onChange={(event) => updateProfile("billingAddress", event.target.value)}
                            rows={4}
                            className={`${INPUT_CLASS_NAME} min-h-[112px] py-3`}
                          />
                        </FieldBlock>
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      eyebrow="/ Security"
                      title="Password"
                      description="Simple access controls with no extra noise."
                    >
                      <div className="space-y-4">
                        <p className="text-[12px] leading-6 text-[var(--muted)]">
                          Change your password from the secure account flow whenever you need to rotate credentials.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            void handlePasswordReset();
                          }}
                          disabled={isSendingPasswordReset}
                          className="rounded-[12px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
                        >
                          {isSendingPasswordReset
                            ? screenLocale === "de"
                              ? "Link wird gesendet..."
                              : "Sending link..."
                            : screenLocale === "de"
                              ? "Passwort ändern"
                              : "Change password"}
                        </button>
                      </div>
                    </SettingsCard>
                  </div>

                  <WorkspaceMembersPanel />
                </div>
              ) : null}

              {activeSection === "translation" ? (
                <div className="space-y-5">
                  <div className="grid gap-5 xl:grid-cols-2">
                    <SettingsCard
                      eyebrow="/ Language"
                      title="Language defaults"
                      description="Choose how new translation runs should detect source content and where they should land by default."
                    >
                      <div className="space-y-5">
                        <SettingRow
                          label="Default source language"
                          description="Keep Translayr on auto-detect, or lock in a manual fallback for predictable imports."
                          control={
                            <SegmentedControl
                              value={draft.translation.sourceLanguageMode}
                              options={[
                                { value: "auto", label: "Auto detect" },
                                { value: "manual", label: "Manual" }
                              ]}
                              onChange={(value) => updateTranslation("sourceLanguageMode", value)}
                            />
                          }
                        />

                        <SettingRow
                          label="Manual source language"
                          description="Only used when source detection is switched from automatic to manual."
                          control={
                            <SelectField
                              value={draft.translation.sourceLanguage}
                              onChange={(value) => updateTranslation("sourceLanguage", value)}
                              options={languageOptions}
                              disabled={draft.translation.sourceLanguageMode === "auto"}
                            />
                          }
                        />

                        <SettingRow
                          label="Default target language"
                          description="Applied to new files when no project-level destination locale is already defined."
                          control={
                            <SelectField
                              value={draft.translation.targetLanguage}
                              onChange={(value) => updateTranslation("targetLanguage", value)}
                              options={languageOptions}
                            />
                          }
                        />
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      eyebrow="/ Tone & Style"
                      title="Tone profile"
                      description="Set a default voice for AI output whenever a project does not provide a tone override."
                    >
                      <FieldBlock
                        label="Default tone"
                        description="Choose the tone Translayr should bias toward in product copy, docs, and review suggestions."
                      >
                        <div className="flex flex-wrap gap-2">
                          {toneOptions.map((option) => {
                            const active = option.value === draft.translation.toneStyle;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => updateTranslation("toneStyle", option.value)}
                                className={[
                                  "rounded-full border px-3 py-2 text-[12px] font-medium transition",
                                  active
                                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                                    : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                                ].join(" ")}
                              >
                                {translateSettingsText(option.value, screenLocale)}
                              </button>
                            );
                          })}
                        </div>
                      </FieldBlock>

                      <div className="mt-5 rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-3">
                        <p className="text-[11.5px] leading-5 text-[var(--muted)]">
                          {toneOptions.find((option) => option.value === draft.translation.toneStyle)?.description}
                        </p>
                      </div>
                    </SettingsCard>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <SettingsCard
                      eyebrow="/ Tag Safety"
                      title="Markup protection"
                      description="Guard placeholders and inline markup before translated files leave the pipeline."
                    >
                      <div className="space-y-5">
                        <SettingRow
                          label="Strict tag protection"
                          description="Preserve placeholders, inline tags, and protected variables during generation."
                          control={
                            <div className="flex justify-start xl:justify-end">
                              <Toggle
                                checked={draft.translation.strictTagProtection}
                                onToggle={() =>
                                  updateTranslation("strictTagProtection", !draft.translation.strictTagProtection)
                                }
                              />
                            </div>
                          }
                        />

                        <SettingRow
                          label="Fail on tag mismatch"
                          description="Stop a translation from continuing when source and target markup drift apart."
                          control={
                            <div className="flex justify-start xl:justify-end">
                              <Toggle
                                checked={draft.translation.failOnTagMismatch}
                                onToggle={() =>
                                  updateTranslation("failOnTagMismatch", !draft.translation.failOnTagMismatch)
                                }
                              />
                            </div>
                          }
                        />
                      </div>
                    </SettingsCard>

                    <SettingsCard
                      eyebrow="/ Glossary Behavior"
                      title="Terminology defaults"
                      description="Control how aggressively approved glossary terms should guide AI output."
                    >
                      <div className="space-y-5">
                        <SettingRow
                          label="Use glossary automatically"
                          description="Inject approved terms whenever source content matches a glossary entry."
                          control={
                            <div className="flex justify-start xl:justify-end">
                              <Toggle
                                checked={draft.translation.useGlossaryAutomatically}
                                onToggle={() =>
                                  updateTranslation(
                                    "useGlossaryAutomatically",
                                    !draft.translation.useGlossaryAutomatically
                                  )
                                }
                              />
                            </div>
                          }
                        />

                        <SettingRow
                          label="Strict glossary mode"
                          description="Prefer glossary-approved wording even when the model suggests softer alternatives."
                          control={
                            <div className="flex justify-start xl:justify-end">
                              <Toggle
                                checked={draft.translation.strictGlossaryMode}
                                onToggle={() =>
                                  updateTranslation("strictGlossaryMode", !draft.translation.strictGlossaryMode)
                                }
                              />
                            </div>
                          }
                        />
                      </div>
                    </SettingsCard>
                  </div>

                  <SettingsCard
                    eyebrow="/ AI Behavior"
                    title="Speed vs quality"
                    description="Choose how aggressively Translayr should trade response time for more refined output."
                  >
                    <FieldBlock
                      label="Translation behavior"
                      description="A higher quality setting can improve nuance, while faster settings keep iteration tight."
                    >
                      <div className="grid gap-3 md:grid-cols-3">
                        {aiBehaviorOptions.map((option) => {
                          const active = option.value === draft.translation.aiBehavior;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateTranslation("aiBehavior", option.value)}
                              className={[
                                "rounded-[14px] border px-4 py-4 text-left transition",
                                active
                                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                                  : "border-[var(--border)] bg-white hover:border-[var(--border-strong)]"
                              ].join(" ")}
                            >
                              <span className="block text-[13px] font-medium">
                                {translateSettingsText(option.value, screenLocale)}
                              </span>
                              <span
                                className={[
                                  "mt-2 block text-[11.5px] leading-5",
                                  active ? "text-white/75" : "text-[var(--muted)]"
                                ].join(" ")}
                              >
                                {option.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </FieldBlock>
                  </SettingsCard>
                </div>
              ) : null}

              {activeSection === "preferences" ? (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.06fr)_minmax(280px,0.94fr)]">
                  <SettingsCard
                    eyebrow={screenLocale === "de" ? "/ Präferenzen" : "/ Preferences"}
                    title={screenLocale === "de" ? "Liefer-Standards" : "Delivery defaults"}
                    description={
                      screenLocale === "de"
                        ? "Halte Exporte vorhersehbar, ohne die Seite mit wenig hilfreichen Optionen zu überladen."
                        : "Keep exports predictable without crowding the page with low-value controls."
                    }
                  >
                    <div className="space-y-5">
                      <SettingRow
                        label={copy.appLanguage}
                        description={copy.appLanguageDesc}
                        control={
                          <SelectField
                            value={draft.preferences.locale}
                            onChange={(value) =>
                              updatePreferences("locale", value as SettingsPreferencesData["locale"])
                            }
                            options={localeOptions}
                          />
                        }
                      />

                      <SettingRow
                        label={
                          screenLocale === "de"
                            ? "Nach Übersetzung automatisch herunterladen"
                            : "Auto-download after translation"
                        }
                        description={
                          screenLocale === "de"
                            ? "Lade die fertige Datei automatisch herunter, sobald ein Übersetzungsjob abgeschlossen ist."
                            : "Download the finished file automatically as soon as a translation job completes."
                        }
                        control={
                          <div className="flex justify-start xl:justify-end">
                            <Toggle
                              checked={draft.preferences.autoDownloadAfterTranslation}
                              onToggle={() =>
                                updatePreferences(
                                  "autoDownloadAfterTranslation",
                                  !draft.preferences.autoDownloadAfterTranslation
                                )
                              }
                            />
                          </div>
                        }
                      />

                      <SettingRow
                        label={screenLocale === "de" ? "Standard-Dateinamensformat" : "Default filename format"}
                        description={
                          screenLocale === "de"
                            ? "Lege fest, wie exportierte Dateien für Übersetzer, Reviewer und Übergaben benannt werden sollen."
                            : "Choose how exported files should be named for translators, reviewers, and handoff."
                        }
                        control={
                          <SelectField
                            value={draft.preferences.defaultFilenameFormat}
                            onChange={(value) =>
                              updatePreferences("defaultFilenameFormat", value as SettingsFilenameFormat)
                            }
                            options={filenameOptions.map((option) => ({
                              code: option.value,
                              label: translateSettingsText(option.value, screenLocale)
                            }))}
                          />
                        }
                      />
                    </div>
                  </SettingsCard>

                  <SettingsCard
                    eyebrow={screenLocale === "de" ? "/ Hinweise" : "/ Notes"}
                    title={copy.keepSimple}
                    description={
                      screenLocale === "de"
                        ? "Hier gehören nur die Standards hin, die du voraussichtlich oft anfasst."
                        : "Only the defaults you are likely to touch often belong here."
                    }
                  >
                    <div className="space-y-4 text-[12px] leading-6 text-[var(--muted)]">
                      <p>
                        {screenLocale === "de"
                          ? "Auto-Download ist nützlich für schnelle QA-Schleifen und wiederkehrende dateibasierte Review-Flows."
                          : "Auto-download is useful for quick QA loops and repetitive file-based review flows."}
                      </p>
                      <p>
                        {screenLocale === "de"
                          ? "Die Dateinamenslogik bleibt bewusst schmal, damit Exporte projektübergreifend erkennbar bleiben, ohne unnötige Komplexität einzuführen."
                          : "Filename formatting stays intentionally narrow so exports remain recognizable across projects without adding unnecessary complexity."}
                      </p>
                      <div className="rounded-[14px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-3">
                        <p className="text-[11.5px] leading-5 text-[var(--muted)]">
                          {filenameOptions.find((option) => option.value === draft.preferences.defaultFilenameFormat)
                            ?.description ??
                            (screenLocale === "de"
                              ? "Wähle einen vorhersehbaren Export-Namensstil."
                              : "Choose a predictable export naming style.")}
                        </p>
                      </div>
                    </div>
                  </SettingsCard>
                </div>
              ) : null}

              {activeSection === "danger" ? (
                <SettingsCard
                  eyebrow="/ Danger Zone"
                  title={draft.dangerZone.title}
                  description={draft.dangerZone.description}
                  className="border-[var(--danger-border)] bg-[var(--danger-bg)]"
                >
                  <div className="flex flex-col gap-4 rounded-[14px] border border-[var(--danger-border)] bg-white px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-[620px]">
                      <p className="text-[13px] font-medium text-[var(--foreground)]">Permanent action</p>
                      <p className="mt-1 text-[12px] leading-6 text-[var(--muted)]">
                        This removes your personal account access and clears your settings footprint from Translayr.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-[12px] border border-[var(--danger)] bg-[var(--danger)] px-4 py-2.5 text-[12.5px] font-medium text-white transition hover:opacity-90"
                    >
                      {draft.dangerZone.actionLabel}
                    </button>
                  </div>
                </SettingsCard>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionIntroCard({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  const locale = useAppLocale();
  return (
    <section className="rounded-[18px] border border-[var(--border)] bg-white px-6 py-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
        {translateSettingsText(eyebrow, locale)}
      </p>
      <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
        {translateSettingsText(title, locale)}
      </h2>
      <p className="mt-2 max-w-[720px] text-[12.5px] leading-6 text-[var(--muted)]">
        {translateSettingsText(description, locale)}
      </p>
    </section>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
  className = ""
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  const locale = useAppLocale();
  return (
    <section className={["rounded-[18px] border border-[var(--border)] bg-white px-5 py-5 sm:px-6", className].join(" ")}>
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
        {translateSettingsText(eyebrow, locale)}
      </p>
      <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
        {translateSettingsText(title, locale)}
      </h3>
      <p className="mt-2 max-w-[680px] text-[12px] leading-6 text-[var(--muted)]">
        {translateSettingsText(description, locale)}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FieldBlock({
  label,
  description,
  children
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  const locale = useAppLocale();
  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--foreground)]">{translateSettingsText(label, locale)}</p>
      <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">
        {translateSettingsText(description, locale)}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control
}: {
  label: string;
  description: string;
  control: ReactNode;
}) {
  const locale = useAppLocale();
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border-light)] pt-5 first:border-t-0 first:pt-0 xl:flex-row xl:items-center xl:justify-between">
      <div className="max-w-[560px]">
        <p className="text-[13px] font-medium text-[var(--foreground)]">{translateSettingsText(label, locale)}</p>
        <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">
          {translateSettingsText(description, locale)}
        </p>
      </div>
      <div className="w-full xl:w-[280px]">{control}</div>
    </div>
  );
}

function SegmentedControl({
  value,
  options,
  onChange
}: {
  value: "auto" | "manual";
  options: Array<{ value: "auto" | "manual"; label: string }>;
  onChange: (value: "auto" | "manual") => void;
}) {
  const locale = useAppLocale();
  return (
    <div className="inline-flex w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-1">
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "flex-1 rounded-[10px] px-3 py-2 text-[12px] font-medium transition",
              active ? "bg-white text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            ].join(" ")}
          >
            {translateSettingsText(option.label, locale)}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onToggle
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={[
        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
        checked ? "border-[var(--foreground)] bg-[var(--foreground)]" : "border-[var(--border)] bg-white"
      ].join(" ")}
    >
      <span
        className={[
          "absolute h-5 w-5 rounded-full bg-white transition",
          checked ? "left-[23px]" : "left-[3px]"
        ].join(" ")}
      />
    </button>
  );
}

function SelectField({
  value,
  onChange,
  options,
  disabled = false
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ code: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={[
          INPUT_CLASS_NAME,
          "appearance-none pr-10",
          disabled ? "cursor-not-allowed bg-[var(--background)] text-[var(--muted-soft)]" : ""
        ].join(" ")}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-soft)]">
        <ChevronDownIcon className="h-4 w-4" />
      </span>
    </div>
  );
}

function getClientAppUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  throw new Error("Unable to resolve browser origin for password reset redirect.");
}

function ProfileIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 13c.7-2 2.4-3 4.5-3s3.8 1 4.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TranslationIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 4h7M6.5 4v1.2c0 2.3-1.1 4.3-3.1 5.8M8 4c.4 1.3 1.2 2.4 2.2 3.3M9.8 11h3.2M11.4 7.8l2.1 5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PreferencesIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M8 2.8v10.4M3.2 5.4H8m0 5.2h4.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="5.4" r="1.6" fill="currentColor" />
      <circle cx="8" cy="10.6" r="1.6" fill="currentColor" />
    </svg>
  );
}

function DangerIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M8 2.5 13 12H3L8 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 6v2.8M8 10.8h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}


function translateSettingsText(value: string, locale: string) {
  if (locale !== "de") {
    return value;
  }

  const translations: Record<string, string> = {
    "/ Identity": "/ Identität",
    "Personal details": "Persönliche Daten",
    "Keep your account details lightweight and easy to scan across the workspace.":
      "Halte deine Kontodaten leichtgewichtig und im ganzen Workspace gut lesbar.",
    Name: "Name",
    "Shown in internal activity, handoff notes, and review ownership.":
      "Wird in internen Aktivitäten, Übergabenotizen und Review-Zuständigkeiten angezeigt.",
    Email: "E-Mail",
    "Primary login address for password recovery and account access.":
      "Primäre Login-Adresse für Passwort-Wiederherstellung und den Kontozugriff.",
    "/ Security": "/ Sicherheit",
    Password: "Passwort",
    "Simple access controls with no extra noise.": "Einfache Zugriffskontrollen ohne unnötigen Ballast.",
    "Change your password from the secure account flow whenever you need to rotate credentials.":
      "Ändere dein Passwort im sicheren Kontofluss, sobald du deine Zugangsdaten rotieren musst.",
    "/ Language": "/ Sprache",
    "Language defaults": "Sprach-Standards",
    "Choose how new translation runs should detect source content and where they should land by default.":
      "Lege fest, wie neue Übersetzungsläufe Quellinhalte erkennen und wohin sie standardmäßig gehen sollen.",
    "Default source language": "Standard-Quellsprache",
    "Keep Translayr on auto-detect, or lock in a manual fallback for predictable imports.":
      "Lass Translayr bei der Auto-Erkennung oder setze eine manuelle Fallback-Sprache für berechenbare Importe.",
    "Auto detect": "Automatisch erkennen",
    Manual: "Manuell",
    "Manual source language": "Manuelle Quellsprache",
    "Only used when source detection is switched from automatic to manual.":
      "Wird nur verwendet, wenn die Quellerkennung von automatisch auf manuell umgestellt wird.",
    "Default target language": "Standard-Zielsprache",
    "Applied to new files when no project-level destination locale is already defined.":
      "Wird auf neue Dateien angewendet, wenn keine Ziel-Sprache auf Projektebene festgelegt ist.",
    "/ Tone & Style": "/ Ton & Stil",
    "Tone profile": "Ton-Profil",
    "Set a default voice for AI output whenever a project does not provide a tone override.":
      "Lege eine Standard-Stimme für KI-Ausgaben fest, wenn ein Projekt keinen eigenen Ton vorgibt.",
    "Default tone": "Standard-Ton",
    "Choose the tone Translayr should bias toward in product copy, docs, and review suggestions.":
      "Wähle den Ton, den Translayr bei Produkttexten, Doku und Review-Vorschlägen bevorzugen soll.",
    Neutral: "Neutral",
    Formal: "Formal",
    Informal: "Informell",
    Marketing: "Marketing",
    Technical: "Technisch",
    "/ Tag Safety": "/ Tag-Sicherheit",
    "Markup protection": "Markup-Schutz",
    "Guard placeholders and inline markup before translated files leave the pipeline.":
      "Schütze Platzhalter und Inline-Markup, bevor übersetzte Dateien die Pipeline verlassen.",
    "Strict tag protection": "Strikter Tag-Schutz",
    "Preserve placeholders, inline tags, and protected variables during generation.":
      "Erhält Platzhalter, Inline-Tags und geschützte Variablen während der Generierung.",
    "Fail on tag mismatch": "Bei Tag-Abweichung abbrechen",
    "Stop a translation from continuing when source and target markup drift apart.":
      "Stoppt eine Übersetzung, wenn Quell- und Ziel-Markup auseinanderlaufen.",
    "/ Glossary Behavior": "/ Glossar-Verhalten",
    "Terminology defaults": "Terminologie-Standards",
    "Control how aggressively approved glossary terms should guide AI output.":
      "Lege fest, wie stark freigegebene Glossarbegriffe die KI-Ausgabe steuern sollen.",
    "Use glossary automatically": "Glossar automatisch verwenden",
    "Inject approved terms whenever source content matches a glossary entry.":
      "Fügt freigegebene Begriffe ein, sobald der Quellinhalt zu einem Glossareintrag passt.",
    "Strict glossary mode": "Strikter Glossar-Modus",
    "Prefer glossary-approved wording even when the model suggests softer alternatives.":
      "Bevorzugt Glossar-Formulierungen, auch wenn das Modell weichere Alternativen vorschlägt.",
    "/ AI Behavior": "/ KI-Verhalten",
    "Speed vs quality": "Geschwindigkeit vs. Qualität",
    "Choose how aggressively Translayr should trade response time for more refined output.":
      "Lege fest, wie stark Translayr Reaktionszeit gegen verfeinerte Ausgabe eintauschen soll.",
    "Translation behavior": "Übersetzungsverhalten",
    "A higher quality setting can improve nuance, while faster settings keep iteration tight.":
      "Eine höhere Qualitätsstufe kann Nuancen verbessern, schnellere Stufen halten die Iteration eng.",
    Fast: "Schnell",
    Balanced: "Ausgewogen",
    "High Quality": "Hohe Qualität",
    "/ Contact": "/ Kontakt",
    "Support channels": "Support-Kanäle",
    "Use the fastest path depending on whether you need product help, operational clarity, or account assistance.":
      "Nutze den schnellsten Weg, je nachdem ob du Produkthilfe, operative Klarheit oder Konto-Unterstützung brauchst.",
    "Email support": "Support per E-Mail",
    "Best for account questions, product issues, and workflow guidance.":
      "Am besten für Kontofragen, Produktprobleme und Workflow-Hilfe.",
    "Typical response within one business day.": "Übliche Antwort innerhalb eines Werktags.",
    "Priority channel": "Prioritätskanal",
    "For plan-specific escalations and critical production blockers.":
      "Für planspezifische Eskalationen und kritische Produktions-Blocker.",
    "Requests are routed through your workspace contact email.":
      "Anfragen werden über deine Workspace-Kontakt-E-Mail geroutet.",
    "Use account email": "Konto-E-Mail verwenden",
    "/ Help": "/ Hilfe",
    "Guides and documentation": "Guides und Dokumentation",
    "A compact support surface for the material users typically need before opening a ticket.":
      "Eine kompakte Support-Fläche für Material, das Nutzer typischerweise vor einem Ticket brauchen.",
    "Getting started": "Erste Schritte",
    "Project setup, language defaults, and first translation workflow.":
      "Projekt-Setup, Sprach-Standards und erster Übersetzungs-Workflow.",
    "Glossary guide": "Glossar-Guide",
    "How shared terms, strict glossary mode, and term review work.":
      "Wie geteilte Begriffe, strikter Glossar-Modus und Begriffsprüfung funktionieren.",
    "File handling": "Dateiverarbeitung",
    "XLIFF imports, tag protection behavior, and export defaults.":
      "XLIFF-Importe, Tag-Schutz-Verhalten und Export-Standards.",
    "/ Service": "/ Service",
    "Operational status": "Betriebsstatus",
    "Keep the most relevant service information visible without turning settings into a dashboard.":
      "Halte die wichtigsten Service-Infos sichtbar, ohne die Einstellungen in ein Dashboard zu verwandeln.",
    "API and translation queue": "API und Übersetzungswarteschlange",
    "No current incidents. Core translation services are operating normally.":
      "Aktuell keine Vorfälle. Die Kern-Übersetzungsdienste laufen normal.",
    Healthy: "Stabil",
    "Workspace contact": "Workspace-Kontakt",
    "/ Best Practice": "/ Best Practice",
    "Before you contact support": "Bevor du den Support kontaktierst",
    "A short checklist that removes the usual back-and-forth for translation issues.":
      "Eine kurze Checkliste, die das übliche Hin und Her bei Übersetzungsproblemen reduziert.",
    "Include the project name, source language, target language, and the exact step where the issue happened.":
      "Nenne Projektnamen, Quellsprache, Zielsprache und den exakten Schritt, an dem das Problem aufgetreten ist.",
    "For file issues, mention whether the problem came from import, translation output, glossary enforcement, or export.":
      "Bei Dateiproblemen gib an, ob das Problem aus Import, Übersetzungsausgabe, Glossar-Regeln oder Export stammt.",
    "If the issue is blocking delivery, say that explicitly so it can be triaged correctly.":
      "Wenn das Problem die Auslieferung blockiert, sag das explizit, damit es korrekt triagiert werden kann.",
    "Permanent action": "Dauerhafte Aktion",
    "This removes your personal account access and clears your settings footprint from Translayr.":
      "Dadurch wird dein persönlicher Kontozugriff entfernt und dein Einstellungs-Footprint aus Translayr gelöscht."
  };

  return translations[value] ?? value;
}

function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="m4.5 6.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isSettingsPayload(value: SettingsScreenData | { error?: string } | null): value is SettingsScreenData {
  return Boolean(
    value &&
      typeof value === "object" &&
      "profile" in value &&
      "translation" in value &&
      "preferences" in value &&
      "dangerZone" in value
  );
}
