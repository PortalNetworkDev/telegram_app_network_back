import { FastifyInstance } from "fastify";
import Schema from "fluent-json-schema";

interface Props {
  limit: number;
  page: number;
  timePeriod: { from: number; to: number };
}

const params = Schema.object()
  .prop("timePeriod", Schema.object())
  .prop("page", Schema.number())
  .prop("limit", Schema.number())
const schema = { params };

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Props }>(
    "/history",
    { schema, onRequest: [fastify.auth] },
    async (request, response) => {
      const { limit, page, timePeriod } = request.body;
      const userId = fastify.getUser(request).id;
      const returnedRowsLimit = limit > 50 ? 50 : limit;

      const result = await fastify.transactions.getTransactionsByUserIdAndTime(
        userId,
        timePeriod,
        returnedRowsLimit,
        page * returnedRowsLimit
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

}
