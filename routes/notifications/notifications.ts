import { FastifyInstance } from "fastify";
import { UserModel } from "../../models/user/user.types";

export default async function (fastify: FastifyInstance) {
  const getTransactionResponse = async (userId: number) => {
    const amount =
      await fastify.transactionsNotifications.getNotificationAmount(userId);

    if (amount === 0) {
      return [];
    }

    const transactions = await fastify.transactions.getLastUserTransactions(
      userId,
      1
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

    const notificationAmount = notificationInfo?.reduce(
      (acc, prev) => (acc += prev.notificationAmount),
      0
    );

    if (notificationAmount === 0) {
      return [];
    }

    const referralInfo = await fastify.modelsUser.getLastReferralForUser(
      userId
    );

    const inviterInfo = await fastify.modelsUser.getLastInviterForRefUser(
      userId
    );

    return notificationInfo
      ?.map((item) => {
        if (item.type === "referral" && item.notificationAmount > 0) {
          return {
            type: "referral",
            powerAmount: Number(fastify.config.forReferalPowerReward),
            inviterUserName: inviterInfo?.username,
          };
        }

        if (item.type === "inviter" && item.notificationAmount > 0) {
          return {
            type: "invite",
            powerAmount: Number(fastify.config.toReferalPowerReward),
            refUserName: referralInfo?.username,
          };
        }
      })
      .filter((item) => item);
  };

  const resetNotifications = async (userId: number) => {
    await fastify.transactionsNotifications.resetNotificationAmount(userId);
    await fastify.referralNotifications.resetNotificationAmount(userId);
  };

  fastify.get(
    "/getNotificationsInfo",
    {
      onRequest: [fastify.auth],
      onResponse: [
        async (request, reply) => {
          const userId = fastify.getUser(request).id;
          await resetNotifications(userId);
        },
      ],
    },
    async (request, reply) => {
      const userId = fastify.getUser(request).id;

      const [
        transactionsNotificationsNumber,
        referralSystemNotificationsNumber,
      ] = await Promise.all([
        fastify.transactionsNotifications.getNotificationAmount(userId),
        fastify.referralNotifications.getNotificationAmount(userId),
      ]);

      if (
        transactionsNotificationsNumber > 1 &&
        referralSystemNotificationsNumber > 1
      ) {
        return {
          status: "ok",
          transactionsNotificationsNumber,
          referralSystemNotificationsNumber,
        };
      }

      const transactionsResponse = await getTransactionResponse(userId);
      const referralResponse = await getReferralResponse(userId);

      if (
        transactionsNotificationsNumber === 1 &&
        referralSystemNotificationsNumber > 2
      ) {
        return {
          status: "ok",
          transactions: transactionsResponse,
          referralSystemNotificationsNumber,
        };
      }

      if (
        referralSystemNotificationsNumber <=2 &&
        transactionsNotificationsNumber > 1
      ) {
        return {
          status: "ok",
          referral: referralResponse,
          transactionsNotificationsNumber,
        };
      }

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

      const referralSystemNotificationsNumber =
        await fastify.referralNotifications.getNotificationAmount(userId);

      return {
        status: "ok",
        transactionsNotificationsNumber,
        referralSystemNotificationsNumber,
      };
    }
  );
}
