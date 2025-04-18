import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import { Transaction, TransactionModel } from "./transactions.types";
import {
  getTimePeriodSQLCondition,
  transformSqlRowToTransactionData,
  transformTransactionHistoryItemData,
} from "./transactions.utils.js";

export default createPlugin<FastifyPluginAsync>(async function (fastify, ops) {
  const createTable = `  
    CREATE TABLE IF NOT EXISTS transactions (
            id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            sender_id BIGINT NOT NULL,
            recipient_id BIGINT NOT NULL,
            power_amount FLOAT NOT NULL,
            comment TEXT,
            creation_time BIGINT NOT NULL,
            type varchar(128)
        );`;

  await fastify.dataBase.query(createTable);

  const addTransaction = async (data: Transaction) => {
    const sql =
      "INSERT INTO transactions (sender_id,recipient_id,power_amount,comment,creation_time,type) VALUES (?,?,?,?,?,?)";

    fastify.dataBase.insert(sql, [
      data.senderId,
      data.recipientId,
      data.powerAmount,
      data.comment ?? null,
      data.creationTime,
      data.type,
    ]);
  };

  const getTransactionById = async (
    id: number
  ): Promise<Transaction | null> => {
    const sql = "SELECT * from transactions WHERE id =?";
    const result = await fastify.dataBase.select<TransactionModel>(sql, [id]);

    if (result?.rows[0]) {
      return transformSqlRowToTransactionData(result?.rows[0]);
    }
    return null;
  };

  const getTransactionsByUserId = async (
    id: number,
    limit = 20,
    offset = 0
  ): Promise<Transaction[]> => {
    const sql = `SELECT * from transactions WHERE sender_id =? OR recipient_id=? order by creation_time DESC limit ${limit} offset ${offset} `;
    const result = await fastify.dataBase.select<TransactionModel>(sql, [
      id,
      id,
    ]);

    if (result?.rows) {
      return result.rows.map((item) => transformSqlRowToTransactionData(item));
    }

    return [];
  };

  const getTransactionsByUserIdAndTime = async (
    id: number,
    timePeriod: { from?: number; to?: number },
    limit = 20,
    offset = 0
  ): Promise<Transaction[]> => {
    const period = getTimePeriodSQLCondition(timePeriod);

    const sql = `SELECT * from transactions WHERE sender_id =? OR recipient_id=? AND ${period} limit ${limit} offset ${offset}`;
    const result = await fastify.dataBase.select<TransactionModel>(sql, [
      id,
      id,
    ]);

    if (result?.rows) {
      const [sender, recipient] = await Promise.all([
        // @ts-ignore: Unreachable code error
        fastify.modelsUser.getUser(result?.rows[0].sender_id),
        // @ts-ignore: Unreachable code error
        fastify.modelsUser.getUser(result?.rows[0].recipient_id),
      ]);

      return result.rows.map((item) =>
        transformTransactionHistoryItemData(
          item,
          sender?.username ?? "",
          recipient?.username ?? ""
        )
      );
    }

    return [];
  };

  const getLastUserTransactions = async (userId: number, amount: number) => {
    const sql = `select * from transactions where recipient_id = ? order by id DESC limit ${amount}`;

    const result = await fastify.dataBase.select<TransactionModel>(sql, [
      userId,
    ]);

    if (result?.rows) {
      return result.rows.map((item) => transformSqlRowToTransactionData(item));
    }

    return [];
  };

  const getTransactionsTableLength = async (userId: number) => {
    const sql = `select count(*) as count from transactions where sender_id =? OR recipient_id=? `;
    const result = await fastify.dataBase.query<{ count: number }>(sql, [
      userId,
      userId,
    ]);

    return result?.rows[0].count ?? 0;
  };

  fastify.decorate("transactions", {
    addTransaction,
    getTransactionById,
    getTransactionsByUserId,
    getTransactionsByUserIdAndTime,
    getLastUserTransactions,
    getTransactionsTableLength,
  });
});
