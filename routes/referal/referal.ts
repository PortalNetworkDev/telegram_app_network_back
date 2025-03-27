import { FastifyInstance } from "fastify";
import {
  saveInviterNotificationInfo,
  saveReferralNotificationInfo
} from "../../models/notifications/notifications.utils.js";
import { addTransactionForReferralSystemParticipant } from "../../models/transactions/transactions.utils.js";

interface Body {
  user_id: number;
}

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>(
    "/follow",
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
                enum: [
                  "user_does_not_exist",
                  "already_follow",
                  "cannot_follow_to_yourself",
                ],
              },
            },
          },
        },
        body: {
          type: "object",
          properties: {
            user_id: { type: "number", minimum: 1 },
          },
          required: ["user_id"],
        },
      },
      onRequest: [fastify.auth],
    },
    async function (request, reply) {
      const { user_id } = request.body;
      const _user = fastify.getUser(request);

      if (_user.id == user_id) {
        return reply.badRequest("cannot_follow_to_yourself");
      }

      const user = await fastify.modelsUser.getUser(_user.id);

      if (!(await fastify.modelsUser.userExist(user_id)))
        return reply.badRequest("user_does_not_exist");

      if (user) {
        if (await fastify.modelsUser.checkReferaluser(user_id, user.id))
          return reply.badRequest("already_follow");
        await fastify.modelsUser.addReferralUser(user_id, user.id);

        await saveInviterNotificationInfo(fastify, user_id);
        await saveReferralNotificationInfo(fastify, user.id);

        await addTransactionForReferralSystemParticipant(
          fastify,
          user_id,
          user.id
        );
      }

      return { code: "succcess" };
    }
  );
}
