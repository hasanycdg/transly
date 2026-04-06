import { AppError } from "./errors";

export function getPayloadSizeBytes(payload: unknown) {
  return Buffer.byteLength(JSON.stringify(payload), "utf8");
}

export function assertPayloadWithinLimit(payload: unknown, maxBytes: number) {
  const size = getPayloadSizeBytes(payload);

  if (size > maxBytes) {
    throw new AppError(
      413,
      `Payload too large: ${size} bytes. Maximum allowed payload is ${maxBytes} bytes.`,
      "PAYLOAD_TOO_LARGE",
      { maxBytes, size }
    );
  }

  return size;
}
