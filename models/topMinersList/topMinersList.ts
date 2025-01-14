import createPlugin from "fastify-plugin";
import { TopMinerListItemModel } from "./topMinersList.types";
export default createPlugin(async function (fastify, opts) {
  const createTable = `
    CREATE TABLE IF NOT EXISTS topMinersList (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            userId BIGINT NOT NULL,
            powerBalance FLOAT DEFAULT 0,
            level int NOT NULL DEFAULT 0
        )`;

  await fastify.dataBase.insert(createTable);

  const getUserCurrentPosition = async (userId: number) => {
    const sql = `select id from topMinersList where userId = ?`;
    const result = await fastify.dataBase.select<
      Pick<TopMinerListItemModel, "id">
    >(sql, [userId]);

    return result?.rows[0]?.id ?? null;
  };

  const getUsersFromList = async (page: number, limit = 30) => {
    const sql = `select * from topMinersList limit ${limit} offset ${
      limit * page
    }`;

    const result = await fastify.dataBase.select<TopMinerListItemModel>(sql);

    return result?.rows ?? null;
  };

  const getMinersListLength = async () => {
    const sql = `select count(*) as count from topMinersList`;
    const result = await fastify.dataBase.query<{ count: number }>(sql);
    return result?.rows[0].count ?? 0;
  };

  fastify.decorate("topMinersListService", {
    getUserCurrentPosition,
    getUsersFromList,
    getMinersListLength,
  });
});
