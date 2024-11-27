"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  const checkInterval = 1;

  setInterval(async function () {
    console.log("RUN checkLiquidity");

    const users = await fastify.modelsUser.getActiveUsers();

    if (users) {
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const tasks = await fastify.modelsTasks.getUserTasks(
          user.id,
          "and user_task_state.is_complite = 0 and tasks.type = 'checkLiquidity'"
        );
        if (tasks) {
          for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];
            if (user.wallet) {
              let isComplite =
                await fastify.modelsBalanceHistory.checkPoolBalanceByPeriod(
                  user.id
                );

              if (isComplite) {
                await fastify.modelsTasks.compliteTask(task.id, user.id, "");
              }

              await fastify.utils.sleep(200);
            }
          }
        }
      }
    }
  }, 1000 * 60 * checkInterval);
}
