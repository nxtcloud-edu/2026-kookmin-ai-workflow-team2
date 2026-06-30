import { describe, expect, it } from "vitest";
import { completeFastModeExchange, fastModeDayEndReply } from "../services/fast-mode.service.js";

describe("completeFastModeExchange", () => {
  it("forces the fixed girlfriend reply on the 10th user turn", () => {
    const result = completeFastModeExchange({
      fastDay: 1,
      fastVisibleMessageCountToday: 18,
      fastUserTurnCountToday: 9
    });

    expect(result.forcedDayEnd).toBe(true);
    expect(result.girlfriendReply).toBe(fastModeDayEndReply);
  });

  it("increments fastDay and resets counters after the forced reply", () => {
    const result = completeFastModeExchange({
      fastDay: 1,
      fastVisibleMessageCountToday: 18,
      fastUserTurnCountToday: 9
    });

    expect(result.fastDay).toBe(2);
    expect(result.fastVisibleMessageCountToday).toBe(0);
    expect(result.fastUserTurnCountToday).toBe(0);
  });
});
