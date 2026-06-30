import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { getDatabase } from "./db/sqlite.js";
import { createServiceContainer, type ServiceContainer } from "./services/container.js";
import { debugRoutes } from "./routes/debug.routes.js";
import { girlfriendsRoutes } from "./routes/girlfriends.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { messagesRoutes } from "./routes/messages.routes.js";
import { roomsRoutes } from "./routes/rooms.routes.js";
import { unlockRoutes } from "./routes/unlock.routes.js";
import { HttpError, isHttpError } from "./utils/http-error.js";

export function createApp(container: ServiceContainer = createServiceContainer(getDatabase())) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use(healthRoutes());
  app.use(girlfriendsRoutes(container));
  app.use(roomsRoutes(container));
  app.use(messagesRoutes(container));
  app.use(unlockRoutes(container));
  app.use(debugRoutes(container));

  app.use((_req, _res, next) => {
    next(new HttpError(404, "NOT_FOUND", "요청한 리소스를 찾을 수 없습니다."));
  });

  app.use(errorHandler);

  return { app, container };
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "INVALID_REQUEST",
      message: "요청 형식이 올바르지 않습니다.",
      issues: error.issues
    });
    return;
  }

  if (isHttpError(error)) {
    res.status(error.statusCode).json({
      error: error.errorCode,
      message: error.message,
      ...error.details
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "서버 오류가 발생했습니다."
  });
};
