import { FastifyInstance } from "fastify";
import { ONE_DAY } from "../../constants/app.constants";

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/rewardForEmoji",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);
      const lastTime =
        await fastify.modelsTasks.getUserLastCompletionTimeForTask(user.id, 10);

      const updateUserTaskStateRow = await fastify.modelsTasks.updateTaskState(
        user.id,
        10
      );

      if (updateUserTaskStateRow === 0) {
        await fastify.modelsTasks.createUserTaskState(user.id, 10, Date.now());
        await fastify.modelsTasks.compliteTask(10, user.id, "");
      }

      if (!lastTime) {
        await fastify.miningPower.addPowerBalance(user.id, 10000);
      } else if (Date.now() - lastTime > ONE_DAY) {
        await fastify.miningPower.addPowerBalance(user.id, 10000);
      }

      await fastify.modelsTasks.setRewardedTask(10, user.id, "");

      return {
        statusCode: 200,
      };
    }
  );

  fastify.post(
    "/resetEmojiTaskState",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      await fastify.modelsTasks.resetTaskState(10, user.id);

      return {
        statusCode: 200,
      };
    }
  );
}
