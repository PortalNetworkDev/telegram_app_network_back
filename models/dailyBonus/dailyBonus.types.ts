export interface DailyGiftModel {
  id: number;
  day: number;
  gift: number;
}

export interface UserClaimedGifts {
  id: number;
  userId: number;
  lastClaimedGiftId: number;
  isAlreadyClaim: boolean;
  claimCounter: number;
  lastClaimTime: number;
}

export type AbleToClaimInfo = Pick<
  UserClaimedGifts,
  "isAlreadyClaim" | "claimCounter" | "lastClaimedGiftId"
>;

export interface DailyBonusService {
  getDailyGiftById: (id: number) => Promise<DailyGiftModel | null>;
  getDailyGiftByDay: (day: number) => Promise<DailyGiftModel | null>;
  getIsUserAbleToClaimGift: (userId: number) => Promise<AbleToClaimInfo | null>;
  getUserLastClaimedGift: (userId: number) => Promise<DailyGiftModel | null>;
  getAllDailyGifts: () => Promise<DailyGiftModel[] | null>;
  claimGiftFirstTime: (userId: number, giftId: number) => Promise<void>;
  claimDailyGift: (userId: number, giftId: number) => Promise<void>;
  getLastClaimTime: (userId: number) => Promise<number>;
  resetDailyGiftProgressForUser: (userId: number) => Promise<void>
}
