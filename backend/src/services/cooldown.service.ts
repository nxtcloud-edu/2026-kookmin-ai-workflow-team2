import { HttpError } from "../utils/http-error.js";
import { isCooldownActive, remainingSeconds } from "../utils/time.js";

export class CooldownService {
  assertAvailable(cooldownUntil: string | null): void {
    if (!cooldownUntil || !isCooldownActive(cooldownUntil)) {
      return;
    }

    throw new HttpError(423, "CHAT_LOCKED", "현재 채팅이 제한되어 있습니다.", {
      remainingSeconds: remainingSeconds(cooldownUntil),
      unlockOptions: ["AD", "PAYMENT"]
    });
  }
}
