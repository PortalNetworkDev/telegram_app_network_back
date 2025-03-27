"use strict";

import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import { UserModel } from "../user/user.types";
import { BalanceHistoryModel, UserModelWithBalanceHistoryInfo } from "./balanceHistory.types";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {

  const balanceHistory = `
        CREATE TABLE IF NOT EXISTS balance_history (
            id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id bigint NOT NULL,
            token_balance float NOT NULL,
            pool_balance float NOT NULL,
            create_time date NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
  await fastify.dataBase.insert(balanceHistory);

  async function addHistory(
    userId: number,
    tokenBalance: number,
    poolBalance: number
  ) {
    const sql = `INSERT INTO balance_history (user_id, token_balance, pool_balance, create_time) VALUES (?,?,?,NOW())`;

    const values = [userId, tokenBalance, poolBalance];

    await fastify.dataBase.insert(sql, values);
  }

  async function getHoleInHistoryTokenBalance(userId: number, period = 14) {
    const sql = `select * from balance_history where user_id=? and token_balance > 0 and create_time >= (NOW() - INTERVAL ? DAY) `;
    const result = await fastify.dataBase.select(sql, [userId, period]);

    return result?.rows ? (result.rows as BalanceHistoryModel[]) : null;
  }

  async function checkTokenBalanceByPeriod(userId: number, period = 14) {
    const elements = await getHoleInHistoryTokenBalance(userId, period);

    if (elements && elements.length <= period) return false;

    return true;
  }

  async function getHoleInHistoryPoolBalance(userId: number) {
    const sql = `select * from balance_history where user_id=? and pool_balance > 0`;
    const result = await fastify.dataBase.select(sql, [userId]);

    return result?.rows ? (result.rows as BalanceHistoryModel[]) : null;
  }

  async function checkPoolBalanceByPeriod(userId: number, period = 14) {
    const elements = await getHoleInHistoryPoolBalance(userId);

    if (elements && elements.length <= period) return false;

    return true;
  }

  //TODO: тут добавляеться новый параметр  подумать что делать с типами в таких случаях если есть доп параметр
  async function getUsersWhoNotSetBalanceHistoryToday() {
    const sql = `select 
        users.id, 
        users.wallet as wallet, 
        (select create_time 
            from balance_history 
            where user_id=users.id 
            and create_time > (NOW() - INTERVAL 1 DAY) limit 1
        ) as create_time 
        from users 
        where wallet != "";`;

    /*const sql = `SELECT
        users.id AS user_id,
        users.wallet AS wallet,
        (SELECT create_time
         FROM balance_history
         WHERE user_id = users.id
           AND create_time >= (NOW() - INTERVAL 1 DAY) limit 1
        ) AS create_time
        FROM users
        WHERE wallet != ""
        AND users.id IN (
          SELECT user_id
          FROM user_task_state
          WHERE task_id = 8
            AND is_complite = 0
        );`*/
    //добавлено что не выполнено задание 8
    const result = await fastify.dataBase.select<UserModelWithBalanceHistoryInfo>(sql);

    return result?.rows ? result.rows : null;
  }

  //TODO: проверить result?.rows[0].count;
  async function checkDaysInHistoryTokenBalance(userId: number, period = 3) {
    const sql = `
        SELECT COUNT(*) AS count 
        FROM balance_history 
        WHERE user_id = ? 
        AND token_balance > 0 
    `;
    const result = await fastify.dataBase.select<BalanceHistoryModel>(sql, [
      userId,
    ]);
     // @ts-ignore: Unreachable code error
    const count = result?.rows[0].count;

    if (count >= period) return true;

    return false;
  }

  fastify.decorate("modelsBalanceHistory", {
    addHistory,
    getHoleInHistoryTokenBalance,
    checkTokenBalanceByPeriod,
    getHoleInHistoryPoolBalance,
    checkPoolBalanceByPeriod,
    getUsersWhoNotSetBalanceHistoryToday,
    checkDaysInHistoryTokenBalance,
  });
});
