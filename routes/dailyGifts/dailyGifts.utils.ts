import { FastifyInstance } from "fastify";
import { ONE_DAY } from "./dailyGifts.constants.js";

export const resetDailyGiftProgressIfUserSkipClaimMoreThenDay = async (
  fastify: FastifyInstance,
  userId: number
) => {
  const lastClaimedTime = await fastify.dailyGiftService.getLastClaimTime(
    userId
  );
  const isUserBreakClaimRow = Date.now() - lastClaimedTime > ONE_DAY;

  if (isUserBreakClaimRow) {
    await fastify.dailyGiftService.resetDailyGiftProgressForUser(userId);
  }
};
