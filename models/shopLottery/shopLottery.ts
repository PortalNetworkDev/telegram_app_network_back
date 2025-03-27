import createPlugin from "fastify-plugin";

import { LotteryGiftModel } from "./shopLottery.types";

export default createPlugin(async function (fastify, opts) {
  const createLotteryTable = `
         CREATE TABLE IF NOT EXISTS lotteryGifts (
          id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          type CHAR(255) NOT NULL,
          value FLOAT,
          imageUrl CHAR(255) NOT NULL,
          chanceToRoll FLOAT NOT NULL
         );
    `;

  await fastify.dataBase.insert(createLotteryTable);

  const getLotteryGiftById = async (giftId: number) => {
    const sql = `select * from lotteryGifts where id = ?`;
    const result = await fastify.dataBase.select<LotteryGiftModel>(sql, [
      giftId,
    ]);
    return result?.rows[0] ?? null;
  };

  const getAllLotteryGifts = async () => {
    const sql = `select * from lotteryGifts`;
    const result = await fastify.dataBase.select<LotteryGiftModel>(sql);
    return result?.rows;
  };

  fastify.decorate("shopLottery",{
    getLotteryGiftById,
    getAllLotteryGifts
  })
});
