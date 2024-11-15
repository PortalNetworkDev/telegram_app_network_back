import { FastifyInstance } from "fastify";
import Schema from "fluent-json-schema";

interface Props {
  limit: number;
  page: number;
  timePeriod: { from: number; to: number };
  userId: number;
}

const params = Schema.object()
  .prop("timePeriod", Schema.object())
  .prop("page", Schema.number())
  .prop("limit", Schema.number())
  .prop("userId", Schema.number());
const schema = { params };

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Props }>(
    "/history",
    { schema },
    async (request, response) => {
      const { limit, page, timePeriod, userId } = request.body;
      const result = await fastify.transactions.getTransactionsByUserIdAndTime(
        userId,
        timePeriod,
        limit,
        page * limit
      );

      return result;
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

  fastify.get<{ Querystring: { id: number } }>(
    "/getTransactionsByUserId",
    async (request, replay) => {
      const transactions = await fastify.transactions.getTransactionsByUserId(
        request.query.id
      );
      return transactions;
    }
  );
}
