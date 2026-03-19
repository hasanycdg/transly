"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import type { DashboardShellData } from "@/types/workspace";

type DashboardShellProps = {
  children: ReactNode;
  shellData: DashboardShellData;
};

const secondaryNavItems = [
  { label: "Usage", href: "/usage", icon: UsageIcon },
  { label: "Glossary", href: "/glossary", icon: GlossaryIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon }
];

export function DashboardShell({ children, shellData }: DashboardShellProps) {
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const projects = shellData.projects;

  return (
    <div className="h-screen overflow-hidden bg-[var(--background)]">
      <div className="flex h-screen">
        <aside className="hidden h-screen w-[212px] shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-white lg:flex">
          <div className="flex items-center gap-[9px] border-b border-[var(--border-light)] px-4 pb-4 pt-5">
            <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[var(--foreground)] text-white">
              <LogoIcon />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.3px] text-[var(--foreground)]">
              Translayr
            </span>
          </div>

          <div className="px-2 py-[10px]">
            <div className="px-2 pb-1 pt-[10px] text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--muted-soft)]">
              Workspace
            </div>
            <button
              type="button"
              aria-expanded={projectsOpen}
              onClick={() => setProjectsOpen((current) => !current)}
              className="flex w-full items-center gap-2 rounded-[6px] bg-[var(--background)] px-2 py-1.5 text-left text-[13px] font-medium text-[var(--foreground)]"
            >
              <ProjectsIcon />
              <span className="flex-1">Projects</span>
              <ChevronIcon open={projectsOpen} />
            </button>
            {projectsOpen ? (
              <div className="pb-[6px] pl-[18px] pt-[1px]">
                <div className="space-y-[1px]">
                  <Link
                    href="/projects"
                    className={[
                      "block truncate rounded-[5px] px-2 py-[5px] text-[12.5px] transition",
                      pathname === "/projects"
                        ? "font-medium text-[var(--foreground)]"
                        : "text-[rgba(17,17,16,0.42)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
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
                          "block truncate rounded-[5px] px-2 py-[5px] text-[12.5px] transition",
                          active
                            ? "font-medium text-[var(--foreground)]"
                            : "text-[rgba(17,17,16,0.42)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                        ].join(" ")}
                        title={project.name}
                      >
                        {project.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="space-y-[1px] pt-[8px]">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = item.href ? pathname.startsWith(item.href) : false;

                const className = [
                  "flex w-full items-center gap-2 rounded-[6px] px-2 py-2 text-left text-[13px] font-medium transition",
                  active
                    ? "bg-[var(--background)] text-[var(--foreground)]"
                    : "text-[rgba(17,17,16,0.72)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                ].join(" ");

                return item.href ? (
                  <Link key={item.label} href={item.href} className={className}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button key={item.label} type="button" className={className}>
                    <Icon />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-[9px] border-t border-[var(--border-light)] px-[14px] py-3">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--foreground)] text-[10px] font-semibold text-white">
              {shellData.workspaceAvatarLabel}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-[var(--foreground)]">
                {shellData.workspaceName}
              </p>
              <p className="text-[11px] text-[var(--muted-soft)]">{shellData.workspacePlanName} plan</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}

function LogoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M1 3h10M1 6h7M1 9h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function UsageIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 4h11M2 7.5h8M2 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function GlossaryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M7.5 1.5a6 6 0 100 12 6 6 0 000-12zM7.5 5v3l2 1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.2 3.2l1 1M10.8 10.8l1 1M10.8 3.2l-1 1M3.2 10.8l1-1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={["transition-transform", open ? "rotate-90" : ""].join(" ")}
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
