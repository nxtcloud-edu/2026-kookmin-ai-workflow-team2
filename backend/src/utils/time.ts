import type { ChatMode, Room } from "../types/domain.js";

const dayMs = 24 * 60 * 60 * 1000;

export function nowIso(): string {
  return new Date().toISOString();
}

export function addSecondsIso(date: Date, seconds: number): string {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

export function secondsBetween(fromIso: string, to: Date = new Date()): number {
  return Math.max(0, Math.floor((to.getTime() - new Date(fromIso).getTime()) / 1000));
}

export function calculateRelationshipDay(room: Pick<Room, "mode" | "fastDay" | "relationshipStartedAt">, at = new Date()): number {
  if (room.mode === "FAST") {
    return room.fastDay;
  }

  return 1 + Math.floor((at.getTime() - new Date(room.relationshipStartedAt).getTime()) / dayMs);
}

export function isCooldownActive(cooldownUntil: string | null, at = new Date()): boolean {
  return Boolean(cooldownUntil && new Date(cooldownUntil).getTime() > at.getTime());
}

export function remainingSeconds(untilIso: string, at = new Date()): number {
  return Math.max(0, Math.ceil((new Date(untilIso).getTime() - at.getTime()) / 1000));
}

export function modeLabel(mode: ChatMode): string {
  return mode === "FAST" ? "FAST" : "REALTIME";
}
