import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/buyrizemultitab",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      onRequest: [fastify.auth],
    },
    async function (request, reply) {
      const user = fastify.getUser(request);

      let data = await fastify.miningPower.getMiningData(user.id);
      if (data) {
        const price_rize_multitab =
          2 ** (data.multitab - 1) * Number(fastify.config.stepMultitabPrice);

        if (data.power_balance < price_rize_multitab) {
          return reply.badRequest("not_enough_power");
        }

        await fastify.miningPower.buyMultitab(user.id, price_rize_multitab);

        //data = await fastify.miningPower.getMiningData(user.id)

        return {
          code: "succcess",
          //power_balance:data.power_balance,
          //generator_limit:data.generator_limit,
          //battery_level:data.battery_level
        };
      } else {
        return reply.badRequest("no available mining data");
      }
    }
  );
}
