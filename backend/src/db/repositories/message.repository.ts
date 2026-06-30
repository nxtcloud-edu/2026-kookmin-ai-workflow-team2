import type { Database } from "better-sqlite3";
import type { Message, MessageType, Sender } from "../../types/domain.js";
import { newId } from "../../utils/ids.js";
import { nowIso } from "../../utils/time.js";

interface MessageRow {
  id: string;
  room_id: string;
  sender: Sender;
  content: string;
  message_type: MessageType;
  virtual_delay_label: string | null;
  created_at: string;
}

function toMessage(row: MessageRow): Message {
  return {
    id: row.id,
    roomId: row.room_id,
    sender: row.sender,
    content: row.content,
    messageType: row.message_type,
    virtualDelayLabel: row.virtual_delay_label,
    createdAt: row.created_at
  };
}

export class MessageRepository {
  constructor(private readonly db: Database) {}

  create(input: {
    roomId: string;
    sender: Sender;
    content: string;
    messageType?: MessageType;
    virtualDelayLabel?: string | null;
  }): Message {
    const message: Message = {
      id: newId("msg"),
      roomId: input.roomId,
      sender: input.sender,
      content: input.content,
      messageType: input.messageType ?? "NORMAL",
      virtualDelayLabel: input.virtualDelayLabel ?? null,
      createdAt: nowIso()
    };

    this.db
      .prepare(`
        INSERT INTO messages (id, room_id, sender, content, message_type, virtual_delay_label, created_at)
        VALUES (@id, @roomId, @sender, @content, @messageType, @virtualDelayLabel, @createdAt)
      `)
      .run(message);

    return message;
  }

  listByRoom(roomId: string): Message[] {
    return this.db
      .prepare("SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC")
      .all(roomId)
      .map((row) => toMessage(row as MessageRow));
  }

  recentByRoom(roomId: string, limit = 20): Message[] {
    return this.db
      .prepare("SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT ?")
      .all(roomId, limit)
      .map((row) => toMessage(row as MessageRow))
      .reverse();
  }

  lastGirlfriendMessage(roomId: string): Message | null {
    const row = this.db
      .prepare("SELECT * FROM messages WHERE room_id = ? AND sender = 'GIRLFRIEND' ORDER BY created_at DESC LIMIT 1")
      .get(roomId) as MessageRow | undefined;

    return row ? toMessage(row) : null;
  }
}
