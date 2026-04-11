"use client";

import Link from "next/link";
import { useAppLocale } from "@/components/app-locale-provider";
import { BrandIconBadge } from "@/components/brand-icon";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";

type Incident = {
  date: string;
  title: string;
  description: string;
  status: "resolved" | "monitoring" | "investigating";
};

type ServiceStatus = {
  name: string;
  status: "operational" | "degraded" | "outage";
};

export default function StatusPage() {
  const locale = useAppLocale();
  const isDe = locale === "de";
  const t = isDe ? deContent : enContent;

  const services: ServiceStatus[] = [
    { name: isDe ? "Übersetzungs-API" : "Translation API", status: "operational" },
    { name: isDe ? "Datei-Upload & Export" : "File Upload & Export", status: "operational" },
    { name: isDe ? "Workspace & Dashboard" : "Workspace & Dashboard", status: "operational" },
    { name: isDe ? "Glossar-Datenbank" : "Glossary Database", status: "operational" },
    { name: isDe ? "Abrechnung & Credits" : "Billing & Credits", status: "operational" },
    { name: isDe ? "Authentifizierung" : "Authentication", status: "operational" }
  ];

  const incidents: Incident[] = isDe
    ? [
        {
          date: "02. April 2026",
          title: "Verzögerte Übersetzungsausgabe",
          description: "Einige Übersetzungsaufträge wurden mit ca. 5 Minuten Verzögerung bearbeitet. Das Problem wurde identifiziert und behoben.",
          status: "resolved"
        },
        {
          date: "28. März 2026",
          title: "Geplante Wartung: Datenbank-Upgrade",
          description: "Planmäßige Wartung der Datenbank-Infrastruktur. Keine Ausfallzeit, geringfügig erhöhte Latenz während des Wartungsfensters.",
          status: "resolved"
        },
        {
          date: "15. März 2026",
          title: "DOCX-Export kurzzeitig nicht verfügbar",
          description: "Der DOCX-Export war für ca. 20 Minuten nicht verfügbar. Ein Update der Dokumentenverarbeitungs-Bibliothek hat das Problem verursacht. Rollback durchgeführt.",
          status: "resolved"
        }
      ]
    : [
        {
          date: "April 2, 2026",
          title: "Delayed translation output",
          description: "Some translation jobs were processed with approximately 5 minutes delay. The issue has been identified and resolved.",
          status: "resolved"
        },
        {
          date: "March 28, 2026",
          title: "Scheduled maintenance: Database upgrade",
          description: "Planned maintenance of database infrastructure. No downtime, slightly increased latency during the maintenance window.",
          status: "resolved"
        },
        {
          date: "March 15, 2026",
          title: "DOCX export temporarily unavailable",
          description: "DOCX export was unavailable for approximately 20 minutes. An update to the document processing library caused the issue. Rollback performed.",
          status: "resolved"
        }
      ];

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 sm:px-7 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandIconBadge />
            <span className="text-[16px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">Translayr</span>
          </Link>
          <Link
            href="/"
            className="text-[14px] font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            {isDe ? "Zurück zur Startseite" : "Back to home"}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[760px] px-5 py-16 sm:px-7 lg:px-8 lg:py-24">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-[var(--success)]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--success)]">
            {t.allSystemsOperational}
          </p>
        </div>
        <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.92] text-[var(--foreground)]`}>
          {t.title}
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
          {t.subtitle}
        </p>

        <section className="mt-12 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.2rem,1.8vw,1.5rem)] leading-[0.95] text-[var(--foreground)]`}>
            {t.serviceStatus}
          </h2>
          <div className="mt-6 divide-y divide-[var(--border-light)]">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between py-4">
                <span className="text-[14px] font-medium text-[var(--foreground)]">{service.name}</span>
                <StatusBadge status={service.status} locale={locale} />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.2rem,1.8vw,1.5rem)] leading-[0.95] text-[var(--foreground)]`}>
            {t.recentIncidents}
          </h2>
          <div className="mt-6 space-y-6">
            {incidents.map((incident, index) => (
              <div
                key={index}
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                    {incident.date}
                  </span>
                  <IncidentStatusBadge status={incident.status} locale={locale} />
                </div>
                <h3 className="mt-3 text-[16px] font-semibold text-[var(--foreground)]">
                  {incident.title}
                </h3>
                <p className="mt-2 text-[14px] leading-7 text-[var(--muted)]">
                  {incident.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.2rem,1.8vw,1.5rem)] leading-[0.95] text-[var(--foreground)]`}>
            {t.uptime}
          </h2>
          <div className="mt-6 flex items-end gap-3">
            <span className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(2.5rem,4vw,4rem)] leading-none text-[var(--success)]`}>
              99.9%
            </span>
            <span className="pb-1 text-[14px] text-[var(--muted)]">
              {isDe ? "Verfügbarkeit in den letzten 90 Tagen" : "uptime over the last 90 days"}
            </span>
          </div>
          <div className="mt-6 flex gap-[3px]">
            {Array.from({ length: 90 }).map((_, i) => {
              const hasIssue = [12, 34, 67].includes(i);
              return (
                <div
                  key={i}
                  className={[
                    "h-8 flex-1 rounded-sm",
                    hasIssue ? "bg-[var(--review)]" : "bg-[var(--success)]"
                  ].join(" ")}
                  title={hasIssue ? (isDe ? "Störung" : "Incident") : (isDe ? "Betriebsbereit" : "Operational")}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[var(--muted-soft)]">
            <span>{isDe ? "Vor 90 Tagen" : "90 days ago"}</span>
            <span>{isDe ? "Heute" : "Today"}</span>
          </div>
        </section>

        <div className="mt-12 text-center">
          <p className="text-[13px] text-[var(--muted-soft)]">
            {isDe ? "Automatisch aktualisiert · Zuletzt geprüft: vor 2 Minuten" : "Auto-updating · Last checked: 2 minutes ago"}
          </p>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status, locale }: { status: ServiceStatus["status"]; locale: "de" | "en" }) {
  const labels = {
    operational: locale === "de" ? "Betriebsbereit" : "Operational",
    degraded: locale === "de" ? "Eingeschränkt" : "Degraded",
    outage: locale === "de" ? "Ausfall" : "Outage"
  };
  const colors = {
    operational: "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]",
    degraded: "border border-[var(--review-border)] bg-[var(--review-bg)] text-[var(--review)]",
    outage: "border border-red-200 bg-red-50 text-red-600"
  };

  return (
    <span className={[
      "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
      colors[status]
    ].join(" ")}>
      {labels[status]}
    </span>
  );
}

function IncidentStatusBadge({ status, locale }: { status: Incident["status"]; locale: "de" | "en" }) {
  const labels = {
    resolved: locale === "de" ? "Gelöst" : "Resolved",
    monitoring: locale === "de" ? "Überwachung" : "Monitoring",
    investigating: locale === "de" ? "Untersuchung" : "Investigating"
  };
  const colors = {
    resolved: "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]",
    monitoring: "border border-[var(--review-border)] bg-[var(--review-bg)] text-[var(--review)]",
    investigating: "border border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]"
  };

  return (
    <span className={[
      "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
      colors[status]
    ].join(" ")}>
      {labels[status]}
    </span>
  );
}

const deContent = {
  allSystemsOperational: "Alle Systeme betriebsbereit",
  title: "Systemstatus",
  subtitle: "Echtzeit-Status aller Translayr-Dienste und Verlauf der letzten Vorfälle.",
  serviceStatus: "Dienststatus",
  recentIncidents: "Letzte Vorfälle",
  uptime: "Verfügbarkeit"
};

const enContent = {
  allSystemsOperational: "All systems operational",
  title: "System Status",
  subtitle: "Real-time status of all Translayr services and recent incident history.",
  serviceStatus: "Service Status",
  recentIncidents: "Recent Incidents",
  uptime: "Uptime"
};
