"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { id: number } }>(
    "/getUserTaskByTaskId/:id",
    { onRequest: [fastify.auth] },
    async function (request, reply) {
      const user = fastify.getUser(request);
      const task = await fastify.modelsTasks.getUserTaskByTaskId(
        user.id,
        request.params.id
      );

      return task;
    }
  );
}
