"use strict";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {};

export default async function (fastify, opts) {
  // Do not touch the following lines
  fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });
  fastify.register(AutoLoad, {
    dir: join(__dirname, "/build/plugins"),
    ignorePattern: /^.*(?:\.ts|\.types.js)$/,
  });
  fastify.register(AutoLoad, {
    dir: join(__dirname, "/build/models"),
    options: Object.assign({}, opts),
    ignorePattern: /^.*(?:\.ts|\.types.js)$/,
    maxDepth: 1,
  });
  fastify.register(AutoLoad, {
    dir: join(__dirname, "/build/routes"),
    options: Object.assign({}, opts),
    ignorePattern: /^.*(?:\.ts|\.types.js)$/,
  });
  fastify.register(AutoLoad, {
    dir: join(__dirname, "/build/services"),
    options: Object.assign({}, opts),
    ignorePattern: /^.*(?:\.ts|\.types.js)$/,
  });
  fastify.register(AutoLoad, {
    dir: join(__dirname, "/build/utils/calculationUtils"),
    options: Object.assign({}, opts),
    ignorePattern: /^.*(?:\.ts|\.types.js)$/,
  });
}
export { options };
