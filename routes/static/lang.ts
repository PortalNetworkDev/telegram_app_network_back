"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { lang: string } }>(
    "/lang/:lang",
    function (req, reply) {
      reply.sendFile(`/lang/${req.params.lang}`);
    }
  );
}
