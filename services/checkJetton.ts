"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {

  const checkInterval = 1;

  setInterval(async function () {
    console.log("RUN checkJetton");

    const users = await fastify.modelsUser.getActiveUsers();

    if (users) {
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        const tasks = await fastify.modelsTasks.getUserTasks(
          user.id,
          "and user_task_state.is_complite = 0 and tasks.type = 'checkJetton'"
        );
        if (tasks) {
          for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];
            if (user.wallet) {
              let isComplite = await fastify.utils.checkBuyTokenStonFi(
                user.wallet
              );
              let isLongStored =
                await fastify.modelsBalanceHistory.checkDaysInHistoryTokenBalance(
                  user.id
                );

              if (isComplite && isLongStored) {
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
