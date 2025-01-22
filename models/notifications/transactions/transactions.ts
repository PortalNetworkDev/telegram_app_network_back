import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import { TransactionsNotificationsModel } from "./transactions.types";
import { MySQLResultSetHeader } from "@fastify/mysql";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const createNotificationsAboutTransactionsTable = `
     CREATE TABLE IF NOT EXISTS notificationsAboutTransactions (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        userId bigint NOT NULL,
        recentTransactionsAmount int DEFAULT 0
       );`;

  await fastify.dataBase.insert(createNotificationsAboutTransactionsTable);

  async function addNotificationInfo(
    userId: number,
    transactionsAmount: number
  ) {
    const sql =
      "insert into notificationsAboutTransactions (userId,recentTransactionsAmount) values (?,?)";
    await fastify.dataBase.insert(sql, [userId, transactionsAmount]);
  }

  async function addNotificationInfoIfNotExists(userId: number) {
    await addNotificationInfo(userId, 1);
  }

  async function incrementNotificationAmount(userId: number) {
    const sql =
      "update notificationsAboutTransactions set recentTransactionsAmount = recentTransactionsAmount + 1 where userId =?";
    const result = await fastify.dataBase.update(sql, [userId]);

    return (result?.rows as unknown as MySQLResultSetHeader)?.affectedRows ?? 0;
  }

  async function resetNotificationAmount(userId: number) {
    const sql = `update notificationsAboutTransactions set recentTransactionsAmount = 0 where userId =?`;
    await fastify.dataBase.update(sql, [userId]);
  }

  async function getNotificationAmount(userId: number) {
    const sql = `select recentTransactionsAmount from  notificationsAboutTransactions where userId =?`;
    const result = await fastify.dataBase.select<
      Pick<TransactionsNotificationsModel, "recentTransactionsAmount">
    >(sql, [userId]);

    return result?.rows[0]?.recentTransactionsAmount ?? 0;
  }


  fastify.decorate("notifications", {
    transactions: {
      addNotificationInfo,
      addNotificationInfoIfNotExists,
      incrementNotificationAmount,
      resetNotificationAmount,
      getNotificationAmount,
    },
  });
});
