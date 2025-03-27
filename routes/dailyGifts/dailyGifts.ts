import { FastifyInstance } from "fastify";
import {
  MAX_DAY_NUMBER_TO_CLAIM_GIFT,
  RESPONSE_CODES,
} from "./dailyGifts.constants.js";
import { resetDailyGiftProgressIfUserSkipClaimMoreThenDay } from "./dailyGifts.utils.js";

export default async function (fastify: FastifyInstance) {
  const MAX_DAY_NUMBER_FOR_CLAIM_GIFT = Number(
    (await fastify.config.maxDayNumberForClaimGift) ??
      MAX_DAY_NUMBER_TO_CLAIM_GIFT
  );

  fastify.get(
    "/checkIsDailyGiftAvailable",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      const claimAvailabilityInfo =
        await fastify.dailyGiftService.getIsUserAbleToClaimGift(user.id);

      if (claimAvailabilityInfo === null) {
        return { status: "ok", isAbleToClaim: true };
      }

      if (
        claimAvailabilityInfo &&
        !claimAvailabilityInfo.isAlreadyClaim &&
        claimAvailabilityInfo.claimCounter <= MAX_DAY_NUMBER_FOR_CLAIM_GIFT
      ) {
        return { status: "ok", isAbleToClaim: true };
      }

      if (claimAvailabilityInfo.isAlreadyClaim) {
        return {
          status: "ok",
          isAbleToClaim: false,
          message: RESPONSE_CODES[2001].message,
          code: RESPONSE_CODES[2001].code,
        };
      }

      if (
        claimAvailabilityInfo &&
        claimAvailabilityInfo.claimCounter === MAX_DAY_NUMBER_FOR_CLAIM_GIFT
      ) {
        return {
          status: "ok",
          isAbleToClaim: false,
          message: RESPONSE_CODES[2002].message,
          code: RESPONSE_CODES[2002].code,
        };
      }
    }
  );

  fastify.post(
    "/claimDailyGift",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      await resetDailyGiftProgressIfUserSkipClaimMoreThenDay(fastify, user.id);

      const claimAvailabilityInfo =
        await fastify.dailyGiftService.getIsUserAbleToClaimGift(user.id);

      if (claimAvailabilityInfo && claimAvailabilityInfo.isAlreadyClaim) {
        return {
          status: "ok",
          message: RESPONSE_CODES[2001].message,
          code: RESPONSE_CODES[2001].code,
        };
      }

      if (
        claimAvailabilityInfo &&
        claimAvailabilityInfo.claimCounter === MAX_DAY_NUMBER_FOR_CLAIM_GIFT
      ) {
        return {
          status: "ok",
          message: RESPONSE_CODES[2002].message,
          code: RESPONSE_CODES[2002].code,
        };
      }

      if (claimAvailabilityInfo === null) {
        const giftModel = await fastify.dailyGiftService.getDailyGiftByDay(1);

        if (giftModel) {
          await fastify.dailyGiftService.claimGiftFirstTime(
            user.id,
            giftModel.id
          );
          await fastify.miningPower.addPowerBalance(user.id, giftModel.gift);

          return { status: "ok" };
        }

        return reply.badRequest(`Gift for day 1 is not available now`);
      }

      if (
        claimAvailabilityInfo &&
        !claimAvailabilityInfo.isAlreadyClaim &&
        claimAvailabilityInfo.claimCounter < MAX_DAY_NUMBER_FOR_CLAIM_GIFT
      ) {
        const lastClaimedGift = await fastify.dailyGiftService.getDailyGiftById(
          claimAvailabilityInfo.lastClaimedGiftId
        );

        const currentGiftDay = (lastClaimedGift?.day ?? 1) + 1;

        const currentGift = await fastify.dailyGiftService.getDailyGiftByDay(
          currentGiftDay
        );

        if (currentGift) {
          await fastify.dailyGiftService.claimDailyGift(
            user.id,
            currentGift.id
          );
          await fastify.miningPower.addPowerBalance(user.id, currentGift.gift);

          return { status: "ok" };
        }

        return reply.badRequest(`Gift is not available now`);
      }
    }
  );

  fastify.get(
    "/getDailyGifts",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      await resetDailyGiftProgressIfUserSkipClaimMoreThenDay(fastify, user.id);

      const allDailyGifts = await fastify.dailyGiftService.getAllDailyGifts();
      const userLastClaimedGift =
        await fastify.dailyGiftService.getUserLastClaimedGift(user.id);

      if (allDailyGifts && userLastClaimedGift === null) {
        const result = allDailyGifts
          ?.sort((prev, next) => prev.day - next.day)
          .filter((item) => item.id !== 0)
          .map((item) => ({
            ...item,
            isAbleToClaim: item.day === 1,
            isClaimed: false,
          }));

        return { status: "ok", gifts: result };
      }

      if (allDailyGifts && userLastClaimedGift) {
        const sortedDailyGifts = allDailyGifts
          ?.sort((prev, next) => prev.day - next.day)
          .filter((item) => item.id !== 0);

        const claimedGiftsByDay = sortedDailyGifts.slice(
          0,
          userLastClaimedGift.day
        );

        const result = sortedDailyGifts.map((gift) => ({
          ...gift,
          isAbleToClaim:
            userLastClaimedGift.day + 1 === MAX_DAY_NUMBER_FOR_CLAIM_GIFT ||
            userLastClaimedGift.day + 1 === gift.day,
          isClaimed: claimedGiftsByDay.some((item) => item.id === gift.id),
        }));

        return { status: "ok", gifts: result };
      }
    }
  );
}
