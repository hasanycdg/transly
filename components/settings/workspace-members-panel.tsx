"use client";

import { useEffect, useState, type FormEvent } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import type {
  WorkspaceMemberInviteResult,
  WorkspaceMemberListItem,
  WorkspaceMemberRole,
  WorkspaceMembersResponse
} from "@/types/workspace";

const INPUT_CLASS_NAME =
  "h-11 w-full rounded-[12px] border border-[var(--border)] bg-white px-3 text-[13px] text-[var(--foreground)] outline-none transition focus:border-[var(--border-strong)]";

const ROLE_OPTIONS: WorkspaceMemberRole[] = ["editor", "reviewer", "viewer", "admin"];

export function WorkspaceMembersPanel() {
  const locale = useAppLocale();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceMemberRole>("editor");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [directory, setDirectory] = useState<WorkspaceMembersResponse | null>(null);
  const copy =
    locale === "de"
      ? {
          eyebrow: "/ Team-Zugriff",
          title: "Team einladen",
          description:
            "Lade Nutzer direkt per Supabase-E-Mail in diesen Workspace ein. Nach Annahme landen sie im richtigen Bereich statt in einem globalen Dashboard.",
          emailLabel: "E-Mail",
          emailPlaceholder: "kollege@firma.de",
          roleLabel: "Rolle",
          sendInvite: "Einladung senden",
          sendingInvite: "Einladung wird gesendet...",
          reloadFailed: "Mitglieder konnten nicht geladen werden.",
          inviteFailed: "Einladung konnte nicht versendet werden.",
          inviteSuccess: "Einladung wurde versendet.",
          membersTitle: "Aktuelle Zugriffe",
          membersDescription: "Aktive und ausstehende Mitglieder dieses Workspace.",
          noMembers: "Noch keine weiteren Mitglieder vorhanden.",
          noName: "Ohne Namen",
          canInviteNote:
            "Die Mail wird von Supabase verschickt. Der Empfänger akzeptiert die Einladung und landet danach direkt in diesem Workspace.",
          noInvitePermission: "Nur Owner und Admins können neue Einladungen versenden.",
          role: {
            owner: "Owner",
            admin: "Admin",
            editor: "Editor",
            reviewer: "Reviewer",
            viewer: "Viewer"
          },
          status: {
            active: "Aktiv",
            invited: "Eingeladen",
            disabled: "Deaktiviert"
          }
        }
      : {
          eyebrow: "/ Team Access",
          title: "Invite teammates",
          description:
            "Send Supabase invitation emails directly into this workspace. After accepting, users land in the correct workspace instead of a shared global dashboard.",
          emailLabel: "Email",
          emailPlaceholder: "colleague@company.com",
          roleLabel: "Role",
          sendInvite: "Send invite",
          sendingInvite: "Sending invite...",
          reloadFailed: "Workspace members could not be loaded.",
          inviteFailed: "Invite could not be sent.",
          inviteSuccess: "Invitation sent.",
          membersTitle: "Current access",
          membersDescription: "Active and pending members in this workspace.",
          noMembers: "No additional members yet.",
          noName: "No name",
          canInviteNote:
            "The email is sent by Supabase. The recipient accepts the invite and then lands directly in this workspace.",
          noInvitePermission: "Only owners and admins can send new invitations.",
          role: {
            owner: "Owner",
            admin: "Admin",
            editor: "Editor",
            reviewer: "Reviewer",
            viewer: "Viewer"
          },
          status: {
            active: "Active",
            invited: "Invited",
            disabled: "Disabled"
          }
        };

  useEffect(() => {
    void loadMembers();
  }, []);

  async function loadMembers() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/workspace-members", { method: "GET" });
      const payload = (await response.json().catch(() => null)) as
        | WorkspaceMembersResponse
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("members" in payload)) {
        throw new Error(payload && "error" in payload ? payload.error ?? copy.reloadFailed : copy.reloadFailed);
      }

      setDirectory(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.reloadFailed);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !directory?.canInvite) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await fetch("/api/workspace-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });
      const payload = (await response.json().catch(() => null)) as
        | WorkspaceMemberInviteResult
        | { error?: string }
        | null;

      if (!response.ok || !payload || !("member" in payload)) {
        throw new Error(payload && "error" in payload ? payload.error ?? copy.inviteFailed : copy.inviteFailed);
      }

      setInviteEmail("");
      setInviteRole("editor");
      setSuccessMessage(copy.inviteSuccess);
      await loadMembers();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.inviteFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[18px] border border-[var(--border)] bg-white px-5 py-5 sm:px-6">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
        {copy.eyebrow}
      </p>
      <h3 className="mt-3 text-[19px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
        {copy.title}
      </h3>
      <p className="mt-2 max-w-[760px] text-[12px] leading-6 text-[var(--muted)]">
        {copy.description}
      </p>

      {errorMessage ? (
        <div className="mt-5 rounded-[14px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-[12.5px] text-[var(--danger)]">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-5 rounded-[14px] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-[12.5px] text-[var(--success)]">
          {successMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(320px,1.08fr)]">
        <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
          <form className="space-y-4" onSubmit={handleInvite}>
            <div>
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.emailLabel}
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder={copy.emailPlaceholder}
                className={INPUT_CLASS_NAME}
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
                {copy.roleLabel}
              </label>
              <div className="relative">
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as WorkspaceMemberRole)}
                  className={[INPUT_CLASS_NAME, "appearance-none pr-10"].join(" ")}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {copy.role[role]}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-soft)]">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !directory?.canInvite}
              className="rounded-[12px] bg-[var(--foreground)] px-4 py-2.5 text-[12px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSubmitting ? copy.sendingInvite : copy.sendInvite}
            </button>
          </form>

          <p className="mt-4 text-[11.5px] leading-5 text-[var(--muted)]">
            {directory?.canInvite ? copy.canInviteNote : copy.noInvitePermission}
          </p>
        </div>

        <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--background)] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-[var(--foreground)]">{copy.membersTitle}</p>
              <p className="mt-1 text-[11.5px] leading-5 text-[var(--muted)]">{copy.membersDescription}</p>
            </div>
            {isLoading ? (
              <span className="text-[11.5px] text-[var(--muted-soft)]">...</span>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            {directory?.members.length ? (
              directory.members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-[14px] border border-[var(--border)] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[var(--foreground)]">
                      {member.displayName || copy.noName}
                    </p>
                    <p className="mt-1 truncate text-[11.5px] text-[var(--muted)]">{member.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--foreground)]">
                      {copy.role[member.role]}
                    </span>
                    <span
                      className={[
                        "inline-flex rounded-full border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.06em]",
                        member.status === "active"
                          ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                          : member.status === "invited"
                            ? "border-[var(--border)] bg-white text-[var(--muted)]"
                            : "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]"
                      ].join(" ")}
                    >
                      {copy.status[member.status]}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[14px] border border-dashed border-[var(--border)] bg-white px-4 py-4 text-[12px] leading-6 text-[var(--muted)]">
                {copy.noMembers}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="m4.5 6.5 3.5 3.5 3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
