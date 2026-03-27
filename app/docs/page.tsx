import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[960px] px-5 py-16 sm:px-7 lg:px-8">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">/ Docs</p>
          <h1 className="[font-family:var(--font-display)] mt-5 text-[clamp(2.6rem,4vw,4.2rem)] leading-[0.92] tracking-[-0.065em]">
            Product docs and setup guides.
          </h1>
          <p className="mt-5 max-w-[620px] text-[15px] leading-8 text-[var(--muted)]">
            This placeholder docs page keeps the footer links functional for now. The next step would be a real
            documentation structure for file formats, credits, and team workflows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              Back to products
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
