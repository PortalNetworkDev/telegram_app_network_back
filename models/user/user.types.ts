import { DataBaseQueryResult } from "../../plugins/mysql/mysql.types";

export interface UserService {
  createUser: (user: User, tgToken: string) => Promise<void>;
  userExist: (userId: number) => Promise<boolean>;
  updateLastUpdated: (userId: number) => Promise<void>;
  updateWallet: (userId: number, wallet: string) => Promise<void>;
  sameWalletExist: (userId: number, wallet: string) => Promise<boolean>;
  getUser: (userId: number) => Promise<UserModel | null>;
  addReferralUser: (userId: number, referralUserId: number) => Promise<void>;
  checkReferaluser: (
    userId: number,
    referralUserId: number
  ) => Promise<boolean>;
  getUsers: () => Promise<UserModel[] | null>;
  updateReward: (userId: number, referalReward: number) => Promise<void>;
  getActiveUsers: () => Promise<UserModel[] | null>;
  getReferalUsersUnrewarded: (
    userId: number
  ) => Promise<DataBaseQueryResult<ReferralUser> | null>;
  getReferalUsersUnrewardedSpecial: (
    userId: number
  ) => Promise<DataBaseQueryResult<ReferralUser> | null>;
  setRewarded: (userId: number, referalUserId: number) => Promise<void>;
  countReferalUsers: (userId: number) => Promise<number>;
  checkAirDropUser: (userId: number, referalUserId: number) => Promise<boolean>;
  getUserByNickname: (nickname: string) => Promise<UserModel | null>;
}

export interface User {
  id: number;
  wallet: string;
  first_name: string;
  last_name: string;
  username: string;
  language_code: "en" | "ru";
  is_premium: boolean;
  allows_write_to_pm: boolean;
}

export interface UserModel extends User {
  referal_reward: number;
  last_updated: number;
  tg_token: string;
}

export interface ReferralUser {
  user_id: number;
  referal_user_id: number;
  reward: number;
  is_rewarded: boolean;
  last_updated: number;
}
