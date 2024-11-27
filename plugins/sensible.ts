"use strict";

import createPlugin from "fastify-plugin";
import fastifySensible, { SensibleOptions } from "@fastify/sensible";
import { FastifyRegisterOptions } from "fastify";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default createPlugin(async function (fastify, opts) {
  fastify.register(fastifySensible, {
    errorHandler: false,
  }  as FastifyRegisterOptions<SensibleOptions>);
});
