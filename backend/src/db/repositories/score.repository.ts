import type { Database } from "better-sqlite3";
import type { RelationshipScores, ScoreEffects } from "../../types/domain.js";
import { applyScoreEffects, clampScores } from "../../utils/clamp.js";
import { nowIso } from "../../utils/time.js";

interface ScoreRow {
  room_id: string;
  affection: number;
  trust: number;
  comfort: number;
  stress: number;
  suspicion: number;
  jealousy: number;
  violation_score: number;
  hidden_flags_json: string;
  updated_at: string;
}

function toScores(row: ScoreRow): RelationshipScores {
  return {
    affection: row.affection,
    trust: row.trust,
    comfort: row.comfort,
    stress: row.stress,
    suspicion: row.suspicion,
    jealousy: row.jealousy,
    violationScore: row.violation_score
  };
}

export class ScoreRepository {
  constructor(private readonly db: Database) {}

  create(roomId: string, scores: RelationshipScores): void {
    const clamped = clampScores(scores);
    this.db
      .prepare(`
        INSERT INTO relationship_scores (
          room_id, affection, trust, comfort, stress, suspicion, jealousy,
          violation_score, hidden_flags_json, updated_at
        )
        VALUES (
          @roomId, @affection, @trust, @comfort, @stress, @suspicion, @jealousy,
          @violationScore, '{}', @updatedAt
        )
      `)
      .run({ roomId, ...clamped, updatedAt: nowIso() });
  }

  findByRoomId(roomId: string): RelationshipScores | null {
    const row = this.db
      .prepare("SELECT * FROM relationship_scores WHERE room_id = ?")
      .get(roomId) as ScoreRow | undefined;
    return row ? toScores(row) : null;
  }

  hiddenFlags(roomId: string): Record<string, unknown> {
    const row = this.db
      .prepare("SELECT hidden_flags_json FROM relationship_scores WHERE room_id = ?")
      .get(roomId) as Pick<ScoreRow, "hidden_flags_json"> | undefined;
    return row ? JSON.parse(row.hidden_flags_json) : {};
  }

  replace(roomId: string, scores: RelationshipScores): RelationshipScores {
    const clamped = clampScores(scores);
    this.db
      .prepare(`
        UPDATE relationship_scores
        SET affection = @affection,
            trust = @trust,
            comfort = @comfort,
            stress = @stress,
            suspicion = @suspicion,
            jealousy = @jealousy,
            violation_score = @violationScore,
            updated_at = @updatedAt
        WHERE room_id = @roomId
      `)
      .run({ roomId, ...clamped, updatedAt: nowIso() });
    return clamped;
  }

  applyEffects(roomId: string, effects: ScoreEffects): RelationshipScores {
    const current = this.findByRoomId(roomId);
    if (!current) {
      throw new Error(`Scores not found for room ${roomId}`);
    }

    return this.replace(roomId, applyScoreEffects(current, effects));
  }

  addViolation(roomId: string, points: number): RelationshipScores {
    return this.applyEffects(roomId, { violationScore: points });
  }

  resetViolation(roomId: string): RelationshipScores {
    const current = this.findByRoomId(roomId);
    if (!current) {
      throw new Error(`Scores not found for room ${roomId}`);
    }

    return this.replace(roomId, { ...current, violationScore: 0 });
  }
}
