import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/claimpower",
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

      await fastify.miningPower.claimBattery(user.id);

      //const data = await fastify.miningPower.getMiningData(user.id)

      return {
        code: "succcess",
        //power_balance:data.power_balance,
        //battery_balance:data.battery_balance
      };
    }
  );
}
