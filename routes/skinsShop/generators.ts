import { FastifyInstance } from "fastify";
import { SkinType } from "../../models/skinsShop/skins.types";
import { ShopItem } from "./generators.types";
import {
  buyOrSelectSkinBodySchema,
  getAllSkinsByTypeQueryParamsSchema,
  getItemsBodySchema,
  getSkinInfoQueryParamsSchema,
} from "./generators.schemes.js";

export default async function (fastify: FastifyInstance) {

  fastify.post<{ Body: { skinType: string } }>(
    "/getItems",
    { schema: { body: getItemsBodySchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const { id: userId } = fastify.getUser(request);

      const { skinType } = request.body;

      const [boughtSkins, allSkins] = await Promise.all([
        fastify.skinsShop.getAllSkinsForUser(
          userId,
          skinType as keyof typeof SkinType
        ),
        fastify.skinsShop.getAllSkinsByType(skinType as keyof typeof SkinType),
      ]);

      if (allSkins) {
        const skins = allSkins.map<ShopItem>((item) => {
          const isPurchased = !!boughtSkins?.find(
            (boughtSkin) => boughtSkin.id === item.id
          );

          return { ...item, isPurchased };
        });

        return {
          status: "ok",
          items: skins,
        };
      }

      return reply.badRequest(`No skins with this type: ${skinType}`);
    }
  );

  fastify.post<{ Body: { skinId: number } }>(
    "/buySkin",
    { schema: { body: buyOrSelectSkinBodySchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);
      const { skinId } = request.body;

      const userMiningData = await fastify.miningPower.getMiningData(user.id);

      if (userMiningData && userMiningData?.power_balance >= 5000) {
        await fastify.miningPower.reduceUserPowerBalance(user.id, 5000);
        await fastify.skinsShop.addPurchasedSkin(user.id, skinId);
      } else {
        return reply.badRequest("User does not have enough funds");
      }

      return { status: "ok" };
    }
  );

  fastify.post<{ Body: { userId: number; skinId: number } }>(
    "/selectSkin",
    { schema: { body: buyOrSelectSkinBodySchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);
      const { skinId } = request.body;
      const boughtSkins = await fastify.skinsShop.getAllBoughtSkinsForUser(
        user.id
      );

      if (boughtSkins && boughtSkins.find((item) => item.skinId === skinId)) {
        await fastify.modelsUser.selectUserGeneratorSkin(user.id, skinId);

        return { status: "ok" };
      }

      return reply.badRequest("User did not purchased this skin");
    }
  );

  fastify.get<{ Querystring: { id: number } }>(
    "/getSkinInfo",
    {
      schema: { querystring: getSkinInfoQueryParamsSchema },
      onRequest: [fastify.auth],
    },
    async (request, reply) => {
      const result = await fastify.skinsShop.getInfoAboutSkin(request.query.id);

      if (result) {
        return { status: "ok", item: result[0] };
      }

      return reply.badRequest(
        `No info about skin with this id: ${request.query.id}`
      );
    }
  );

  fastify.get<{ Querystring: { type: string } }>(
    "/getAllSkinsByType",
    {
      schema: { querystring: getAllSkinsByTypeQueryParamsSchema },
      onRequest: [fastify.auth],
    },
    async (request, reply) => {
      if (request.query.type) {
        const result = await fastify.skinsShop.getAllSkinsByType(
          request.query.type as keyof typeof SkinType
        );

        if (result) {
          return result;
        }
        return reply.badRequest(
          `No skins with this type: ${request.query.type}`
        );
      }
    }
  );
}
