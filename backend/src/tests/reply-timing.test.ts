import { describe, expect, it } from "vitest";
import { evaluateUserReplyTiming } from "../services/reply-timing.service.js";

describe("evaluateUserReplyTiming", () => {
  it("marks gf_minseo replies over 3600 seconds as ignored", () => {
    const result = evaluateUserReplyTiming({
      policy: "EXPECT_FAST_REPLY",
      delaySeconds: 3601
    });

    expect(result.label).toBe("IGNORED");
    expect(result.effects.affection).toBeLessThan(0);
    expect(result.effects.suspicion).toBeGreaterThan(0);
  });

  it("marks gf_jiyoon replies within 60 seconds as too fast", () => {
    const result = evaluateUserReplyTiming({
      policy: "PREFERS_SPACE",
      delaySeconds: 60
    });

    expect(result.label).toBe("TOO_FAST");
  });

  it("marks gf_seoa support context replies within 300 seconds as supportive fast replies", () => {
    const result = evaluateUserReplyTiming({
      policy: "CONTEXTUAL",
      delaySeconds: 300,
      timingContext: "NEEDS_SUPPORT"
    });

    expect(result.label).toBe("SUPPORTIVE_FAST_REPLY");
    expect(result.effects.comfort).toBeGreaterThan(0);
  });
});
