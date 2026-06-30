import { GirlfriendRepository } from "../db/repositories/girlfriend.repository.js";
import type { GirlfriendConfig } from "../types/domain.js";
import { HttpError } from "../utils/http-error.js";

export class GirlfriendService {
  constructor(private readonly girlfriendRepository: GirlfriendRepository) {}

  listVisible(): Array<Pick<GirlfriendConfig, "id" | "name" | "displayName" | "difficulty" | "personaType" | "description">> {
    return this.girlfriendRepository.list().map((girlfriend) => ({
      id: girlfriend.id,
      name: girlfriend.name,
      displayName: girlfriend.displayName,
      difficulty: girlfriend.difficulty,
      personaType: girlfriend.personaType,
      description: girlfriend.description
    }));
  }

  getRequired(id: string): GirlfriendConfig {
    const girlfriend = this.girlfriendRepository.findById(id);
    if (!girlfriend) {
      throw new HttpError(404, "GIRLFRIEND_NOT_FOUND", "선택한 캐릭터를 찾을 수 없습니다.");
    }

    return girlfriend;
  }
}
