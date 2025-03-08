import { MySQLPromisePool } from "@fastify/mysql";
import { TransactionsService } from "../models/transactions/transactions.types";
import { Config } from "../plugins/config/config.types";
import { DataBase } from "../plugins/mysql/mysql.types";

import { BalanceHistoryService } from "../models/balanceHisotry/balanceHistory.types";
import { DailyBonusService } from "../models/dailyBonus/dailyBonus.types";
import { GeneratorRecoveryBoostService } from "../models/dailyBoosts/dailyBoosts.types";
import { MiningPowerService } from "../models/miningPower/miningPower.types";
import { NftHolderService } from "../models/nftHolders/nftHolders.types";
import { ReferralNotificationsService } from "../models/notifications/referrals/referral.types";
import { TransactionsNotificationsService } from "../models/notifications/transactions/transactions.types";
import { ShopLotteryService } from "../models/shopLottery/shopLottery.types";
import { SkinShopService } from "../models/skinsShop/skins.types";
import { TaskService } from "../models/tasks/tasks.types";
import { TopMinerListService } from "../models/topMinersList/topMinersList.types";
import { UserService } from "../models/user/user.types";
import { Authentication, GetUserFromRequest } from "../plugins/auth";
import { SendTonToken } from "../plugins/sendToken/sendToken";
import { Utils } from "../plugins/utils/utils.types";
import { CalculationUtils } from "../utils/calculationUtils/calculationUtils.types";
declare module "fastify" {
  interface FastifyInstance {
    mysql: MySQLPromisePool;
    dataBase: DataBase;
    config: Config;
    transactions: TransactionsService;
    miningPower: MiningPowerService;
    modelsBalanceHistory: BalanceHistoryService;
    modelsTasks: TaskService;
    utils: Utils;
    modelsUser: UserService;
    auth: Authentication;
    getUser: GetUserFromRequest;
    sendTonToken: SendTonToken;
    calculationUtils: CalculationUtils;
    skinsShop: SkinShopService;
    shopLottery: ShopLotteryService;
    generatorRecoveryBoost: GeneratorRecoveryBoostService;
    dailyGiftService: DailyBonusService;
    topMinersListService: TopMinerListService;
    transactionsNotifications: TransactionsNotificationsService;
    referralNotifications: ReferralNotificationsService;
    nftHolders: NftHolderService;
  }
}
