import { describe, expect, it } from "vitest";
import {
  getDailyFeedbackFallback,
  getGirlfriendFallbackReply,
  getIntentFallback
} from "../services/fallback.service.js";

describe("fallback.service", () => {
  it("returns gf_minseo fallback", () => {
    expect(getGirlfriendFallbackReply("gf_minseo")).toBe("??吏湲?萸먮씪怨??댁빞 ?좎? 紐⑤Ⅴ寃좎뼱.");
  });

  it("returns gf_jiyoon fallback", () => {
    expect(getGirlfriendFallbackReply("gf_jiyoon")).toBe("?좉퉸 ?앷컖 醫 ?좉쾶.");
  });

  it("returns gf_seoa fallback", () => {
    expect(getGirlfriendFallbackReply("gf_seoa")).toBe("吏湲덉? 留먯씠 ?????섏?.");
  });

  it("returns gf_harin fallback", () => {
    expect(getGirlfriendFallbackReply("gf_harin")).toBe("???섍린??議곌툑 ?덈떎媛 ?ㅼ떆 ?섏옄.");
  });

  it("returns default fallback", () => {
    expect(getGirlfriendFallbackReply("unknown")).toBe("?좉퉸留? 吏湲덉? 諛붾줈 ?듯븯湲??대졄寃좎뼱.");
  });

  it("returns daily feedback fallback", () => {
    expect(getDailyFeedbackFallback()).toContain("?ㅻ뒛???쇰뱶諛?");
  });

  it("returns intent fallback", () => {
    expect(getIntentFallback()).toEqual({
      intent: "UNKNOWN",
      confidence: 0,
      reason: "遺꾨쪟???ㅽ뙣?덉뒿?덈떎."
    });
  });
});
