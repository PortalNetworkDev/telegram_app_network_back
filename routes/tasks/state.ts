"use strict";

import { FastifyInstance } from "fastify";
import { CategoriesTaskModelWithTasks } from "../../models/tasks/tasks.types";
import {
  CsvCategoryFileProps,
  CsvTaskFileProps,
} from "../../plugins/utils/utils.types";

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/mystate",
    { onRequest: [fastify.auth] },
    async function (request, reply) {
      const user = await fastify.modelsUser.getUser(
        fastify.getUser(request).id
      );

      if (!user) {
        return reply.badRequest("User do not exists");
      }

      const cats =
        (await fastify.modelsTasks.getCategories()) as CategoriesTaskModelWithTasks[];
      const tasks = await fastify.modelsTasks.getUserTasks(user.id);

      const en_cats = await fastify.utils.csvParser<CsvCategoryFileProps>(
        "./db/catstranslate_en.csv"
      );
      const en_tasks = await fastify.utils.csvParser<CsvTaskFileProps>(
        "./db/taskstranslate_en.csv"
      );

      const subscribeUsersText =
        user.language_code == "ru"
          ? "Привлечено пользователей, выполнивших задание Первенец"
          : "Attracted users who bought POE";

      const daysInPoolText =
        user.language_code == "ru" ? "Дней в пуле" : "Days in the pool";

      if (cats && tasks) {
        for (let indexCat = 0; indexCat < cats.length; indexCat++) {
          const cat = cats[indexCat];

          if (user.language_code != "ru") {
            cat.description = en_cats[indexCat].description;
            cat.label = en_cats[indexCat].label;
          }

          Object.defineProperty(cats[indexCat], "tasks", {
            value: [],
            enumerable: true,
          });

          for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];

            if (user.language_code != "ru") {
              task.label = en_tasks[index].label;
              task.description = en_tasks[index].description;
              task.title = en_tasks[index].title;
              task.other = en_tasks[index].other;
            }

            if (task.category_id === cat.id) {
              if (task.reward < 1)
                task.reward = Number(Number(task.reward).toFixed(2));

              if (task.type == "referal") {
                task.description =
                  task.description +
                  `<br><br>${subscribeUsersText}: <b>${await fastify.modelsUser.countReferalUsers(
                    user.id
                  )}</b>`;
                task.reward = Number(Number(user.referal_reward).toFixed(2));
              }

              if (task.type == "checkLiquidity") {
                const days =
                  await fastify.modelsBalanceHistory.getHoleInHistoryPoolBalance(
                    user.id
                  );
                task.description =
                  task.description +
                  `<br><br>${daysInPoolText}: <b>${days?.length ?? 0}</b>`;
              }

              cats[indexCat].tasks.push(task);
            }
          }
        }
      }
      return cats;
    }
  );
}
