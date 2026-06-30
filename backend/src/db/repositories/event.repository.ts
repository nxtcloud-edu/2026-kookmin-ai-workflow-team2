import type { Database } from "better-sqlite3";
import type { EventStatus, EventTemplateConfig, RoomEvent } from "../../types/domain.js";
import { newId } from "../../utils/ids.js";
import { nowIso } from "../../utils/time.js";

interface EventTemplateRow {
  id: string;
  name: string;
  category: string;
  hidden: number;
  priority: number;
  trigger_json: string;
  opening_message: string;
  steps_json: string;
  effects_json: string;
  min_day: number | null;
  max_day: number | null;
  cooldown_days: number;
  enabled: number;
}

interface RoomEventRow {
  id: string;
  room_id: string;
  event_template_id: string;
  status: EventStatus;
  current_step: number;
  hidden: number;
  started_at: string;
  expires_at: string | null;
  completed_at: string | null;
  event_state_json: string;
  created_at: string;
  updated_at: string;
}

function toTemplate(row: EventTemplateRow): EventTemplateConfig {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    hidden: row.hidden === 1,
    priority: row.priority,
    trigger: JSON.parse(row.trigger_json),
    openingMessage: row.opening_message,
    steps: JSON.parse(row.steps_json),
    effects: JSON.parse(row.effects_json),
    minDay: row.min_day,
    maxDay: row.max_day,
    cooldownDays: row.cooldown_days,
    enabled: row.enabled === 1,
    timingContext: JSON.parse(row.steps_json)[0]?.timingContext ?? "NEEDS_SUPPORT"
  } as EventTemplateConfig;
}

function toRoomEvent(row: RoomEventRow): RoomEvent {
  return {
    id: row.id,
    roomId: row.room_id,
    eventTemplateId: row.event_template_id,
    status: row.status,
    currentStep: row.current_step,
    hidden: row.hidden === 1,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    completedAt: row.completed_at,
    eventState: JSON.parse(row.event_state_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class EventRepository {
  constructor(private readonly db: Database) {}

  listTemplates(): EventTemplateConfig[] {
    return this.db
      .prepare("SELECT * FROM event_templates WHERE enabled = 1 ORDER BY priority DESC")
      .all()
      .map((row) => toTemplate(row as EventTemplateRow));
  }

  findTemplateById(id: string): EventTemplateConfig | null {
    const row = this.db.prepare("SELECT * FROM event_templates WHERE id = ?").get(id) as EventTemplateRow | undefined;
    return row ? toTemplate(row) : null;
  }

  findActiveByRoomId(roomId: string): RoomEvent | null {
    const row = this.db
      .prepare("SELECT * FROM room_events WHERE room_id = ? AND status = 'ACTIVE' ORDER BY started_at DESC LIMIT 1")
      .get(roomId) as RoomEventRow | undefined;
    return row ? toRoomEvent(row) : null;
  }

  countFailedByRoomId(roomId: string): number {
    const row = this.db
      .prepare("SELECT COUNT(*) AS count FROM room_events WHERE room_id = ? AND status = 'FAILED'")
      .get(roomId) as { count: number };
    return row.count;
  }

  createActive(input: {
    roomId: string;
    template: EventTemplateConfig;
    eventState?: Record<string, unknown>;
    expiresAt?: string | null;
  }): RoomEvent {
    const now = nowIso();
    const event: RoomEvent = {
      id: newId("event"),
      roomId: input.roomId,
      eventTemplateId: input.template.id,
      status: "ACTIVE",
      currentStep: 1,
      hidden: input.template.hidden,
      startedAt: now,
      expiresAt: input.expiresAt ?? null,
      completedAt: null,
      eventState: input.eventState ?? {},
      createdAt: now,
      updatedAt: now
    };

    this.db
      .prepare(`
        INSERT INTO room_events (
          id, room_id, event_template_id, status, current_step, hidden,
          started_at, expires_at, completed_at, event_state_json, created_at, updated_at
        )
        VALUES (
          @id, @roomId, @eventTemplateId, @status, @currentStep, @hidden,
          @startedAt, @expiresAt, @completedAt, @eventStateJson, @createdAt, @updatedAt
        )
      `)
      .run({
        ...event,
        hidden: event.hidden ? 1 : 0,
        eventStateJson: JSON.stringify(event.eventState)
      });

    return event;
  }

  complete(id: string, status: Extract<EventStatus, "COMPLETED" | "FAILED">, eventState: Record<string, unknown>): void {
    this.db
      .prepare(`
        UPDATE room_events
        SET status = @status,
            completed_at = @completedAt,
            event_state_json = @eventStateJson,
            updated_at = @updatedAt
        WHERE id = @id
      `)
      .run({
        id,
        status,
        completedAt: nowIso(),
        eventStateJson: JSON.stringify(eventState),
        updatedAt: nowIso()
      });
  }
}
