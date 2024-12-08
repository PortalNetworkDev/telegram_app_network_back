"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { image: string } }>(
    "/skins/generators/:image",
    function (req, reply) {
      reply.sendFile(`/skins/generators/${req.params.image}`);
    }
  );
}
