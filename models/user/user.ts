"use strict";

import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import { ReferralUser, User, UserModel } from "./user.types";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id BIGINT NOT NULL, 
            wallet VARCHAR(255) NOT NULL , 
            first_name VARCHAR(255) NOT NULL , 
            last_name VARCHAR(255) NOT NULL , 
            username VARCHAR(255) NOT NULL , 
            language_code VARCHAR(3) NOT NULL , 
            is_premium BOOLEAN NOT NULL , 
            allows_write_to_pm BOOLEAN NOT NULL , 
            referal_reward FLOAT NOT NULL , 
            last_updated BIGINT NOT NULL ,
            tg_token TEXT,
            selectedGeneratorSkinId INT,
            selectedBatterySkinId INT,
            PRIMARY KEY (\`id\`)
        ) ENGINE = InnoDB CHARSET=utf8mb3 COLLATE utf8mb3_general_ci;
    `;

  const userReferalsTable = `
        CREATE TABLE IF NOT EXISTS referal_users (
            user_id BIGINT NOT NULL,
            referal_user_id BIGINT NOT NULL,
            reward FLOAT NOT NULL,
            is_rewarded BOOLEAN DEFAULT 0,
            last_updated BIGINT
        ) ENGINE = InnoDB CHARSET=utf8mb3 COLLATE utf8mb3_general_ci;`;

  await fastify.dataBase.insert(usersTable);
  await fastify.dataBase.insert(userReferalsTable);

  const createUser = async (user: User, tgToken: string) => {
    if (user.first_name)
      user.first_name = user.first_name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ ]/g, "");

    if (user.last_name)
      user.last_name = user.last_name.replace(/[^a-zA-Z0-9а-яА-ЯёЁ ]/g, "");

    const sql = `INSERT INTO users (id, first_name,last_name,username,language_code,is_premium,allows_write_to_pm, last_updated,referal_reward,wallet, tg_token) 
        VALUES (?, ?,?,?,?,?,?, ?,?,"",?)`;
    const values = [
      user.id,
      user.first_name,
      user.last_name ? user.last_name : "",
      user.username ? user.username : "",
      user.language_code,
      user.is_premium ? user.is_premium : 0,
      user.allows_write_to_pm ? user.allows_write_to_pm : 0,
      Date.now(),
      fastify.config.referalreward,
      tgToken,
    ];

    await fastify.dataBase.insert(sql, values);
  };

  const addReferralUser = async (userId: number, referralUserId: number) => {
    const user = await getUser(userId);

    const sql = `INSERT INTO referal_users (user_id, referal_user_id, reward, is_rewarded, last_updated)
        VALUES (?, ?, ?, ?, ?)
        `;
    const values = [
      userId,
      referralUserId,
      user?.referal_reward ?? 0,
      0,
      Date.now(),
    ];
    await fastify.dataBase.insert(sql, values);

    await fastify.miningPower.getMiningData(userId); //проверка данных пользователя
    await fastify.miningPower.getMiningData(referralUserId); //проверка данных пользователя
    await fastify.miningPower.addPowerBalance(
      userId,
      Number(fastify.config.forReferalPowerReward)
    );
    await fastify.miningPower.addPowerBalance(
      referralUserId,
      Number(fastify.config.toReferalPowerReward)
    );
  };

  const checkReferaluser = async (userId: number, referralUserId: number) => {
    const result = await fastify.dataBase.select<UserModel>(
      "select * from referal_users where user_id = ? and referal_user_id = ?",
      [userId, referralUserId]
    );

    if (!result?.rows.length) {
      return false;
    } else {
      return true;
    }
  };

  //TODO: check this method and query
  const countReferalUsers = async (userId: number) => {
    const result = await fastify.dataBase.select<ReferralUser>(
      "select count(*) from referal_users JOIN user_task_state on user_task_state.user_id = referal_users.referal_user_id where referal_users.user_id = ? and user_task_state.task_id = 5 and user_task_state.is_complite = 1",
      [userId]
    );

    if (result?.rows) {
      // @ts-ignore: Unreachable code error
      return result.rows[0]["count(*)"] as number;
    }
    return 0;
  };

  const getReferalUsersUnrewarded = async (userId: number) => {
    const result = await fastify.dataBase.select<ReferralUser>(
      `
            select  
            referal_users.user_id as user_id,
            referal_users.referal_user_id as referal_user_id,
            referal_users.reward as reward,
            referal_users.is_rewarded as is_rewarded,
            referal_users.last_updated as last_updated
            from referal_users JOIN user_task_state on user_task_state.user_id = referal_users.referal_user_id where referal_users.user_id = ? and referal_users.is_rewarded = 0 and user_task_state.task_id = 5 and user_task_state.is_complite = 1;
        `,
      [userId]
    );
    return result;
  };

  const getReferalUsersUnrewardedSpecial = async (userId: number) => {
    const result = await fastify.dataBase.select<ReferralUser>(
      `
            select  
            referal_users.user_id as user_id,
            referal_users.referal_user_id as referal_user_id,
            referal_users.reward as reward,
            referal_users.is_rewarded as is_rewarded,
            referal_users.last_updated as last_updated
            from referal_users JOIN user_task_state on user_task_state.user_id = referal_users.referal_user_id where referal_users.user_id = ? and referal_users.is_rewarded = 0 and user_task_state.task_id = 4 and user_task_state.is_complite = 1;
        `,
      [userId]
    );
    return result;
  };

  const setRewarded = async (userId: number, referalUserId: number) => {
    const sql = `update referal_users set is_rewarded = 1 where user_id = ? and referal_user_id = ?`;
    console.log("setRewarded", userId, referalUserId);
    await fastify.dataBase.update(sql, [userId, referalUserId]);
  };

  const updateLastUpdated = async (userId: number) => {
    const sql = `update users set last_updated = ? where id = ?`;
    await fastify.dataBase.update(sql, [Date.now(), userId]);
  };

  const updateWallet = async (userId: number, wallet: string) => {
    const sql = `update users set wallet = ? where id = ?`;
    await fastify.dataBase.update(sql, [wallet, userId]);
  };

  const sameWalletExist = async (userId: number, wallet: string) => {
    const result = await fastify.dataBase.select<UserModel>(
      "select count(*) from users where wallet = ? and id != ?",
      [wallet, userId]
    );
    // @ts-ignore: Unreachable code error
    if (result?.rows[0]["count(*)"] > 0) {
      return true;
    }

    return false;
  };

  const updateReward = async (userId: number, referalReward: number) => {
    const sql = `update users set referal_reward = ? where id = ?`;
    await fastify.dataBase.update<UserModel>(sql, [referalReward, userId]);
  };

  const userExist = async (userId: number) => {
    const result = await fastify.dataBase.select<UserModel>(
      "select * from users where id = ?",
      [userId]
    );

    if (!result?.rows.length) {
      return false;
    } else {
      return true;
    }
  };

  const getUserByNickname = async (nickname: string) => {
    let result = null;
    try {
      result = await fastify.dataBase.select<UserModel>(
        "select * from users where username = ?",
        [nickname]
      );
    } catch (error) {
      fastify.log.error("error when try to get user by nickname form db");
      return null;
    }
    return result?.rows[0] ?? null;
  };

  const getUser = async (userId: number) => {
    const result = await fastify.dataBase.select<UserModel>(
      "select * from users where id = ?",
      [userId]
    );
    if (!result?.rows.length) {
      return null;
    } else {
      return result?.rows[0];
    }
  };

  const getUsers = async () => {
    const result = await fastify.dataBase.select<UserModel>(
      "select * from users"
    );

    return result?.rows ? result?.rows : null;
  };

  const getActiveUsers = async () => {
    const result = await fastify.dataBase.select<UserModel>(
      "select * from users where last_updated > UNIX_TIMESTAMP(NOW() - INTERVAL 1 HOUR)*1000"
    );
    return result?.rows ? result?.rows : null;
  };

  const checkAirDropUser = async (userId: number, referalUserId: number) => {
    const result = await fastify.dataBase.select(
      "select * from referal_users where user_id = ? and referal_user_id = ? and is_rewarded = 0",
      [userId, referalUserId]
    );

    if (!result?.rows.length) {
      return false;
    } else {
      return true;
    }
  };

  const selectUserGeneratorSkin = async (userId: number, skinId: number) => {
    const sql = `update users set selectedGeneratorSkinId = ? where id = ? `;
    fastify.dataBase.update<UserModel>(sql, [skinId, userId]);
  };
  const selectUserBatterySkin = async (userId: number, skinId: number) => {
    const sql = `update users set selectedBatterySkinId = ? where id = ? `;
    fastify.dataBase.update<UserModel>(sql, [skinId, userId]);
  };

  if (!(await userExist(1)))
    await createUser(
      {
        id: 1,
        first_name: "Durov",
        last_name: "Tester",
        username: "durov",
        language_code: "ru",
        is_premium: true,
        allows_write_to_pm: true,
        wallet: "",
      },
      ""
    );

  fastify.decorate("modelsUser", {
    createUser,
    userExist,
    updateLastUpdated,
    updateWallet,
    sameWalletExist,
    getUser,
    addReferralUser,
    checkReferaluser,
    getUsers,
    updateReward,
    getActiveUsers,
    getReferalUsersUnrewarded,
    getReferalUsersUnrewardedSpecial,
    setRewarded,
    countReferalUsers,
    checkAirDropUser,
    getUserByNickname,
    selectUserGeneratorSkin,
    selectUserBatterySkin
  });
});
