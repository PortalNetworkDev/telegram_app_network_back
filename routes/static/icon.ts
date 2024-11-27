"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { icon: string } }>(
    "/icon/:icon",
    function (req, reply) {
      reply.sendFile(`/icons/${req.params.icon}`);
    }
  );
}
