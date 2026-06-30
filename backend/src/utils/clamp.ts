import type { RelationshipScores, ScoreEffects } from "../types/domain.js";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampScores(scores: RelationshipScores): RelationshipScores {
  return {
    affection: clamp(Math.round(scores.affection), 0, 100),
    trust: clamp(Math.round(scores.trust), 0, 100),
    comfort: clamp(Math.round(scores.comfort), 0, 100),
    stress: clamp(Math.round(scores.stress), 0, 100),
    suspicion: clamp(Math.round(scores.suspicion), 0, 100),
    jealousy: clamp(Math.round(scores.jealousy), 0, 100),
    violationScore: clamp(Math.round(scores.violationScore), 0, 999)
  };
}

export function applyScoreEffects(
  scores: RelationshipScores,
  effects: ScoreEffects
): RelationshipScores {
  return clampScores({
    affection: scores.affection + (effects.affection ?? 0),
    trust: scores.trust + (effects.trust ?? 0),
    comfort: scores.comfort + (effects.comfort ?? 0),
    stress: scores.stress + (effects.stress ?? 0),
    suspicion: scores.suspicion + (effects.suspicion ?? 0),
    jealousy: scores.jealousy + (effects.jealousy ?? 0),
    violationScore: scores.violationScore + (effects.violationScore ?? 0)
  });
}
