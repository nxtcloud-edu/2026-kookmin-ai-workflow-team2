import { Router } from "express";
import { env } from "../config/env.js";
import type { ServiceContainer } from "../services/container.js";
import { HttpError } from "../utils/http-error.js";

export function debugRoutes(container: ServiceContainer): Router {
  const router = Router();

  router.get("/api/debug/rooms/:roomId/scores", (req, res, next) => {
    try {
      if (!env.DEBUG_EXPOSE_SCORES) {
        throw new HttpError(404, "NOT_FOUND", "디버그 엔드포인트가 비활성화되어 있습니다.");
      }

      container.services.roomService.getRequired(req.params.roomId);
      res.json({
        scores: container.repositories.scoreRepository.findByRoomId(req.params.roomId),
        hiddenFlags: container.repositories.scoreRepository.hiddenFlags(req.params.roomId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
