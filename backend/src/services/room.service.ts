import type { Database } from "better-sqlite3";
import { RoomRepository } from "../db/repositories/room.repository.js";
import { ScoreRepository } from "../db/repositories/score.repository.js";
import type { ChatMode, Room } from "../types/domain.js";
import { calculateRelationshipDay, isCooldownActive } from "../utils/time.js";
import { HttpError } from "../utils/http-error.js";
import { GirlfriendService } from "./girlfriend.service.js";

export class RoomService {
  constructor(
    private readonly db: Database,
    private readonly roomRepository: RoomRepository,
    private readonly scoreRepository: ScoreRepository,
    private readonly girlfriendService: GirlfriendService
  ) {}

  createRoom(input: { userId: string; girlfriendId: string; mode: ChatMode }): {
    roomId: string;
    mode: ChatMode;
    relationshipDay: number;
    status: string;
    girlfriend: { id: string; name: string; displayName: string };
  } {
    const girlfriend = this.girlfriendService.getRequired(input.girlfriendId);

    const transaction = this.db.transaction(() => {
      const room = this.roomRepository.create(input);
      this.scoreRepository.create(room.id, girlfriend.baseScores);
      return room;
    });

    const room = transaction() as Room;
    return {
      roomId: room.id,
      mode: room.mode,
      relationshipDay: calculateRelationshipDay(room),
      status: room.status,
      girlfriend: {
        id: girlfriend.id,
        name: girlfriend.name,
        displayName: girlfriend.displayName
      }
    };
  }

  getRequired(roomId: string): Room {
    const room = this.roomRepository.findById(roomId);
    if (!room) {
      throw new HttpError(404, "ROOM_NOT_FOUND", "채팅방을 찾을 수 없습니다.");
    }

    if (room.cooldownUntil && !isCooldownActive(room.cooldownUntil) && room.status === "COOLDOWN") {
      this.roomRepository.clearCooldown(room.id);
      return { ...room, status: "ACTIVE", cooldownUntil: null };
    }

    return room;
  }

  state(roomId: string, debugExposeScores: boolean): Record<string, unknown> {
    const room = this.getRequired(roomId);
    const girlfriend = this.girlfriendService.getRequired(room.girlfriendId);
    const scores = this.scoreRepository.findByRoomId(room.id);

    return {
      roomId: room.id,
      status: room.status,
      mode: room.mode,
      relationshipDay: calculateRelationshipDay(room),
      girlfriendId: room.girlfriendId,
      girlfriendName: girlfriend.displayName,
      cooldownUntil: room.cooldownUntil,
      fastVisibleMessageCountToday: room.fastVisibleMessageCountToday,
      fastUserTurnCountToday: room.fastUserTurnCountToday,
      ...(debugExposeScores && scores
        ? {
            scores,
            hiddenFlags: this.scoreRepository.hiddenFlags(room.id)
          }
        : {})
    };
  }
}
