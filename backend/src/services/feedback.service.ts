import type { Message } from "../types/domain.js";
import { LlmClientService } from "./llm-client.service.js";

const deterministicFeedback =
  "오늘의 피드백: 상대의 감정 상태와 답장 타이밍이 중요했습니다. 다음에는 힘든 이야기를 꺼냈을 때 먼저 공감하고, 필요한 경우 짧게라도 빠르게 반응하는 편이 좋습니다.";

export class FeedbackService {
  constructor(private readonly llmClient: LlmClientService) {}

  async dailyFeedback(roomId: string, messages: Message[]): Promise<string> {
    const llmFeedback = await this.llmClient.generateDailyFeedback({ roomId, messages });
    return llmFeedback ?? deterministicFeedback;
  }
}
