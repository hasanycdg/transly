"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { useAppLocale } from "@/components/app-locale-provider";
import { BILLING_PLANS } from "@/lib/billing/plans";

const DISPLAY_FONT_CLASS_NAME = "[font-family:var(--font-display)] font-medium tracking-[-0.065em]";
const EYEBROW_CLASS = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]";
const PRIMARY_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center rounded-[14px] bg-[var(--foreground)] px-6 text-[14px] font-medium text-[var(--surface)] transition hover:opacity-90";
const REGISTER_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center rounded-[14px] !bg-[#1a4faf] px-6 text-[14px] font-medium !text-white transition hover:!bg-[#173f8f]";
const SECONDARY_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-transparent px-5 text-[14px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]";

type MarketingPageId = "home" | "products" | "workspace" | "files" | "pricing";

type MarketingNavItem = {
  href: string;
  label: string;
  active: boolean;
};

type ProductCard = {
  id: Exclude<MarketingPageId, "home" | "products" | "pricing">;
  href: string;
  label: string;
  title: string;
  body: string;
  points: string[];
};

type HeroAction = {
  href: string;
  label: string;
  tone: "primary" | "secondary";
};

type PageHero = {
  eyebrow: string;
  title: string;
  body: string;
  actions: HeroAction[];
};

type DetailBlock = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
};

type PageFrameProps = {
  hero: PageHero;
  activePage: MarketingPageId;
  navItems: MarketingNavItem[];
  productCards: ProductCard[];
  footer: MarketingFooterCopy;
  loginLabel: string;
  registerLabel: string;
  cta: MarketingCtaCopy;
  children: React.ReactNode;
  visual: React.ReactNode;
  locale: "de" | "en";
  onLocaleChange: (locale: "de" | "en") => void;
  heroVisualLarge?: boolean;
};

type MarketingFooterCopy = {
  copyright: string;
  privacy: string;
  terms: string;
  status: string;
};

type MarketingCtaCopy = {
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
};

type PricingPlanView = {
  id: string;
  name: string;
  price: string;
  suffix: string;
  note?: string;
  credits: string;
  description: string;
  features: string[];
  featured: boolean;
};

type PricingInterval = "monthly" | "yearly";
type MarketingLocale = "de" | "en";
type MarketingFaqItem = { question: string; answer: string };

type MarketingCopy = {
  navHome: string;
  navProducts: string;
  navPricing: string;
  navLogin: string;
  navRegister: string;
  footer: MarketingFooterCopy;
  cta: MarketingCtaCopy;
  productCards: ProductCard[];
  homeHero: PageHero;
  homeProductsEyebrow: string;
  homeProductsTitle: string;
  homeProductsBody: string;
  solutionEyebrow: string;
  solutionTitle: string;
  solutionBody: string;
  featureCards: Array<{ title: string; body: string }>;
  metrics: Array<{ value: string; label: string }>;
  homeOperationsEyebrow: string;
  homeOperationsTitle: string;
  homeOperationsBody: string;
  homeOperationsRows: Array<{ title: string; body: string }>;
  homeFaqEyebrow: string;
  homeFaqTitle: string;
  homeFaqBody: string;
  homeFaqItems: MarketingFaqItem[];
  productsHero: PageHero;
  productsGridEyebrow: string;
  productsGridTitle: string;
  productsGridBody: string;
  compareEyebrow: string;
  compareTitle: string;
  compareBody: string;
  compareRows: Array<{ title: string; body: string }>;
  workspaceHero: PageHero;
  workspaceBlocks: DetailBlock[];
  filesHero: PageHero;
  filesBlocks: DetailBlock[];
  textHero: PageHero;
  textBlocks: DetailBlock[];
  pricingHero: PageHero;
  pricingGridEyebrow: string;
  pricingGridTitle: string;
  pricingGridBody: string;
  pricingNotes: Array<{ title: string; body: string }>;
  pricingComparison: Array<{ label: string; values: boolean[] }>;
};

const MARKETING_LOCALE_STORAGE_KEY = "translayr-marketing-locale";
const marketingLocaleSubscribers = new Set<() => void>();

function readStoredMarketingLocale(): MarketingLocale | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedLocale = window.localStorage.getItem(MARKETING_LOCALE_STORAGE_KEY);
    return storedLocale === "de" || storedLocale === "en" ? storedLocale : null;
  } catch {
    return null;
  }
}

function subscribeToMarketingLocale(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === MARKETING_LOCALE_STORAGE_KEY) {
      onStoreChange();
    }
  };

  marketingLocaleSubscribers.add(onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    marketingLocaleSubscribers.delete(onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function writeStoredMarketingLocale(locale: MarketingLocale) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(MARKETING_LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore storage write failures (private mode / blocked storage).
  }

  marketingLocaleSubscribers.forEach((notify) => notify());
}

function useMarketingLocale(serverLocale: MarketingLocale): MarketingLocale {
  return useSyncExternalStore(
    subscribeToMarketingLocale,
    () => readStoredMarketingLocale() ?? serverLocale,
    () => serverLocale
  );
}

export function LandingPage() {
  return <MarketingPage pageId="home" />;
}

export function MarketingPage({ pageId }: { pageId: MarketingPageId }) {
  const serverLocale = useAppLocale();
  const locale = useMarketingLocale(serverLocale);
  const [pricingInterval, setPricingInterval] = useState<PricingInterval>("monthly");

  const handleLocaleChange = (nextLocale: MarketingLocale) => {
    writeStoredMarketingLocale(nextLocale);
  };

  const copy = locale === "de" ? getGermanMarketingCopy() : getEnglishMarketingCopy();
  const navItems: MarketingNavItem[] = [
    {
      href: "/",
      label: copy.navHome,
      active: pageId === "home"
    },
    {
      href: "/products",
      label: copy.navProducts,
      active: pageId === "products" || pageId === "workspace" || pageId === "files"
    },
    {
      href: "/pricing",
      label: copy.navPricing,
      active: pageId === "pricing"
    }
  ];
  const productCards = copy.productCards;
  const pricingPlans = getPricingPlans(locale, pricingInterval);

  switch (pageId) {
    case "products":
      return (
        <PageFrame
          hero={copy.productsHero}
          activePage={pageId}
          navItems={navItems}
          productCards={productCards}
          footer={copy.footer}
          loginLabel={copy.navLogin}
          registerLabel={copy.navRegister}
          cta={copy.cta}
          visual={<ProductsOverviewVisual locale={locale} />}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        >
          <SectionIntro eyebrow={copy.productsGridEyebrow} title={copy.productsGridTitle} body={copy.productsGridBody} />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {productCards.map((card) => (
              <ProductLaneCard key={card.id} card={card} locale={locale} />
            ))}
          </div>

          <section className="mt-20 grid gap-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <p className={EYEBROW_CLASS}>
                {copy.compareEyebrow}
              </p>
              <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2rem,3vw,3rem)] leading-[0.96] text-[var(--foreground)]`}>
                {copy.compareTitle}
              </h2>
              <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-[var(--muted)]">
                {copy.compareBody}
              </p>
            </div>
            <div className="grid gap-4">
              {copy.compareRows.map((row) => (
                <div
                  key={row.title}
                  className="rounded-[22px] border border-[var(--border-light)] bg-[var(--background-strong)] px-5 py-5"
                >
                  <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                    {row.title}
                  </div>
                  <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">{row.body}</p>
                </div>
              ))}
            </div>
          </section>
        </PageFrame>
      );
    case "workspace":
      return (
        <ProductDetailPage
          activePage={pageId}
          navItems={navItems}
          productCards={productCards}
          footer={copy.footer}
          loginLabel={copy.navLogin}
          registerLabel={copy.navRegister}
          cta={copy.cta}
          hero={copy.workspaceHero}
          blocks={copy.workspaceBlocks}
          visual={<WorkspaceVisual locale={locale} />}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        />
      );
    case "files":
      return (
        <ProductDetailPage
          activePage={pageId}
          navItems={navItems}
          productCards={productCards}
          footer={copy.footer}
          loginLabel={copy.navLogin}
          registerLabel={copy.navRegister}
          cta={copy.cta}
          hero={copy.filesHero}
          blocks={copy.filesBlocks}
          visual={<FilesVisual locale={locale} />}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        />
      );
    case "pricing":
      return (
        <PageFrame
          hero={copy.pricingHero}
          activePage={pageId}
          navItems={navItems}
          productCards={productCards}
          footer={copy.footer}
          loginLabel={copy.navLogin}
          registerLabel={copy.navRegister}
          cta={copy.cta}
          visual={<PricingVisual locale={locale} />}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        >
          <section className="mt-12 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] px-6 py-8 shadow-[0_24px_80px_rgba(17,17,16,0.05)] lg:px-8 lg:py-10">
            <div className="mx-auto max-w-[720px] text-center">
              <SectionIntro eyebrow={copy.pricingGridEyebrow} title={copy.pricingGridTitle} body={copy.pricingGridBody} />
            </div>
            <div className="mx-auto mt-8 max-w-[720px]">
              <PricingIntervalToggle
                locale={locale}
                value={pricingInterval}
                onChange={setPricingInterval}
              />
            </div>
            <div className="mt-10 grid gap-5 xl:grid-cols-4">
              {pricingPlans.map((plan) => (
                <PricingPlanCard key={plan.id} plan={plan} locale={locale} />
              ))}
            </div>

            <div className="mt-16">
              <h3 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.6rem,2.5vw,2.2rem)] leading-[0.95] text-[var(--foreground)]`}>
                {locale === "de" ? "Feature-Vergleich" : "Feature comparison"}
              </h3>
              <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-[var(--muted)]">
                {locale === "de"
                  ? "Alle Funktionen im Überblick – was in welchem Plan enthalten ist."
                  : "All features at a glance – what is included in each plan."}
              </p>
              <div className="mt-8 overflow-x-auto rounded-[20px] border border-[var(--border)] bg-[var(--surface)]">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                        {locale === "de" ? "Funktion" : "Feature"}
                      </th>
                      {pricingPlans.map((plan) => (
                        <th key={plan.id} className="px-5 py-4 text-center text-[13px] font-semibold text-[var(--foreground)]">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {copy.pricingComparison.map((row, ri) => (
                      <tr key={row.label} className={ri > 0 ? "border-t border-[var(--border-light)]" : ""}>
                        <td className="px-5 py-3.5 font-medium text-[var(--foreground)]">{row.label}</td>
                        {row.values.map((val, ci) => (
                          <td key={ci} className="px-5 py-3.5 text-center">
                            {val === true ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--background-strong)] text-[var(--muted-soft)]">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <section className="mt-8 grid gap-6 lg:grid-cols-3">
              {copy.pricingNotes.map((note) => (
                <div
                  key={note.title}
                  className="rounded-[24px] border border-[var(--border)] bg-[var(--background-strong)] px-6 py-6"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                    {note.title}
                  </p>
                  <p className="mt-4 text-[14px] leading-7 text-[var(--muted)]">{note.body}</p>
                </div>
              ))}
            </section>
          </section>
        </PageFrame>
      );
    case "home":
    default:
      return (
        <PageFrame
          hero={copy.homeHero}
          activePage={pageId}
          navItems={navItems}
          productCards={productCards}
          footer={copy.footer}
          loginLabel={copy.navLogin}
          registerLabel={copy.navRegister}
          cta={copy.cta}
          visual={<HomeHeroVisual locale={locale} />}
          locale={locale}
          heroVisualLarge
          onLocaleChange={handleLocaleChange}
        >

          <SectionIntro eyebrow={copy.homeProductsEyebrow} title={copy.homeProductsTitle} body={copy.homeProductsBody} />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {productCards.map((card) => (
              <ProductLaneCard key={card.id} card={card} locale={locale} />
            ))}
          </div>

          <section className="mt-32">
            <SectionIntro eyebrow={copy.solutionEyebrow} title={copy.solutionTitle} body={copy.solutionBody} />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {copy.featureCards.map((card) => (
                <div key={card.title} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-6 py-6">
                  <h3 className={`${DISPLAY_FONT_CLASS_NAME} text-[clamp(1.6rem,2vw,2rem)] leading-[0.94] text-[var(--foreground)]`}>
                    {card.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">{card.body}</p>
                </div>
              ))}
            </div>
          </section>

          <DarkContrastSection locale={locale} />

          <section className="mt-32">
            <SectionIntro eyebrow={copy.pricingGridEyebrow} title={copy.pricingGridTitle} body={copy.pricingGridBody} />
            <PricingIntervalToggle
              locale={locale}
              value={pricingInterval}
              onChange={setPricingInterval}
            />
            <div className="mt-12 grid gap-5 xl:grid-cols-4">
              {pricingPlans.map((plan) => (
                <PricingPlanCard key={plan.id} plan={plan} locale={locale} compact />
              ))}
            </div>
          </section>

          <LandingFaqSection
            locale={locale}
            eyebrow={copy.homeFaqEyebrow}
            title={copy.homeFaqTitle}
            body={copy.homeFaqBody}
            items={copy.homeFaqItems}
          />
          <LandingFaqCtaSection locale={locale} />
        </PageFrame>
      );
  }
}

function ProductDetailPage({
  hero,
  blocks,
  visual,
  ...frameProps
}: Omit<PageFrameProps, "children"> & {
  blocks: DetailBlock[];
}) {
  return (
    <PageFrame hero={hero} visual={visual} {...frameProps}>
      <section className="grid gap-5 xl:grid-cols-3">
        {blocks.map((block) => (
          <div
            key={block.title}
            className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] px-6 py-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
              {block.eyebrow}
            </p>
            <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
              {block.title}
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-[var(--muted)]">{block.body}</p>
            <ul className="mt-5 space-y-3 text-[13px] leading-6 text-[var(--foreground)]">
              {block.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--foreground)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </PageFrame>
  );
}

function PageFrame({
  hero,
  activePage,
  navItems,
  productCards,
  footer,
  loginLabel,
  registerLabel,
  cta,
  children,
  visual,
  locale,
  onLocaleChange,
  heroVisualLarge = false
}: PageFrameProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--surface)] text-[var(--foreground)]">
      <MarketingHeader
        navItems={navItems}
        loginLabel={loginLabel}
        registerLabel={registerLabel}
        locale={locale}
        onLocaleChange={onLocaleChange}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,79,175,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(17,17,16,0.06),transparent_24%),radial-gradient(circle_at_50%_35%,rgba(17,17,16,0.05),transparent_34%)]" />
      {activePage === "products" || activePage === "workspace" || activePage === "files" ? (
        <ProductTabs
          activePage={activePage}
          cards={productCards}
        />
      ) : null}

      <div className="relative mx-auto max-w-[1280px] px-5 pb-24 pt-6 sm:px-7 lg:px-8 lg:pt-10">
        <section
          className={[
            "grid gap-12 border-b border-[var(--border)] pb-20 lg:items-center",
            heroVisualLarge ? "lg:grid-cols-[0.75fr_1.25fr]" : "lg:grid-cols-[0.92fr_1.08fr]"
          ].join(" ")}
        >
          <div className="max-w-[560px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-soft)]">
              / {hero.eyebrow}
            </p>
            <h1 className={`${DISPLAY_FONT_CLASS_NAME} mt-6 text-[clamp(3.4rem,5.8vw,6.2rem)] leading-[0.88] text-[var(--foreground)]`}>
              {hero.title}
            </h1>
            <p className="mt-7 max-w-[520px] text-[18px] leading-9 tracking-[-0.01em] text-[var(--muted)]">
              {hero.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {hero.actions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className={
                    action.href === "/register"
                      ? REGISTER_BUTTON_CLASS
                      : action.tone === "primary"
                        ? PRIMARY_BUTTON_CLASS
                        : SECONDARY_BUTTON_CLASS
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className={heroVisualLarge ? "lg:pl-4" : undefined}>{visual}</div>
        </section>

        <div className="pt-20">{children}</div>
      </div>

      <MarketingFooter footer={footer} locale={locale} />
    </main>
  );
}

function MarketingHeader({
  navItems,
  loginLabel,
  registerLabel,
  locale,
  onLocaleChange
}: {
  navItems: MarketingNavItem[];
  loginLabel: string;
  registerLabel: string;
  locale: "de" | "en";
  onLocaleChange: (locale: "de" | "en") => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuId = "marketing-mobile-menu";

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-[120] border-b border-[var(--border)] bg-[color:rgba(255,255,255,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 sm:px-7 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center text-[var(--foreground)]">
            <BrandMark />
          </span>
          <span className="text-[16px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">Translayr</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "relative py-2 text-[14px] font-medium transition",
                item.active
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              ].join(" ")}
            >
              {item.label}
              {item.active ? <span className="absolute inset-x-0 -bottom-4 h-0.5 bg-[var(--foreground)]" /> : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden px-2 py-2 text-[14px] font-medium text-[var(--foreground)] transition hover:opacity-70 md:inline-flex"
          >
            {loginLabel}
          </Link>
          <Link
            href="/register"
            className="hidden rounded-full !bg-[#1a4faf] px-4 py-2 text-[14px] font-medium !text-white transition hover:!bg-[#173f8f] md:inline-flex"
          >
            {registerLabel}
          </Link>
          <div className="pointer-events-auto relative hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 md:flex">
            <button
              type="button"
              onClick={() => onLocaleChange("en")}
              className={[
                "relative z-10 cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-medium transition",
                locale === "en"
                  ? "bg-[var(--foreground)] text-[var(--surface)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              ].join(" ")}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("de")}
              className={[
                "relative z-10 cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-medium transition",
                locale === "de"
                  ? "bg-[var(--foreground)] text-[var(--surface)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              ].join(" ")}
            >
              DE
            </button>
          </div>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            aria-label={mobileOpen ? (locale === "de" ? "Menü schließen" : "Close menu") : locale === "de" ? "Menü öffnen" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
            className="pointer-events-auto relative z-10 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--background-strong)] md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {mobileOpen ? (
                <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              ) : (
                <>
                  <path d="M3 5H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M3 9H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M3 13H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id={mobileMenuId} className="border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
          <div className="mx-auto max-w-[1280px] px-5 py-5 sm:px-7">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "rounded-[10px] px-4 py-3 text-[14px] font-medium transition",
                    item.active
                      ? "bg-[var(--background-strong)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:bg-[var(--background-strong)] hover:text-[var(--foreground)]"
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-6">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-[10px] px-4 py-3 text-center text-[14px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
              >
                {loginLabel}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-[10px] !bg-[#1a4faf] px-4 py-3 text-center text-[14px] font-medium !text-white transition hover:!bg-[#173f8f]"
              >
                {registerLabel}
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1 rounded-full border border-[var(--border)] bg-[var(--background-strong)] p-1">
              <button
                type="button"
                onClick={() => { onLocaleChange("en"); setMobileOpen(false); }}
                className={[
                  "rounded-full px-4 py-2 text-[12px] font-medium transition",
                  locale === "en"
                    ? "bg-[var(--foreground)] text-[var(--surface)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                ].join(" ")}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => { onLocaleChange("de"); setMobileOpen(false); }}
                className={[
                  "rounded-full px-4 py-2 text-[12px] font-medium transition",
                  locale === "de"
                    ? "bg-[var(--foreground)] text-[var(--surface)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                ].join(" ")}
              >
                DE
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ProductTabs({
  activePage,
  cards
}: {
  activePage: MarketingPageId;
  cards: ProductCard[];
}) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-[1280px] gap-8 overflow-x-auto px-5 py-0 sm:px-7 lg:px-8">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className={[
              "relative shrink-0 py-4 text-[15px] font-medium transition",
              activePage === card.id
                ? "text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            ].join(" ")}
          >
            {card.label}
            {activePage === card.id ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--foreground)]" /> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-[680px]">
      <p className={EYEBROW_CLASS}>/ {eyebrow}</p>
      <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(2rem,3vw,3.2rem)] leading-[0.96] text-[var(--foreground)]`}>
        {title}
      </h2>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">{body}</p>
    </div>
  );
}

function LandingFaqSection({
  locale,
  eyebrow,
  title,
  body,
  items
}: {
  locale: "de" | "en";
  eyebrow: string;
  title: string;
  body: string;
  items: MarketingFaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-32 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 lg:p-8">
      <SectionIntro eyebrow={eyebrow} title={title} body={body} />
      <div className="mt-10 divide-y divide-[var(--border-light)] rounded-[20px] border border-[var(--border)] bg-[var(--background-strong)] px-5">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <article key={item.question} className="py-4">
              <button
                type="button"
                onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <span className="text-[15px] font-semibold leading-7 text-[var(--foreground)]">{item.question}</span>
                <span className="mt-[3px] inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[14px] text-[var(--muted)]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <p className="mt-3 max-w-[920px] pr-10 text-[14px] leading-7 text-[var(--muted)]">{item.answer}</p>
              ) : null}
            </article>
          );
        })}
      </div>
      <p className="mt-5 text-[12px] text-[var(--muted-soft)]">
        {locale === "de"
          ? "Noch Fragen? Schreib uns über Support oder starte direkt im Produkt mit echten Dateien."
          : "Still have questions? Contact support or start directly in the product with real files."}
      </p>
    </section>
  );
}

function LandingFaqCtaSection({ locale }: { locale: "de" | "en" }) {
  return (
    <section className="mt-10 rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-7 lg:p-10">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-soft)]">
        {locale === "de" ? "Nächster Schritt" : "Next step"}
      </p>
      <h3 className={`${DISPLAY_FONT_CLASS_NAME} mt-3 text-[clamp(1.9rem,2.9vw,2.8rem)] leading-[0.92] text-[var(--foreground)]`}>
        {locale === "de" ? "Bereit für deinen ersten Run?" : "Ready for your first run?"}
      </h3>
      <p className="mt-3 max-w-[820px] text-[15px] leading-8 text-[var(--muted)]">
        {locale === "de"
          ? "Starte kostenlos, lade echte Dateien hoch und sieh direkt, wie der Workflow in deinem Team funktioniert."
          : "Start free, upload real files, and see how the workflow behaves with your team setup."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-[15px] !bg-[#111110] px-6 text-[14px] font-medium !text-white transition hover:!bg-[#111110]"
          style={{ backgroundColor: "#111110", color: "#ffffff" }}
        >
          {locale === "de" ? "Kostenlos starten" : "Start free"}
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-12 items-center justify-center rounded-[15px] border border-[var(--border)] bg-[var(--surface)] px-6 text-[14px] font-medium text-[var(--foreground)] transition hover:bg-[var(--background-strong)]"
        >
          {locale === "de" ? "Preise ansehen" : "View pricing"}
        </Link>
      </div>
    </section>
  );
}

function ProductLaneCard({ card, locale }: { card: ProductCard; locale: "de" | "en" }) {
  return (
    <Link
      href={card.href}
      className="group flex h-full flex-col rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-6 py-6 shadow-[0_18px_50px_rgba(17,17,16,0.04)] transition hover:-translate-y-0.5 hover:border-[var(--border-strong)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">
        {card.label}
      </p>
      <h3 className={`${DISPLAY_FONT_CLASS_NAME} mt-5 text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.94] text-[var(--foreground)]`}>
        {card.title}
      </h3>
      <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">{card.body}</p>
      <ul className="mt-6 space-y-3 text-[13px] leading-6 text-[var(--foreground)]">
        {card.points.map((point) => (
          <li key={point} className="flex gap-3">
            <span className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[11px] text-white">
              ✓
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-3 pt-8 text-[15px] font-medium text-[var(--processing)]">
        <span>{locale === "de" ? "Mehr erfahren" : "Learn more"}</span>
        <span className="text-[22px] leading-none transition group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

function PricingPlanCard({
  plan,
  locale,
  compact = false
}: {
  plan: PricingPlanView;
  locale: "de" | "en";
  compact?: boolean;
}) {
  const [showMore, setShowMore] = useState(false);
  const visibleFeatures = showMore ? plan.features : plan.features.slice(0, 3);
  const hasMore = plan.features.length > 3;

  const card = (
    <div
      className={[
        "rounded-[26px] border px-6 py-6",
        plan.featured
          ? "border-[var(--processing)] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9ff_58%,#f3faf6_100%)] text-[var(--foreground)] shadow-[0_12px_40px_rgba(26,79,175,0.12)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={[
                "text-[11px] font-semibold uppercase tracking-[0.18em]",
                plan.featured ? "text-[var(--processing)]" : "text-[var(--muted-soft)]"
              ].join(" ")}
            >
              {plan.name}
            </p>
            {plan.featured ? (
              <span className="rounded-full bg-[var(--processing)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                {locale === "de" ? "Beliebtester Plan" : "Most popular"}
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className={`${DISPLAY_FONT_CLASS_NAME} text-[44px] leading-none`}>
              {plan.price}
            </span>
            <span className="pb-1 text-[var(--muted-soft)]">{plan.suffix}</span>
          </div>
          {plan.note ? <p className="mt-2 text-[11px] font-medium text-[var(--processing)]">{plan.note}</p> : null}
        </div>
        <span
          className={[
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
            plan.featured
              ? "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
              : "bg-[var(--background-strong)] text-[var(--muted)]"
          ].join(" ")}
        >
          {plan.credits}
        </span>
      </div>

      <ul className="mt-6 space-y-3 text-[13px] leading-6">
        {visibleFeatures.map((feature) => (
          <li key={feature} className="flex gap-3">
            <span className={["mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full", plan.featured ? "bg-[var(--processing)]" : "bg-[var(--foreground)]"].join(" ")} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="mt-4 text-[12px] font-medium text-[var(--processing)] transition hover:opacity-80"
        >
          {showMore
            ? locale === "de" ? "Weniger anzeigen" : "Show less"
            : locale === "de" ? "Mehr anzeigen" : "Show more"}
        </button>
      )}

      <Link
        href="/register"
        className={[
          "mt-5 inline-flex h-11 items-center justify-center rounded-full px-5 text-[13px] font-medium transition",
          plan.featured
            ? "!bg-[#1a4faf] !text-white hover:!bg-[#173f8f]"
            : "border border-[var(--border)] bg-[var(--background-strong)] text-[var(--foreground)] hover:bg-[var(--background)]"
        ].join(" ")}
      >
        {compact
          ? locale === "de"
            ? "Plan öffnen"
            : "Open plan"
          : locale === "de"
            ? "Mit diesem Plan starten"
            : "Start with this plan"}
      </Link>
    </div>
  );

  if (!plan.featured) {
    return card;
  }

  return (
    <div className="rounded-[28px] bg-[linear-gradient(135deg,var(--processing)_0%,rgba(26,127,75,0.6)_55%,rgba(17,17,16,0.15)_100%)] p-[2px]">
      {card}
    </div>
  );
}

function PricingIntervalToggle({
  locale,
  value,
  onChange
}: {
  locale: "de" | "en";
  value: PricingInterval;
  onChange: (value: PricingInterval) => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4 rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-soft)]">
          {locale === "de" ? "Abrechnung" : "Billing cadence"}
        </div>
        <div className="mt-1 text-[13px] text-[var(--muted)]">
          {locale === "de" ? "Jährlich zeigt 2 Monate Rabatt für bezahlte Pläne." : "Yearly shows a 2-month discount for paid plans."}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background-strong)] p-1">
        {[
          { id: "monthly", label: locale === "de" ? "Monatlich" : "Monthly" },
          { id: "yearly", label: locale === "de" ? "Jährlich" : "Yearly" }
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id as PricingInterval)}
            className={[
              "rounded-full px-4 py-2 text-[12.5px] font-medium transition",
              value === option.id
                ? "bg-[var(--processing-bg)] text-[var(--processing)] ring-1 ring-[var(--processing-border)]"
                : "text-[var(--muted)] hover:bg-[var(--surface)]"
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SocialProofSection({ locale }: { locale: "de" | "en" }) {
  const stats =
    locale === "de"
      ? [
          { value: "Viele Teams", label: "nutzen Translayr aktiv im Rollout" },
          { value: "300k+", label: "Wörter bereits übersetzt" },
          { value: "99.9%", label: "Datei-Exporte im ersten Durchlauf" }
        ]
      : [
          { value: "Many Teams", label: "actively using Translayr in rollout" },
          { value: "300k+", label: "words already translated" },
          { value: "99.9%", label: "successful file exports on first run" }
        ];

  return (
    <section className="mt-24 border-t border-[var(--border)] pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden">
          <p className={EYEBROW_CLASS}>/ {locale === "de" ? "Vertrauen" : "Social proof"}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <div key={stat.label}>
              <div
                className={[
                  "text-[clamp(3rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.08em]",
                  index === 0
                    ? "text-[var(--foreground)]"
                    : index === 1
                      ? "text-[var(--processing)]"
                      : "text-[var(--success)]"
                ].join(" ")}
              >
                {stat.value}
              </div>
              <div className="mt-3 max-w-[220px] text-[14px] leading-7 text-[var(--muted)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureTabs({ locale }: { locale: "de" | "en" }) {
  const [activeTab, setActiveTab] = useState<"workspace" | "files">("workspace");

  const workspaceData =
    locale === "de"
      ? {
          eyebrow: "Übersetzungs-Workspace",
          title: "Die operative Fläche für Projekte, Prüfung und Abrechnung.",
          body: "Translayr bündelt Projektstatus, letzte Übersetzungen, Glossar und Verbrauch in einer klaren Oberfläche.",
          points: [
            "Dashboard, Projekte und Verbrauch in einem Ablauf",
            "Prüfstatus und Fortschritt direkt sichtbar",
            "Abrechnung und Credits ohne Seitensprünge"
          ],
          visual: (
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--background-strong)] p-5">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">Workspace</span>
              </div>
              <div className="mt-4 grid gap-3">
                {["Mobile-App-Texte", "Help-Center-Update", "Website-Checkout"].map((item, i) => (
                  <div key={item} className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <div>
                      <div className="text-[12px] font-medium text-[var(--foreground)]">{item}</div>
                      <div className="mt-0.5 text-[10px] text-[var(--muted-soft)]">EN → DE, FR, ES</div>
                    </div>
                    <span
                      className={[
                        "rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]",
                        i === 0
                          ? "border border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]"
                          : i === 1
                            ? "border border-[var(--review-border)] bg-[var(--review-bg)] text-[var(--review)]"
                            : "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                      ].join(" ")}
                    >
                      {i === 0 ? "Processing" : i === 1 ? "Review" : "Done"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      : {
          eyebrow: "Translation workspace",
          title: "The operating surface for projects, review, and billing.",
          body: "Translayr pulls project state, recent translations, glossary context, and usage into one clean surface.",
          points: [
            "Dashboard, projects, and usage in one flow",
            "Review state and progress visible at a glance",
            "Billing and credits without leaving the product"
          ],
          visual: (
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--background-strong)] p-5">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">Workspace</span>
              </div>
              <div className="mt-4 grid gap-3">
                {["Mobile app strings", "Help center update", "Website checkout"].map((item, i) => (
                  <div key={item} className="flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <div>
                      <div className="text-[12px] font-medium text-[var(--foreground)]">{item}</div>
                      <div className="mt-0.5 text-[10px] text-[var(--muted-soft)]">EN → DE, FR, ES</div>
                    </div>
                    <span
                      className={[
                        "rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]",
                        i === 0
                          ? "border border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]"
                          : i === 1
                            ? "border border-[var(--review-border)] bg-[var(--review-bg)] text-[var(--review)]"
                            : "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                      ].join(" ")}
                    >
                      {i === 0 ? "Processing" : i === 1 ? "Review" : "Done"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        };

  const filesData =
    locale === "de"
      ? {
          eyebrow: "Dateiübersetzung",
          title: "Dateiübersetzung für reale Release-Dateien statt Demo-Uploads.",
          body: "Arbeite mit XLIFF, PO, STRINGS, RESX, CSV, TXT, DOCX und PPTX, ohne Struktur manuell neu aufzubauen.",
          points: [
            "Mehrformat-Upload mit wortbasiertem Credit-Modell",
            "Seitenvergleich in der Prüfung und Download im Originalformat",
            "Tag- und Struktur-Schutz für Lokalisierungsdateien"
          ],
          visual: (
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--background-strong)] p-5">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">Files</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                    {locale === "de" ? "Quelle" : "Source"}
                  </div>
                  <div className="mt-2 space-y-1.5 text-[11px] text-[var(--muted)]">
                    <div>Release notes for onboarding</div>
                    <div>New billing cycle logic</div>
                    <div>Review state improvements</div>
                  </div>
                </div>
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted-soft)]">
                    {locale === "de" ? "Übersetzung" : "Translation"}
                  </div>
                  <div className="mt-2 space-y-1.5 text-[11px] text-[var(--foreground)]">
                    <div>Versionshinweise für Onboarding</div>
                    <div>Neue Billing-Cycle-Logik</div>
                    <div>Verbesserte Review-Zustände</div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      : {
          eyebrow: "File translation",
          title: "File translation for real release assets, not demo uploads.",
          body: "Work with XLIFF, PO, STRINGS, RESX, CSV, TXT, DOCX, and PPTX without manually rebuilding structure.",
          points: [
            "Multi-format upload with word-based credits",
            "Side-by-side review and original-format download",
            "Tag and structure protection for localization files"
          ],
          visual: (
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--background-strong)] p-5">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">Files</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted-soft)]">Source</div>
                  <div className="mt-2 space-y-1.5 text-[11px] text-[var(--muted)]">
                    <div>Release notes for onboarding</div>
                    <div>New billing cycle logic</div>
                    <div>Review state improvements</div>
                  </div>
                </div>
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted-soft)]">Translation</div>
                  <div className="mt-2 space-y-1.5 text-[11px] text-[var(--foreground)]">
                    <div>Versionshinweise für Onboarding</div>
                    <div>Neue Billing-Cycle-Logik</div>
                    <div>Verbesserte Review-Zustände</div>
                  </div>
                </div>
              </div>
            </div>
          )
        };

  const active = activeTab === "workspace" ? workspaceData : filesData;

  return (
    <section className="mt-32 grid gap-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_70px_rgba(17,17,16,0.04)] lg:p-8">
      <div className="grid grid-cols-2 gap-1 rounded-full border border-[var(--border)] bg-[var(--background-strong)] p-1">
        <button
          type="button"
          aria-pressed={activeTab === "workspace"}
          onClick={() => setActiveTab("workspace")}
          className={[
            "w-full rounded-full px-3 py-2.5 text-center text-[12px] font-medium transition sm:px-5 sm:text-[13px]",
            activeTab === "workspace"
              ? "bg-[var(--foreground)] text-[var(--surface)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          ].join(" ")}
        >
          {locale === "de" ? "Übersetzungs-Workspace" : "Translation Workspace"}
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "files"}
          onClick={() => setActiveTab("files")}
          className={[
            "w-full rounded-full px-3 py-2.5 text-center text-[12px] font-medium transition sm:px-5 sm:text-[13px]",
            activeTab === "files"
              ? "bg-[var(--foreground)] text-[var(--surface)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          ].join(" ")}
        >
          {locale === "de" ? "Dateiübersetzung" : "File Translation"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <p className={EYEBROW_CLASS}>{active.eyebrow}</p>
          <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(1.8rem,2.5vw,2.6rem)] leading-[0.96] text-[var(--foreground)]`}>
            {active.title}
          </h2>
          <p className="mt-4 max-w-[520px] text-[15px] leading-7 text-[var(--muted)]">{active.body}</p>
          <ul className="mt-6 space-y-3 text-[13px] leading-6 text-[var(--foreground)]">
            {active.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[11px] text-white">
                  ✓
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <Link
            href={activeTab === "workspace" ? "/products/workspace" : "/products/file-translation"}
            className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-[var(--processing)] transition hover:opacity-80"
          >
            {locale === "de" ? "Mehr erfahren" : "Learn more"}
            <span className="text-[18px] leading-none">→</span>
          </Link>
        </div>
        <div>{active.visual}</div>
      </div>
    </section>
  );
}

function DarkContrastSection({ locale }: { locale: "de" | "en" }) {
  const metrics = getIconMetrics(locale);

  return (
    <section className="mt-24 overflow-hidden rounded-[32px] bg-[var(--foreground)] px-5 py-10 sm:rounded-[36px] sm:px-7 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--surface)]/60">
            {locale === "de" ? "Statement" : "Statement"}
          </p>
          <h2 className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[clamp(1.8rem,2.8vw,2.8rem)] leading-[0.92] text-[var(--surface)]`}>
            {locale === "de"
              ? "Übersetzung ist Teil deines Produkts — keine Nebenaufgabe."
              : "Translation is part of your product — not a side task."}
          </h2>
          <p className="mt-3 max-w-[640px] text-[15px] leading-7 text-[var(--surface)]/72">
            {locale === "de"
              ? "Viele Teams nutzen Translayr bereits täglich. Mehr als 400.000 Wörter wurden schon in produktiven Flows übersetzt."
              : "Many teams already use Translayr every day. More than 400,000 words have already been translated in production flows."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-[14px] bg-white px-6 text-[14px] font-medium text-[var(--foreground)] transition hover:bg-white/90"
            >
              {locale === "de" ? "Kostenlos starten" : "Start free"}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-white/30 px-6 text-[14px] font-medium text-white transition hover:bg-white/10"
            >
              {locale === "de" ? "Preise ansehen" : "View pricing"}
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((item) => (
            <div
              key={item.value + item.label}
              className="rounded-[14px] border border-white/15 bg-white/5 px-4 py-3 text-left"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/90">
                {item.icon}
              </div>
              <div className={`${DISPLAY_FONT_CLASS_NAME} mt-2 text-[clamp(1.3rem,1.8vw,1.7rem)] leading-none text-[var(--surface)]`}>
                {item.value}
              </div>
              <div className="mt-1 text-[12.5px] leading-5 text-[var(--surface)]/70">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getIconMetrics(locale: "de" | "en") {
  const teamIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 13a3 3 0 013 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  const uptimeIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  const workflowIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6.5h4a2 2 0 012 2v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 17.5h-4a2 2 0 01-2-2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  const formatIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return [
    {
      value: locale === "de" ? "Viele Teams" : "Many teams",
      label: locale === "de" ? "nutzen Translayr bereits im täglichen Rollout" : "are already using Translayr in daily rollout",
      icon: teamIcon
    },
    {
      value: "400k+",
      label: locale === "de" ? "Wörter sind bereits übersetzt worden" : "words have already been translated",
      icon: workflowIcon
    },
    {
      value: "99.9%",
      label: locale === "de" ? "Datei-Exporte laufen beim ersten Versuch" : "file exports succeed on first pass",
      icon: uptimeIcon
    },
    {
      value: "10+",
      label: locale === "de" ? "Dateiformate im produktiven Einsatz" : "file formats supported in production",
      icon: formatIcon
    }
  ];
}

function MarketingFooter({ footer, locale }: { footer: MarketingFooterCopy; locale: "de" | "en" }) {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:px-7 lg:grid-cols-[1fr_0.7fr_0.7fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center text-[var(--foreground)]">
              <BrandMark />
            </span>
            <div>
              <div className="text-[16px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">Translayr</div>
            </div>
          </div>
          <p className="mt-4 max-w-[320px] text-[13px] leading-6 text-[var(--muted)]">
            {locale === "de"
              ? "Translayr ist die operative Übersetzungsfläche für Releases, Review und Export."
              : "Translayr is the operating translation surface for releases, review, and export."}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-[13px]">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="transition hover:text-[var(--processing)]">LinkedIn</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="transition hover:text-[var(--processing)]">X</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="transition hover:text-[var(--processing)]">GitHub</a>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            {locale === "de" ? "Startseite" : "Home"}
          </div>
          <div className="mt-4 flex flex-col gap-3 text-[13px] text-[var(--muted)]">
            <Link href="/" className="transition hover:text-[var(--processing)]">{locale === "de" ? "Überblick" : "Overview"}</Link>
            <Link href="/products" className="transition hover:text-[var(--processing)]">{locale === "de" ? "Produkte" : "Products"}</Link>
            <Link href="/pricing" className="transition hover:text-[var(--processing)]">{locale === "de" ? "Preise" : "Pricing"}</Link>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            {locale === "de" ? "Unternehmen" : "Company"}
          </div>
          <div className="mt-4 flex flex-col gap-3 text-[13px] text-[var(--muted)]">
            <Link href="/blog" className="transition hover:text-[var(--processing)]">Blog</Link>
            <Link href="/docs" className="transition hover:text-[var(--processing)]">Docs</Link>
            <Link href="/" className="transition hover:text-[var(--processing)]">{locale === "de" ? "Kontakt" : "Contact"}</Link>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            {locale === "de" ? "Rechtliches" : "Legal"}
          </div>
          <div className="mt-4 flex flex-col gap-3 text-[13px] text-[var(--muted)]">
            <Link href="/terms" className="transition hover:text-[var(--processing)]">{footer.terms}</Link>
            <Link href="/privacy" className="transition hover:text-[var(--processing)]">{footer.privacy}</Link>
            <Link href="/status" className="transition hover:text-[var(--processing)]">{footer.status}</Link>
          </div>
          <div className="mt-6 text-[12px] text-[var(--muted-soft)]">{footer.copyright}</div>
        </div>
      </div>
    </footer>
  );
}

function HomeHeroVisual({ locale }: { locale: "de" | "en" }) {
  const segments =
    locale === "de"
      ? [
          {
            source: "Update pricing copy in checkout",
            target: "Pricing-Texte im Checkout aktualisieren"
          },
          {
            source: "Refresh onboarding release notes",
            target: "Release Notes für das Onboarding aktualisieren"
          },
          {
            source: "Translate support macro for refunds",
            target: "Support-Makro für Erstattungen übersetzen"
          },
          {
            source: "Export DE and FR handoff package",
            target: "DE- und FR-Übergabepaket exportieren"
          }
        ]
      : [
          {
            source: "Update pricing copy in checkout",
            target: "Pricing copy updated in checkout"
          },
          {
            source: "Refresh onboarding release notes",
            target: "Onboarding release notes refreshed"
          },
          {
            source: "Translate support macro for refunds",
            target: "Refund support macro translated"
          },
          {
            source: "Export DE and FR handoff package",
            target: "DE and FR handoff package exported"
          }
        ];
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrame((current) => (current + 1) % (segments.length + 1));
    }, 1300);

    return () => window.clearInterval(interval);
  }, [segments.length]);

  const translatedCount = Math.min(frame, segments.length);
  const progress = `${Math.max((translatedCount / segments.length) * 100, 8)}%`;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_40px_120px_rgba(17,17,16,0.08)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" />
        <div className="ml-3 text-[11px] uppercase tracking-[0.14em] text-[var(--muted-soft)]">
          {locale === "de" ? "Workspace-Vorschau" : "Workspace preview"}
        </div>
      </div>
      <div className="grid min-h-[640px] grid-cols-[94px_minmax(0,1fr)]">
        <aside className="border-r border-[var(--border)] bg-[var(--background-strong)] px-3 py-4">
          <div className="space-y-2">
            {[
              locale === "de" ? "Dashboard" : "Dashboard",
              locale === "de" ? "Projekte" : "Projects",
              locale === "de" ? "Berichte" : "Reports",
              locale === "de" ? "Verbrauch" : "Usage"
            ].map((item, index) => (
              <div
                key={item}
                className={[
                  "rounded-[12px] px-3 py-2 text-[11px] font-medium",
                  index === 0 ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>
        <div className="bg-[linear-gradient(180deg,var(--surface)_0%,#fbfbfa_100%)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {locale === "de" ? "Dashboard" : "Dashboard"}
            </h3>
            <span className="rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--success)]">
              Live
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                {locale === "de" ? "Nutzung diesen Monat" : "Usage this month"}
              </div>
              <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">$1,759</div>
              <div className="mt-4 space-y-3">
                {[
                  { label: locale === "de" ? "Wörter" : "Words", value: "100", tone: "bg-[var(--processing)]" },
                  { label: locale === "de" ? "Dateien" : "Files", value: "48", tone: "bg-[var(--success)]" },
                  { label: locale === "de" ? "Dokumente" : "Documents", value: "12", tone: "bg-[var(--review)]" },
                  { label: locale === "de" ? "OCR" : "OCR", value: "8", tone: "bg-[var(--border-strong)]" }
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-[72px_minmax(0,1fr)_32px] items-center gap-3 text-[11px] text-[var(--muted)]">
                    <span>{item.label}</span>
                    <div className="h-2 rounded-full bg-[var(--background-strong)] overflow-hidden">
                      <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${Math.max(Number(item.value), 8)}%` }} />
                    </div>
                    <span className="text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                {locale === "de" ? "Live-Workflow" : "Wordflow now"}
              </div>
              <div className="mt-4 flex h-[150px] items-end justify-between gap-3">
                {[34, 52, 73, 46, 67].map((bar, index) => (
                  <div key={bar} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={[
                        "w-full rounded-t-[10px]",
                        index === 1 ? "bg-[var(--processing)]" : index === 2 ? "bg-[var(--success)]" : "bg-[var(--border)]"
                      ].join(" ")}
                      style={{ height: `${bar}%` }}
                    />
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted-soft)]">
                      {["Mon", "Tue", "Wed", "Thu", "Fri"][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                {locale === "de" ? "Live-Übersetzungswarteschlange" : "Live translation queue"}
              </div>
              <div className="text-[11px] text-[var(--muted-soft)]">EN → DE · FR</div>
            </div>
            <div className="mt-4 space-y-2">
              {segments.map((segment, index) => {
                const isDone = index < translatedCount;
                const isActive = index === translatedCount && translatedCount < segments.length;

                return (
                  <div key={segment.source} className="grid grid-cols-[1.4fr_1fr_88px] items-center gap-3 rounded-[12px] border border-[var(--border-light)] px-3 py-2.5 text-[12px]">
                    <div className="truncate text-[var(--foreground)]">{segment.source}</div>
                    <div className="truncate text-[var(--muted)]">{isDone ? segment.target : locale === "de" ? "Wird übersetzt…" : "Translating…"}</div>
                    <div className="flex justify-end">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          isDone
                            ? "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                            : isActive
                              ? "border border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]"
                              : "border border-[var(--border)] bg-[var(--background-strong)] text-[var(--muted-soft)]"
                        ].join(" ")}
                      >
                        {isDone ? "Done" : isActive ? "Live" : "Queued"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-2 rounded-full bg-[var(--background-strong)]">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--processing)_0%,var(--success)_100%)] transition-all duration-700" style={{ width: progress }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsOverviewVisual({ locale }: { locale: "de" | "en" }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid gap-px bg-[var(--border-light)] md:grid-cols-3">
        {[
          locale === "de"
            ? { title: "Workspace", body: "Projekte, Review und Billing in einer Fläche." }
            : { title: "Workspace", body: "Projects, review, and billing in one surface." },
          locale === "de"
            ? { title: "Files", body: "Format-sichere Uploads und Exporte." }
            : { title: "Files", body: "Format-safe uploads and exports." },
          locale === "de"
            ? { title: "Text", body: "Direkte Übersetzung für schnelle Inhalte." }
            : { title: "Text", body: "Direct translation for fast content output." }
        ].map((item) => (
          <div key={item.title} className="bg-[var(--background-strong)] px-5 py-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
              {item.title}
            </div>
            <p className="mt-4 text-[14px] leading-7 text-[var(--muted)]">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspaceVisual({ locale }: { locale: "de" | "en" }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid min-h-[420px] lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="border-b border-[var(--border)] bg-[var(--background-strong)] p-4 lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            {[
              locale === "de" ? "Dashboard" : "Dashboard",
              locale === "de" ? "Projekte" : "Projects",
              locale === "de" ? "Verbrauch" : "Usage",
              locale === "de" ? "Glossar" : "Glossary"
            ].map((item, index) => (
              <div
                key={item}
                className={[
                  "rounded-[14px] px-3 py-2.5 text-[12.5px] font-medium",
                  index === 1 ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)]"
                ].join(" ")}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              locale === "de" ? "Wörter diesen Monat" : "Words this month",
              locale === "de" ? "Review offen" : "In review",
              locale === "de" ? "Kosten aktuell" : "Current spend"
            ].map((item, index) => (
              <div key={item} className="rounded-[18px] border border-[var(--border)] bg-[var(--background-strong)] px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">{item}</div>
                <div className="mt-3 text-[26px] font-semibold tracking-[-0.05em] text-[var(--foreground)]">
                  {index === 0 ? "48K" : index === 1 ? "12" : "€49"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {[
              locale === "de" ? "Mobile-App-Texte" : "Mobile app strings",
              locale === "de" ? "Help-Center-Update" : "Help center update",
              locale === "de" ? "Website-Checkout" : "Website checkout"
            ].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div>
                  <div className="text-[13px] font-medium text-[var(--foreground)]">{item}</div>
                  <div className="mt-1 text-[11.5px] text-[var(--muted-soft)]">EN → DE, FR, ES</div>
                </div>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                    index === 0
                      ? "border border-[var(--processing-border)] bg-[var(--processing-bg)] text-[var(--processing)]"
                      : index === 1
                        ? "border border-[var(--review-border)] bg-[var(--review-bg)] text-[var(--review)]"
                        : "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                  ].join(" ")}
                >
                  {index === 0 ? "Processing" : index === 1 ? "Review" : "Done"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilesVisual({ locale }: { locale: "de" | "en" }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] bg-[var(--background-strong)] px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {["XLIFF", "PO", "STRINGS", "RESX", "CSV", "TXT", "DOCX", "PPTX"].map((format) => (
            <span key={format} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[var(--muted)]">
              {format}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--background-strong)] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            {locale === "de" ? "Upload" : "Upload"}
          </div>
          <div className="mt-5 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-[14px] text-[var(--muted)]">
            {locale === "de" ? "Dateien hier hineinziehen" : "Drop files here"}
          </div>
          <div className="mt-4 text-[12px] text-[var(--muted-soft)]">
            {locale === "de" ? "Struktur und Tags bleiben erhalten." : "Structure and tags stay intact."}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[var(--foreground)]">
                  {locale === "de" ? "sample-word-document.docx" : "sample-word-document.docx"}
                </div>
                <div className="mt-1 text-[11.5px] text-[var(--muted-soft)]">EN → DE</div>
              </div>
              <span className="rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]">
                Done
              </span>
            </div>
          </div>
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--background-strong)] px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                  {locale === "de" ? "Quelle" : "Source"}
                </div>
                <div className="mt-3 space-y-2 text-[12.5px] text-[var(--muted)]">
                  <div>Release notes for onboarding</div>
                  <div>New billing cycle logic</div>
                  <div>Review state improvements</div>
                </div>
              </div>
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">
                  {locale === "de" ? "Übersetzung" : "Translation"}
                </div>
                <div className="mt-3 space-y-2 text-[12.5px] text-[var(--foreground)]">
                  <div>Versionshinweise für Onboarding</div>
                  <div>Neue Billing-Cycle-Logik</div>
                  <div>Verbesserte Review-Zustände</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextTranslationVisual({ locale }: { locale: "de" | "en" }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid min-h-[420px] gap-px bg-[var(--border-light)] lg:grid-cols-2">
        <div className="bg-[var(--background-strong)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">
              {locale === "de" ? "Original" : "Original"}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              EN
            </span>
          </div>
          <div className="mt-5 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-5 text-[14px] leading-7 text-[var(--muted)]">
            Launch copy for a pricing update, weekly release notes, or short customer support replies can move through the same surface without opening a project first.
          </div>
        </div>
        <div className="bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted-soft)]">
              {locale === "de" ? "Ergebnis" : "Output"}
            </span>
            <span className="rounded-full border border-[var(--success-border)] bg-[var(--success-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--success)]">
              DE
            </span>
          </div>
          <div className="mt-5 rounded-[20px] border border-[var(--border)] bg-[var(--background-strong)] px-4 py-5 text-[14px] leading-7 text-[var(--foreground)]">
            Texte fur ein Pricing-Update, wochentliche Release Notes oder kurze Support-Antworten laufen durch dieselbe Flache, ohne zuerst ein Projekt anlegen zu mussen.
          </div>
          <div className="mt-4 flex gap-2">
            {[
              locale === "de" ? "Automatische Erkennung" : "Auto detect",
              locale === "de" ? "Formell" : "Formal",
              locale === "de" ? "TXT-Export" : "TXT export"
            ].map((item) => (
              <span key={item} className="rounded-full border border-[var(--border)] bg-[var(--background-strong)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingVisual({ locale }: { locale: "de" | "en" }) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid gap-px bg-[var(--border-light)] md:grid-cols-2">
        <div className="bg-[var(--background-strong)] px-5 py-8">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            {locale === "de" ? "Credits = Wörter" : "Credits = words"}
          </div>
          <div className={`${DISPLAY_FONT_CLASS_NAME} mt-4 text-[40px] leading-none text-[var(--foreground)]`}>
            1K → 700K
          </div>
          <p className="mt-4 text-[14px] leading-7 text-[var(--muted)]">
            {locale === "de"
              ? "Von Free bis Scale bleibt dieselbe Logik bestehen: monatliche Credits orientieren sich direkt am Übersetzungsvolumen."
              : "From Free to Scale the same logic holds: monthly credits map directly to translation volume."}
          </p>
        </div>
        <div className="bg-[var(--surface)] px-5 py-8">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-soft)]">
            {locale === "de" ? "Skalierung" : "Scaling"}
          </div>
          <div className="mt-4 space-y-3">
            {["Free", "Starter", "Pro", "Scale"].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--background-strong)] px-4 py-3">
                <span className="text-[13px] font-medium text-[var(--foreground)]">{item}</span>
                <span className="text-[12px] text-[var(--muted)]">
                  {index === 0 ? "1K" : index === 1 ? "50K" : index === 2 ? "200K" : "700K"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M3 4.2C3 3.53726 3.53726 3 4.2 3H13.8C14.4627 3 15 3.53726 15 4.2V6.3C15 6.96274 14.4627 7.5 13.8 7.5H4.2C3.53726 7.5 3 6.96274 3 6.3V4.2Z"
        fill="currentColor"
      />
      <path
        d="M3 11.7C3 11.0373 3.53726 10.5 4.2 10.5H9.15C9.81274 10.5 10.35 11.0373 10.35 11.7V13.8C10.35 14.4627 9.81274 15 9.15 15H4.2C3.53726 15 3 14.4627 3 13.8V11.7Z"
        fill="currentColor"
        opacity="0.78"
      />
      <path
        d="M11.55 11.7C11.55 11.0373 12.0873 10.5 12.75 10.5H13.8C14.4627 10.5 15 11.0373 15 11.7V13.8C15 14.4627 14.4627 15 13.8 15H12.75C12.0873 15 11.55 14.4627 11.55 13.8V11.7Z"
        fill="currentColor"
        opacity="0.48"
      />
    </svg>
  );
}

function getPricingPlans(locale: "de" | "en", interval: PricingInterval): PricingPlanView[] {
  const numberFormatter = new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  return BILLING_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: numberFormatter.format(
      (interval === "yearly" && plan.paid ? plan.basePriceCents * 10 : plan.basePriceCents) / 100
    ),
    suffix:
      interval === "yearly" && plan.paid
        ? locale === "de"
          ? "pro Jahr"
          : "per year"
        : locale === "de"
          ? "pro Monat"
          : "per month",
    note:
      interval === "yearly" && plan.paid
        ? locale === "de"
          ? "2 Monate gratis bei jährlicher Abrechnung"
          : "2 months free on annual billing"
        : undefined,
    credits: `${new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
      notation: "compact",
      maximumFractionDigits: 0
    }).format(plan.creditsLimit)} ${locale === "de" ? "Credits" : "credits"}`,
    description: plan.description,
    features: localizePlanFeatures(plan.id, locale),
    featured: plan.id === "pro"
  }));
}

function localizePlanFeatures(
  planId: (typeof BILLING_PLANS)[number]["id"],
  locale: "de" | "en"
) {
  if (locale === "en") {
    return BILLING_PLANS.find((plan) => plan.id === planId)?.features ?? [];
  }

  switch (planId) {
    case "free":
      return ["5k monatliche Wörter", "Kern-Workspace für Übersetzungen", "Glossar-Basics"];
    case "starter":
      return ["100k monatliche Wörter", "Projekt-Workspaces", "Glossar-Support"];
    case "pro":
      return ["500k monatliche Wörter", "Review-Workflow", "Priorisierte Glossar-Injektion"];
    case "scale":
      return ["1M monatliche Wörter", "Höherer Durchsatz", "Gemeinsame Team-Operationen"];
    default:
      return [];
  }
}

function getGermanMarketingCopy(): MarketingCopy {
  const productCards: ProductCard[] = [
    {
      id: "workspace",
      href: "/products/workspace",
      label: "Übersetzungs-Workspace",
      title: "Die operative Fläche für Projekte, Prüfung und Abrechnung.",
      body: "Translayr bündelt Projektstatus, letzte Übersetzungen, Glossar und Verbrauch in einer klaren Oberfläche.",
      points: [
        "Dashboard, Projekte und Verbrauch in einem Ablauf",
        "Prüfstatus und Fortschritt direkt sichtbar",
        "Abrechnung und Credits ohne Seitensprünge"
      ]
    },
    {
      id: "files",
      href: "/products/file-translation",
      label: "Dateiübersetzung",
      title: "Dateiübersetzung für reale Release-Dateien statt Demo-Uploads.",
      body: "Arbeite mit XLIFF, PO, STRINGS, RESX, CSV, TXT, DOCX und PPTX, ohne Struktur manuell neu aufzubauen.",
      points: [
        "Mehrformat-Upload mit wortbasiertem Credit-Modell",
        "Seitenvergleich in der Prüfung und Download im Originalformat",
        "Tag- und Struktur-Schutz für Lokalisierungsdateien"
      ]
    }
  ];

  return {
    navHome: "Überblick",
    navProducts: "Produkte",
    navPricing: "Preise",
    navLogin: "Anmelden",
    navRegister: "Kostenlos starten",
    footer: {
      copyright: "© 2026 Translayr. Alle Rechte vorbehalten.",
      privacy: "Datenschutz",
      terms: "AGB",
      status: "Status"
    },
    cta: {
      eyebrow: "Start",
      title: "Baue deinen Release-Flow um die Übersetzung herum, nicht um Dateien.",
      body: "Starte kostenlos, lade echte Release-Dateien hoch und bring Review, Verbrauch und Export in dieselbe Oberfläche.",
      primary: "Kostenlos starten",
      secondary: "Anmelden"
    },
    productCards,
    homeHero: {
      eyebrow: "Sprachoperationen",
      title: "Übersetzung als Produktfläche, nicht als Ordnerstruktur.",
      body: "Translayr bringt Projekte, Dateien, direkte Textübersetzung und Credits in ein sauberes System. Statt One-off-Uploads arbeitest du in einem klaren Release-Flow.",
      actions: [
        { href: "/register", label: "Kostenlos starten", tone: "primary" as const },
        { href: "/products", label: "Produkte ansehen", tone: "secondary" as const }
      ]
    },
    homeProductsEyebrow: "Produktfamilie",
    homeProductsTitle: "Nicht eine Scrollseite, sondern eine echte Produktstruktur.",
    homeProductsBody: "Die Startseite führt in die drei Kernflächen. Jede Produktseite erklärt einen klaren Job statt alles in einen langen One-Pager zu drücken.",
    solutionEyebrow: "Die Lösung",
    solutionTitle: "Ein System für alles, was du übersetzt.",
    solutionBody: "Vom Website-Inhalt bis zu Release-Dateien – alles bleibt strukturiert, verbunden und einsatzbereit.",
    featureCards: [
      {
        title: "Workspace",
        body: "Verwalte Übersetzungsprojekte an einem Ort. Verfolge Fortschritt, überprüfe Inhalte und verwalte die Nutzung, ohne Tools zu wechseln."
      },
      {
        title: "Dateiübersetzung",
        body: "Übersetze echte Dateien, ohne die Struktur zu brechen. Lade XLIFF, DOCX, PPTX und mehr hoch – erhalte saubere, einsatzbereite Ergebnisse."
      },
      {
        title: "Direkte Übersetzung",
        body: "Übersetze Inhalte sofort. Sende Inhalte direkt oder füge Text ein und erhalte strukturierte Übersetzungen zurück."
      }
    ],
    metrics: [
      { value: "1K–700K", label: "Monatliche Credits über die Planleiter" },
      { value: "8+", label: "Produktive Dateiformate im Live-Flow" },
      { value: "3", label: "Klare Flächen für Workspace, Files und Text" },
      { value: "1", label: "Konsistente Credit-Logik über alle Wege" }
    ],
    homeOperationsEyebrow: "Release-Realität",
    homeOperationsTitle: "Gebaut für Teams, die Übersetzung operativ steuern müssen.",
    homeOperationsBody: "Die Seite erklärt Translayr jetzt wie ein Produkt: mit eigener Startseite, eigenen Produktseiten und einer separaten Preisfläche. Das wirkt klarer, glaubwürdiger und näher an echten SaaS-Navigationsmustern.",
    homeOperationsRows: [
      {
        title: "Releases",
        body: "Mehrere Zielsprachen und mehrere Dateien bleiben im selben Projektkontext statt in Einzelaktionen."
      },
      {
        title: "Prüfung",
        body: "Fortschritt, offene Prüfungen und letzte Übersetzungen sind keine versteckten Zustände, sondern eigene Produktflächen."
      },
      {
        title: "Finanzen",
        body: "Credits, monatliche Limits und aktuelle Kosten hängen direkt an derselben operativen Oberfläche."
      }
    ],
    homeFaqEyebrow: "FAQ",
    homeFaqTitle: "Häufige Fragen vor dem ersten produktiven Run.",
    homeFaqBody: "Kurz und konkret: so arbeitet Translayr im echten Team- und Release-Alltag.",
    homeFaqItems: [
      {
        question: "Kann ich ZIP-Archive mit gemischten Dateitypen hochladen?",
        answer:
          "Ja. ZIP-Dateien werden automatisch entpackt und alle unterstützten Übersetzungsdateien direkt in die Queue übernommen. Das ist praktisch, wenn ein Release aus vielen Assets besteht und du nicht jede Datei einzeln hochladen willst."
      },
      {
        question: "Was passiert mit Dateien im ZIP, die nicht unterstützt werden?",
        answer:
          "Nicht unterstützte oder systeminterne Einträge werden ignoriert, damit der Übersetzungsflow sauber bleibt. Verarbeitet werden nur gültige Formate wie XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX und PPTX."
      },
      {
        question: "Bleiben Tags und Platzhalter in Lokalisierungsdateien erhalten?",
        answer:
          "Ja. Der Übersetzungsflow enthält Schutzlogik für Tags und Platzhalter, damit Struktur und technische Tokens stabil bleiben. Zusätzlich kannst du in den Einstellungen strikten Tag-Schutz und ein hartes Stoppen bei Tag-Mismatch aktivieren."
      },
      {
        question: "Brauche ich für kurze Übersetzungen immer ein Projekt?",
        answer:
          "Nein. Für schnelle Einzeltexte gibt es die Textfläche unter /translate, inklusive Tonalität, Copy und TXT-Export. Wenn der Inhalt später wiederkehrend wird oder in Releases eingebunden ist, lohnt sich ein Projekt-Workflow."
      },
      {
        question: "Kann ich Standardsprachen und Ton einmal global festlegen?",
        answer:
          "Ja. In den Einstellungen definierst du Quelle, Ziel, Tonalität und KI-Verhalten als Defaults für neue Übersetzungen. Diese Defaults sparen Zeit bei jedem neuen Run, können aber pro Projekt oder Request weiterhin angepasst werden."
      },
      {
        question: "Unterstützt das Glossar geschützte Begriffe?",
        answer:
          "Ja. Glossarbegriffe können als geschützt markiert werden, damit Markenbegriffe und feste Produktbezeichnungen nicht verändert werden. Bei aktivem Glossar-Automodus werden relevante Begriffe zur Laufzeit eingebunden und konsistent angewendet."
      },
      {
        question: "Können mehrere Teammitglieder gleichzeitig im Workspace arbeiten?",
        answer:
          "Ja. Du kannst Teammitglieder mit Rollen wie Admin, Editor, Reviewer oder Viewer einladen und die Zugriffe zentral verwalten. So bleibt klar geregelt, wer editieren, prüfen oder nur einsehen darf."
      },
      {
        question: "Wie sehe ich Verbrauch und verbleibende Credits im Zyklus?",
        answer:
          "Auf der Usage-Seite siehst du verbrauchte Credits, verbleibendes Volumen, Prozentanteil und Reset-Datum des aktuellen Zyklus. In Billing ergänzt du das Bild mit Planstatus, Abrechnungsdetails und möglichen Top-ups."
      },
      {
        question: "Was passiert, wenn das Credit-Limit erreicht ist?",
        answer:
          "Neue Übersetzungen werden vor der Ausführung per Credit-Check validiert und bei zu wenig Volumen mit klarer Meldung gestoppt. Danach kannst du sofort upgraden oder zusätzliche Credit-Pakete buchen, um ohne lange Unterbrechung weiterzuarbeiten."
      },
      {
        question: "Kann ich WordPress- oder CMS-Jobs per API anstoßen?",
        answer:
          "Ja. Für Integrationen gibt es einen separaten Developer-API-Bereich mit Endpoints für Einzeljobs, Bulk-Requests und Job-Status. Authentifizierung läuft über API-Key-Header, damit WordPress- oder CMS-Pipelines sauber angebunden werden können."
      }
    ],
    productsHero: {
      eyebrow: "Produkte",
      title: "Drei Workflows. Ein Übersetzungssystem.",
      body: "Unterschiedliche Aufgaben erfordern unterschiedliche Tools – aber sie sollten zusammenarbeiten.",
      actions: [
        { href: "/products/workspace", label: "Workspace öffnen", tone: "primary" as const },
        { href: "/pricing", label: "Preise ansehen", tone: "secondary" as const }
      ]
    },
    productsGridEyebrow: "Jeder Workflow löst eine spezifische Aufgabe",
    productsGridTitle: "Statt einer überladenen Oberfläche konzentriert sich jeder Teil des Produkts auf eine klare Aufgabe.",
    productsGridBody: "Projekte verwalten deine laufende Arbeit. Dateien verarbeiten strukturierte Assets. Text deckt schnelle Übersetzungen ab. Alles in einem System verbunden.",
    compareEyebrow: "Vergleich",
    compareTitle: "So greifen die drei Flächen ineinander.",
    compareBody: "Workspace ist der operative Kern. Dateien bringen strukturierte Assets hinein. Text deckt schnelle Einzel-Ausgaben ab, die keinen Projektcontainer brauchen.",
    compareRows: [
      {
        title: "Workspace",
        body: "Für Projektstatus, Prüfung, letzte Übersetzungen, Abrechnung und Team-Kontext."
      },
      {
        title: "Dateien",
        body: "Für echte Lokalisierungsdateien mit Upload, Fortschritt, Wortzählung und Export."
      },
      {
        title: "Text",
        body: "Für Copy, Support und kleine Inhalte, die direkt übersetzt und exportiert werden sollen."
      }
    ],
    workspaceHero: {
      eyebrow: "Workspace",
      title: "Deine Übersetzungszentrale",
      body: "Verwalte Projekte, verfolge Fortschritt und überprüfe Übersetzungen — alles an einem Ort.",
      actions: [
        { href: "/register", label: "Workspace testen", tone: "primary" as const },
        { href: "/dashboard", label: "Dashboard ansehen", tone: "secondary" as const }
      ]
    },
    workspaceBlocks: [
      {
        eyebrow: "Dashboard",
        title: "Alles in einem Dashboard",
        body: "Projekte, Verbrauch und letzte Aktivitäten — alles auf einen Blick sichtbar.",
        points: [
          "Projekte, Verbrauch und letzte Aktivitäten an einem Ort",
          "Fortschritt auf einen Blick verfolgen",
          "Kein Kontextwechsel nötig"
        ]
      },
      {
        eyebrow: "Prüfung",
        title: "Prüfung in den Workflow eingebaut",
        body: "Sieh was erledigt ist, was geprüft werden muss und was bereit ist.",
        points: [
          "Klare Prüfstatus im Dashboard sichtbar",
          "Projekt-Workspaces mit Datei-Status und Fortschritt",
          "Download und Prüfung im selben Ablauf"
        ]
      },
      {
        eyebrow: "Abrechnung",
        title: "Klarer Verbrauch und Abrechnung",
        body: "Wisse genau, was du nutzt und was es kostet — keine Überraschungen.",
        points: [
          "Credit-Checks vor jeder Übersetzung",
          "Verbrauch direkt im Produkt sichtbar",
          "Upgrade-Pfade wenn du mehr brauchst"
        ]
      }
    ],
    filesHero: {
      eyebrow: "Dateiübersetzung",
      title: "Übersetze Dateien ohne sie zu zerstören",
      body: "Lade strukturierte Dateien und Dokumente hoch — erhalte Ergebnisse, die sofort einsatzbereit sind.",
      actions: [
        { href: "/register", label: "Datei hochladen", tone: "primary" as const },
        { href: "/pricing", label: "Preise ansehen", tone: "secondary" as const }
      ]
    },
    filesBlocks: [
      {
        eyebrow: "Formate",
        title: "Unterstützt echte Formate",
        body: "XLIFF, XLF, DOCX, PPTX, CSV, TXT und mehr.",
        points: [
          "XLIFF, XLF, PO, STRINGS, RESX, XML",
          "CSV, TXT, DOCX und PPTX",
          "Wortzählung vor der Übersetzung"
        ]
      },
      {
        eyebrow: "Struktur",
        title: "Struktur bleibt erhalten",
        body: "Tags, Platzhalter und Formatierung bleiben während der Übersetzung erhalten.",
        points: [
          "Tag-Schutz im Übersetzungsprozess",
          "Seitenvergleich in der Prüfung",
          "Kein manuelles Neuformatieren vor dem Release"
        ]
      },
      {
        eyebrow: "Prüfung",
        title: "Prüfung vor dem Export",
        body: "Überprüfe Übersetzungen, bevor du die finalen Dateien herunterlädst.",
        points: [
          "Übersetzungen im Kontext prüfen",
          "Download im übersetzten Originalformat",
          "Qualitätsprüfungen im Workflow integriert"
        ]
      }
    ],
    textHero: {
      eyebrow: "Textübersetzung",
      title: "Direkte Übersetzung für kurze Inhalte, ohne erst ein Projekt anzulegen.",
      body: "Nicht jede Übersetzung beginnt mit einer Datei. Für Copy, Support oder schnelle Freigaben gibt es eine eigene Textfläche mit automatischer Erkennung, Tonalität und Export.",
      actions: [
        { href: "/translate", label: "Text übersetzen", tone: "primary" as const },
        { href: "/products/file-translation", label: "Dateifläche ansehen", tone: "secondary" as const }
      ]
    },
    textBlocks: [
      {
        eyebrow: "Geschwindigkeit",
        title: "Schneller Output für operative Texte.",
        body: "Die Textfläche ist für kurze Inhalte gedacht, die nicht erst in eine Projektstruktur umgebaut werden müssen.",
        points: [
          "Copy/Paste ohne Setup",
          "Automatische Erkennung der Quellsprache",
          "Sofortige Ausgabe im selben Bildschirm"
        ]
      },
      {
        eyebrow: "Steuerung",
        title: "Tonalität und Zielsprache bleiben steuerbar.",
        body: "Auch schnelle Übersetzungen brauchen Kontrolle. Deshalb bleibt die Auswahl von Sprache und Stil im Flow sichtbar.",
        points: [
          "Zielsprache mit bevorzugten Sprachen oben",
          "Tonalitätsoptionen für formell, informell und technisch",
          "Copy und TXT-Export für den direkten Weiterweg"
        ]
      },
      {
        eyebrow: "Verbrauch",
        title: "Dieselbe Credit-Logik wie im Rest des Produkts.",
        body: "Textübersetzungen laufen nicht nebenher, sondern in dieselbe Verbrauchs- und Credit-Logik wie Dateiübersetzungen.",
        points: [
          "Wortzählung vor dem Start",
          "Credit-Check vor der Übersetzung",
          "Monatsverbrauch auf derselben Abrechnungsgrundlage"
        ]
      }
    ],
    pricingHero: {
      eyebrow: "Preise",
      title: "Klare Preise. Keine Überraschungen.",
      body: "Bezahle was du nutzt. Skaliere wenn du mehr brauchst.",
      actions: [
        { href: "/register", label: "Kostenlos starten", tone: "primary" as const },
        { href: "/products", label: "Pläne ansehen", tone: "secondary" as const }
      ]
    },
    pricingGridEyebrow: "Von Free bis Scale",
    pricingGridTitle: "Wähle einen Plan basierend auf deiner Nutzung. Upgrade jederzeit wenn deine Bedürfnisse wachsen.",
    pricingGridBody: "Alle Pläne beinhalten strukturierte Übersetzung mit steigenden Limits und Features.",
    pricingNotes: [
      {
        title: "Credits",
        body: "Ein Credit entspricht in der Produktlogik einem Wort. Dadurch bleiben Preise direkt mit der echten Nutzung verknüpft."
      },
      {
        title: "Upgrade",
        body: "Wenn das Volumen größer wird als das aktuelle Paket erlaubt, bleibt der Upgrade-Pfad im Produkt und auf der Preisseite konsistent."
      },
      {
        title: "Positionierung",
        body: "Die Preisseite steht jetzt als eigene Fläche und muss nicht mehr in derselben Scrollstrecke wie Features und Story mitschwingen."
      }
    ],
    pricingComparison: [
      {
        label: "5.000 Wörter / Monat enthalten",
        values: [true, false, false, false]
      },
      {
        label: "100.000 Wörter / Monat enthalten",
        values: [false, true, false, false]
      },
      {
        label: "500.000 Wörter / Monat enthalten",
        values: [false, false, true, false]
      },
      {
        label: "1.000.000 Wörter / Monat enthalten",
        values: [false, false, false, true]
      },
      {
        label: "Kernübersetzung für XLIFF / XLF",
        values: [true, true, true, true]
      },
      {
        label: "Erweiterte Dateiformate (PO, STRINGS, RESX, XML)",
        values: [false, true, true, true]
      },
      {
        label: "Dokumentformate (CSV, TXT, DOCX, PPTX)",
        values: [false, false, true, true]
      },
      {
        label: "Glossar-Basics",
        values: [true, true, true, true]
      },
      {
        label: "Glossar-Support",
        values: [false, true, true, true]
      },
      {
        label: "Priorisierte Glossar-Injektion",
        values: [false, false, true, true]
      },
      {
        label: "Projekt-Workspaces",
        values: [false, true, true, true]
      },
      {
        label: "Prüf-Workflow",
        values: [false, false, true, true]
      },
      {
        label: "Höherer Durchsatz",
        values: [false, false, false, true]
      },
      {
        label: "Gemeinsame Team-Operationen",
        values: [false, false, false, true]
      },
      {
        label: "Credit-Check vor Übersetzung",
        values: [true, true, true, true]
      }
    ]
  };
}

function getEnglishMarketingCopy(): MarketingCopy {
  const productCards: ProductCard[] = [
    {
      id: "workspace",
      href: "/products/workspace",
      label: "Translation workspace",
      title: "The operating surface for projects, review, and billing.",
      body: "Translayr pulls project state, recent translations, glossary context, and usage into one clean surface.",
      points: [
        "Dashboard, projects, and usage in one flow",
        "Review state and progress visible at a glance",
        "Billing and credits without leaving the product"
      ]
    },
    {
      id: "files",
      href: "/products/file-translation",
      label: "File translation",
      title: "File translation for real release assets, not demo uploads.",
      body: "Work with XLIFF, PO, STRINGS, RESX, CSV, TXT, DOCX, and PPTX without manually rebuilding structure.",
      points: [
        "Multi-format upload with word-based credits",
        "Side-by-side review and original-format download",
        "Tag and structure protection for localization files"
      ]
    }
  ];

  return {
    navHome: "Overview",
    navProducts: "Products",
    navPricing: "Pricing",
    navLogin: "Sign in",
    navRegister: "Start free",
    footer: {
      copyright: "© 2026 Translayr. All rights reserved.",
      privacy: "Privacy",
      terms: "Terms",
      status: "Status"
    },
    cta: {
      eyebrow: "Start",
      title: "Build your release flow around translation, not around files.",
      body: "Start free, upload real release assets, and keep review, usage, and export inside one surface.",
      primary: "Start free",
      secondary: "Sign in"
    },
    productCards,
    homeHero: {
      eyebrow: "Language operations",
      title: "Translate your website and files — without breaking anything.",
      body: "No more messy exports, broken layouts, or manual fixes. Translate WordPress, XLIFF, and documents in one clean workflow.",
      actions: [
        { href: "/register", label: "Start free", tone: "primary" as const },
        { href: "/products", label: "See how it works", tone: "secondary" as const }
      ]
    },
    homeProductsEyebrow: "The problem",
    homeProductsTitle: "Translation today is still messy.",
    homeProductsBody: "You export files, lose structure, fix layouts, and import everything again. Most tools weren't built for real product workflows.",
    solutionEyebrow: "The solution",
    solutionTitle: "One system for everything you translate.",
    solutionBody: "From website content to release files — everything stays structured, connected, and ready to use.",
    featureCards: [
      {
        title: "Workspace",
        body: "Manage translation projects in one place. Track progress, review content, and manage usage without switching tools."
      },
      {
        title: "File Translation",
        body: "Translate real files without breaking structure. Upload XLIFF, DOCX, PPTX, and more — get clean, ready-to-use outputs."
      },
      {
        title: "Direct Translation",
        body: "Translate content instantly. Send content directly or paste text and get structured translations back."
      }
    ],
    metrics: [
      { value: "1K–700K", label: "Monthly credits across the plan ladder" },
      { value: "8+", label: "Production file formats in the live flow" },
      { value: "3", label: "Clear surfaces for workspace, files, and text" },
      { value: "1", label: "Consistent credit logic across every route" }
    ],
    homeOperationsEyebrow: "Release reality",
    homeOperationsTitle: "Built for teams that need to operate translation, not just trigger it.",
    homeOperationsBody: "The site now explains Translayr like a product: a real home page, dedicated product pages, and a separate pricing page. That feels clearer, more credible, and closer to how mature SaaS sites are structured.",
    homeOperationsRows: [
      {
        title: "Launches",
        body: "Multiple languages and multiple assets stay in one project context instead of scattered one-off actions."
      },
      {
        title: "Review",
        body: "Progress, open review states, and recent translations are not hidden states but explicit product surfaces."
      },
      {
        title: "Finance",
        body: "Credits, monthly limits, and current spend stay directly connected to the same operational experience."
      }
    ],
    homeFaqEyebrow: "FAQ",
    homeFaqTitle: "Common questions before your first production run.",
    homeFaqBody: "Short and practical answers for how Translayr works in real release operations.",
    homeFaqItems: [
      {
        question: "Can I upload ZIP archives with mixed file types?",
        answer:
          "Yes. ZIP uploads are unpacked automatically and supported translation files are added to your queue right away. This is useful when a release contains many assets and you do not want to upload each file one by one."
      },
      {
        question: "What happens to unsupported files inside a ZIP?",
        answer:
          "Unsupported or system entries are skipped so the translation flow stays clean and predictable. Only valid formats such as XLIFF, PO, STRINGS, RESX, XML, CSV, TXT, DOCX, and PPTX are processed."
      },
      {
        question: "Are tags and placeholders preserved in localization files?",
        answer:
          "Yes. The pipeline includes tag and placeholder protection so technical structure remains intact. You can also enable strict tag protection and fail-on-mismatch behavior in settings for stricter QA."
      },
      {
        question: "Do I always need a project for short translations?",
        answer:
          "No. For quick one-off content you can use /translate with tone control, copy, and TXT export. If the content becomes recurring or release-critical, moving it into a project gives you better tracking and review visibility."
      },
      {
        question: "Can I set default languages and tone once for the workspace?",
        answer:
          "Yes. Settings let you define source mode, default target language, tone style, and AI behavior for new runs. These defaults reduce repetitive setup while still allowing project-level or request-level overrides."
      },
      {
        question: "Does glossary support protected terms?",
        answer:
          "Yes. Terms can be marked as protected to keep brand names and fixed terminology unchanged. With glossary auto mode enabled, relevant terms are injected during runtime to keep output consistent."
      },
      {
        question: "Can multiple teammates work in the same workspace?",
        answer:
          "Yes. Invite members with roles such as admin, editor, reviewer, or viewer and manage access centrally. This keeps responsibility clear across editing, review, and read-only collaboration."
      },
      {
        question: "Where can I monitor usage and remaining credits?",
        answer:
          "The Usage page shows consumed credits, remaining capacity, cycle percentage, and the reset date. Billing complements that view with plan status, invoices, and available top-up options."
      },
      {
        question: "What happens when the credit limit is reached?",
        answer:
          "New translations are validated before execution and blocked with a clear message when credits are insufficient. You can then upgrade your plan or buy credit packs and continue without reworking the workflow."
      },
      {
        question: "Can I trigger WordPress or CMS jobs via API?",
        answer:
          "Yes. The Developer API section includes endpoints for single jobs, bulk requests, and job status tracking. Authentication works via API key headers so WordPress or CMS pipelines can connect in a controlled way."
      }
    ],
    productsHero: {
      eyebrow: "Products",
      title: "Three workflows. One translation system.",
      body: "Different tasks need different tools — but they should still work together.",
      actions: [
        { href: "/products/workspace", label: "Open workspace page", tone: "primary" as const },
        { href: "/pricing", label: "View pricing", tone: "secondary" as const }
      ]
    },
    productsGridEyebrow: "Each workflow solves a specific job",
    productsGridTitle: "Instead of one overloaded interface, each part of the product focuses on one clear task.",
    productsGridBody: "Projects manage your ongoing work. Files handle structured assets. Text covers quick translations. All connected in one system.",
    compareEyebrow: "Comparison",
    compareTitle: "How the three surfaces fit together.",
    compareBody: "Workspace is the operating core. Files bring structured assets into the system. Text handles fast one-off outputs that do not need a project wrapper.",
    compareRows: [
      {
        title: "Workspace",
        body: "For project state, review, recent translations, billing, and team context."
      },
      {
        title: "Files",
        body: "For real localization assets with upload, progress, word counts, and export."
      },
      {
        title: "Text",
        body: "For copy, support, and short content that should be translated and exported immediately."
      }
    ],
    workspaceHero: {
      eyebrow: "Workspace",
      title: "Your translation command center",
      body: "Manage projects, track progress, and review translations — all in one place.",
      actions: [
        { href: "/register", label: "Try workspace", tone: "primary" as const },
        { href: "/dashboard", label: "View dashboard", tone: "secondary" as const }
      ]
    },
    workspaceBlocks: [
      {
        eyebrow: "Dashboard",
        title: "Everything in one dashboard",
        body: "Projects, usage, and recent activity — all visible in one place.",
        points: [
          "Projects, usage, and recent activity all in one place",
          "Track progress at a glance",
          "No context switching needed"
        ]
      },
      {
        eyebrow: "Review",
        title: "Review built into the workflow",
        body: "See what's done, what needs review, and what's ready.",
        points: [
          "Clear review states visible in the dashboard",
          "Project workspaces with file status and progress",
          "Download and review in the same flow"
        ]
      },
      {
        eyebrow: "Billing",
        title: "Clear usage and billing",
        body: "Know exactly what you use and what it costs — no surprises.",
        points: [
          "Credit checks before every translation",
          "Usage visible directly in the product",
          "Upgrade paths when you need more"
        ]
      }
    ],
    filesHero: {
      eyebrow: "File translation",
      title: "Translate files without breaking them",
      body: "Upload structured files and documents — get outputs that are ready to use.",
      actions: [
        { href: "/register", label: "Upload a file", tone: "primary" as const },
        { href: "/pricing", label: "View pricing", tone: "secondary" as const }
      ]
    },
    filesBlocks: [
      {
        eyebrow: "Formats",
        title: "Supports real formats",
        body: "XLIFF, XLF, DOCX, PPTX, CSV, TXT and more.",
        points: [
          "XLIFF, XLF, PO, STRINGS, RESX, XML",
          "CSV, TXT, DOCX, and PPTX",
          "Word counts before translation begins"
        ]
      },
      {
        eyebrow: "Structure",
        title: "Structure stays intact",
        body: "Tags, placeholders, and formatting are preserved during translation.",
        points: [
          "Tag protection during translation",
          "Side-by-side review for translated content",
          "No manual reformatting before release"
        ]
      },
      {
        eyebrow: "Review",
        title: "Review before export",
        body: "Check translations before downloading final files.",
        points: [
          "Review translations in context",
          "Download in the translated original format",
          "Quality checks built into the workflow"
        ]
      }
    ],
    textHero: {
      eyebrow: "Text translation",
      title: "Direct translation for short-form content without creating a project first.",
      body: "Not every translation starts as a file. For copy, support, or quick approvals, there is a dedicated text surface with auto-detect, tone, and export.",
      actions: [
        { href: "/translate", label: "Translate text", tone: "primary" as const },
        { href: "/products/file-translation", label: "See file translation", tone: "secondary" as const }
      ]
    },
    textBlocks: [
      {
        eyebrow: "Speed",
        title: "Fast output for operational text.",
        body: "The text surface is made for short content that should not be forced into a project wrapper first.",
        points: [
          "Copy and paste without setup",
          "Automatic source detection",
          "Immediate output in the same screen"
        ]
      },
      {
        eyebrow: "Control",
        title: "Tone and target language stay explicit.",
        body: "Even fast translations need control. Language and style stay visible inside the workflow.",
        points: [
          "Target language with preferred languages surfaced first",
          "Tone options for formal, informal, and technical output",
          "Copy and TXT export for immediate follow-up"
        ]
      },
      {
        eyebrow: "Usage",
        title: "The same credit model as the rest of the product.",
        body: "Text translation is not an isolated side feature. It runs through the same usage and credit logic as file translation.",
        points: [
          "Word count before start",
          "Credit validation before translation",
          "Monthly usage tied to the same billing logic"
        ]
      }
    ],
    pricingHero: {
      eyebrow: "Pricing",
      title: "Clear pricing. No surprises.",
      body: "Pay for what you use. Scale when you need more.",
      actions: [
        { href: "/register", label: "Start free", tone: "primary" as const },
        { href: "/products", label: "Browse plans", tone: "secondary" as const }
      ]
    },
    pricingGridEyebrow: "From free to scale",
    pricingGridTitle: "Choose a plan based on your usage. Upgrade anytime as your needs grow.",
    pricingGridBody: "All plans include structured translation, with increasing limits and features.",
    pricingNotes: [
      {
        title: "Credits",
        body: "In the current product model, one credit maps to one word. That keeps pricing tied directly to real usage."
      },
      {
        title: "Upgrade",
        body: "When volume outgrows the current package, the upgrade path stays consistent across the product and the pricing page."
      },
      {
        title: "Positioning",
        body: "Pricing now stands as its own surface instead of being squeezed into the same scroll flow as features and story."
      }
    ],
    pricingComparison: [
      {
        label: "5,000 words / month included",
        values: [true, false, false, false]
      },
      {
        label: "100,000 words / month included",
        values: [false, true, false, false]
      },
      {
        label: "500,000 words / month included",
        values: [false, false, true, false]
      },
      {
        label: "1,000,000 words / month included",
        values: [false, false, false, true]
      },
      {
        label: "Core XLIFF / XLF translation",
        values: [true, true, true, true]
      },
      {
        label: "Extended file formats (PO, STRINGS, RESX, XML)",
        values: [false, true, true, true]
      },
      {
        label: "Document formats (CSV, TXT, DOCX, PPTX)",
        values: [false, false, true, true]
      },
      {
        label: "Glossary basics",
        values: [true, true, true, true]
      },
      {
        label: "Glossary support",
        values: [false, true, true, true]
      },
      {
        label: "Priority glossary injection",
        values: [false, false, true, true]
      },
      {
        label: "Project workspaces",
        values: [false, true, true, true]
      },
      {
        label: "Review workflow",
        values: [false, false, true, true]
      },
      {
        label: "Faster throughput",
        values: [false, false, false, true]
      },
      {
        label: "Shared team operations",
        values: [false, false, false, true]
      },
      {
        label: "Credit check before translation",
        values: [true, true, true, true]
      }
    ]
  };
}
