import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/reward",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      //сохранить время первого награждения и если прошло меньше 24 часов с момента предыдущего вызова - пропускать
      // таблицас наградами за задания имеет сервис reward который вызывает setRewardedTask похоже для всех
      // нужно внести в него исключения для этого задания т.к. награды будут начисляться по другому
      await fastify.modelsTasks.createUserTaskState(user.id, 10);
      await fastify.modelsTasks.compliteTask(10, user.id, "");
      await fastify.miningPower.addPowerBalance(user.id, 10000);
      await fastify.modelsTasks.setRewardedTask(10, user.id, "");
    }
  );

  fastify.post(
    "/remove",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      await fastify.modelsTasks.resetTaskState(10, user.id);
    }
  );
}
