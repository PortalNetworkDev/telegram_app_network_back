import { FastifyInstance } from "fastify";
import Schema from "fluent-json-schema";
import { UserModel } from "../../models/user/user.types";
import { TransactionType } from "../../models/transactions/transactions.types";

interface Props {
  limit: number;
  page: number;
  timePeriod: { from: number; to: number };
}

const params = Schema.object()
  .prop("page", Schema.number())
  .prop("limit", Schema.number());
const schema = { params };

const addPrefixToUserName = (name: string, transactionType: TransactionType) =>
  transactionType === "invitation" || transactionType === "referral"
    ? `referral@${name}`
    : `@${name}`;

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Props }>(
    "/history",
    { schema, onRequest: [fastify.auth] },
    async (request, response) => {
      const { limit = 30, page } = request.body;

      const userId = fastify.getUser(request).id;
      const returnedRowsLimit = limit > 50 ? 50 : limit;
      const currentTransactionsListLength =
        await fastify.transactions.getTransactionsTableLength(userId);

      const result = await fastify.transactions.getTransactionsByUserId(
        userId,
        returnedRowsLimit,
        page * returnedRowsLimit
      );

      if (result.length === 0) {
        return { status: "ok", items: [] };
      }

      const listItems = currentTransactionsListLength - limit * (page + 1);

      const isHasNextPage =
        listItems > 0 && listItems !== currentTransactionsListLength;

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

      return {
        status: "ok",
        isHasNextPage,
        items: result
          .map((item) => {
            const senderName = usersInfoMap[item.senderId]?.username;
            const recipientName = usersInfoMap[item.recipientId]?.username;

            if (item.senderId === userId && item.type === "invitation") {
              return null;
            }

            return {
              id: item.id,
              sender: {
                id: item.senderId,
                userName: addPrefixToUserName(
                  senderName,
                  item.type ?? "invitation"
                ),
              },
              recipient: {
                id: item.recipientId,
                userName: addPrefixToUserName(
                  recipientName,
                  item.type ?? "invitation"
                ),
              },
              powerAmount: item.powerAmount,
              creationTime: item.creationTime,
            };
          })
          .filter((item) => item),
      };
    }
  );

  fastify.get<{ Querystring: { id: number } }>(
    "/getTransactionById",
    async (request, replay) => {
      const transaction = await fastify.transactions.getTransactionById(
        request.query.id
      );

      if (transaction) {
        const senderInfo = await fastify.modelsUser.getUser(
          transaction?.senderId ?? 0
        );

        const recipientInfo = await fastify.modelsUser.getUser(
          transaction?.recipientId ?? 0
        );

        return {
          status: "ok",
          transaction: {
            id: transaction?.id,
            sender: {
              firstName: senderInfo?.first_name,
              lastName: senderInfo?.last_name,
              userName: addPrefixToUserName(
                senderInfo?.username ?? "",
                transaction.type ?? "invitation"
              ),
            },
            recipient: {
              firstName: recipientInfo?.first_name,
              lastName: recipientInfo?.last_name,
              userName: addPrefixToUserName(
                recipientInfo?.username ?? "",
                transaction.type ?? "invitation"
              ),
            },
            powerAmount: transaction?.powerAmount,
            creationTime: transaction?.creationTime,
          },
        };
      }

      return replay.badRequest(
        `There is no transaction with this id: ${request.query.id}`
      );
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
          type: "transfer",
        });
      }

      for (let index = 0; index < length; index++) {
        const randomDate = getRandomDate(2);

        await fastify.transactions.addTransaction({
          senderId: allUsers?.rows[index].id ?? 0,
          recipientId: userId,
          powerAmount: (Math.floor(Math.random() * 10) + 1) * 100,
          creationTime: randomDate.getTime(),
          type: "transfer",
        });
      }

      for (let index = 0; index < length; index++) {
        const randomDate = getRandomDate(3);

        await fastify.transactions.addTransaction({
          senderId: allUsers?.rows[index].id ?? 0,
          recipientId: userId,
          powerAmount: (Math.floor(Math.random() * 10) + 1) * 100,
          creationTime: randomDate.getTime(),
          type: "transfer",
        });
      }

      for (let index = 0; index < length; index++) {
        const randomDate = getRandomDate(4);

        await fastify.transactions.addTransaction({
          senderId: allUsers?.rows[index].id ?? 0,
          recipientId: userId,
          powerAmount: (Math.floor(Math.random() * 10) + 1) * 100,
          creationTime: randomDate.getTime(),
          type: "transfer",
        });
      }
      return { status: "ok" };
    }
  );
}
