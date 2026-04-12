import type { NextRequest } from "next/server";

type RequestLike = Request | NextRequest;

export function getRequestOrigin(request: RequestLike) {
  const url = new URL(request.url);
  const forwardedHost = getForwardedHeader(request, "x-forwarded-host");
  const forwardedProto = getForwardedHeader(request, "x-forwarded-proto");

  if (forwardedHost) {
    const protocol = forwardedProto || url.protocol.replace(":", "");
    const candidateOrigin = `${protocol}://${forwardedHost}`;

    try {
      return new URL(candidateOrigin).origin;
    } catch {
      return url.origin;
    }
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
