export const IDEMPOTENCY_KEY_MAX_LENGTH = 255;

export function createRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createStableHash(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

export function createIdempotencyKey(...parts: string[]) {
  const key = parts.join(":");

  if (key.length <= IDEMPOTENCY_KEY_MAX_LENGTH) {
    return key;
  }

  const hashSuffix = `:${createStableHash(key)}`;
  return `${key.slice(0, IDEMPOTENCY_KEY_MAX_LENGTH - hashSuffix.length)}${hashSuffix}`;
}
