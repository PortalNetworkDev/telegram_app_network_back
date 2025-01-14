"use strict";

import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import { MiningLevel, MiningPowerModal } from "./miningPower.types";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const miningData = `
        CREATE TABLE IF NOT EXISTS mining_data (
            rowid bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id bigint NOT NULL,
            poe_balance float NOT NULL DEFAULT 0,
            level int NOT NULL DEFAULT 0,
            power_balance bigint NOT NULL DEFAULT 0,
            battery_balance bigint NOT NULL DEFAULT 0,
            battery_capacity bigint NOT NULL DEFAULT 0,
            battery_level int NOT NULL DEFAULT 0,
            generator_limit bigint NOT NULL DEFAULT 0,
            generator_balance bigint NOT NULL DEFAULT 0,
            generator_level int NOT NULL DEFAULT 0,
            multitab int NOT NULL DEFAULT 1,
            time_last_spin TEXT NOT NULL,
            time_last_claim TEXT NOT NULL,
            time_last_update TEXT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
  await fastify.dataBase.insert(miningData);

  async function createUserMiningData(
    userId: number,
    batteryCapacity: number,
    generatorLimit: number
  ) {
    const sql = `INSERT INTO mining_data (user_id, battery_capacity, generator_limit, generator_balance, time_last_spin, time_last_claim, time_last_update) VALUES (?,?,?,?,?,?,?)`;
    const now = new Date();
    const values = [
      userId,
      batteryCapacity,
      generatorLimit,
      generatorLimit,
      now,
      now,
      now,
    ];

    const insertedData = await fastify.dataBase.insert<MiningPowerModal>(
      sql,
      values
    );
    return insertedData;
  }

  async function getMiningData(userId: number) {
    const sql = `select * from mining_data where user_id=?`;
    const result = await fastify.dataBase.select<MiningPowerModal>(sql, [
      userId,
    ]);

    if (!result?.rows.length) {
      console.log("Creating mining data for user", userId);
      const result = await createUserMiningData(
        userId,
        Number(fastify.config.batteryStart),
        Number(fastify.config.generatorStart)
      );

      return result ? result.rows[0] : null;
    }

    return result.rows[0];
  }

  async function updatePowerBalance(userId: number, powerBalance: number) {
    const sql = `update mining_data set power_balance = ? where user_id = ?`;
    await fastify.dataBase.update(sql, [powerBalance, userId]);
  }

  async function addPowerBalance(userId: number, addPowerBalance: number) {
    const sql = `update mining_data set power_balance = power_balance+? where user_id = ?`;
    await fastify.dataBase.update(sql, [addPowerBalance, userId]);
  }

  async function subtractPowerBalance(userId: number, addPowerBalance: number) {
    const sql = `update mining_data set power_balance = power_balance-? where user_id = ?`;
    await fastify.dataBase.update(sql, [addPowerBalance, userId]);
  }

  async function updateBatteryBalance(userId: number, batteryBalance: number) {
    const sql = `update mining_data set battery_balance = ? where user_id = ?`;
    await fastify.dataBase.update(sql, [batteryBalance, userId]);
  }

  async function updateGeneratorBalance(
    userId: number,
    generatorBalance: number
  ) {
    const sql = `update mining_data set generator_balance = ? where user_id = ?`;
    await fastify.dataBase.update(sql, [generatorBalance, userId]);
  }

  async function recoverGeneratorBalance(userId: number) {
    const sql = `update mining_data set generator_balance = generator_limit where user_id = ? `;
    await fastify.dataBase.update(sql, [userId]);
  }

  async function updatePoeBalance(userId: number, poeBalance: number) {
    const sql = `update mining_data set poe_balance = ? where user_id = ?`;
    await fastify.dataBase.update(sql, [poeBalance, userId]);
  }

  async function updateBatteryCapacity(
    userId: number,
    batteryCapacity: number
  ) {
    const sql = `update mining_data set battery_capacity = ? where user_id = ?`;
    await fastify.dataBase.update(sql, [batteryCapacity, userId]);
  }

  async function updateGeneratorLimit(userId: number, generatorLimit: number) {
    const sql = `update mining_data set generator_limit = ? where user_id = ?`;
    await fastify.dataBase.update(sql, [generatorLimit, userId]);
  }

  async function addPoeBalance(userId: number, amount: number) {
    const sql = `update mining_data set poe_balance = poe_balance+ ? where user_id = ?`;
    await fastify.dataBase.update(sql, [amount, userId]);
  }

  async function claimBattery(userId: number) {
    const sql = `update mining_data set power_balance=power_balance+battery_balance, battery_balance = 0, time_last_claim = ? where user_id = ?`;
    const now = new Date();
    await fastify.dataBase.update(sql, [now, userId]);
  }

  async function generatingEnergy(
    userId: number,
    generatorBalance: number,
    batteryBalance: number
  ) {
    const sql = `update mining_data set generator_balance = ?, battery_balance = ?, time_last_spin = ?, time_last_update = ? where user_id = ?`;
    const now = new Date();

    await fastify.dataBase.update(sql, [
      generatorBalance,
      batteryBalance,
      now,
      now,
      userId,
    ]);
  }

  async function updateBatteryGeneratorBalance(
    userId: number,
    batteryBalance: number,
    generatorBalance: number
  ) {
    const sql = `update mining_data set generator_balance = ?, battery_balance = ?, time_last_update = ? where user_id = ?`;
    const now = new Date();

    await fastify.dataBase.update(sql, [
      generatorBalance,
      batteryBalance,
      now,
      userId,
    ]);
  }

  async function buyBatteryCapacity(
    userId: number,
    batteryCapacity: number,
    price: number
  ) {
    const sql = `update mining_data set battery_capacity = ?, power_balance=power_balance-?, battery_level=battery_level+1 where user_id = ?`;
    await fastify.dataBase.update(sql, [batteryCapacity, price, userId]);
  }

  async function buyGeneratorLimit(
    userId: number,
    generatorLimit: number,
    price: number
  ) {
    const sql = `update mining_data set generator_limit = ?, power_balance=power_balance-?, generator_level=generator_level+1 where user_id = ?`;
    await fastify.dataBase.update(sql, [generatorLimit, price, userId]);
  }

  async function buyMultitab(userId: number, price: number) {
    const sql = `update mining_data set power_balance=power_balance-?, multitab=multitab+1 where user_id = ?`;
    await fastify.dataBase.update(sql, [price, userId]);
  }

  async function reduceUserPowerBalance(userId: number, amount: number) {
    const sql = `update mining_data set power_balance=power_balance-? where user_id = ?`;
    await fastify.dataBase.update(sql, [amount, userId]);
  }

  async function getUserPowerBalance(userId: number) {
    const query = "select power_balance from mining_data where user_id = ?";
    const result = await fastify.dataBase.select(query, [userId]);

    const { power_balance } = result?.rows[0] as MiningPowerModal;

    return power_balance;
  }

  async function getUserMiningLevel(userId: number) {
    const sql = "select level from mining_data where user_id = ?";
    const result = await fastify.dataBase.select<MiningLevel>(sql, [userId]);

    return result?.rows[0]?.level ?? 0;
  }

  async function setUserLevel(userId: number, level: number) {
    const sql = `update mining_data set level = ? where user_id=?`;
    await fastify.dataBase.update(sql, [level, userId]);
  }

  fastify.decorate("miningPower", {
    createUserMiningData,
    getMiningData,
    updatePowerBalance,
    addPowerBalance,
    updateBatteryBalance,
    updateBatteryCapacity,
    updateGeneratorLimit,
    updateGeneratorBalance,
    claimBattery,
    generatingEnergy,
    updatePoeBalance,
    updateBatteryGeneratorBalance,
    buyBatteryCapacity,
    buyGeneratorLimit,
    buyMultitab,
    getUserPowerBalance,
    subtractPowerBalance,
    reduceUserPowerBalance,
    addPoeBalance,
    recoverGeneratorBalance,
    setUserLevel,
    getUserMiningLevel,
  });
});
