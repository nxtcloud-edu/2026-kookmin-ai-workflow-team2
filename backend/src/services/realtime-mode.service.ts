import { PendingJobRepository } from "../db/repositories/pending-job.repository.js";
import { RoomRepository } from "../db/repositories/room.repository.js";
import type { GirlfriendConfig, Room } from "../types/domain.js";
import { addSecondsIso } from "../utils/time.js";
import { calculateGirlfriendReplyDelaySeconds } from "./reply-delay.service.js";

export class RealtimeModeService {
  constructor(
    private readonly pendingJobRepository: PendingJobRepository,
    private readonly roomRepository: RoomRepository
  ) {}

  scheduleOrGetPending(room: Room, girlfriend: GirlfriendConfig): { dueAt: string; existing: boolean; immediate: boolean } {
    const existing = this.pendingJobRepository.findPendingByRoomId(room.id);
    if (existing) {
      return { dueAt: existing.dueAt, existing: true, immediate: false };
    }

    const delaySeconds = calculateGirlfriendReplyDelaySeconds({ girlfriend, room });
    if (delaySeconds <= 0) {
      return { dueAt: new Date().toISOString(), existing: false, immediate: true };
    }

    const dueAt = addSecondsIso(new Date(), delaySeconds);
    this.pendingJobRepository.create(room.id, dueAt);
    this.roomRepository.updateStatus(room.id, "PENDING_REPLY");
    return { dueAt, existing: false, immediate: false };
  }
}
