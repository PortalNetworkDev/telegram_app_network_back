import { MySQLPromisePool } from "@fastify/mysql";
import { DataBase } from "../plugins/mysql/mysql.types";
import { Config } from "../plugins/config/config.types";
import { TransactionsService } from "../models/transactions/transactions.types";
import { TransactionsUtils } from "../models/transactions/utils/utils.types";
import { MiningPowerService } from "../models/miningPower/miningPower.types";
import { BalanceHistoryService } from "../models/balanceHisotry/balanceHistory.types";
import { TaskService } from "../models/tasks/tasks.types";
import { Utils } from "../plugins/utils/utils.types";
import { UserService } from "../models/user/user.types";
import { Authentication, GetUserFromRequest } from "../plugins/auth";
import { SendTonToken } from "../plugins/sendToken/sendToken";

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
    transactionsUtils: TransactionsUtils;
  }
}
