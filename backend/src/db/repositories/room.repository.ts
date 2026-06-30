import type { Database } from "better-sqlite3";
import type { ChatMode, Room, RoomStatus } from "../../types/domain.js";
import { newId } from "../../utils/ids.js";
import { nowIso } from "../../utils/time.js";

interface RoomRow {
  id: string;
  user_id: string;
  girlfriend_id: string;
  mode: ChatMode;
  status: RoomStatus;
  relationship_started_at: string;
  fast_day: number;
  fast_visible_message_count_today: number;
  fast_user_turn_count_today: number;
  cooldown_until: string | null;
  created_at: string;
  updated_at: string;
}

function toRoom(row: RoomRow): Room {
  return {
    id: row.id,
    userId: row.user_id,
    girlfriendId: row.girlfriend_id,
    mode: row.mode,
    status: row.status,
    relationshipStartedAt: row.relationship_started_at,
    fastDay: row.fast_day,
    fastVisibleMessageCountToday: row.fast_visible_message_count_today,
    fastUserTurnCountToday: row.fast_user_turn_count_today,
    cooldownUntil: row.cooldown_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class RoomRepository {
  constructor(private readonly db: Database) {}

  create(input: { userId: string; girlfriendId: string; mode: ChatMode }): Room {
    const now = nowIso();
    const room: Room = {
      id: newId("room"),
      userId: input.userId,
      girlfriendId: input.girlfriendId,
      mode: input.mode,
      status: "ACTIVE",
      relationshipStartedAt: now,
      fastDay: 1,
      fastVisibleMessageCountToday: 0,
      fastUserTurnCountToday: 0,
      cooldownUntil: null,
      createdAt: now,
      updatedAt: now
    };

    this.db
      .prepare(`
        INSERT INTO chat_rooms (
          id, user_id, girlfriend_id, mode, status, relationship_started_at,
          fast_day, fast_visible_message_count_today, fast_user_turn_count_today,
          cooldown_until, created_at, updated_at
        )
        VALUES (
          @id, @userId, @girlfriendId, @mode, @status, @relationshipStartedAt,
          @fastDay, @fastVisibleMessageCountToday, @fastUserTurnCountToday,
          @cooldownUntil, @createdAt, @updatedAt
        )
      `)
      .run(room);

    return room;
  }

  findById(id: string): Room | null {
    const row = this.db.prepare("SELECT * FROM chat_rooms WHERE id = ?").get(id) as RoomRow | undefined;
    return row ? toRoom(row) : null;
  }

  updateStatus(id: string, status: RoomStatus, cooldownUntil?: string | null): void {
    this.db
      .prepare("UPDATE chat_rooms SET status = ?, cooldown_until = ?, updated_at = ? WHERE id = ?")
      .run(status, cooldownUntil ?? null, nowIso(), id);
  }

  clearCooldown(id: string): void {
    this.db
      .prepare("UPDATE chat_rooms SET status = 'ACTIVE', cooldown_until = NULL, updated_at = ? WHERE id = ?")
      .run(nowIso(), id);
  }

  updateFastCounters(
    id: string,
    counters: { fastDay: number; fastVisibleMessageCountToday: number; fastUserTurnCountToday: number }
  ): void {
    this.db
      .prepare(`
        UPDATE chat_rooms
        SET fast_day = @fastDay,
            fast_visible_message_count_today = @fastVisibleMessageCountToday,
            fast_user_turn_count_today = @fastUserTurnCountToday,
            updated_at = @updatedAt
        WHERE id = @id
      `)
      .run({ id, ...counters, updatedAt: nowIso() });
  }
}
