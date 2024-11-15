import { MySQLPromisePool } from "@fastify/mysql";
import { DataBase } from "../plugins/mysql/mysql.types";
import { Config } from "../plugins/config/config.types";
import { TransactionsService } from "../models/transactions/transactions.types";

declare module "fastify" {
  interface FastifyInstance {
    mysql: MySQLPromisePool;
    dataBase: DataBase;
    config: Config;
    transactions: TransactionsService;
  }
}
