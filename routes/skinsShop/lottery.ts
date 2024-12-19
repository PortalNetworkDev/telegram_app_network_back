import { FastifyInstance } from "fastify";
import { doLotteryRollSchema } from "./lottery.schemes.js";
import {
  LotteryGiftModel,
  LotteryGiftType,
} from "../../models/shopLottery/shopLottery.types.js";

interface Lot {
  type: LotteryGiftType;
  value: number | null;
  position: number;
  imageUrl: string;
  isReward: boolean;
}

const DEFAULT_ROLL_PRICE = 1000;

const loses: Lot[] = [
  { type: "lose", value: null, position: 0, imageUrl: "url", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "url", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "url", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "url", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "url", isReward: false },
];

const poe: Lot[] = [
  { type: "poe", value: 5, position: 0, imageUrl: "url", isReward: false },
  { type: "poe", value: 10, position: 0, imageUrl: "url", isReward: false },
  { type: "poe", value: 10, position: 0, imageUrl: "url", isReward: false },
];

const nft: Lot[] = [
  { type: "nft", value: null, position: 0, imageUrl: "url", isReward: false },
  { type: "nft", value: null, position: 0, imageUrl: "url", isReward: false },
  { type: "nft", value: null, position: 0, imageUrl: "url", isReward: false },
];

const power: Lot[] = [
  { type: "power", value: 1000, position: 0, imageUrl: "url", isReward: false },
  { type: "power", value: 1500, position: 0, imageUrl: "url", isReward: false },
  { type: "power", value: 2000, position: 0, imageUrl: "url", isReward: false },
  { type: "power", value: 2500, position: 0, imageUrl: "url", isReward: false },
];

const shuffleLots = (poll: Lot[]) => {
  const data = [...poll];

  for (let index = data.length - 1; index > 0; index--) {
    let nextIndex = Math.floor(Math.random() * (index + 1));

    [data[index], data[nextIndex]] = [data[nextIndex], data[index]];
  }
  return data;
};

function createArrayOfGits() {
  const allLots = loses.concat(poe).concat(power).concat(nft);

  return shuffleLots(allLots);
}

function getRandomGift(items: LotteryGiftModel[], weights: number[]) {
  if (items.length !== weights.length) {
    throw new Error("Items and weights must be of the same size");
  }

  if (!items.length) {
    throw new Error("Items must not be empty");
  }

  const cumulativeWeights: number[] = [];

  weights.forEach((weight, index) => {
    cumulativeWeights[index] = weight + (cumulativeWeights[index - 1] || 0);
  });

  const maxCumulativeWeight = cumulativeWeights.at(-1) ?? 0;

  const randomNumber = maxCumulativeWeight * Math.random();

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    if (cumulativeWeights[itemIndex] >= randomNumber) {
      return items[itemIndex];
    }
  }
}

function applyReceivedGift(
  fastify: FastifyInstance,
  gift: LotteryGiftModel,
  userId: number
) {
  switch (gift.type) {
    case "lose":
      break;
    case "nft":
      break;
    case "poe":
      fastify.miningPower.addPoeBalance(userId, gift?.value ?? 0);
      break;
    case "power":
      fastify.miningPower.addPowerBalance(userId, gift?.value ?? 0);
    default:
      break;
  }
}

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

      if (userSelectedLotteryPosition > 15) {
        return reply.badRequest(`Position should be less or equal ${15}`);
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
