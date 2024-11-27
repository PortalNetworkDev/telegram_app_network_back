"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { image: string } }>(
    "/images/:image",
    function (req, reply) {
      reply.sendFile(`/images/${req.params.image}`);
    }
  );
}
