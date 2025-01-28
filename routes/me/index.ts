"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  const FIRST_LEVEL_BALANCE_AMOUNT = Number(
    fastify.config.firstLevelPowerBalanceAmount ?? 500
  );

  fastify.get(
    "/",
    { onRequest: [fastify.auth] },
    async function (request, reply) {
      const _user = fastify.getUser(request);

      const user = await fastify.modelsUser.getUser(_user.id);
      const [currentGeneratorSkin, currentBatterySkin] = await Promise.all([
        fastify.skinsShop.getInfoAboutSkin(user?.selectedGeneratorSkinId ?? 1),
        fastify.skinsShop.getInfoAboutSkin(user?.selectedBatterySkinId ?? 11),
      ]);

      const obj = { balance: 0, power_balance: 0 };

      if (user && user.wallet) {
        const { token_balance } = await fastify.utils.getBalances(user.wallet);

        obj.balance = token_balance;
      } else {
        obj.balance = 0;
      }

      const data = await fastify.miningPower.getMiningData(_user.id);

      if (data) {
        obj.power_balance = data.power_balance;

        await fastify.miningPower.updatePoeBalance(_user.id, obj.balance);
      }

      let userMiningLevel = data?.level ?? 0;

      if (
        data &&
        data.level === 0 &&
        data.power_balance > FIRST_LEVEL_BALANCE_AMOUNT
      ) {
        const level = fastify.calculationUtils.calculateUserMiningLevel(
          data.power_balance,
          FIRST_LEVEL_BALANCE_AMOUNT
        );

        await fastify.miningPower.setUserLevel(_user.id, level);

        userMiningLevel = level;
      }

      const notificationsAmount =
        await fastify.transactionsNotifications.getNotificationAmount(_user.id);

      return {
        ...user,
        ...obj,
        currentGeneratorSkinUrl: currentGeneratorSkin?.imageUrl ?? "",
        currentBatterySkinUrl: currentBatterySkin?.imageUrl ?? "",
        level: userMiningLevel,
        nextLevelPowerBalance: fastify.calculationUtils.getNextMiningLevelEdge(
          userMiningLevel,
          FIRST_LEVEL_BALANCE_AMOUNT
        ),
        notifications: notificationsAmount,
      };
    }
  );
}
