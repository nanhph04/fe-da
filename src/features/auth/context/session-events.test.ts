import { getSessionRevocationReason } from "./session-events";

describe("session event handling", () => {
  it("detects a named session.revoked SSE event", () => {
    expect(getSessionRevocationReason(null, "session.revoked")).toBe("account-disabled");
  });

  it("detects a session.revoked payload when proxies deliver it as a message event", () => {
    expect(
      getSessionRevocationReason(
        { type: "session.revoked", data: { reason: "ACCOUNT_SUSPENDED" } },
        "message",
      ),
    ).toBe("account-disabled");
  });

  it("ignores unrelated session events", () => {
    expect(getSessionRevocationReason({ type: "session.connected" }, "message")).toBeNull();
  });
});
