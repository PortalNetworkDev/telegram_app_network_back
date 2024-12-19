import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
    fastify.get<{ Params: { image: string } }>(
      "/lottery/gift/:image",
      function (req, reply) {
        reply.sendFile(`/shopLottery/${req.params.image}`);
      }
    );
  }
  