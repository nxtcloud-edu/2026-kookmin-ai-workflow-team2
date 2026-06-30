import type { ForbiddenRuleConfig, ViolationMatch } from "../types/domain.js";
import { normalizedIncludes } from "../utils/normalize.js";
import { filterActiveForbiddenRules } from "./forbidden-rule.service.js";

export interface ViolationEvaluation {
  matches: ViolationMatch[];
  totalPoints: number;
}

export function evaluateForbiddenRules(input: {
  content: string;
  rules: ForbiddenRuleConfig[];
  girlfriendId: string;
  relationshipDay: number;
  activeEventId?: string | null;
}): ViolationEvaluation {
  const activeRules = filterActiveForbiddenRules(input);
  const matches: ViolationMatch[] = [];

  for (const rule of activeRules) {
    const matchedKeywords = rule.keywords.filter((keyword) => normalizedIncludes(input.content, keyword));
    if (matchedKeywords.length > 0) {
      matches.push({
        rule,
        points: rule.points,
        matchedKeywords
      });
    }
  }

  return {
    matches,
    totalPoints: matches.reduce((sum, match) => sum + match.points, 0)
  };
}
