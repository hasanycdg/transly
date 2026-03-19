"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { ReactNode } from "react";

import { getSeedProjects, mergeProjects } from "@/lib/projects/mock-data";
import { loadStoredProjects } from "@/lib/projects/storage";

type DashboardShellProps = {
  children: ReactNode;
};

const secondaryNavItems = [
  { label: "Usage", icon: UsageIcon },
  { label: "Glossary", icon: GlossaryIcon },
  { label: "Settings", icon: SettingsIcon }
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const projects = useMemo(
    () => mergeProjects(getSeedProjects(), loadStoredProjects()),
    []
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[362px] shrink-0 border-r border-[var(--border)] bg-white lg:flex lg:flex-col">
          <div className="flex items-center gap-4 border-b border-[var(--border)] px-8 py-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--foreground)] text-white">
              <LogoIcon />
            </div>
            <div>
              <h1 className="text-[19px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Translayr
              </h1>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <nav className="space-y-12 overflow-y-auto px-6 py-8">
              <section>
                <p className="px-4 text-[13px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.42)]">
                  Workspace
                </p>
                <div className="mt-3 space-y-1.5">
                  <div className="rounded-[16px] bg-[rgba(20,20,20,0.04)] p-1.5">
                    <Link
                      href="/projects"
                      className="flex min-w-0 items-center gap-3 rounded-[14px] px-4 py-3 text-[17px] font-medium text-[var(--foreground)]"
                    >
                      <ProjectsIcon />
                      <span>Projects</span>
                    </Link>
                  </div>

                  <div className="space-y-1.5 pl-10 pt-4">
                    <Link
                      href="/projects"
                      className={[
                        "block truncate rounded-[12px] px-4 py-2.5 text-[15px] transition",
                        pathname === "/projects"
                          ? "font-medium text-[var(--foreground)]"
                          : "text-[rgba(20,20,20,0.58)] hover:text-[var(--foreground)]"
                      ].join(" ")}
                    >
                      All projects
                    </Link>

                    {projects.map((project) => {
                      const active = pathname === `/projects/${project.id}`;

                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className={[
                            "block truncate rounded-[12px] px-4 py-2.5 text-[15px] transition",
                            active
                              ? "font-medium text-[var(--foreground)]"
                              : "text-[rgba(20,20,20,0.58)] hover:text-[var(--foreground)]"
                          ].join(" ")}
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section>
                <p className="px-4 text-[13px] font-medium uppercase tracking-[0.18em] text-[rgba(20,20,20,0.42)]">
                  Tools
                </p>
                <div className="mt-3 space-y-1.5">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-[14px] px-4 py-3 text-[17px] text-[rgba(20,20,20,0.72)]"
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </nav>

            <div className="border-t border-[var(--border)] px-8 py-8">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-semibold text-white">
                  N
                </div>
                <Link href="/projects" className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-medium tracking-[-0.02em] text-[var(--foreground)]">
                    Workspace
                  </p>
                  <p className="text-sm text-[var(--muted)]">Pro plan</p>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[var(--background)]">{children}</main>
      </div>
    </div>
  );
}

function LogoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7.5 8.25h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 12h6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 15.75h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.5" y="4.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="4.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4.5" y="13.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function UsageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.75 7.5h14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.75 12h10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.75 16.5h7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GlossaryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v4.5l2.75 1.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.75v2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 18.15v2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m6.17 6.17 1.49 1.49" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m16.34 16.34 1.49 1.49" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.75 12h2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18.15 12h2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m6.17 17.83 1.49-1.49" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m16.34 7.66 1.49-1.49" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.05" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
