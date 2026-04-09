"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import type {
  NotificationChannelItem,
  NotificationEventItem,
  NotificationsScreenData,
  SettingsNotificationsData,
  UsageMetricItem
} from "@/types/workspace";

type NotificationsScreenProps = {
  data: NotificationsScreenData;
};

export function NotificationsScreen({ data }: NotificationsScreenProps) {
  const locale = useAppLocale();
  const router = useRouter();
  const [preferences, setPreferences] = useState<SettingsNotificationsData>(data.preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Benachrichtigungen",
          heading: "Notifications",
          intro:
            "Sieh, welche Signale aktiv sind, welche Ereignisse zuletzt aufgelaufen sind und passe die Regeln direkt hier an.",
          reset: "Zurücksetzen",
          saveChanges: "Regeln speichern",
          saving: "Speichert...",
          saveSuccess: "Benachrichtigungsregeln gespeichert.",
          saveError: "Benachrichtigungsregeln konnten nicht gespeichert werden.",
          channels: "/ Kanäle",
          channelsIntro: "Welche Wege gerade aktiv senden dürfen und wie sie sich verhalten.",
          active: "Aktiv",
          inactive: "Inaktiv",
          email: "E-Mail",
          inApp: "In-App",
          toggleOn: "Einschalten",
          toggleOff: "Ausschalten",
          routing: "/ Routing",
          routingTitle: "Benachrichtigungsziel",
          routingDescription:
            "Alle E-Mails laufen auf die primäre Workspace-Adresse, bis getrennte Empfänger pro Ereignis eingeführt werden.",
          recipient: "Empfänger",
          company: "Firma",
          notSet: "Nicht gesetzt",
          recentEvents: "/ Letzte Signale",
          recentEventsIntro: "Aktuelle Hinweise aus Workspace, Billing und Projektaktivität.",
          noEvents: "Noch keine Benachrichtigungen oder Signale vorhanden."
        }
      : {
          eyebrow: "/ Notifications",
          heading: "Notifications",
          intro:
            "See which signals are active, which events arrived most recently, and adjust the rules directly here.",
          reset: "Reset",
          saveChanges: "Save rules",
          saving: "Saving...",
          saveSuccess: "Notification rules saved.",
          saveError: "Notification rules could not be saved.",
          channels: "/ Channels",
          channelsIntro: "Which delivery paths are currently allowed to send and how they behave.",
          active: "Active",
          inactive: "Inactive",
          email: "Email",
          inApp: "In-app",
          toggleOn: "Enable",
          toggleOff: "Disable",
          routing: "/ Routing",
          routingTitle: "Notification target",
          routingDescription:
            "All emails route to the primary workspace address until per-event recipients are introduced.",
          recipient: "Recipient",
          company: "Company",
          notSet: "Not set",
          recentEvents: "/ Recent signals",
          recentEventsIntro: "Current alerts from workspace, billing, and project activity.",
          noEvents: "No notifications or signals yet."
        };
  const hasPreferenceChanges = JSON.stringify(preferences) !== JSON.stringify(data.preferences);
  const channels = data.channels.map((channel) => ({
    ...channel,
    enabled: getChannelEnabledState(channel.id, preferences)
  }));

  useEffect(() => {
    setPreferences(data.preferences);
  }, [data.preferences]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function toggleChannel(channelId: NotificationChannelItem["id"]) {
    setPreferences((current) => {
      switch (channelId) {
        case "translation_complete_email":
          return { ...current, translationCompleteEmail: !current.translationCompleteEmail };
        case "invoice_created_email":
          return { ...current, invoiceCreatedEmail: !current.invoiceCreatedEmail };
        case "payment_failed_email":
          return { ...current, paymentFailedEmail: !current.paymentFailedEmail };
        case "spending_limit_email":
          return { ...current, spendingLimitEmail: !current.spendingLimitEmail };
        case "review_reminders":
          return { ...current, reviewReminders: !current.reviewReminders };
        case "in_app_notifications":
          return { ...current, inAppNotifications: !current.inAppNotifications };
        default:
          return current;
      }
    });
  }

  async function handleSave() {
    if (!hasPreferenceChanges || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(preferences)
      });
      const payload = (await response.json().catch(() => null)) as
        | SettingsNotificationsData
        | { error?: string }
        | null;

      if (!response.ok || !isNotificationPreferencesPayload(payload)) {
        throw new Error(payload && "error" in payload ? payload.error ?? copy.saveError : copy.saveError);
      }

      setPreferences(payload);
      setSuccessMessage(copy.saveSuccess);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.saveError);
    } finally {
      setIsSaving(false);
    }
  }

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
            <button
              type="button"
              onClick={() => {
                setPreferences(data.preferences);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              disabled={!hasPreferenceChanges || isSaving}
              className="rounded-[10px] border border-[var(--border)] bg-white px-4 py-2.5 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {copy.reset}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSave();
              }}
              disabled={!hasPreferenceChanges || isSaving}
              className="rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-[12px] font-medium text-[var(--foreground)] shadow-[0_8px_20px_rgba(17,17,16,0.06)] transition hover:border-[var(--foreground)] hover:bg-[var(--background-strong)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving ? copy.saving : copy.saveChanges}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-7 py-6">
        {successMessage ? (
          <div className="rounded-[16px] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-[12.5px] text-[var(--success)]">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[16px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[12.5px] text-[var(--danger)]">
            {errorMessage}
          </div>
        ) : null}

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
              {channels.map((channel) => (
                <NotificationChannelRow
                  key={channel.id}
                  channel={channel}
                  activeLabel={copy.active}
                  inactiveLabel={copy.inactive}
                  emailLabel={copy.email}
                  inAppLabel={copy.inApp}
                  toggleOnLabel={copy.toggleOn}
                  toggleOffLabel={copy.toggleOff}
                  onToggle={() => toggleChannel(channel.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[16px] border border-[var(--border)] bg-white">
              <div className="border-b border-[var(--border-light)] px-5 py-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                  {copy.routing}
                </p>
                <p className="mt-2 text-[13px] font-medium text-[var(--foreground)]">{copy.routingTitle}</p>
                <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
                  {copy.routingDescription}
                </p>
              </div>

              <div className="space-y-3 px-5 py-4">
                <DetailRow label={copy.recipient} value={data.routingEmail} />
                <DetailRow label={copy.company} value={data.routingCompany || copy.notSet} />
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
  inAppLabel,
  toggleOnLabel,
  toggleOffLabel,
  onToggle
}: {
  channel: NotificationChannelItem;
  activeLabel: string;
  inactiveLabel: string;
  emailLabel: string;
  inAppLabel: string;
  toggleOnLabel: string;
  toggleOffLabel: string;
  onToggle: () => void;
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
        <button
          type="button"
          onClick={onToggle}
          className="mt-2 rounded-[9px] border border-[var(--border)] bg-white px-2.5 py-1 text-[10.5px] font-medium text-[var(--foreground)] transition hover:border-[var(--border-strong)]"
        >
          {channel.enabled ? toggleOffLabel : toggleOnLabel}
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12px]">
      <span className="text-[var(--muted-soft)]">{label}</span>
      <span className="text-right font-medium text-[var(--foreground)]">{value}</span>
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

function getChannelEnabledState(
  channelId: NotificationChannelItem["id"],
  preferences: SettingsNotificationsData
) {
  switch (channelId) {
    case "translation_complete_email":
      return preferences.translationCompleteEmail;
    case "invoice_created_email":
      return preferences.invoiceCreatedEmail;
    case "payment_failed_email":
      return preferences.paymentFailedEmail;
    case "spending_limit_email":
      return preferences.spendingLimitEmail;
    case "review_reminders":
      return preferences.reviewReminders;
    case "in_app_notifications":
      return preferences.inAppNotifications;
    default:
      return false;
  }
}

function isNotificationPreferencesPayload(value: unknown): value is SettingsNotificationsData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<SettingsNotificationsData>;

  return (
    typeof payload.translationCompleteEmail === "boolean" &&
    typeof payload.invoiceCreatedEmail === "boolean" &&
    typeof payload.paymentFailedEmail === "boolean" &&
    typeof payload.spendingLimitEmail === "boolean" &&
    typeof payload.reviewReminders === "boolean" &&
    typeof payload.inAppNotifications === "boolean"
  );
}
