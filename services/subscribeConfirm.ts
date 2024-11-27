"use strict";
import { FastifyInstance } from "fastify";
import TelegramBot from "node-telegram-bot-api";
import { CsvTaskFileProps } from "../plugins/utils/utils.types";

export default async function (fastify: FastifyInstance) {
  const checkInterval = 1;
  const en_tasks = await fastify.utils.csvParser<CsvTaskFileProps>(
    "./db/taskstranslate_en.csv"
  );

  setInterval(async function () {
    console.log("RUN subscribeConfirm");

    const bot = new TelegramBot((fastify.config?.bottoken ?? "") as string);

    const users = await fastify.modelsUser.getActiveUsers();

    if (users) {
      for (let uindex = 0; uindex < users.length; uindex++) {
        const user = users[uindex];
        const tasks = await fastify.modelsTasks.getUserTasks(
          user.id,
          "and user_task_state.is_complite = 0 and tasks.type = 'checkSubscribe'"
        );

        if (tasks) {
          for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];

            if (user.language_code != "ru") {
              task.description = en_tasks[task.id - 1].description;
            }

            try {
              const check = await bot.getChatMember(task.description, user.id);

              if (check.status != "left") {
                await fastify.modelsTasks.compliteTask(task.id, user.id, "");
              }
            } catch (error) {
              //console.log("subscribeConfirm", user.id , ">",task.description, "failed", "cannot get info")
            }
          }
        }
      }
    }
  }, 1000 * 60 * checkInterval);
}
