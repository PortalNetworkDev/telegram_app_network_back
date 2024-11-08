"use strict";

import { join, dirname } from "path";
import { fileURLToPath } from "url";

import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pass --options via CLI arguments in command to enable these options.
const options = {};

export default async function (fastify, opts) {
  // Do not touch the following lines
  fastify.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    ignorePattern: /^.*.ts$/
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "models"),
    options: Object.assign({}, opts),
    
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, "services"),
    options: Object.assign({}, opts),
  });
}

export { options };
