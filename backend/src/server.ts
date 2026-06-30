import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { startPendingReplyWorker } from "./jobs/pending-reply.worker.js";
import { startEventExpireWorker } from "./jobs/event-expire.worker.js";

const { app, container } = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`game-backend listening on ${env.PORT}`);
});

const stopPendingReplyWorker = startPendingReplyWorker(container.services.chatService);
const stopEventExpireWorker = startEventExpireWorker();

function shutdown() {
  stopPendingReplyWorker();
  stopEventExpireWorker();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
