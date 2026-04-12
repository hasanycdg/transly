"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { BrandGlyph } from "@/components/brand-icon";
import { createClient } from "@/lib/supabase/client";
import type { DashboardShellData } from "@/types/workspace";

type DashboardShellProps = {
  children: ReactNode;
  shellData: DashboardShellData;
};

type NavIconProps = {
  className?: string;
};

type SidebarItem = {
  label: string;
  href: string;
  icon: (props: NavIconProps) => ReactNode;
  prefetch: boolean;
  active?: boolean;
};

export function DashboardShell({ children, shellData }: DashboardShellProps) {
  const locale = useAppLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [hasMounted, setHasMounted] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const projects = shellData.projects;
  const shouldPrefetch = process.env.NODE_ENV === "production";
  const copy =
    locale === "de"
      ? {
          dashboard: "Dashboard",
          usage: "Nutzung",
          glossary: "Glossar",
          support: "Support",
          billing: "Abrechnung",
          settings: "Einstellungen",
          projects: "Projekte",
          allProjects: "Alle Projekte",
          workspaceSection: "Arbeitsbereich",
          managementSection: "Verwalten",
          deleteProjectTitle: (projectName: string) => `${projectName} löschen`,
          deleteProjectConfirm: (projectName: string) =>
            `„${projectName}“ löschen? Das Projekt wird aus der Datenbank entfernt, archivierte Nutzungsstatistiken bleiben aber verfügbar.`,
          deleteProjectFailed: "Das Projekt konnte nicht gelöscht werden.",
          signOut: "Abmelden",
          signingOut: "Abmeldung läuft...",
          signOutFailed: "Die Abmeldung konnte nicht abgeschlossen werden.",
          planSuffix: "Tarif"
        }
      : {
          dashboard: "Dashboard",
          usage: "Usage",
          glossary: "Glossary",
          support: "Support",
          billing: "Billing",
          settings: "Settings",
          projects: "Projects",
          allProjects: "All projects",
          workspaceSection: "Workspace",
          managementSection: "Manage",
          deleteProjectTitle: (projectName: string) => `Delete ${projectName}`,
          deleteProjectConfirm: (projectName: string) =>
            `Delete "${projectName}"? The project will be removed from the database, but archived usage statistics will stay available.`,
          deleteProjectFailed: "Project deletion failed.",
          signOut: "Sign out",
          signingOut: "Signing out...",
          signOutFailed: "Sign-out failed.",
          planSuffix: "plan"
        };
  const primaryNavItems: SidebarItem[] = [
    { label: copy.dashboard, href: "/dashboard", icon: HomeIcon, prefetch: shouldPrefetch },
    { label: copy.usage, href: "/usage", icon: UsageIcon, prefetch: false },
    { label: copy.glossary, href: "/glossary", icon: GlossaryIcon, prefetch: shouldPrefetch }
  ];
  const utilityNavItems: SidebarItem[] = [
    {
      label: copy.support,
      href: "/support",
      icon: SupportIcon,
      prefetch: shouldPrefetch,
      active: pathname.startsWith("/support")
    },
    {
      label: copy.billing,
      href: "/billing",
      icon: BillingIcon,
      prefetch: shouldPrefetch,
      active: pathname.startsWith("/billing")
    },
    {
      label: copy.settings,
      href: "/settings",
      icon: SettingsIcon,
      prefetch: shouldPrefetch,
      active: pathname.startsWith("/settings")
    }
  ];
  const projectsSectionActive = pathname.startsWith("/projects");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  async function handleDeleteProject(projectId: string, projectName: string) {
    if (deletingProjectId) {
      return;
    }

    const confirmed = window.confirm(copy.deleteProjectConfirm(projectName));

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProjectId(projectId);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE"
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.deleteProjectFailed);
      }

      if (pathname === `/projects/${projectId}`) {
        router.replace("/projects");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : copy.deleteProjectFailed);
    } finally {
      setDeletingProjectId(null);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : copy.signOutFailed);
      setIsSigningOut(false);
    }
  }

  function isItemActive(item: SidebarItem) {
    if (typeof item.active === "boolean") {
      return item.active;
    }

    if (item.href === "/dashboard") {
      return pathname === item.href;
    }

    return pathname.startsWith(item.href);
  }

  function renderNavItem(item: SidebarItem) {
    const Icon = item.icon;
    const active = isItemActive(item);

    return (
      <Link
        key={item.label}
        href={item.href}
        prefetch={item.prefetch}
        className={[
          "group flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[12.5px] transition-colors",
          active
            ? "bg-[rgba(26,79,175,0.08)] font-semibold text-[var(--processing)]"
            : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
        ].join(" ")}
      >
        <Icon
          className={[
            "h-[14px] w-[14px] shrink-0 transition-opacity",
            active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
          ].join(" ")}
        />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[var(--background)]">
      <div className="flex h-screen">
        <aside className="hidden h-screen w-[224px] shrink-0 flex-col overflow-hidden border-r border-[0.5px] border-[var(--border)] bg-white lg:flex">
          <div className="flex items-center gap-[9px] border-b border-[0.5px] border-[var(--border-light)] px-4 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[var(--foreground)] text-white">
              <BrandGlyph />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
              Translayr
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarSection label={copy.workspaceSection}>
              {primaryNavItems.slice(0, 1).map((item) => renderNavItem(item))}
              <button
                type="button"
                aria-expanded={projectsOpen}
                onClick={() => setProjectsOpen((current) => !current)}
                className={[
                  "group flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] transition-colors",
                  projectsSectionActive
                    ? "bg-[rgba(26,79,175,0.08)] font-semibold text-[var(--processing)]"
                    : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                ].join(" ")}
              >
                <ProjectsIcon
                  className={[
                    "h-[14px] w-[14px] shrink-0 transition-opacity",
                    projectsSectionActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  ].join(" ")}
                />
                <span className="flex-1">{copy.projects}</span>
                <ChevronIcon open={projectsOpen} />
              </button>

              {projectsOpen ? (
                <div className="space-y-1 pl-6">
                  <Link
                    href="/projects"
                    prefetch={shouldPrefetch}
                    className={[
                      "block truncate rounded-[7px] px-2.5 py-1.5 text-[12px] transition-colors",
                      pathname === "/projects"
                        ? "bg-[rgba(26,79,175,0.08)] font-medium text-[var(--processing)]"
                        : "text-[var(--muted-soft)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                    ].join(" ")}
                  >
                    {copy.allProjects}
                  </Link>

                  {projects.map((project) => {
                    const active = pathname === `/projects/${project.id}`;
                    const isDeleting = deletingProjectId === project.id;
                    const linkClassName = [
                      "block truncate rounded-[7px] px-2.5 py-1.5 text-[12px] transition-colors",
                      active
                        ? "bg-[rgba(26,79,175,0.08)] font-medium text-[var(--processing)]"
                        : "text-[var(--muted-soft)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                    ].join(" ");

                    if (!hasMounted) {
                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          prefetch={shouldPrefetch}
                          className={linkClassName}
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                      );
                    }

                    return (
                      <div key={project.id} className="group/project relative flex items-center">
                        <Link
                          href={`/projects/${project.id}`}
                          prefetch={shouldPrefetch}
                          className={[linkClassName, "min-w-0 flex-1 pr-7"].join(" ")}
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                        <button
                          type="button"
                          aria-label={copy.deleteProjectTitle(project.name)}
                          disabled={Boolean(deletingProjectId)}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void handleDeleteProject(project.id, project.name);
                          }}
                          className={[
                            "absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-[4px] text-[12px] leading-none transition",
                            isDeleting
                              ? "opacity-100 text-[var(--muted-soft)]"
                              : "opacity-0 text-[var(--muted-soft)] group-hover/project:opacity-100 hover:bg-[var(--background)] hover:text-[var(--foreground)] focus:opacity-100"
                          ].join(" ")}
                          title={copy.deleteProjectTitle(project.name)}
                        >
                          {isDeleting ? "…" : "×"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {primaryNavItems.slice(1).map((item) => renderNavItem(item))}
            </SidebarSection>
          </div>

          <div className="border-t border-[0.5px] border-[var(--border-light)] p-3">
            <SidebarSection label={copy.managementSection}>
              {utilityNavItems.map((item) => renderNavItem(item))}
            </SidebarSection>

            <div className="flex items-center gap-3 rounded-[10px] border border-[0.5px] border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--foreground)] text-[10px] font-semibold text-white">
                {shellData.workspaceAvatarLabel}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">
                  {shellData.workspaceName}
                </p>
                <p className="truncate text-[11px] text-[var(--muted-soft)]">
                  {shellData.workspacePlanName} {copy.planSuffix}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="mt-2 flex h-8 w-full items-center justify-center rounded-[8px] border border-[0.5px] border-[var(--border)] bg-white px-3 text-[12px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background)] disabled:cursor-progress disabled:opacity-70"
            >
              {isSigningOut ? copy.signingOut : copy.signOut}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarSection({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5">
      <p className="mb-2 px-2.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted-soft)]">
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function ProjectsIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="4.75" height="4.75" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8.25" y="1" width="4.75" height="4.75" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1" y="8.25" width="4.75" height="4.75" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8.25" y="8.25" width="4.75" height="4.75" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function HomeIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 6.1 7 2l5 4.1v5.4a.5.5 0 0 1-.5.5H8.2V8.8H5.8V12H2.5a.5.5 0 0 1-.5-.5V6.1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsageIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 3.75h10M2 7h7M2 10.25h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function GlossaryIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM7 4.8v2.7l1.9 1.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SupportIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M4.85 5.45A2.45 2.45 0 1 1 8.53 7.5c-.7.39-1.23.86-1.23 1.55M7 10.68h.01"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function BillingIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="11" height="9" rx="1.75" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 5h11M3.8 8.6h3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ className }: NavIconProps) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="1.85" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M7 1v1.4M7 11.6V13M1 7h1.4M11.6 7H13M3.2 3.2l.95.95M9.85 9.85l.95.95M9.85 3.2l-.95.95M3.2 9.85l.95-.95"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={["shrink-0 text-[var(--muted-soft)] transition-transform", open ? "rotate-90" : ""].join(" ")}
    >
      <path
        d="m4.5 2.5 3 3.5-3 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
