import { FastifyInstance } from "fastify";
import { ShopItem } from "./generators.types";
import { SkinType } from "../../models/skinsShop/skins.types.js";

export default async function (fastify: FastifyInstance) {
  // fastify.get("/addSkins", async (request, reply) => {
  //   const data = [
  //     { id: 1, price: 5000, name: "blackBattery.png" },
  //     { id: 2, price: 5000, name: "whiteBattery.png" },
  //     { id: 3, price: 5000, name: "blueBattery.png" },
  //     { id: 4, price: 5000, name: "capperBattery.png" },
  //     { id: 5, price: 5000, name: "darkBlueBattery.png" },
  //     { id: 6, price: 5000, name: "purpleBattery.png" },
  //     { id: 7, price: 5000, name: "raspberryBattery.png" },
  //     { id: 8, price: 5000, name: "redButtery.png" },
  //     { id: 9, price: 5000, name: "vinousBattery.png" },
  //     { id: 10, price: 5000, name: "greenBattery .png" },
  //   ];

  //   data.forEach((item) => {
  //     fastify.dataBase.insert(
  //       "insert into skins (price,name,imageUrl) VALUES(?,?,?)",
  //       [item.price, item.name.slice(0, item.name.length - 4), item.name]
  //     );
  //   });
  //   return {
  //     status: "ok",
  //   };
  // });

  fastify.post<{ Body: { userId: number; skinType: string } }>(
    "/getItems",
    async (request, reply) => {
      const { userId, skinType } = request.body;

      if (!skinType) {
        return reply.badRequest("Pram skinType should not be empty");
      }

      const [boughtSkins, allSkins] = await Promise.all([
        fastify.skinsShop.getAllSkinsForUser(
          userId,
          skinType as keyof typeof SkinType
        ),
        fastify.skinsShop.getAllSkinsByType(skinType as keyof typeof SkinType),
      ]);

      if (boughtSkins && allSkins) {
        const skins = allSkins.map<ShopItem>((item) => {
          const isPurchased = !!boughtSkins.find(
            (boughtSkin) => boughtSkin.id === item.id
          );

          return { ...item, isPurchased };
        });

        return {
          items: skins,
        };
      }

      return reply.badRequest(`No skins with this type: ${skinType}`);
    }
  );

  fastify.post<{ Body: { userId: number; skinId: number } }>(
    "/buySkin",
    async (request, reply) => {
      const { userId, skinId } = request.body;
      const userMiningData = await fastify.miningPower.getMiningData(userId);

      if (userMiningData && userMiningData?.power_balance >= 5000) {
        await fastify.miningPower.reduceUserPowerBalance(userId, 5000);
        await fastify.skinsShop.addPurchasedSkin(userId, skinId);
      } else {
        return reply.badRequest("User does not have enough funds");
      }

      return { status: "ok" };
    }
  );

  fastify.post<{ Body: { userId: number; skinId: number } }>(
    "/selectSkin",
    async (request, reply) => {
      const { userId, skinId } = request.body;
      const boughtSkins = await fastify.skinsShop.getAllBoughtSkinsForUser(
        userId
      );
      if (boughtSkins && boughtSkins.find((item) => item.skinId === skinId)) {
        await fastify.modelsUser.selectUserGeneratorSkin(userId, skinId);

        return { status: "ok" };
      }

      return reply.badRequest("User does not purchased this skin");
    }
  );

  fastify.get<{ Querystring: { id: number } }>(
    "/getSkinInfo",
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

      return reply.badRequest(`No skins with this type: ${request.query.type}`);
    }
  );
}
