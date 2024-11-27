import { UserModel } from "../user/user.types";

export interface BalanceHistoryModel {
  id: number;
  user_id: number;
  token_balance: number;
  pool_balance: number;
  create_time: string;
}

export interface BalanceHistoryService {
  addHistory: (
    userId: number,
    tokenBalance: number,
    poolBalance: number
  ) => Promise<void>;

  getHoleInHistoryTokenBalance: (
    userId: number,
    period?: number
  ) => Promise<BalanceHistoryModel[] | null>;

  checkTokenBalanceByPeriod: (
    userId: number,
    period?: number
  ) => Promise<boolean>;

  getHoleInHistoryPoolBalance: (
    userId: number
  ) => Promise<BalanceHistoryModel[] | null>;

  checkPoolBalanceByPeriod: (
    userId: number,
    period?: number
  ) => Promise<boolean>;

  getUsersWhoNotSetBalanceHistoryToday: () => Promise<UserModelWithBalanceHistoryInfo[] | null>;

  checkDaysInHistoryTokenBalance: (
    userId: number,
    period?: number
  ) => Promise<boolean>;
}

export interface UserModelWithBalanceHistoryInfo
  extends UserModel,
    Pick<BalanceHistoryModel,'create_time'> {}
