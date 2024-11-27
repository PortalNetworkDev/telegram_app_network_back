"use strict";

import createPlugin from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { CategoriesTaskModel, TaskModel } from "./tasks.types";
import {
  CsvCategoryFileProps,
  CsvTaskFileProps,
} from "../../plugins/utils/utils.types";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const userTaskState = `
        CREATE TABLE IF NOT EXISTS user_task_state (
            rowid BIGINT NOT NULL AUTO_INCREMENT , PRIMARY KEY (\`rowid\`),
            task_id INTEGER,
            user_id BIGINT,
            is_complite BOOLEAN DEFAULT 0,
            is_rewarded BOOLEAN DEFAULT 0,
            result VARCHAR(255) DEFAULT ""
        )`;

  const categoriesTable = `
        CREATE TABLE IF NOT EXISTS categories_task (
            id BIGINT PRIMARY KEY,
            label VARCHAR(255),
            description TEXT
    )`;

  const tasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
            id BIGINT PRIMARY KEY,
            title TEXT,
            label TEXT,
            description TEXT , UNIQUE \`description\` (\`description\`(300)),
            type VARCHAR(255),
            category_id INTEGER,
            reward FLOAT,
            icon_url VARCHAR(255),
            other TEXT
    )`;

  const typesTasks = [
    "selfConfirm",
    "checkSubscribe",
    "connectToTon",
    "checkJetton",
    "checkLiquidity",
    "referal",
  ];

  await Promise.all([
    fastify.dataBase.insert(userTaskState),
    fastify.dataBase.insert(categoriesTable),
    fastify.dataBase.insert(tasksTable),
  ]);

  const createCategory = async (
    id: number,
    label: string,
    description: string
  ) => {
    if (await categoryExist(id)) return true;

    const sql = `INSERT INTO categories_task (id,label, description) VALUES (?,?,?)`;
    const values = [id, label, description];
    await fastify.dataBase.insert<CategoriesTaskModel>(sql, values);
  };

  const catImport = async (file: string) => {
    console.log("RUN catImport");

    //TODO: можно сделать ее джнериком и сделать два типа для файла с катигориями и заданиями
    const cats = await fastify.utils.csvParser<CsvCategoryFileProps>(file);

    for (let index = 0; index < cats.length; index++) {
      let cat = cats[index];
      try {
        await createCategory(cat.id, cat.label, cat.description);
      } catch (error) {
        fastify.log.error("Error when add category", cat, error);
      }
    }
  };

  const taskImport = async (file: string) => {
    console.log("RUN taskImport");

    const tasks = await fastify.utils.csvParser<CsvTaskFileProps>(file);
    for (let index = 0; index < tasks.length; index++) {
      const {
        id,
        title,
        label,
        description,
        type,
        category_id,
        reward,
        icon_url,
        other,
      } = tasks[index];
      try {
        await createTask(
          id,
          title,
          label,
          description,
          type,
          category_id,
          reward,
          icon_url,
          other
        );
      } catch (error) {
        fastify.log.error("error when create task from csv file:", error);
      }
    }
  };

  const getCategories = async () => {
    const result = await fastify.dataBase.select(
      "select * from categories_task"
    );
    return result?.rows ? (result.rows as CategoriesTaskModel[]) : null;
  };

  const categoryExist = async (id: number) => {
    const result = await fastify.dataBase.select(
      "select id from categories_task where id = ?",
      [id]
    );
    if (result && result.rows.length) {
      return true;
    } else {
      return false;
    }
  };

  const taskExist = async (id: number) => {
    const result = await fastify.dataBase.select(
      "select id from tasks where id = ?",
      [id]
    );

    if (result && result.rows.length) {
      return true;
    } else {
      return false;
    }
  };

  const createTask = async (
    id: number,
    title: string,
    label: string,
    description: string,
    type: string,
    category_id: number,
    reward: number,
    icon_url: string,
    other: string
  ) => {
    if (!(await categoryExist(category_id))) throw "category_does_not_exist";

    if (!typesTasks.includes(type)) throw "type_does_not_exist";

    if (await taskExist(id)) return true;

    const sql = `INSERT INTO tasks (id,title, label, description, type, category_id, reward, icon_url, other) 
        VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      id,
      title,
      label,
      description,
      type,
      category_id,
      reward,
      icon_url,
      other,
    ];

    await fastify.dataBase.insert(sql, values);
  };

  const getTasks = async () => {
    const result = await fastify.dataBase.select("select * from tasks");
    return result?.rows ? (result.rows as TaskModel[]) : null;
  };


  const getUserTasks = async (userId: number, where = "") => {
    try {
      const result = await fastify.dataBase.select<TaskModel>(
        `select  
            user_task_state.is_complite as is_complite,
            user_task_state.is_rewarded as is_rewarded,
            user_task_state.result as result,
            user_task_state.task_id as id,
            tasks.title as title,
            tasks.label as label,
            tasks.description as description,
            tasks.type as type,
            tasks.category_id as category_id,
            tasks.reward as reward,
            tasks.icon_url as icon_url,
            tasks.other as other

            from tasks JOIN user_task_state on tasks.id = user_task_state.task_id where user_task_state.user_id = ? ${where}`,
        [userId]
      );

      return result?.rows ? result.rows : null;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getUserTask = async (userId: number, taskId: number) => {
    try {
      const result = await fastify.dataBase.select<TaskModel>(
        `select  
            user_task_state.is_complite as is_complite,
            user_task_state.is_rewarded as is_rewarded,
            user_task_state.result as result,
            user_task_state.task_id as id,
            tasks.title as title,
            tasks.label as label,
            tasks.description as description,
            tasks.type as type,
            tasks.category_id as category_id,
            tasks.reward as reward,
            tasks.icon_url as icon_url,
            tasks.other as other

            from tasks JOIN user_task_state on tasks.id = user_task_state.task_id where user_task_state.user_id = ? and user_task_state.task_id = ?`,
        [userId, taskId]
      );

      return result ? result?.rows[0] : null;
    } catch (error) {
      console.log(error);
      return {} as TaskModel;
    }
  };

  const getUserTaskByTaskId = async (userId: number, taskId: number) => {
    try {
      const result = await fastify.dataBase.select<TaskModel>(
        `select  
            user_task_state.is_complite as is_complite,
            user_task_state.is_rewarded as is_rewarded,
            user_task_state.result as result,
            user_task_state.task_id as id,
            tasks.title as title,
            tasks.label as label,
            tasks.description as description,
            tasks.type as type,
            tasks.category_id as category_id,
            tasks.reward as reward,
            tasks.icon_url as icon_url,
            tasks.other as other

            from tasks JOIN user_task_state on tasks.id = user_task_state.task_id where user_task_state.user_id = ? and user_task_state.task_id = ?`,
        [userId, taskId]
      );

      return result ? result.rows[0] : null;
    } catch (error) {
      console.log(error);
      return {} as TaskModel;
    }
  };

  const createUserTaskStates = async (userId: number) => {
    const tasks = await getTasks();

    if (tasks) {
      for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index];

        if (typeof (await getUserTaskByTaskId(userId, task.id)) == "undefined")
          await createUserTaskState(userId, task.id);
      }
    }
  };

  const createUserTaskState = async (userId: number, taskId: number) => {
    const sql = `INSERT INTO user_task_state (user_id, task_id) VALUES (?,?)`;
    await fastify.dataBase.insert(sql, [userId, taskId]);
  };

  const compliteTask = async (id: number, userId: number, result: string) => {
    const tasks = await fastify.dataBase.update<TaskModel>(
      "update user_task_state set result = ?, is_complite = 1 where task_id = ? and user_id = ?",
      [result, id, userId]
    );
    return tasks;
  };

  const setRewardedTask = async (
    id: number,
    userId: number,
    result: string
  ) => {
    console.log("setRewardedTask", id, userId, result);
    const tasks = await fastify.dataBase.update<TaskModel>(
      "update user_task_state set result = ?, is_rewarded = 1 where task_id = ? and user_id = ?",
      [result, id, userId]
    );
    return tasks;
  };

  const getAllTasks = async () => {
    const sql = `select * from tasks`;
    const result = await fastify.dataBase.select<TaskModel>(sql);
    return result;
  };

  const reimportCat = async () => {
    await fastify.dataBase.query("delete from categories_task;");
    await catImport("./db/catsimport.csv");
  };

  const reimportTasks = async () => {
    await fastify.dataBase.query("delete from tasks;");
    await taskImport("./db/tasksimport.csv");
  };

  await Promise.all([
    catImport("./db/catsimport.csv"),
    taskImport("./db/tasksimport.csv"),
  ]);

  fastify.decorate("modelsTasks", {
    createUserTaskState,
    compliteTask,
    createCategory,
    createTask,
    getCategories,
    categoryExist,
    getUserTasks,
    getUserTask,
    createUserTaskStates,
    setRewardedTask,
    getUserTaskByTaskId,
    getAllTasks,
    reimportCat,
    reimportTasks,
  });
});
