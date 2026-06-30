import { describe, expect, it } from "vitest";
import { normalizedIncludes, normalizeMessage } from "../utils/normalize.js";

describe("normalizeMessage", () => {
  it("matches spaced Korean words", () => {
    expect(normalizedIncludes("결 혼 언제 할래?", "결혼")).toBe(true);
  });

  it("matches punctuated Korean words", () => {
    expect(normalizedIncludes("부-모님은 뭐하셔?", "부모님")).toBe(true);
  });

  it("keeps Korean letters, latin letters, and numbers", () => {
    expect(normalizeMessage("A-1 한 글!")).toBe("a1한글");
  });
});
