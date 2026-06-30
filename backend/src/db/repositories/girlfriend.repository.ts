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
  const description = visibleDescription(row.id);
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    difficulty: row.difficulty,
    personaType: row.persona_type,
    personality: description,
    description,
    personaPrompt: row.persona_prompt,
    baseScores: JSON.parse(row.base_scores_json) as RelationshipScores,
    girlfriendReplyPolicy: JSON.parse(row.girlfriend_reply_policy_json),
    userReplyTimingPolicy: JSON.parse(row.user_reply_timing_policy_json) as UserReplyTimingPolicy,
    eventWeights: JSON.parse(row.event_weights_json)
  };
}

function visibleDescription(id: string): string {
  const descriptions: Record<string, string> = {
    gf_minseo: "애정 표현과 빠른 반응을 중요하게 생각하는 타입",
    gf_jiyoon: "거리감과 신뢰를 중요하게 생각하는 타입",
    gf_seoa: "맥락 판단과 감정 읽기를 중요하게 생각하는 타입",
    gf_harin: "책임감과 커리어 존중을 중요하게 생각하는 타입"
  };

  return descriptions[id] ?? "관계 대화 훈련용 캐릭터";
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
