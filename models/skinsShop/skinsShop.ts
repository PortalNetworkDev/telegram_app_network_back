import createPlugin from "fastify-plugin";
import { SkinModel, PurchasedSkinsModel, SkinType } from "./skins.types.js";

export default createPlugin(async function (fastify, opts) {
  const createSkinsTable = `
    CREATE TABLE IF NOT EXISTS skins (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            price FLOAT NOT NULL,
            name CHAR(255),
            imageUrl CHAR(255),
            type TINYINT
        );`;

  const createUsersPurchasedSkins = `
          CREATE TABLE IF NOT EXISTS purchasedSkins (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            skinId INT NOT NULL,
            userId BIGINT NOT NULL,
            creationTime BIGINT NOT NULL
        );`;

  await fastify.dataBase.query(createSkinsTable);
  await fastify.dataBase.query(createUsersPurchasedSkins);

  const addPurchasedSkin = async (userId: number, skinId: number) => {
    const sql = `INSERT INTO purchasedSkins (skinId,userId,creationTime) VALUES (?,?,?)`;
    const creationTime = Date.now();

    await fastify.dataBase.insert<SkinModel>(sql, [
      skinId,
      userId,
      creationTime,
    ]);
  };

  const getAllSkinsForUser = async (
    userId: number,
    skinType: keyof typeof SkinType
  ) => {
    const sql = `SELECT skins.id, skins.price, skins.imageUrl, skins.name  from skins JOIN purchasedSkins on skins.id = purchasedSkins.skinId where purchasedSkins.userId= ? and skins.type = ?;`;
    let result = null;

    if (SkinType[skinType] !== undefined) {
      result = await fastify.dataBase.select<SkinModel>(sql, [
        userId,
        SkinType[skinType],
      ]);
    }

    return result?.rows ?? null;
  };

  const getAllSkins = async () => {
    const sql = `SELECT * from skins`;
    const result = await fastify.dataBase.select<SkinModel>(sql, []);
    return result?.rows ?? null;
  };

  const getAllSkinsByType = async (skinType: keyof typeof SkinType) => {
    const sql = `SELECT * from skins where skins.type = ?`;
    let result = null;

    if (SkinType[skinType] !== undefined) {
      result = await fastify.dataBase.select<SkinModel>(sql, [
        SkinType[skinType],
      ]);
    }

    return result?.rows ?? null;
  };

  const getAllBoughtSkinsForUser = async (userId: number) => {
    const sql = `SELECT * from purchasedSkins where purchasedSkins.userId = ?;`;

    const result = await fastify.dataBase.select<PurchasedSkinsModel>(sql, [
      userId,
    ]);
    return result?.rows ?? null;
  };

  const getInfoAboutSkin = async (skinId: number) => {
    const sql = `select * from skins where skins.id = ?`;
    const result = await fastify.dataBase.select<SkinModel>(sql, [skinId]);
    return result?.rows ?? null;
  };

  fastify.decorate("skinsShop", {
    addPurchasedSkin,
    getAllSkins,
    getAllBoughtSkinsForUser,
    getAllSkinsForUser,
    getInfoAboutSkin,
    getAllSkinsByType,
  });
});
