import { FastifyInstance, FastifyReply } from "fastify";
import { TWO_DAYS } from "./dailyGifts.constants.js";
import { AbleToClaimInfo } from "../../models/dailyBonus/dailyBonus.types.js";

export const resetDailyGiftProgressIfUserSkipClaimMoreThenDay = async (
  fastify: FastifyInstance,
  userId: number
) => {
  const lastClaimedTime = await fastify.dailyGiftService.getLastClaimTime(
    userId
  );
  const isUserDoNotBreakClaimRow = Date.now() - lastClaimedTime <= TWO_DAYS;

  if (!isUserDoNotBreakClaimRow) {
    await fastify.dailyGiftService.resetDailyGiftProgressForUser(userId);
  }
};

export const getBadRequestMessage = (
  giftId: number,
  claimAvailabilityInfo: AbleToClaimInfo | null
) => {
  if (giftId <= 0) {
    return `User can not claim gift with this id ${giftId}`;
  }

  if (claimAvailabilityInfo === null && giftId > 1) {
    return `User can not claim gift with this id ${giftId}`;
  }

  if (
    claimAvailabilityInfo &&
    claimAvailabilityInfo.lastClaimedGiftId === giftId
  ) {
    return `User already claim this gift with id ${giftId}`;
  }
};
