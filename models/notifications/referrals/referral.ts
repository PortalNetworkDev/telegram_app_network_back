import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import {
  ReferralNotifications,
  ReferralNotificationsModel,
} from "./referral.types";
import { MySQLResultSetHeader } from "@fastify/mysql";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const createNotificationsAboutReferralRewardsTable = `
    CREATE TABLE IF NOT EXISTS referralRewardsNotifications (
       id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
       userId bigint NOT NULL,
       notificationAmount int DEFAULT 0,
       isReferral BOOLEAN DEFAULT false,
       isInviter BOOLEAN DEFAULT false
      );`;

  await fastify.dataBase.insert(createNotificationsAboutReferralRewardsTable);

  async function addReferralNotification({
    userId,
    notificationAmount,
    isInviter,
    isReferral,
  }: ReferralNotifications) {
    const sql = `insert into referralRewardsNotifications (userId, notificationAmount,isReferral,isInviter) values (?,?,?,?)`;
    await fastify.dataBase.insert(sql, [
      userId,
      notificationAmount,
      isReferral,
      isInviter,
    ]);
  }

  async function addReferralNotificationIfNotExists(userId: number) {
    await addReferralNotification({
      userId,
      notificationAmount: 1,
      isReferral: true,
      isInviter: false,
    });
  }

  async function addInviterNotificationIfNotExists(userId: number) {
    await addReferralNotification({
      userId,
      notificationAmount: 1,
      isReferral: false,
      isInviter: true,
    });
  }

  async function incrementNotificationAmount(userId: number) {
    const sql = `update referralRewardsNotifications set notificationAmount = notificationAmount + 1 where userId = ?`;
    const result = await fastify.dataBase.update(sql, [userId]);

    return (result?.rows as unknown as MySQLResultSetHeader)?.affectedRows ?? 0;
  }

  async function getNotificationInfo(userId: number) {
    const sql = `select * from referralRewardsNotifications where userId = ?`;
    const result = await fastify.dataBase.select<ReferralNotificationsModel>(
      sql,
      [userId]
    );

    return result?.rows ?? null;
  }

  async function getNotificationAmount(userId: number) {
    const sql = `select notificationAmount from referralRewardsNotifications where userId = ?`;
    const result = await fastify.dataBase.select<
      Pick<ReferralNotificationsModel, "notificationAmount">
    >(sql, [userId]);

    return result?.rows[0]?.notificationAmount ?? 0;
  }

  async function resetNotificationAmount(userId: number) {
    const sql = `update referralRewardsNotifications set notificationAmount = 0 where userId =?`;
    await fastify.dataBase.update(sql, [userId]);
  }

  fastify.decorate("referralNotifications", {
    getNotificationInfo,
    incrementNotificationAmount,
    addInviterNotificationIfNotExists,
    addReferralNotificationIfNotExists,
    resetNotificationAmount,
    getNotificationAmount,
  });
});
