import { FastifyInstance } from "fastify";

const DEFAULT_RECOVERY_LIMIT = 3600;

export default async function (fastify: FastifyInstance) {
  const MAX_AVAILABLE_ATTEMPTS =
    (await fastify.generatorRecoveryBoost.getMaxAvailableAttempts()) ??
    Number(fastify.config.maxAvailableAttemptsToRecoveryGenerator);

  const RECOVERY_PERIOD_LIMIT =
    Number(await fastify.config.recoveryGeneratorBootsActivationPeriodLimit) ??
    DEFAULT_RECOVERY_LIMIT;

  fastify.get(
    "/useDailyRecovery",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      const leftAttemptsForUser =
        await fastify.generatorRecoveryBoost.amountAttemptsLeftByUserId(
          user.id
        );

      if (leftAttemptsForUser === 0) {
        return reply.badRequest(
          "It not able to recover generator because of user attempts is 0"
        );
      }

      const previousActivationTime =
        (await fastify.generatorRecoveryBoost.getPreviousActivationTime(
          user.id
        )) ?? 0;

      if (Date.now() - previousActivationTime < RECOVERY_PERIOD_LIMIT) {
        return reply.badRequest(
          "Less than an 1 hour has passed since the last activation"
        );
      }

      let attemptsLeftResult = 0;

      if (leftAttemptsForUser === null) {
        await fastify.generatorRecoveryBoost.addUserIntoTable(
          user.id,
          MAX_AVAILABLE_ATTEMPTS - 1,
          Date.now(),
          MAX_AVAILABLE_ATTEMPTS
        );

        attemptsLeftResult = MAX_AVAILABLE_ATTEMPTS - 1;
      } else {
        await fastify.generatorRecoveryBoost.reduceUserAttemptsForRecoverGenerator(
          user.id,
          1
        );

        attemptsLeftResult = leftAttemptsForUser - 1;
      }

      await fastify.miningPower.recoverGeneratorBalance(user.id);

      return { status: "ok", leftAmount: attemptsLeftResult };
    }
  );

  fastify.get(
    "/getRecoveryBoostInfo",
    { onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);

      const leftAttemptsForUser =
        await fastify.generatorRecoveryBoost.amountAttemptsLeftByUserId(
          user.id
        );

      const previousActivationTime =
        (await fastify.generatorRecoveryBoost.getPreviousActivationTime(
          user.id
        )) ?? 0;

      const timeLeftBeforeNewAttempt =
        RECOVERY_PERIOD_LIMIT - (Date.now() - previousActivationTime) / 1000;

      return {
        status: "ok",
        leftAttempts: leftAttemptsForUser ?? MAX_AVAILABLE_ATTEMPTS,
        timeLeftBeforeNewAttempt: Math.max(0, timeLeftBeforeNewAttempt),
      };
    }
  );
}
