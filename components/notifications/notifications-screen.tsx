"use client";

import Link from "next/link";

import { useAppLocale } from "@/components/app-locale-provider";
import type {
  NotificationChannelItem,
  NotificationEventItem,
  NotificationsScreenData,
  UsageMetricItem
} from "@/types/workspace";

type NotificationsScreenProps = {
  data: NotificationsScreenData;
};

export function NotificationsScreen({ data }: NotificationsScreenProps) {
  const locale = useAppLocale();
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Benachrichtigungen",
          heading: "Notifications",
          intro:
            "Sieh, welche Signale aktiv sind, welche Ereignisse zuletzt aufgelaufen sind und springe direkt in die Regeln.",
          manageRules: "Regeln bearbeiten",
          channels: "/ Kanäle",
          channelsIntro: "Welche Wege gerade aktiv senden dürfen.",
          active: "Aktiv",
          inactive: "Inaktiv",
          email: "E-Mail",
          inApp: "In-App",
          recentEvents: "/ Letzte Signale",
          recentEventsIntro: "Aktuelle Hinweise aus Workspace, Billing und Projektaktivität.",
          noEvents: "Noch keine Benachrichtigungen oder Signale vorhanden."
        }
      : {
          eyebrow: "/ Notifications",
          heading: "Notifications",
          intro:
            "See which signals are active, which events arrived most recently, and jump directly into the rules.",
          manageRules: "Manage rules",
          channels: "/ Channels",
          channelsIntro: "Which delivery paths are currently allowed to send.",
          active: "Active",
          inactive: "Inactive",
          email: "Email",
          inApp: "In-app",
          recentEvents: "/ Recent signals",
          recentEventsIntro: "Current alerts from workspace, billing, and project activity.",
          noEvents: "No notifications or signals yet."
        };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)] px-7 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[760px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              {copy.eyebrow}
            </span>
            <h1 className="mt-2 text-[27px] font-semibold tracking-[-0.06em] text-[var(--foreground)]">
              {copy.heading}
            </h1>
            <p className="mt-2 text-[12.5px] leading-6 text-[var(--muted)]">
              {copy.intro}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-[11.5px] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />
              {data.updatedLabel}
            </div>
            <Link
              href={data.settingsHref}
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-[12.5px] font-medium text-[var(--foreground)] shadow-[0_8px_20px_rgba(17,17,16,0.06)] transition hover:border-[var(--foreground)] hover:bg-[var(--background-strong)]"
            >
              {copy.manageRules}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        <section className="grid grid-cols-1 overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          {data.metrics.map((metric) => (
            <NotificationMetricCell key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="rounded-[16px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.channels}
              </p>
              <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                {copy.channelsIntro}
              </p>
            </div>

            <div className="px-5 py-3">
              {data.channels.map((channel) => (
                <NotificationChannelRow
                  key={channel.id}
                  channel={channel}
                  activeLabel={copy.active}
                  inactiveLabel={copy.inactive}
                  emailLabel={copy.email}
                  inAppLabel={copy.inApp}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[16px] border border-[var(--border)] bg-white">
            <div className="border-b border-[var(--border-light)] px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.recentEvents}
              </p>
              <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                {copy.recentEventsIntro}
              </p>
            </div>

            <div className="px-5 py-3">
              {data.items.length > 0 ? (
                data.items.map((item) => <NotificationEventRow key={item.id} item={item} />)
              ) : (
                <div className="py-8 text-[12px] text-[var(--muted-soft)]">
                  {copy.noEvents}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function NotificationMetricCell({ metric }: { metric: UsageMetricItem }) {
  return (
    <div className="border-b border-[var(--border)] bg-white px-5 py-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="text-[28px] font-semibold leading-none tracking-[-0.08em] text-[var(--foreground)]">
        {metric.value}
      </div>
      <div className="mt-2 text-[12px] text-[var(--muted-soft)]">{metric.label}</div>
      <div className="mt-1 text-[11.5px] text-[var(--muted)]">{metric.meta}</div>
    </div>
  );
}

function NotificationChannelRow({
  channel,
  activeLabel,
  inactiveLabel,
  emailLabel,
  inAppLabel
}: {
  channel: NotificationChannelItem;
  activeLabel: string;
  inactiveLabel: string;
  emailLabel: string;
  inAppLabel: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[var(--foreground)]">{channel.label}</p>
        <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">{channel.description}</p>
      </div>
      <div className="shrink-0 text-right">
        <span
          className={[
            "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]",
            channel.enabled
              ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
              : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-soft)]"
          ].join(" ")}
        >
          {channel.enabled ? activeLabel : inactiveLabel}
        </span>
        <p className="mt-2 text-[11px] text-[var(--muted-soft)]">
          {channel.type === "email" ? emailLabel : inAppLabel}
        </p>
      </div>
    </div>
  );
}

function NotificationEventRow({ item }: { item: NotificationEventItem }) {
  return (
    <Link
      href={item.href}
      className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] py-3 transition hover:opacity-85 last:border-b-0"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={["h-2 w-2 rounded-full", getToneDotClassName(item.tone)].join(" ")} />
          <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{item.title}</p>
        </div>
        <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">
          {item.projectName} · {item.detail}
        </p>
      </div>
      <p className="shrink-0 text-[11px] text-[var(--muted-soft)]">{item.timestampLabel}</p>
    </Link>
  );
}

function getToneDotClassName(tone: NotificationEventItem["tone"]) {
  switch (tone) {
    case "positive":
      return "bg-[var(--success)]";
    case "warning":
      return "bg-[var(--review)]";
    case "danger":
      return "bg-[var(--danger)]";
    case "default":
    default:
      return "bg-[var(--muted-soft)]";
  }
}
