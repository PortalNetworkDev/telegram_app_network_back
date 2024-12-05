import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/buyrizebattery",
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

      const data = await fastify.miningPower.getMiningData(user.id);

      if (data) {
        const price_rize_battery =
          fastify.calculationUtils.calculatePriceRiseBatteryWithLimit(
            data?.battery_level ?? 0,
            Number(fastify.config.stepBatteryPrice)
          );

        const power_rize_battery =
          data.battery_capacity +
          Number(fastify.config.stepBatteryCap) *
            Math.round(1.2 ** data.battery_level);

        if (data.power_balance < price_rize_battery) {
          return reply.badRequest("not_enough_power");
        }

        await fastify.miningPower.buyBatteryCapacity(
          user.id,
          power_rize_battery,
          price_rize_battery
        );

        //data = await fastify.miningPower.getMiningData(user.id)

        return {
          code: "succcess",
          //power_balance:data.power_balance,
          //battery_capacity:data.battery_capacity,
          //battery_level:data.battery_level
        };
      }else{
        return reply.badRequest("no available mining data");
      }
    }
  );
}
