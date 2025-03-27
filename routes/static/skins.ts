"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Params: { image: string } }>(
    "/skins/generators/:image",
    function (req, reply) {
      reply.sendFile(`/skins/generators/shopItem/${req.params.image}`);
    }
  );

  fastify.get<{ Params: { image: string } }>(
    "/skins/batteries/:image",
    function (req, reply) {
      reply.sendFile(`/skins/batteries/shopItem/${req.params.image}`);
    }
  );

  fastify.get<{ Params: { image: string } }>(
    "/skins/batteries/full/:image",
    function (req, reply) {
      reply.sendFile(`/skins/batteries/full/${req.params.image}`);
    }
  );

  fastify.get<{ Params: { image: string } }>(
    "/skins/generators/full/:image",
    function (req, reply) {
      reply.sendFile(`/skins/generators/full/${req.params.image}`);
    }
  );
}
