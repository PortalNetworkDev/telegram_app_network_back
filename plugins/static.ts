"use strict";

import createPlugin from "fastify-plugin";
import fastifyStatic from "@fastify/static";

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { FastifyPluginAsync } from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  fastify.register(fastifyStatic, {
    root: join(__dirname, "../../assets"),
  });
});
