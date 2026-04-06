"use client";

import { useAppLocale } from "@/components/app-locale-provider";
import type { SettingsScreenData } from "@/types/workspace";
import type { ReactNode } from "react";

type DeveloperApiScreenProps = {
  data: SettingsScreenData;
  backendBaseUrl: string;
};

function normalizeApiBaseUrl(input: string) {
  const sanitized = input.trim().replace(/\/+$/, "");
  if (sanitized.endsWith("/api")) {
    return sanitized;
  }
  return `${sanitized}/api`;
}

export function DeveloperApiScreen({ data, backendBaseUrl }: DeveloperApiScreenProps) {
  const providerLocale = useAppLocale();
  const locale = data.preferences.locale ?? providerLocale;
  const apiBaseUrl = normalizeApiBaseUrl(backendBaseUrl);

  const copy =
    locale === "de"
      ? {
          eyebrow: "/ API",
          heading: "Developer API",
          intro:
            "Technische Oberfläche für WordPress-Plugin-Integrationen. Nutze diese Angaben für Übersetzungsjobs, Bulk-Anfragen und Job-Status-Abfragen.",
          overviewTitle: "Übersicht",
          overviewItems: [
            "Authentifizierung per API Key über `x-api-key` oder `Authorization: Bearer <key>`.",
            "Antworten behalten die Struktur der gesendeten Payload bei und sind für WordPress-Reimport ausgelegt.",
            "Jobs werden in `public.wp_translation_jobs` gespeichert."
          ],
          configTitle: "Konfiguration",
          configuredBaseUrl: "Konfigurierte API Base URL",
          requiredHeadersTitle: "Pflicht-Header",
          endpointTitle: "Endpoints",
          payloadTitle: "WordPress Payload (Beispiel)",
          curlTitle: "Quickstart cURL",
          tipsTitle: "Hinweise",
          tipsItems: [
            "Für lokale Entwicklung läuft das Backend separat (`cd backend && npm run dev`).",
            "Wenn WordPress extern läuft, verwende Tunnel/Deployment statt `localhost`.",
            "Nutze einen eigenen `BACKEND_API_KEY` statt langfristig den Supabase Service Role Key."
          ]
        }
      : {
          eyebrow: "/ API",
          heading: "Developer API",
          intro:
            "Technical surface for WordPress plugin integrations. Use this data for translation jobs, bulk requests, and job status lookups.",
          overviewTitle: "Overview",
          overviewItems: [
            "Authenticate with API key via `x-api-key` or `Authorization: Bearer <key>`.",
            "Responses preserve payload shape for safe WordPress re-import.",
            "Jobs are persisted in `public.wp_translation_jobs`."
          ],
          configTitle: "Configuration",
          configuredBaseUrl: "Configured API base URL",
          requiredHeadersTitle: "Required headers",
          endpointTitle: "Endpoints",
          payloadTitle: "WordPress payload (example)",
          curlTitle: "Quickstart cURL",
          tipsTitle: "Notes",
          tipsItems: [
            "Local development runs backend separately (`cd backend && npm run dev`).",
            "If WordPress is remote, use tunnel/deployment instead of `localhost`.",
            "Use a dedicated `BACKEND_API_KEY` instead of keeping Supabase Service Role key as long-term API key."
          ]
        };

  const endpointRows = [
    { method: "GET", path: "/health", purpose: locale === "de" ? "Service-Status" : "Service health" },
    { method: "POST", path: "/translate", purpose: locale === "de" ? "Einzelner Übersetzungsjob" : "Single translation job" },
    { method: "POST", path: "/translate/bulk", purpose: locale === "de" ? "Mehrere Jobs in einer Anfrage" : "Multiple jobs in one request" },
    { method: "GET", path: "/job/:id", purpose: locale === "de" ? "Job-Status und Metadaten" : "Job status and metadata" }
  ];

  const payloadExample = {
    siteUrl: "https://example.com",
    postId: "1842",
    postType: "page",
    sourceLanguage: "en",
    targetLanguage: "de",
    title: "AI Translation Platform",
    excerpt: "Translate while preserving structure.",
    content: "<p>Launch globally with multilingual pages.</p>",
    meta: {
      seo_title: "Fast translation workflows"
    },
    acf: {
      hero_heading: "Ship multilingual product pages"
    },
    raw: {
      blocks: [{ type: "text", data: { body: "Nested payload is supported." } }]
    },
    options: {
      translateSlugs: false,
      translateUrls: false
    }
  };

  const curlExample = `curl -X POST "${apiBaseUrl}/translate" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_BACKEND_API_KEY" \\
  --data '${JSON.stringify(payloadExample)}'`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="max-w-[880px]">
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
            {copy.eyebrow}
          </span>
          <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">{copy.heading}</h1>
          <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">{copy.intro}</p>
        </div>
      </header>

      <div className="px-7 py-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <section className="space-y-5">
            <ApiPanel title={copy.overviewTitle}>
              <div className="space-y-2 text-[12.5px] leading-6 text-[var(--muted)]">
                {copy.overviewItems.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </ApiPanel>

            <ApiPanel title={copy.endpointTitle}>
              <div className="overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[var(--background)]">
                <table className="w-full min-w-[480px] text-left text-[12.5px]">
                  <thead className="border-b border-[var(--border)] text-[11px] uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                    <tr>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Path</th>
                      <th className="px-4 py-3">{locale === "de" ? "Zweck" : "Purpose"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {endpointRows.map((row) => (
                      <tr key={`${row.method}-${row.path}`}>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[var(--foreground)]">
                            {row.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-[var(--foreground)]">{row.path}</td>
                        <td className="px-4 py-3 text-[var(--muted)]">{row.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ApiPanel>

            <ApiPanel title={copy.payloadTitle}>
              <pre className="overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[#111110] p-4 text-[11.5px] leading-6 text-[#f3f3f2]">
                {JSON.stringify(payloadExample, null, 2)}
              </pre>
            </ApiPanel>
          </section>

          <section className="space-y-5">
            <ApiPanel title={copy.configTitle}>
              <div className="space-y-4">
                <ApiField label={copy.configuredBaseUrl} value={apiBaseUrl} mono />
                <ApiField label={copy.requiredHeadersTitle} value={"x-api-key: YOUR_BACKEND_API_KEY\nContent-Type: application/json"} mono />
              </div>
            </ApiPanel>

            <ApiPanel title={copy.curlTitle}>
              <pre className="overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[#111110] p-4 text-[11.5px] leading-6 text-[#f3f3f2]">
                {curlExample}
              </pre>
            </ApiPanel>

            <ApiPanel title={copy.tipsTitle}>
              <div className="space-y-2 text-[12.5px] leading-6 text-[var(--muted)]">
                {copy.tipsItems.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </ApiPanel>
          </section>
        </div>
      </div>
    </div>
  );
}

function ApiPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[18px] border border-[var(--border)] bg-white p-5">
      <h2 className="text-[17px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ApiField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-[12px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted-soft)]">{label}</p>
      <p className={["mt-1 whitespace-pre-wrap break-all text-[12.5px] text-[var(--foreground)]", mono ? "font-mono" : ""].join(" ")}>
        {value}
      </p>
    </div>
  );
}
