import { FastifyInstance, FastifyRequest } from "fastify";
import { User } from "node-telegram-bot-api";

export type RequestBody = {
  user_id: number;
  reward: number;
};

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/setUserReward",
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
              message: {
                type: "string",
                enum: ["user_does_not_exist", "access_denied"],
              },
            },
          },
        },
        body: {
          type: "object",
          properties: {
            user_id: { type: "number", minimum: 1 },
            reward: { type: "number", minimum: 1 },
          },
          required: ["user_id", "reward"],
        },
      },
      onRequest: [fastify.auth],
    },
    async function (
      request: FastifyRequest<{
        Body: RequestBody;
      }>,
      reply
    ) {
      const _user = fastify.getUser(request);
      const user = await fastify.modelsUser.getUser(_user.id);

      if (user && !fastify.config.admins?.includes(user.username))
        return reply.badRequest("access_denied");

      const { user_id, reward } = request.body;

      if (!(await fastify.modelsUser.userExist(user_id)))
        return reply.badRequest("user_does_not_exist");

      await fastify.modelsUser.updateReward(user_id, reward);

      return { code: "succcess" };
    }
  );
}
