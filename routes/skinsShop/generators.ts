import { FastifyInstance } from "fastify";
import { ShopItem } from "./generators.types";

export default async function (fastify: FastifyInstance) {
  //   fastify.get("/addSkins", async (request, reply) => {
  //     const data = [
  //       { id: 1, price: 5000, name: "defaultGenerator.png" },
  //       { id: 2, price: 5000, name: "atom.png" },
  //       { id: 3, price: 5000, name: "cogwheel.png" },
  //       { id: 4, price: 5000, name: "earth.png" },
  //       { id: 5, price: 5000, name: "lightning.png" },
  //       { id: 6, price: 5000, name: "notcoin.png" },
  //       { id: 7, price: 5000, name: "ton.png" },
  //       { id: 8, price: 5000, name: "turbine.png" },
  //       { id: 9, price: 5000, name: "pumpkin.png" },
  //       { id: 10, price: 5000, name: "plasma.png" },
  //     ];

  //     data.forEach((item) => {
  //         fastify.dataBase.insert(
  //           "insert into skins (price,name,image_name) VALUES(?,?,?)",
  //           [item.price, item.name.slice(0, item.name.length - 4), item.name]
  //         );
  //     });
  //     return {
  //       status: "ok",
  //     };
  //   });

  fastify.post<{ Body: { userId: number } }>(
    "/getItems",
    async (request, reply) => {
      const [boughtSkins, allSkins] = await Promise.all([
        fastify.skinsShop.getAllSkinsForUser(request.body.userId),
        fastify.skinsShop.getAllSkins(),
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

      return {
        items: [],
      };
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
}
