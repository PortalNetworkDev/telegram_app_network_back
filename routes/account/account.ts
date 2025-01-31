import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/getUserRefLink",
    { onRequest: fastify.auth },
    async (request, reply) => {
      return { status: "ok", link: "" };
    }
  );
}
