import { EventRepository } from "../db/repositories/event.repository.js";
import { MessageRepository } from "../db/repositories/message.repository.js";
import { RoomRepository } from "../db/repositories/room.repository.js";
import type { EventTemplateConfig, Room, RoomEvent } from "../types/domain.js";

export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly messageRepository: MessageRepository,
    private readonly roomRepository: RoomRepository
  ) {}

  startEvent(room: Room, template: EventTemplateConfig): { roomEvent: RoomEvent; openingMessageId: string } {
    const roomEvent = this.eventRepository.createActive({
      roomId: room.id,
      template,
      eventState: {
        templateId: template.id,
        timingContext: template.timingContext
      }
    });
    const opening = this.messageRepository.create({
      roomId: room.id,
      sender: "GIRLFRIEND",
      content: template.openingMessage,
      messageType: "EVENT_OPENING"
    });
    this.roomRepository.updateStatus(room.id, "EVENT_ACTIVE");
    return { roomEvent, openingMessageId: opening.id };
  }
}
