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

export interface PersistedPaymentSession {
  idempotencyKey: string;
  requestId: string;
}

export function getPersistedSession(key: string): PersistedPaymentSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setPersistedSession(key: string, data: PersistedPaymentSession): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function clearPersistedSession(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

