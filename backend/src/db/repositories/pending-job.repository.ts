import type { Database } from "better-sqlite3";
import type { PendingReplyJob } from "../../types/domain.js";
import { newId } from "../../utils/ids.js";
import { nowIso } from "../../utils/time.js";

interface PendingReplyJobRow {
  id: string;
  room_id: string;
  due_at: string;
  status: "PENDING" | "DONE" | "CANCELLED";
  created_at: string;
  updated_at: string;
}

function toJob(row: PendingReplyJobRow): PendingReplyJob {
  return {
    id: row.id,
    roomId: row.room_id,
    dueAt: row.due_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class PendingJobRepository {
  constructor(private readonly db: Database) {}

  findPendingByRoomId(roomId: string): PendingReplyJob | null {
    const row = this.db
      .prepare("SELECT * FROM pending_reply_jobs WHERE room_id = ? AND status = 'PENDING' ORDER BY due_at ASC LIMIT 1")
      .get(roomId) as PendingReplyJobRow | undefined;
    return row ? toJob(row) : null;
  }

  create(roomId: string, dueAt: string): PendingReplyJob {
    const now = nowIso();
    const job: PendingReplyJob = {
      id: newId("job"),
      roomId,
      dueAt,
      status: "PENDING",
      createdAt: now,
      updatedAt: now
    };

    this.db
      .prepare(`
        INSERT INTO pending_reply_jobs (id, room_id, due_at, status, created_at, updated_at)
        VALUES (@id, @roomId, @dueAt, @status, @createdAt, @updatedAt)
      `)
      .run(job);

    return job;
  }

  dueJobs(now: string): PendingReplyJob[] {
    return this.db
      .prepare("SELECT * FROM pending_reply_jobs WHERE status = 'PENDING' AND due_at <= ? ORDER BY due_at ASC")
      .all(now)
      .map((row) => toJob(row as PendingReplyJobRow));
  }

  markDone(id: string): void {
    this.db
      .prepare("UPDATE pending_reply_jobs SET status = 'DONE', updated_at = ? WHERE id = ?")
      .run(nowIso(), id);
  }

  cancelByRoomId(roomId: string): void {
    this.db
      .prepare("UPDATE pending_reply_jobs SET status = 'CANCELLED', updated_at = ? WHERE room_id = ? AND status = 'PENDING'")
      .run(nowIso(), roomId);
  }
}
