export default async function (fastify, opts) {
  fastify.post(
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

      const user = await fastify.models_user.getUser(_user.id);

      if (!(await fastify.models_user.userExist(user_id)))
        return reply.badRequest("user_does_not_exist");

      if (await fastify.models_user.checkReferaluser(user_id, user.id))
        return reply.badRequest("already_follow");

      fastify.models_user.addReferalUser(user_id, user.id);

      return { code: "succcess" };
    }
  );
}
