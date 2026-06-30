import type { ForbiddenRuleConfig } from "../types/domain.js";

export function isRuleActiveForContext(input: {
  rule: ForbiddenRuleConfig;
  girlfriendId: string;
  relationshipDay: number;
  activeEventId?: string | null;
}): boolean {
  const { rule, girlfriendId, relationshipDay, activeEventId } = input;
  if (rule.enabled === false) {
    return false;
  }

  if (relationshipDay < rule.minDay) {
    return false;
  }

  if (rule.maxDay !== null && rule.maxDay !== undefined && relationshipDay > rule.maxDay) {
    return false;
  }

  if (rule.scope === "PERSONA" && rule.girlfriendId !== girlfriendId) {
    return false;
  }

  if (rule.scope === "EVENT" && rule.activeEventId !== activeEventId) {
    return false;
  }

  return true;
}

export function filterActiveForbiddenRules(input: {
  rules: ForbiddenRuleConfig[];
  girlfriendId: string;
  relationshipDay: number;
  activeEventId?: string | null;
}): ForbiddenRuleConfig[] {
  return input.rules.filter((rule) =>
    isRuleActiveForContext({
      rule,
      girlfriendId: input.girlfriendId,
      relationshipDay: input.relationshipDay,
      activeEventId: input.activeEventId
    })
  );
}
