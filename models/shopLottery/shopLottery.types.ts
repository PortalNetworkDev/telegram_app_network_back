export type LotteryGiftType = "lose" | "nft" | "power" | "poe";

export interface LotteryGiftModel {
  id: number;
  type: LotteryGiftType;
  value: number | null;
  imageUrl: string;
  chanceToRoll: number;
}

export interface ShopLotteryService {
  getLotteryGiftById: (giftId: number) => Promise<LotteryGiftModel | null>;
  getAllLotteryGifts: () => Promise<LotteryGiftModel[] | undefined>;
}
