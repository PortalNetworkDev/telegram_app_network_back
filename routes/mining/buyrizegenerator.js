export default async function (fastify, opts) {
  fastify.post(
    "/buyrizegenerator",
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

      const price_rize_generator =
        2 ** Math.round(data.generator_level / 2) *
        Number(fastify.config.stepGeneratorPrice);
      const power_rize_generator =
        data.generator_limit + Number(fastify.config.stepGeneratorLim);

      if (data.power_balance < price_rize_generator) {
        return reply.badRequest("not_enough_power");
      }

      await fastify.miningPower.buyGeneratorLimit(
        user.id,
        power_rize_generator,
        price_rize_generator
      );

      //data = await fastify.miningPower.getMiningData(user.id)

      return {
        code: "succcess",
        //power_balance:data.power_balance,
        //generator_limit:data.generator_limit,
        //battery_level:data.battery_level
      };
    }
  );
}
