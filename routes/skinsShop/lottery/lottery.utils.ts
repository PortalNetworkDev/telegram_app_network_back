import { FastifyInstance } from "fastify";
import {
  LotteryGiftModel,
  LotteryGiftType,
} from "../../../models/shopLottery/shopLottery.types";
import { LOSES, NFT, POE, POWER } from "./lottery.constants.js";
import { transferNFT } from "../../../utils/ton/ton.utils.js";
import { Address } from "@ton/core";

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

  return shuffleLots(allLots).map((item, index) => ({
    ...item,
    position: index,
  }));
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

const sendNftForUser = async (fastify: FastifyInstance, userId: number) => {
  const result = await fastify.nftForLotteryService.getAllNftsWithoutWinner();
  const randomIndex = getRandomValueInRange(0, result?.length ?? 0);
  const nftPrize = result?.[randomIndex];

  if (nftPrize) {
    const userAddress = await fastify.modelsUser.getUser(userId);
    await fastify.nftForLotteryService.setWinnerForNft(userId, nftPrize?.id);

    if (userAddress?.wallet) {
      try {
        await transferNFT({
          userAddress: Address.parse(userAddress?.wallet),
          nftContractAddress: Address.parse(nftPrize.nftAddress),
          isTestNet: Boolean(fastify.config.isUseTonTestNet),
          fastify,
        });

        await fastify.nftForLotteryService.setIsNftSendToWinnerUser(
          nftPrize?.id
        );
      } catch (error) {
        console.log(
          'error when try to send nft for user in function "transferNFT"'
        );
      }
    }

    console.log("send nft for user : ", userId);
  }
};

export function applyReceivedGift(
  fastify: FastifyInstance,
  gift: LotteryGiftModel,
  userId: number
) {
  switch (gift.type) {
    case "lose":
      break;
    case "nft":
      sendNftForUser(fastify, userId);
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
