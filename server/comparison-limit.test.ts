import { describe, expect, it } from "vitest";
import { createComparisonLimit } from "./comparison-limit";

describe("local comparison limit", () => {
  it("allows only one active comparison", () => {
    const acquire = createComparisonLimit(() => 0);
    const first = acquire();
    expect(acquire()).toEqual({ retryAfter: 5 });
    if ("release" in first) first.release();
    expect(acquire()).toHaveProperty("release");
  });

  it("allows five starts in a rolling minute and rounds up the wait", () => {
    let time = 0;
    const acquire = createComparisonLimit(() => time);
    for (let i = 0; i < 5; i++) {
      const slot = acquire();
      expect(slot).toHaveProperty("release");
      if ("release" in slot) slot.release();
      time += 1000;
    }
    expect(acquire()).toEqual({ retryAfter: 55 });
    time = 59_999;
    expect(acquire()).toEqual({ retryAfter: 1 });
    time = 60_000;
    expect(acquire()).toHaveProperty("release");
  });

  it("applies the hourly limit even when the minute has capacity", () => {
    let time = 0;
    const acquire = createComparisonLimit(() => time);
    for (let window = 0; window < 6; window++) {
      for (let i = 0; i < 5; i++) {
        const slot = acquire();
        expect(slot).toHaveProperty("release");
        if ("release" in slot) slot.release();
      }
      time += 60_000;
    }
    expect(acquire()).toEqual({ retryAfter: 3240 });
    time = 3_600_000;
    expect(acquire()).toHaveProperty("release");
  });
});
