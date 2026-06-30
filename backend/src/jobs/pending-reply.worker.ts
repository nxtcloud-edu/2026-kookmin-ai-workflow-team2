import { ChatService } from "../services/chat.service.js";

export function startPendingReplyWorker(chatService: ChatService): () => void {
  const timer = setInterval(() => {
    void chatService.processDuePendingReplies().catch((error) => {
      console.error("pending reply worker failed", error);
    });
  }, 3000);

  return () => clearInterval(timer);
}
