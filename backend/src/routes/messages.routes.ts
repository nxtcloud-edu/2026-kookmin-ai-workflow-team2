import { Router } from "express";
import { z } from "zod";
import type { ServiceContainer } from "../services/container.js";

const replyDelayChoiceSchema = z.enum([
  "NOW",
  "AFTER_5_MIN",
  "AFTER_30_MIN",
  "AFTER_1_HOUR",
  "AFTER_3_HOURS",
  "AFTER_HALF_DAY",
  "AFTER_NEXT_DAY"
]);

const createMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  replyDelayChoice: replyDelayChoiceSchema.optional()
});

export function messagesRoutes(container: ServiceContainer): Router {
  const router = Router();

  router.get("/api/rooms/:roomId/messages", (req, res, next) => {
    try {
      res.json({ messages: container.services.chatService.listMessages(req.params.roomId) });
    } catch (error) {
      next(error);
    }
  });

  router.post("/api/rooms/:roomId/messages", async (req, res, next) => {
    try {
      const input = createMessageSchema.parse(req.body);
      const result = await container.services.chatService.handleUserMessage({
        roomId: req.params.roomId,
        content: input.content,
        replyDelayChoice: input.replyDelayChoice
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
