import type { Database } from "better-sqlite3";
import type { ForbiddenRuleConfig } from "../../types/domain.js";

interface ForbiddenRuleRow {
  id: string;
  scope: "COMMON" | "STAGE" | "PERSONA" | "EVENT";
  girlfriend_id: string | null;
  label: string;
  type: string;
  keywords_json: string;
  points: number;
  min_day: number;
  max_day: number | null;
  active_event_id: string | null;
  enabled: number;
}

function toRule(row: ForbiddenRuleRow): ForbiddenRuleConfig {
  return {
    id: row.id,
    scope: row.scope,
    girlfriendId: row.girlfriend_id,
    label: row.label,
    type: row.type,
    keywords: JSON.parse(row.keywords_json) as string[],
    points: row.points,
    minDay: row.min_day,
    maxDay: row.max_day,
    activeEventId: row.active_event_id,
    enabled: row.enabled === 1
  };
}

export class ForbiddenRuleRepository {
  constructor(private readonly db: Database) {}

  listEnabled(): ForbiddenRuleConfig[] {
    return this.db
      .prepare("SELECT * FROM forbidden_rules WHERE enabled = 1 ORDER BY scope, id")
      .all()
      .map((row) => toRule(row as ForbiddenRuleRow));
  }
}
