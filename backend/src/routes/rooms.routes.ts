import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import type { ServiceContainer } from "../services/container.js";

const createRoomSchema = z.object({
  userId: z.string().min(1),
  girlfriendId: z.string().min(1),
  mode: z.enum(["FAST", "REALTIME"])
});

export function roomsRoutes(container: ServiceContainer): Router {
  const router = Router();

  router.post("/api/rooms", (req, res, next) => {
    try {
      const input = createRoomSchema.parse(req.body);
      res.status(201).json(container.services.roomService.createRoom(input));
    } catch (error) {
      next(error);
    }
  });

  router.get("/api/rooms/:roomId/state", (req, res, next) => {
    try {
      res.json(container.services.roomService.state(req.params.roomId, env.DEBUG_EXPOSE_SCORES));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
