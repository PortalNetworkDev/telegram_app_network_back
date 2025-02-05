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

    const senderInfo = await fastify.modelsUser.getUser(
      transactions[0].senderId
    );

    const resultData = {
      type: "transaction",
      comment: transactions[0].comment,
      sender: {
        firstName: senderInfo?.first_name,
        lastName: senderInfo?.last_name,
        username: senderInfo?.username,
      },
      powerAmount: transactions[0].powerAmount,
      time: transactions[0].creationTime,
    };
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
        transactionsNotificationsCounter,
        referralSystemNotificationsCounter,
      ] = await Promise.all([
        fastify.transactionsNotifications.getNotificationAmount(userId),
        fastify.referralNotifications.getNotificationAmount(userId),
      ]);

      const totalNotificationAmount =
        transactionsNotificationsCounter + referralSystemNotificationsCounter;

      if (totalNotificationAmount > 1) {
        return {
          status: "ok",
          transactionsNotificationsCounter,
          referralSystemNotificationsCounter,
        };
      } else if (transactionsNotificationsCounter === 1) {
        const transactionsResponse = await getTransactionResponse(userId);

        return {
          status: "ok",
          notification: transactionsResponse ,
        };
      } else if (referralSystemNotificationsCounter === 1) {
        const referralResponse = await getReferralResponse(userId);

        return {
          status: "ok",
          notification: referralResponse?.[0],
        };
      }

      return {
        status: "ok",
        notification: {},
      };
    }
  );

  fastify.get(
    "/checkNotifications",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const userId = fastify.getUser(request).id;

      const transactionsNotificationsCounter =
        await fastify.transactionsNotifications.getNotificationAmount(userId);

      const referralSystemNotificationsCounter =
        await fastify.referralNotifications.getNotificationAmount(userId);

      return {
        status: "ok",
        transactionsNotificationsCounter,
        referralSystemNotificationsCounter,
      };
    }
  );
}
