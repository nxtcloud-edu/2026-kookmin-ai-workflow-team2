import type { RelationshipScores, ScoreEffects } from "../types/domain.js";
import { applyScoreEffects, clampScores } from "../utils/clamp.js";

export function applyRelationshipEffects(scores: RelationshipScores, effects: ScoreEffects): RelationshipScores {
  return applyScoreEffects(scores, effects);
}

export function normalizeRelationshipScores(scores: RelationshipScores): RelationshipScores {
  return clampScores(scores);
}
