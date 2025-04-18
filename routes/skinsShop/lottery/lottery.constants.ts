import {Lot} from './lottery.utils.js'

export const DEFAULT_ROLL_PRICE = 1000;
export const AMOUNT_OF_GIFTS_IN_RESULT  = 15;

export const LOSES: Lot[] = [
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
  { type: "lose", value: null, position: 0, imageUrl: "lose.png", isReward: false },
];

export const POE: Lot[] = [
  { type: "poe", value: 5, position: 0, imageUrl: "poe.png", isReward: false },
];

export const NFT: Lot[] = [
  { type: "nft", value: null, position: 0, imageUrl: "nft.png", isReward: false },
];

export const POWER: Lot[] = [
  { type: "power", value: 1000, position: 0, imageUrl: "power.png", isReward: false },
  { type: "power", value: 1500, position: 0, imageUrl: "power.png", isReward: false },
  { type: "power", value: 2000, position: 0, imageUrl: "power.png", isReward: false },
];
