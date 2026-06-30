import type { ScoreEffects, TimingContext, TimingEvaluation, UserReplyTimingPolicy } from "../types/domain.js";

function result(label: string, effects: ScoreEffects = {}): TimingEvaluation {
  return { label, effects };
}

export function evaluateUserReplyTiming(input: {
  policy: UserReplyTimingPolicy;
  delaySeconds: number;
  timingContext?: TimingContext | null;
  importantEvent?: boolean;
}): TimingEvaluation {
  const delay = input.delaySeconds;

  switch (input.policy) {
    case "EXPECT_FAST_REPLY":
      if (delay <= 120) return result("PERFECT_TIMING", { affection: 3, trust: 1 });
      if (delay <= 300) return result("ACCEPTABLE_TIMING");
      if (delay <= 1800) return result("LATE_REPLY", { affection: -3 });
      if (delay <= 3600) return result("VERY_LATE_REPLY", { affection: -8, suspicion: 5 });
      return result("IGNORED", { affection: -15, suspicion: 15, stress: 10 });

    case "PREFERS_SPACE":
      if (delay <= 60) return result("TOO_FAST", { comfort: -5, affection: -2, stress: 3 });
      if (delay <= 300) return result("SLIGHTLY_FAST");
      if (delay <= 1800) return result("GOOD_DISTANCE", { comfort: 3, affection: 2 });
      if (delay <= 7200) return result("ACCEPTABLE_DISTANCE");
      return result("TOO_LATE", { affection: -5, trust: -3 });

    case "CONTEXTUAL":
      return evaluateContextualTiming(delay, input.timingContext);

    case "MATURE_STABLE":
      if (delay <= 30) return result("TOO_FAST_LIGHT", { comfort: -2 });
      if (delay >= 300 && delay <= 3600) return result("STABLE_REPLY", { trust: 3 });
      if (delay <= 10800) return result("ACCEPTABLE");
      return result("TOO_LATE", { trust: input.importantEvent ? -10 : -5, affection: -3 });
  }
}

function evaluateContextualTiming(delay: number, timingContext?: TimingContext | null): TimingEvaluation {
  if (timingContext === "NEEDS_SUPPORT" || timingContext === "NEEDS_REASSURANCE") {
    if (delay <= 300) {
      return result("SUPPORTIVE_FAST_REPLY", { affection: 5, comfort: 5, stress: -5 });
    }

    return result("FAILED_TO_SUPPORT", { affection: -8, trust: -5, stress: 10 });
  }

  if (timingContext === "NEEDS_SPACE") {
    if (delay <= 60) return result("PRESSURING_REPLY", { comfort: -8, stress: 8 });
    if (delay <= 7200) return result("RESPECTED_SPACE", { comfort: 5, trust: 3 });
    return result("TOO_DISTANT", { affection: -5 });
  }

  if (delay <= 1800) {
    return result("NORMAL_GOOD", { affection: 1 });
  }

  return result("NORMAL_LATE", { affection: -2 });
}
