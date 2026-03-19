"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Projects", href: "/projects", icon: ProjectsIcon },
  { label: "Usage", icon: UsageIcon },
  { label: "Glossary", icon: GlossaryIcon },
  { label: "Settings", icon: SettingsIcon }
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 border-r border-[var(--border)] bg-[rgba(255,255,255,0.7)] px-6 py-7 lg:flex lg:flex-col">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[var(--foreground)]">
              <LogoIcon />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                Translayr
              </h1>
              <p className="text-sm text-[var(--muted)]">Localization Hub</p>
            </div>
          </div>

          <nav className="mt-14 space-y-2">
            {navItems.map((item) => {
              const active = item.href ? pathname.startsWith(item.href) : false;
              const Icon = item.icon;

              if (!item.href) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] text-[var(--muted)]"
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition",
                    active
                      ? "bg-[rgba(20,20,20,0.04)] font-medium text-[var(--foreground)]"
                      : "text-[var(--foreground)] hover:bg-[rgba(20,20,20,0.03)]"
                  ].join(" ")}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(245,246,250,0.9))] p-4 shadow-[var(--shadow)]">
            <p className="text-[13px] font-semibold text-[var(--foreground)]">Usage Meter</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(20,20,20,0.08)]">
              <div className="h-full w-[64%] rounded-full bg-[rgba(20,20,20,0.42)]" />
            </div>
            <p className="mt-3 text-[13px] text-[var(--muted)]">Progress bar 23.56 GB</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 md:px-8">
          <div className="mx-auto max-w-[1040px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.5 12 12 16.5 20.5 12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3.5 16.5 12 21l8.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.75h7.5L19 8.25v12H7v-16.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 3.75v4.5H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function UsageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 18.25h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m6.5 15 3.75-4.25 3.25 2.5L18 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlossaryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6.75C4 5.78 4.78 5 5.75 5h4.5c.97 0 1.75.78 1.75 1.75v10.5c0-.97-.78-1.75-1.75-1.75h-4.5A1.75 1.75 0 0 0 4 17.25V6.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 6.75C12 5.78 12.78 5 13.75 5h4.5C19.22 5 20 5.78 20 6.75v10.5c0-.97-.78-1.75-1.75-1.75h-4.5c-.97 0-1.75.78-1.75 1.75V6.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 8.25 2.3-1.85 2.7 1.55-.12 2.95 2.02 1.98-1.02 2.96-2.8.46L12 18.75l-2.08-1.45-2.8-.46-1.02-2.96 2.02-1.98-.12-2.95 2.7-1.55L12 8.25Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.35" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
