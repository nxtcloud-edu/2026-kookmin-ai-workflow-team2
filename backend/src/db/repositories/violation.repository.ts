import type { Database } from "better-sqlite3";
import type { ViolationMatch } from "../../types/domain.js";
import { newId } from "../../utils/ids.js";
import { nowIso } from "../../utils/time.js";

export class ViolationRepository {
  constructor(private readonly db: Database) {}

  createMany(input: {
    roomId: string;
    userMessageId: string;
    relationshipDay: number;
    matches: ViolationMatch[];
  }): void {
    const insert = this.db.prepare(`
      INSERT INTO violation_events (
        id, room_id, rule_id, user_message_id, points, relationship_day, created_at
      )
      VALUES (@id, @roomId, @ruleId, @userMessageId, @points, @relationshipDay, @createdAt)
    `);

    const transaction = this.db.transaction(() => {
      for (const match of input.matches) {
        insert.run({
          id: newId("vio"),
          roomId: input.roomId,
          ruleId: match.rule.id,
          userMessageId: input.userMessageId,
          points: match.points,
          relationshipDay: input.relationshipDay,
          createdAt: nowIso()
        });
      }
    });

    transaction();
  }
}
