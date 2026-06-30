import type { Database } from "better-sqlite3";
import type { ChatMode, ScoreEffects } from "../../types/domain.js";
import { newId } from "../../utils/ids.js";
import { nowIso } from "../../utils/time.js";

export class TimingRepository {
  constructor(private readonly db: Database) {}

  create(input: {
    roomId: string;
    girlfriendMessageId?: string | null;
    userMessageId: string;
    mode: ChatMode;
    delaySeconds: number;
    delayLabel: string;
    timingResult: string;
    effects: ScoreEffects;
    activeEventId?: string | null;
  }): void {
    this.db
      .prepare(`
        INSERT INTO user_reply_timing_events (
          id, room_id, girlfriend_message_id, user_message_id, mode, delay_seconds,
          delay_label, timing_result, effects_json, active_event_id, created_at
        )
        VALUES (
          @id, @roomId, @girlfriendMessageId, @userMessageId, @mode, @delaySeconds,
          @delayLabel, @timingResult, @effectsJson, @activeEventId, @createdAt
        )
      `)
      .run({
        id: newId("timing"),
        roomId: input.roomId,
        girlfriendMessageId: input.girlfriendMessageId ?? null,
        userMessageId: input.userMessageId,
        mode: input.mode,
        delaySeconds: input.delaySeconds,
        delayLabel: input.delayLabel,
        timingResult: input.timingResult,
        effectsJson: JSON.stringify(input.effects),
        activeEventId: input.activeEventId ?? null,
        createdAt: nowIso()
      });
  }
}
