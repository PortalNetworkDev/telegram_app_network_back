import { FastifyInstance } from "fastify";
import { getMinersListSchema } from "./topMinersList.schemes.js";
import { getLimit } from "./topMinersList.utils.js";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/getUserListPosition",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const userId = fastify.getUser(request).id;

      const userPositionInList =
        await fastify.topMinersListService.getUserCurrentPosition(userId);

      if (!userPositionInList) {
        return reply.badRequest(`Unable to find user with this id: ${userId}`);
      }

      return { status: "ok", position: userPositionInList };
    }
  );

  fastify.get<{ Querystring: { page: number; limit?: number } }>(
    "/getMinersList",
    { schema: { querystring: getMinersListSchema } },
    async (request, replay) => {
      //попробовать как-то сделать чтобы подсчет происходил только когда обновилась таблица
      const currentMinersListLength =
        await fastify.topMinersListService.getMinersListLength();

      const page = Number(request.query.page);
      const limit = request.query?.limit
        ? getLimit(Number(request.query.limit))
        : 30;

      const listItems = currentMinersListLength - limit * (page + 1);

      const isHasNextPage =
        listItems > 0 && listItems !== currentMinersListLength;

      //придумать как не дергать запрос если page больше доступной
      const list = await fastify.topMinersListService.getUsersFromList(
        page,
        limit
      );

      return {
        status: "ok",
        hasNextPage: isHasNextPage,
        list:
          list?.map((item) => ({
            position: item.id,
            powerBalance: item.powerBalance,
            userId: item.userId,
            level: item.level,
            firstName: item.firstName,
            lastName: item.lastName,
          })) ?? [],
      };
    }
  );
}
