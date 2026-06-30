import { describe, expect, it } from "vitest";
import type { ForbiddenRuleConfig } from "../types/domain.js";
import { evaluateForbiddenRules } from "../services/violation.service.js";

const rules: ForbiddenRuleConfig[] = [
  {
    id: "early_family_question",
    scope: "STAGE",
    girlfriendId: null,
    label: "초기 가족관계 질문",
    type: "KEYWORD",
    keywords: ["가족", "부모님", "가족관계"],
    points: 50,
    minDay: 1,
    maxDay: 30
  },
  {
    id: "marriage_after_month",
    scope: "STAGE",
    girlfriendId: null,
    label: "한 달 이후 결혼 압박",
    type: "KEYWORD",
    keywords: ["결혼", "상견례"],
    points: 50,
    minDay: 31,
    maxDay: null
  }
];

describe("evaluateForbiddenRules", () => {
  it("adds 50 points for early family topic on day 1", () => {
    const result = evaluateForbiddenRules({
      content: "부모님은 뭐하셔?",
      rules,
      girlfriendId: "gf_minseo",
      relationshipDay: 1
    });

    expect(result.totalPoints).toBe(50);
    expect(result.matches[0]?.rule.id).toBe("early_family_question");
  });

  it("does not add family topic points on day 31", () => {
    const result = evaluateForbiddenRules({
      content: "가족관계가 어떻게 돼?",
      rules,
      girlfriendId: "gf_minseo",
      relationshipDay: 31
    });

    expect(result.totalPoints).toBe(0);
  });

  it("adds 50 points for marriage topic on day 31", () => {
    const result = evaluateForbiddenRules({
      content: "우리 결혼 생각해볼까?",
      rules,
      girlfriendId: "gf_minseo",
      relationshipDay: 31
    });

    expect(result.totalPoints).toBe(50);
    expect(result.matches[0]?.rule.id).toBe("marriage_after_month");
  });
});
