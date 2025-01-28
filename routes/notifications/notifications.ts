import { FastifyInstance } from "fastify";
import { UserModel } from "../../models/user/user.types";

export default async function (fastify: FastifyInstance) {
  const getTransactionResponse = async (userId: number) => {
    const amount =
      await fastify.transactionsNotifications.getNotificationAmount(userId);

    if (amount === 0) {
      return {
        status: "ok",
        message: "there is not any notification for user",
      };
    }

    const transactions = await fastify.transactions.getLastUserTransactions(
      userId,
      amount
    );

    const senderIds = new Set<number>();
    transactions.forEach((item) => {
      senderIds.add(item.senderId);
    });

    const sendersInfo = await fastify.modelsUser.getUsersInfoByIds(
      Array.from(senderIds)
    );
    const sendersInfoMap: Record<number, Omit<UserModel, "id">> = {};

    sendersInfo.forEach((item) => {
      const { id, ...rest } = item;
      sendersInfoMap[item.id] = rest;
    });

    const resultData = transactions.map((item) => ({
      comment: item.comment,
      sender: sendersInfoMap[item.senderId],
      powerAmount: item.powerAmount,
      time: item.creationTime,
    }));

    return resultData;
  };

  const getReferralResponse = async (userId: number) => {
    const notificationInfo =
      await fastify.referralNotifications.getNotificationInfo(userId);

    const referralInfo = await fastify.modelsUser.getLastReferralForUser(
      userId
    );

    const inviterInfo = await fastify.modelsUser.getLastInviterForRefUser(
      userId
    );

    return notificationInfo?.map((item) => {
      if (item.isReferral) {
        return {
          type: "referral",
          powerAmount: Number(fastify.config.forReferalPowerReward),
          inviterUserName: inviterInfo?.username,
        };
      }

      if (item.isInviter) {
        return {
          type: "invite",
          powerAmount: Number(fastify.config.toReferalPowerReward),
          refUserName: referralInfo?.username,
        };
      }
    });
  };

  fastify.get(
    "/getNotificationsInfo",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const userId = fastify.getUser(request).id;
      const transactionsResponse = await getTransactionResponse(userId);
      const referralResponse = await getReferralResponse(userId);

      // await fastify.transactionsNotifications.resetNotificationAmount(userId);
      // await fastify.referralNotifications.resetNotificationAmount(userId);

      return {
        status: "ok",
        transactions: transactionsResponse,
        referral: referralResponse,
      };
    }
  );

  fastify.get(
    "/checkNotifications",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const userId = fastify.getUser(request).id;

      const transactionsNotificationsNumber =
        await fastify.transactionsNotifications.getNotificationAmount(userId);

      const referralNotificationsNumber =
        await fastify.referralNotifications.getNotificationAmount(userId);

      return {
        status: "ok",
        transactionsNotificationsNumber,
        referralNotificationsNumber,
      };
    }
  );
}
