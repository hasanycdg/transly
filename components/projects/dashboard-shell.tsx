"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Projects", href: "/projects" },
  { label: "Usage" },
  { label: "Glossary" },
  { label: "Settings" }
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[rgb(244,244,240)]">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 md:px-6">
        <aside className="hidden w-[264px] shrink-0 flex-col rounded-[32px] border border-[rgba(36,39,32,0.08)] bg-[rgba(255,255,255,0.86)] p-5 shadow-[0_20px_60px_rgba(21,25,19,0.05)] backdrop-blur lg:flex">
          <div className="rounded-[24px] border border-[rgba(36,39,32,0.08)] bg-[rgba(247,247,244,0.84)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
              Translayr
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Localization workspace
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Project-based translation management for developer teams and WordPress agencies.
            </p>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const active = item.href ? pathname.startsWith(item.href) : false;

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={[
                      "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-[var(--foreground)] text-white"
                        : "text-[var(--foreground)] hover:bg-[rgba(36,39,32,0.05)]"
                    ].join(" ")}
                  >
                    <span>{item.label}</span>
                    {active ? <span className="text-xs uppercase tracking-[0.16em]">Live</span> : null}
                  </Link>
                );
              }

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[rgba(31,26,20,0.5)]"
                >
                  <span>{item.label}</span>
                  <span className="rounded-full border border-[rgba(36,39,32,0.08)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                    Soon
                  </span>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[24px] border border-[rgba(36,39,32,0.08)] bg-white p-4">
            <p className="text-sm font-medium text-[var(--foreground)]">Premium workflow</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Structure-safe translation, project tracking, and export control in one place.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
