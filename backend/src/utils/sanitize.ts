const SECRET_KEY_PATTERNS = [/api[_-]?key/i, /authorization/i, /token/i, /password/i];

function shouldRedactKey(key: string) {
  return SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function sanitizeForLog(value: unknown, depth = 0): unknown {
  if (depth > 5) {
    return "[Depth limited]";
  }

  if (typeof value === "string") {
    if (value.length > 800) {
      return `${value.slice(0, 800)}...[truncated:${value.length}]`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length > 50) {
      return [...value.slice(0, 50).map((item) => sanitizeForLog(item, depth + 1)), `[truncated:${value.length}]`];
    }

    return value.map((item) => sanitizeForLog(item, depth + 1));
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, childValue] of Object.entries(value)) {
      output[key] = shouldRedactKey(key) ? "[REDACTED]" : sanitizeForLog(childValue, depth + 1);
    }
    return output;
  }

  return value;
}
