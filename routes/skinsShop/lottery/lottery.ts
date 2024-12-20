import { FastifyInstance } from "fastify";
import {
  AMOUNT_OF_GIFTS_IN_RESULT,
  DEFAULT_ROLL_PRICE,
} from "./lottery.constants.js";
import { doLotteryRollSchema } from "./lottery.schemes.js";
import {
  applyReceivedGift,
  createArrayOfGits,
  getRandomGift,
} from "./lottery.utils.js";

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: { position: number } }>(
    "/roll",
    { schema: { body: doLotteryRollSchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);
      const userSelectedLotteryPosition = request.body.position;

      if (userSelectedLotteryPosition < 0) {
        return reply.badRequest("Position should be positive number");
      }

      if (userSelectedLotteryPosition > AMOUNT_OF_GIFTS_IN_RESULT) {
        return reply.badRequest(
          `Position should be less or equal ${AMOUNT_OF_GIFTS_IN_RESULT - 1}`
        );
      }

      const userBalance = await fastify.miningPower.getUserPowerBalance(
        user.id
      );

      if (
        userBalance <
        Number(fastify.config.shopLotteryRollPrice ?? DEFAULT_ROLL_PRICE)
      ) {
        return reply.badRequest("Does not enough funds to make roll");
      }

      const allLotteryGifts = await fastify.shopLottery.getAllLotteryGifts();

      if (allLotteryGifts) {
        const giftWeights = allLotteryGifts.map((item) => item.chanceToRoll);
        const randomGift = getRandomGift(allLotteryGifts, giftWeights);
        const arrayOfRandomGifts = createArrayOfGits();

        if (randomGift) {
          const gift = {
            type: randomGift.type,
            value: randomGift.value,
            position: userSelectedLotteryPosition,
            imageUrl: randomGift.imageUrl,
            isReward: true,
          };

          arrayOfRandomGifts.splice(userSelectedLotteryPosition, 0, gift);

          await fastify.miningPower.reduceUserPowerBalance(
            user.id,
            Number(fastify.config.shopLotteryRollPrice ?? DEFAULT_ROLL_PRICE)
          );

          applyReceivedGift(fastify, randomGift, user.id);

          return { status: "ok", lots: arrayOfRandomGifts };
        }
      }

      return reply.badRequest("No available lottery gifts");
    }
  );
}
