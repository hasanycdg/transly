"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function AnalyticsEventsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstPageView = useRef(true);
  const search = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    if (isFirstPageView.current) {
      isFirstPageView.current = false;
      return;
    }

    const pagePath = search ? `${pathname}?${search}` : pathname;
    trackEvent("page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [pathname, search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const origin = event.target;

      if (!(origin instanceof Element)) {
        return;
      }

      const explicitEventElement = origin.closest("[data-analytics-event]");

      if (explicitEventElement instanceof HTMLElement) {
        const customEventName = explicitEventElement.dataset.analyticsEvent;
        const eventName = normalizeEventName(customEventName || "interaction");

        trackEvent(eventName, {
          page_path: window.location.pathname,
          element_id: explicitEventElement.id || undefined,
          element_label: getElementLabel(explicitEventElement)
        });
        return;
      }

      const link = origin.closest("a");

      if (link instanceof HTMLAnchorElement) {
        trackEvent("link_click", {
          page_path: window.location.pathname,
          link_url: link.href,
          link_text: getElementLabel(link),
          is_external: isExternalLink(link)
        });
        return;
      }

      const button = origin.closest("button");

      if (button instanceof HTMLButtonElement) {
        trackEvent("button_click", {
          page_path: window.location.pathname,
          element_id: button.id || undefined,
          button_text: getElementLabel(button)
        });
      }
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target;

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      trackEvent("form_submit", {
        page_path: window.location.pathname,
        form_id: form.id || undefined,
        form_name: form.getAttribute("name") || undefined,
        form_action: form.action || undefined
      });
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return null;
}

function trackEvent(name: string, params: EventParams) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: name,
      ...params
    });
  }
}

function normalizeEventName(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized.slice(0, 40) || "interaction";
}

function getElementLabel(element: HTMLElement) {
  const dataLabel = element.dataset.analyticsLabel?.trim();

  if (dataLabel) {
    return dataLabel.slice(0, 120);
  }

  const ariaLabel = element.getAttribute("aria-label")?.trim();

  if (ariaLabel) {
    return ariaLabel.slice(0, 120);
  }

  const text = element.textContent?.replace(/\s+/g, " ").trim();

  return text ? text.slice(0, 120) : undefined;
}

function isExternalLink(link: HTMLAnchorElement) {
  try {
    return new URL(link.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}
