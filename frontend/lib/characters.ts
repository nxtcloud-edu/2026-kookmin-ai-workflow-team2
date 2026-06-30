export type Character = {
  id: string
  name: string
  tagline: string
  personality: string
  avatar: string
  /** full-body standee shown in the lobby right column */
  standee: string
  /** tailwind gradient classes for the card accent */
  accent: string
  /** neon glow color (CSS color) used for the standee aura */
  glow: string
  /** short aura label shown on the standee tag */
  aura: string
  /** opening message shown when chat starts */
  greeting: string
}

export const characters: Character[] = [
  {
    id: "harin",
    name: "하린",
    tagline: "Healing",
    personality: "부드럽고 다정한 힐링형 · 차분하게 마음을 열어요",
    avatar: "/characters/1/avatar.png",
    standee: "/characters/1/standee.png",
    accent: "from-sky-100 to-rose-100",
    glow: "oklch(0.78 0.08 230)",
    aura: "Soft Blue Aura",
    greeting: "괜찮아? 많이 놀랐겠다. 천천히 말해도 돼. 나 듣고 있어.",
  },
  {
    id: "seoyun",
    name: "서윤",
    tagline: "Tsundere",
    personality: "말은 차갑지만 선을 지키면 깊게 다가오는 현실주의자",
    avatar: "/characters/2/avatar.png",
    standee: "/characters/2/standee.png",
    accent: "from-red-200 to-neutral-100",
    glow: "oklch(0.58 0.22 25)",
    aura: "Crimson Aura",
    greeting: "살아있네. 다행이긴 한데... 그런 표정으로 있지는 마.",
  },
  {
    id: "minseo",
    name: "민서",
    tagline: "Bubbly",
    personality: "애교 많고 활발한 리액션형 · 장난과 진심을 같이 봐요",
    avatar: "/characters/3/avatar.png",
    standee: "/characters/3/standee.png",
    accent: "from-pink-200 to-rose-100",
    glow: "oklch(0.76 0.16 350)",
    aura: "Pink Aura",
    greeting: "야 너 진짜 걱정했잖아. 이제 괜찮은 거 맞지?",
  },
  {
    id: "jia",
    name: "지아",
    tagline: "Mystery",
    personality: "쿨한 미스터리형 · 말수는 적지만 이전 대화를 기억해요",
    avatar: "/characters/4/avatar.png",
    standee: "/characters/4/standee.png",
    accent: "from-neutral-300 to-purple-100",
    glow: "oklch(0.42 0.12 300)",
    aura: "Deep Purple Aura",
    greeting: "깨어났구나. 그 말투... 기억해둘게.",
  },
]

const replyPools: Record<string, string[]> = {
  harin: [
    "응, 천천히 말해도 괜찮아. 급하게 대답 안 해도 돼.",
    "많이 놀랐겠다. 지금은 네가 편한 쪽으로 이야기해.",
    "그렇게 말해줘서 고마워. 나도 조금 안심했어.",
    "무리하지 말고, 지금 느끼는 것부터 말해줘.",
    "괜찮아. 나 여기 있어.",
  ],
  seoyun: [
    "그런 질문은 좀 빠르지 않아?",
    "대답은 할 건데, 너무 편하게 넘기진 마.",
    "뭐... 네가 그렇게 말하면 나쁘진 않네.",
    "괜히 이상하게 굴지 말고 제대로 말해.",
    "신경 안 쓴 건 아닌데, 착각은 하지 말고.",
  ],
  minseo: [
    "야 말투 왜 이렇게 로봇 같아? 다시 해봐.",
    "ㅋㅋㅋ 그건 좀 웃겼다. 근데 진심도 섞인 거 맞지?",
    "좋아좋아, 그런 반응이면 나도 더 말하고 싶어져.",
    "헐 진짜? 그 얘기 좀 더 해봐.",
    "아 뭐야, 은근 귀엽게 말하네.",
  ],
  jia: [
    "그 말, 기억해둘게.",
    "흥미롭네. 계속해봐.",
    "너는 가끔 예상이 안 돼.",
    "지금 대답은 나쁘지 않았어.",
    "조금 더 지켜볼게.",
  ],
}

export function getReply(characterId: string, turn: number): string {
  const pool = replyPools[characterId] ?? ["..."]
  return pool[turn % pool.length]
}

/** message count -> human friendly timeline phase label */
export function getTimelinePhase(messageCount: number): string {
  const pairs = Math.floor(messageCount / 2)
  if (pairs < 3) return "1일차"
  if (pairs < 6) return "3일차"
  if (pairs < 10) return "1주차"
  if (pairs < 16) return "2주차"
  if (pairs < 24) return "1개월차"
  return "연인 사이 ❤️"
}
