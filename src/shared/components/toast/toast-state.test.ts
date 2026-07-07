import { createToastItem, getVisibleToasts } from "./toast-state";

describe("toast state helpers", () => {
  it("creates an info toast by default", () => {
    expect(createToastItem(7, { title: "Kênh đã bị khóa" })).toEqual({
      id: 7,
      title: "Kênh đã bị khóa",
      variant: "info",
    });
  });

  it("keeps the newest four toasts visible", () => {
    const visibleToasts = getVisibleToasts([
      createToastItem(1, { title: "One" }),
      createToastItem(2, { title: "Two" }),
      createToastItem(3, { title: "Three" }),
      createToastItem(4, { title: "Four" }),
      createToastItem(5, { title: "Five" }),
    ]);

    expect(visibleToasts.map(toast => toast.id)).toEqual([2, 3, 4, 5]);
  });
});
