import { Router } from "express";
import type { ServiceContainer } from "../services/container.js";

export function girlfriendsRoutes(container: ServiceContainer): Router {
  const router = Router();

  router.get("/api/girlfriends", (_req, res) => {
    res.json({ girlfriends: container.services.girlfriendService.listVisible() });
  });

  return router;
}
