import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import { GeneratorRecoveryBoostModel } from "./dailyBoosts.types";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const createFullGeneratorRecoveryBoost = `
       CREATE TABLE IF NOT EXISTS generatorRecoveryBoost (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        userId bigint NOT NULL,
        amountAttemptsLeft TINYINT,
        previousActivationTime bigint NOT null,
        maxAvailableAttempts int
       );
    `;

  await fastify.dataBase.insert(createFullGeneratorRecoveryBoost);

  const amountAttemptsLeftByUserId = async (userId: number) => {
    const sql = `select amountAttemptsLeft from generatorRecoveryBoost where userId = ? `;
    const result = await fastify.dataBase.select<
      Pick<GeneratorRecoveryBoostModel, "amountAttemptsLeft">
    >(sql, [userId]);

    return result?.rows[0]?.amountAttemptsLeft ?? null;
  };

  const getGeneratorRecoveryBoostInfoByUserId = async (userId: number) => {
    const sql = `select * from generatorRecoveryBoost where userId = ? `;
    const result = await fastify.dataBase.select<GeneratorRecoveryBoostModel>(
      sql,
      [userId]
    );

    return result?.rows[0] ?? null;
  };

  const getMaxAvailableAttempts = async () => {
    const sql = `select maxAvailableAttempts from generatorRecoveryBoost limit 1`;
    const result = await fastify.dataBase.select<
      Pick<GeneratorRecoveryBoostModel, "maxAvailableAttempts">
    >(sql);

    return result?.rows[0]?.maxAvailableAttempts ?? null;
  };

  const reduceUserAttemptsForRecoverGenerator = async (
    userId: number,
    amount: number
  ) => {
    const sql = `update generatorRecoveryBoost set amountAttemptsLeft = amountAttemptsLeft - ?,previousActivationTime = ?   where userId = ?`;
    await fastify.dataBase.insert(sql, [amount, Date.now(), userId]);
  };

  const addUserIntoTable = async (
    userId: number,
    attemptsLeft: number,
    previousActivationTime: number,
    maxAvailableAttempts: number
  ) => {
    const sql = `insert into generatorRecoveryBoost (userId,amountAttemptsLeft,previousActivationTime,maxAvailableAttempts) VALUES (?,?,?,?);`;
    await fastify.dataBase.insert(sql, [
      userId,
      attemptsLeft,
      previousActivationTime,
      maxAvailableAttempts,
    ]);
  };

  const getPreviousActivationTime = async (userId: number) => {
    const sql = `select previousActivationTime from generatorRecoveryBoost where userId = ?`;
    const result = await fastify.dataBase.select<
      Pick<GeneratorRecoveryBoostModel, "previousActivationTime">
    >(sql, [userId]);
    return result?.rows[0]?.previousActivationTime ?? null;
  };

  fastify.decorate("generatorRecoveryBoost", {
    reduceUserAttemptsForRecoverGenerator,
    getMaxAvailableAttempts,
    getGeneratorRecoveryBoostInfoByUserId,
    amountAttemptsLeftByUserId,
    addUserIntoTable,
    getPreviousActivationTime,
  });
});
