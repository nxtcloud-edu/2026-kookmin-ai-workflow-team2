export const fastModeDayEndReply = "아 너무 졸리네 오늘은 먼저 잘게";

export interface FastModeCounters {
  fastDay: number;
  fastVisibleMessageCountToday: number;
  fastUserTurnCountToday: number;
}

export interface FastModeExchangeResult extends FastModeCounters {
  forcedDayEnd: boolean;
  girlfriendReply: string | null;
  dayEndSystemMessage: string | null;
}

export function completeFastModeExchange(
  counters: FastModeCounters,
  limits: { userTurnsPerDay: number; messagesPerDay: number } = { userTurnsPerDay: 10, messagesPerDay: 20 }
): FastModeExchangeResult {
  const userTurnsAfterMessage = counters.fastUserTurnCountToday + 1;
  const visibleAfterUser = counters.fastVisibleMessageCountToday + 1;

  if (userTurnsAfterMessage >= limits.userTurnsPerDay) {
    const completedDay = counters.fastDay;
    return {
      fastDay: completedDay + 1,
      fastVisibleMessageCountToday: 0,
      fastUserTurnCountToday: 0,
      forcedDayEnd: true,
      girlfriendReply: fastModeDayEndReply,
      dayEndSystemMessage: `${completedDay}일차가 종료되었습니다.`
    };
  }

  return {
    fastDay: counters.fastDay,
    fastVisibleMessageCountToday: Math.min(limits.messagesPerDay, visibleAfterUser + 1),
    fastUserTurnCountToday: userTurnsAfterMessage,
    forcedDayEnd: false,
    girlfriendReply: null,
    dayEndSystemMessage: null
  };
}
