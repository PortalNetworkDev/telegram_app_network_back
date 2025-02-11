import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/rewardForEmoji",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);
      const isUserCompleteTaskWithEmoji =
        await fastify.modelsTasks.getIsUserCompleteTask(user.id, 10);

      if (isUserCompleteTaskWithEmoji) {
        return {
          statusCode: 200,
          message: "Already complete task",
        };
      }

      const updateUserTaskStateRow = await fastify.modelsTasks.updateTaskState(
        user.id,
        10
      );

      if (updateUserTaskStateRow === 0) {
        await fastify.modelsTasks.createUserTaskState(user.id, 10);
        await fastify.modelsTasks.compliteTask(10, user.id, "");
      }
      await fastify.miningPower.addPowerBalance(user.id, 10000);
      await fastify.modelsTasks.setRewardedTask(10, user.id, "");

      return {
        statusCode: 200,
      };
    }
  );
}
