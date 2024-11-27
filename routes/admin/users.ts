"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify:FastifyInstance) {
  fastify.get(
    "/users",
    { onRequest: [fastify.auth] },
    async function (request, reply) {
      const _user = fastify.getUser(request);
      const user = await fastify.modelsUser.getUser(_user.id);

      if (user && !fastify.config.admins?.includes(user.username))
        return reply.badRequest("access_denied");

      return await fastify.modelsUser.getUsers();
    }
  );
}
