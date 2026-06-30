import type { GirlfriendConfig, ReplyDelayChoice, Room } from "../types/domain.js";
import { replyDelaySeconds } from "../types/domain.js";

export function replyDelayChoiceToSeconds(choice: ReplyDelayChoice = "NOW"): number {
  return replyDelaySeconds[choice];
}

export function replyDelayChoiceToLabel(choice: ReplyDelayChoice = "NOW"): string {
  switch (choice) {
    case "NOW":
      return "바로";
    case "AFTER_5_MIN":
      return "5분 뒤";
    case "AFTER_30_MIN":
      return "30분 뒤";
    case "AFTER_1_HOUR":
      return "1시간 뒤";
    case "AFTER_3_HOURS":
      return "3시간 뒤";
    case "AFTER_HALF_DAY":
      return "반나절 뒤";
    case "AFTER_NEXT_DAY":
      return "다음날";
  }
}

export function virtualDelayLabel(choice: ReplyDelayChoice = "NOW"): string | null {
  return choice === "NOW" ? null : `[${replyDelayChoiceToLabel(choice)}]`;
}

export function calculateGirlfriendReplyDelaySeconds(input: {
  girlfriend: GirlfriendConfig;
  room: Room;
  now?: Date;
}): number {
  const policy = input.girlfriend.girlfriendReplyPolicy;
  switch (policy.type) {
    case "AFTER_N_FIXED_DELAY":
      return input.room.fastVisibleMessageCountToday < (policy.immediateReplyCount ?? 0)
        ? 0
        : policy.delayAfterImmediateSeconds ?? 1800;
    case "BURST_THEN_SILENCE":
      return input.room.fastVisibleMessageCountToday < (policy.burstCount ?? 0) ? 0 : policy.silenceSeconds ?? 43200;
    case "RANDOM_DELAY": {
      const min = policy.minDelaySeconds ?? 10;
      const max = policy.maxDelaySeconds ?? 3600;
      return Math.floor(min + Math.random() * Math.max(0, max - min));
    }
    case "SCHEDULED_BY_DAILY_ROUTINE": {
      const hour = (input.now ?? new Date()).getHours();
      return hour >= 9 && hour < 18 ? policy.workHourDelaySeconds ?? 7200 : policy.normalDelaySeconds ?? 600;
    }
  }
}
