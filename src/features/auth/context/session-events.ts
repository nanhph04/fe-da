export type SessionLogoutReason = "account-disabled";

export function getSessionRevocationReason(data: unknown, event: string): SessionLogoutReason | null {
  if (event === "session.revoked") {
    return "account-disabled";
  }

  if (hasSessionEventType(data, "session.revoked")) {
    return "account-disabled";
  }

  return null;
}

function hasSessionEventType(data: unknown, type: string): boolean {
  return !!data && typeof data === "object" && "type" in data && data.type === type;
}
