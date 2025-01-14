import { FastifyInstance } from "fastify";
import {
  LotteryGiftModel,
  LotteryGiftType,
} from "../../../models/shopLottery/shopLottery.types";
import { LOSES, NFT, POE, POWER } from "./lottery.constants.js";

export interface Lot {
  type: LotteryGiftType;
  value: number | null;
  position: number;
  imageUrl: string;
  isReward: boolean;
}

export function shuffleLots(poll: Lot[]) {
  const data = [...poll];

  for (let index = data.length - 1; index > 0; index--) {
    let nextIndex = Math.floor(Math.random() * (index + 1));

    [data[index], data[nextIndex]] = [data[nextIndex], data[index]];
  }
  return data;
}

export function getRandomValueInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function createArrayOfGits() {
  const allLots = LOSES.concat(
    POE.map((item) => ({ ...item, value: getRandomValueInRange(1, 6) }))
  )
    .concat(
      POWER.map((item) => ({
        ...item,
        value: getRandomValueInRange(1000, 3001),
      }))
    )
    .concat(NFT);

  return shuffleLots(allLots).map((item,index)=>({...item,position:index}));
}

export function getRandomGift(items: LotteryGiftModel[], weights: number[]) {
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

export function applyReceivedGift(
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
