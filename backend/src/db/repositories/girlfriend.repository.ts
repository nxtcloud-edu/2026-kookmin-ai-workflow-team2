import type { Database } from "better-sqlite3";
import type { GirlfriendConfig, RelationshipScores, UserReplyTimingPolicy } from "../../types/domain.js";

interface GirlfriendRow {
  id: string;
  name: string;
  display_name: string;
  difficulty: string;
  persona_type: string;
  persona_prompt: string;
  base_scores_json: string;
  girlfriend_reply_policy_json: string;
  user_reply_timing_policy_json: string;
  event_weights_json: string;
}

function toGirlfriend(row: GirlfriendRow): GirlfriendConfig {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    difficulty: row.difficulty,
    personaType: row.persona_type,
    personality: "",
    description: row.persona_prompt,
    personaPrompt: row.persona_prompt,
    baseScores: JSON.parse(row.base_scores_json) as RelationshipScores,
    girlfriendReplyPolicy: JSON.parse(row.girlfriend_reply_policy_json),
    userReplyTimingPolicy: JSON.parse(row.user_reply_timing_policy_json) as UserReplyTimingPolicy,
    eventWeights: JSON.parse(row.event_weights_json)
  };
}

export class GirlfriendRepository {
  constructor(private readonly db: Database) {}

  list(): GirlfriendConfig[] {
    return this.db
      .prepare("SELECT * FROM girlfriends ORDER BY id")
      .all()
      .map((row) => toGirlfriend(row as GirlfriendRow));
  }

  findById(id: string): GirlfriendConfig | null {
    const row = this.db.prepare("SELECT * FROM girlfriends WHERE id = ?").get(id) as GirlfriendRow | undefined;
    return row ? toGirlfriend(row) : null;
  }
}
