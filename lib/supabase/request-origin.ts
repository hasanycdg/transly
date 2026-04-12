import type { NextRequest } from "next/server";

import { getAppUrl } from "@/lib/supabase/env";

type RequestLike = Request | NextRequest;

export function getRequestOrigin(request: RequestLike) {
  const url = new URL(request.url);
  const forwardedHost = getForwardedHeader(request, "x-forwarded-host");
  const forwardedProto = getForwardedHeader(request, "x-forwarded-proto");
  const host = getForwardedHeader(request, "host");

  if (forwardedHost) {
    const protocol = forwardedProto || url.protocol.replace(":", "");
    const candidateOrigin = `${protocol}://${forwardedHost}`;

    try {
      return new URL(candidateOrigin).origin;
    } catch {
      return url.origin;
    }
  }

  if (host && isLoopbackHost(url.hostname)) {
    const protocol = forwardedProto || url.protocol.replace(":", "");
    const candidateOrigin = `${protocol}://${host}`;

    try {
      return new URL(candidateOrigin).origin;
    } catch {
      return url.origin;
    }
  }

  if (isLoopbackHost(url.hostname)) {
    return getAppUrl();
  }

  return url.origin;
}

function getForwardedHeader(request: RequestLike, key: string) {
  const header = request.headers.get(key);

  if (!header) {
    return null;
  }

  const firstValue = header
    .split(",")[0]
    ?.trim()
    .toLowerCase();

  return firstValue || null;
}

function isLoopbackHost(hostname: string) {
  const normalizedHost = hostname.trim().toLowerCase();

  return normalizedHost === "localhost" || normalizedHost === "127.0.0.1" || normalizedHost === "::1";
}
