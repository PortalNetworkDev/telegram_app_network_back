import { FastifyInstance } from "fastify";
import { SkinType } from "../../models/skinsShop/skins.types.js";
import { ShopItem } from "./skinsShop.types";
import {
  buyOrSelectSkinBodySchema,
  getAllSkinsByTypeQueryParamsSchema,
  getItemsBodySchema,
  getSkinInfoQueryParamsSchema,
} from "./skinsShopRoutes.schemes.js";

const DEFAULT_SKIN_PRICE = 5000;

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: { skinType: string } }>(
    "/getItems",
    { schema: { querystring: getItemsBodySchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const { id: userId } = fastify.getUser(request);

      const { skinType } = request.query;

      const [boughtSkins, allSkins] = await Promise.all([
        fastify.skinsShop.getAllSkinsForUser(
          userId,
          skinType as keyof typeof SkinType
        ),
        fastify.skinsShop.getAllSkinsByType(skinType as keyof typeof SkinType),
      ]);

      const currentSelectedUserSkinId =
        await fastify.modelsUser.getSelectedUserSkin(
          userId,
          skinType as keyof typeof SkinType
        );

      if (allSkins) {
        const skins = allSkins.map<ShopItem>((item) => {
          const isPurchased = !!boughtSkins?.find(
            (boughtSkin) => boughtSkin.id === item.id
          );
          const isSelected = item.id === currentSelectedUserSkinId;

          return { ...item, isPurchased, isSelected };
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

      const [userMiningData, skinData] = await Promise.all([
        fastify.miningPower.getMiningData(user.id),
        fastify.skinsShop.getInfoAboutSkin(skinId),
      ]);

      const skinPrice = skinData?.[0].price ?? DEFAULT_SKIN_PRICE;

      if (userMiningData && userMiningData?.power_balance >= skinPrice) {
        await fastify.miningPower.reduceUserPowerBalance(user.id, skinPrice);
        await fastify.skinsShop.addPurchasedSkin(user.id, skinId);
      } else {
        return reply.badRequest("User does not have enough funds");
      }

      return { status: "ok" };
    }
  );

  fastify.post<{ Body: { skinId: number } }>(
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

  fastify.get<{ Querystring: { skinId: number } }>(
    "/getSkinInfo",
    {
      schema: { querystring: getSkinInfoQueryParamsSchema },
      onRequest: [fastify.auth],
    },
    async (request, reply) => {
      const result = await fastify.skinsShop.getInfoAboutSkin(
        request.query.skinId
      );

      if (result) {
        return { status: "ok", item: result[0] };
      }

      return reply.badRequest(
        `No info about skin with this id: ${request.query.skinId}`
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
