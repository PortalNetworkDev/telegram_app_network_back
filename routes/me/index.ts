"use strict";

import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
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

      return {
        ...user,
        ...obj,
        currentGeneratorSkinUrl: currentGeneratorSkin?.imageUrl ?? "",
        currentBatterySkinUrl: currentBatterySkin?.imageUrl ?? "",
      };
    }
  );
}
