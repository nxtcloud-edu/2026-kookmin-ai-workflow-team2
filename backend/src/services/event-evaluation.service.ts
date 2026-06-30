import type { EventIntent, EventTemplateConfig } from "../types/domain.js";
import { normalizedIncludes } from "../utils/normalize.js";

const supportive = ["힘들었겠다", "고생했어", "내가 들어줄게", "네 편", "괜찮아", "말해줘"];
const dismissive = ["별거 아니네", "그게 뭐", "오바", "예민", "귀찮아"];
const blaming = ["네 잘못", "너도 문제", "그러니까", "왜 그랬어"];
const controlling = ["가지마", "사진 보내", "인증해", "위치", "연락 끊어", "폰 보여줘"];
const balancedTrust = ["신경 쓰이긴 해", "그래도 믿", "말해줘서 고마워", "도착하면 연락"];
const romantic = ["100일", "기념일", "사랑", "챙기려고", "오늘 같이"];
const apology = ["미안", "내가 잘못", "사과", "고칠게"];

export class EventEvaluationService {
  classifyLocalIntent(userMessage: string): EventIntent {
    if (matchesAny(userMessage, supportive)) return "SUPPORTIVE";
    if (matchesAny(userMessage, balancedTrust)) return "BALANCED_TRUST";
    if (matchesAny(userMessage, romantic)) return "ROMANTIC";
    if (matchesAny(userMessage, apology)) return "APOLOGETIC";
    if (matchesAny(userMessage, dismissive)) return "DISMISSIVE";
    if (matchesAny(userMessage, blaming)) return "BLAMING";
    if (matchesAny(userMessage, controlling)) return "CONTROLLING";
    return "UNKNOWN";
  }

  isSuccess(template: EventTemplateConfig, intent: EventIntent): boolean {
    if (template.id === "anniversary_100_day") {
      return intent === "ROMANTIC" || intent === "APOLOGETIC";
    }

    if (template.category === "JEALOUSY_TRUST") {
      return intent === "BALANCED_TRUST" || intent === "SUPPORTIVE";
    }

    if (template.category === "SUSPICION") {
      return intent === "APOLOGETIC" || intent === "BALANCED_TRUST" || intent === "SUPPORTIVE";
    }

    return intent === "SUPPORTIVE" || intent === "APOLOGETIC" || intent === "ROMANTIC" || intent === "BALANCED_TRUST";
  }
}

function matchesAny(message: string, keywords: string[]): boolean {
  return keywords.some((keyword) => normalizedIncludes(message, keyword));
}
