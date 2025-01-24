import { FastifyInstance } from "fastify";
import { UserModel } from "../../models/user/user.types";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/getNotificationsInfo",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const userId = fastify.getUser(request).id;

      const amount =
        await fastify.notifications.transactions.getNotificationAmount(userId);

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

      await fastify.notifications.transactions.resetNotificationAmount(userId);

      //проверить flow работы программы когда отправляешь по id Вт
      return { status: "ok", items: resultData };
    }
  );

  fastify.get(
    "/checkNotifications",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const userId = fastify.getUser(request).id;

      const amount =
        await fastify.notifications.transactions.getNotificationAmount(userId);

      return { status: "ok", amount };
    }
  );
}
