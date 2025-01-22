import { FastifyInstance } from "fastify";
import Schema from "fluent-json-schema";
import { UserModel } from "../../models/user/user.types";

interface Props {
  limit: number;
  page: number;
  timePeriod: { from: number; to: number };
}

const params = Schema.object()
  .prop("page", Schema.number())
  .prop("limit", Schema.number());
const schema = { params };

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Props }>(
    "/history",
    { schema, onRequest: [fastify.auth] },
    async (request, response) => {
      const { limit = 30, page } = request.body;

      const userId = fastify.getUser(request).id;
      const returnedRowsLimit = limit > 50 ? 50 : limit;

      const result = await fastify.transactions.getTransactionsByUserId(
        userId,
        returnedRowsLimit,
        page * returnedRowsLimit
      );

      if (result.length === 0) {
        return { status: "ok", items: [] };
      }

      const usersIds = new Set<number>();

      result.forEach((item) => {
        usersIds.add(item.recipientId);
        usersIds.add(item.senderId);
      });

      const usersInfo = await fastify.modelsUser.getUsersInfoByIds(
        Array.from(usersIds)
      );
      const usersInfoMap: Record<number, Omit<UserModel, "id">> = {};

      usersInfo.forEach((item) => {
        const { id, ...rest } = item;
        usersInfoMap[item.id] = rest;
      });

      return result.map((item) => ({
        id: item.id,
        sender: {
          id: item.senderId,
          userName: usersInfoMap[item.senderId].username,
        },
        recipient: {
          id: item.recipientId,
          userName: usersInfoMap[item.recipientId].username,
        },
        powerAmount: item.powerAmount,
        creationTime: item.creationTime,
      }));
    }
  );

  fastify.get<{ Querystring: { id: number } }>(
    "/getTransactionById",
    async (request, replay) => {
      const transaction = await fastify.transactions.getTransactionById(
        request.query.id
      );
      return transaction;
    }
  );

  fastify.get(
    "/addTransactionsToDB",
    { onRequest: [fastify.auth] },
    async (request, replay) => {
      const userId = fastify.getUser(request).id;

      const allUsers = await fastify.dataBase.select<Pick<UserModel, "id">>(
        "select id from users where id != ?",
        [userId]
      );
      const length = allUsers?.rows.length ?? 10;

      const getRandomDate = (month: number) => {
        const randomDate = new Date();
        randomDate.setHours(Math.floor(Math.random() * 11) + 1);
        randomDate.setMonth(month);
        randomDate.setDate(Math.floor(Math.random() * 20) + 1);

        return randomDate;
      };

      for (let index = 0; index < length; index++) {
        const randomDate = getRandomDate(1);

        await fastify.transactions.addTransaction({
          senderId: userId,
          recipientId: allUsers?.rows[index].id ?? 0,
          powerAmount: (Math.floor(Math.random() * 10) + 1) * 100,
          creationTime: randomDate.getTime(),
        });
      }

      for (let index = 0; index < length; index++) {
        const randomDate = getRandomDate(2);

        await fastify.transactions.addTransaction({
          senderId: allUsers?.rows[index].id ?? 0,
          recipientId: userId,
          powerAmount: (Math.floor(Math.random() * 10) + 1) * 100,
          creationTime: randomDate.getTime(),
        });
      }

      for (let index = 0; index < length; index++) {
        const randomDate = getRandomDate(3);

        await fastify.transactions.addTransaction({
          senderId: allUsers?.rows[index].id ?? 0,
          recipientId: userId,
          powerAmount: (Math.floor(Math.random() * 10) + 1) * 100,
          creationTime: randomDate.getTime(),
        });
      }

      for (let index = 0; index < length; index++) {
        const randomDate = getRandomDate(4);

        await fastify.transactions.addTransaction({
          senderId: allUsers?.rows[index].id ?? 0,
          recipientId: userId,
          powerAmount: (Math.floor(Math.random() * 10) + 1) * 100,
          creationTime: randomDate.getTime(),
        });
      }
      return { status: "ok" };
    }
  );
}
