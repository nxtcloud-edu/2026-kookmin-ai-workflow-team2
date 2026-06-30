import type { EventTemplateConfig, RelationshipScores, Room } from "../types/domain.js";
import { calculateRelationshipDay } from "../utils/time.js";

export class EventTriggerService {
  selectEvent(input: {
    room: Room;
    scores: RelationshipScores;
    templates: EventTemplateConfig[];
    failedEvents: number;
    now?: Date;
  }): EventTemplateConfig | null {
    const relationshipDay = calculateRelationshipDay(input.room, input.now);
    const candidates = input.templates
      .filter((template) =>
        this.matchesTrigger({
          template,
          room: input.room,
          scores: input.scores,
          relationshipDay,
          failedEvents: input.failedEvents
        })
      )
      .sort((a, b) => b.priority - a.priority);

    return candidates[0] ?? null;
  }

  private matchesTrigger(input: {
    template: EventTemplateConfig;
    room: Room;
    scores: RelationshipScores;
    relationshipDay: number;
    failedEvents: number;
  }): boolean {
    const { template, scores, relationshipDay, failedEvents } = input;
    const trigger = template.trigger;

    if (trigger.relationshipDayEquals !== undefined && relationshipDay !== trigger.relationshipDayEquals) return false;
    if (trigger.minDay !== undefined && relationshipDay < trigger.minDay) return false;
    if (trigger.maxDay !== undefined && relationshipDay > trigger.maxDay) return false;
    if (trigger.stressMin !== undefined && scores.stress < trigger.stressMin) return false;
    if (trigger.suspicionMin !== undefined && scores.suspicion < trigger.suspicionMin) return false;
    if (trigger.trustMax !== undefined && scores.trust > trigger.trustMax) return false;
    if (trigger.trustMin !== undefined && scores.trust < trigger.trustMin) return false;
    if (trigger.affectionMax !== undefined && scores.affection > trigger.affectionMax) return false;
    if (trigger.comfortMax !== undefined && scores.comfort > trigger.comfortMax) return false;
    if (trigger.failedEventsMin !== undefined && failedEvents < trigger.failedEventsMin) return false;
    if (trigger.baseChance !== undefined && Math.random() > trigger.baseChance) return false;

    return true;
  }
}
