import { Router } from "express";
import type { ServiceContainer } from "../services/container.js";

export function unlockRoutes(container: ServiceContainer): Router {
  const router = Router();

  const unlock = (roomId: string) => {
    container.repositories.roomRepository.clearCooldown(roomId);
    container.repositories.scoreRepository.resetViolation(roomId);
    return { result: "UNLOCKED", status: "ACTIVE" };
  };

  router.post("/api/rooms/:roomId/unlock/ad-complete", (req, res, next) => {
    try {
      container.services.roomService.getRequired(req.params.roomId);
      res.json(unlock(req.params.roomId));
    } catch (error) {
      next(error);
    }
  });

  router.post("/api/rooms/:roomId/unlock/payment-complete", (req, res, next) => {
    try {
      container.services.roomService.getRequired(req.params.roomId);
      res.json(unlock(req.params.roomId));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
