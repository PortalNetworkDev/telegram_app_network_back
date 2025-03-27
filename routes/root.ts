"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify:FastifyInstance) {
  fastify.get("/", async function (request, reply) {
    return { root: true };
  });
}
