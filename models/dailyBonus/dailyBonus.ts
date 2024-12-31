import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";

import {
  AbleToClaimInfo,
  DailyGiftModel,
  UserClaimedGifts,
} from "./dailyBonus.types";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const createDailyGiftsTable = `
    CREATE TABLE IF NOT EXISTS dailyGifts (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        day TINYINT not null,
        gift int not null
        )`;

  const createUserClaimedGift = `
     CREATE TABLE IF NOT EXISTS userClaimedGifts (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        userId bigint NOT NULL ,
        lastClaimedGiftId int NOT NULL,
        isAlreadyClaim BOOLEAN DEFAULT false,
        claimCounter TINYINT DEFAULT 0,
        lastClaimTime BIGINT,
        FOREIGN KEY (lastClaimedGiftId) REFERENCES dailyGifts(id) ON DELETE CASCADE
     )
    `;

  await fastify.dataBase.insert(createDailyGiftsTable);
  await fastify.dataBase.insert(createUserClaimedGift);

  const getAllDailyGifts = async () => {
    const sql = `select * from dailyGifts;`;
    const result = await fastify.dataBase.select<DailyGiftModel>(sql);
    return result?.rows ?? null;
  };
  const getDailyGiftById = async (id: number) => {
    const sql = `select * from dailyGifts where id = ?`;
    const result = await fastify.dataBase.select<DailyGiftModel>(sql, [id]);

    return result?.rows[0] ?? null;
  };

  const getDailyGiftByDay = async (day: number) => {
    const sql = `select * from dailyGifts where day = ?`;
    const result = await fastify.dataBase.select<DailyGiftModel>(sql, [day]);

    return result?.rows[0] ?? null;
  };

  const getIsUserAbleToClaimGift = async (userId: number) => {
    const sql = `select isAlreadyClaim,claimCounter,lastClaimedGiftId from userClaimedGifts where userId = ?`;
    const result = await fastify.dataBase.select<AbleToClaimInfo>(sql, [
      userId,
    ]);

    return result?.rows[0] ?? null;
  };

  const getUserLastClaimedGift = async (userId: number) => {
    const sql = `select * from dailyGifts join userClaimedGifts on dailyGifts.id = userClaimedGifts.lastClaimedGiftId where userClaimedGifts.userId = ?`;
    const result = await fastify.dataBase.select<DailyGiftModel>(sql, [userId]);

    return result?.rows[0] ?? null;
  };

  const claimGiftFirstTime = async (userId: number, giftId: number) => {
    const sql = `insert into userClaimedGifts (userId,lastClaimedGiftId,isAlreadyClaim,claimCounter,lastClaimTime) values (?,?,?,?,?)`;
    await fastify.dataBase.insert(sql, [userId, giftId, true, 1, Date.now()]);
  };

  const claimDailyGift = async (userId: number, giftId: number) => {
    const sql = `update userClaimedGifts set lastClaimedGiftId = ?,claimCounter = claimCounter + 1,isAlreadyClaim = true,lastClaimTime = ? where userId = ? `;
    await fastify.dataBase.update(sql, [giftId, Date.now(), userId]);
  };

  const resetDailyGiftProgressForUser = async (userId: number) => {
    const sql = `update userClaimedGifts set lastClaimedGiftId = 0, isAlreadyClaim = false, claimCounter = 0, lastClaimTime = ? where userId = ? `;
    await fastify.dataBase.update(sql, [Date.now(), userId]);
  };

  const getLastClaimTime = async (userId: number) => {
    const sql = `select lastClaimTime from userClaimedGifts where userId = ?`;
    const result = await fastify.dataBase.select<
      Pick<UserClaimedGifts, "lastClaimTime">
    >(sql, [userId]);

    return result?.rows[0]?.lastClaimTime ?? 0;
  };

  fastify.decorate("dailyGiftService", {
    getDailyGiftById,
    getDailyGiftByDay,
    getIsUserAbleToClaimGift,
    getUserLastClaimedGift,
    getAllDailyGifts,
    claimDailyGift,
    claimGiftFirstTime,
    getLastClaimTime,
    resetDailyGiftProgressForUser,
  });
});
