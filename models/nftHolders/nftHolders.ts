import createPlugin from "fastify-plugin";
import { NftCollectionsModel } from "./nftHolders.types";

export default createPlugin(async function (fastify, opts) {
  const createNFTholderTable = `CREATE TABLE IF NOT EXISTS nftHolders (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            userId BIGINT DEFAULT null,
            userWallerAddress VARCHAR(255),
            nftAddress VARCHAR(255),
            collectionId int not null
        );`;

  const createNFTCollectionsTable = `CREATE TABLE IF NOT EXISTS nftCollections (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            nftCollectionAddress VARCHAR(255),
            rewardForOneItem TINYINT 
        );`;

  const BASE_COLLECTION = `EQDxVIF0_OSEcT2isB5YBmaU1ZQZeSLkfmDX0xoqDtLtxYM6`;
  const BASE_REWARD_FOR_ITEM = 100;

  await fastify.dataBase.query(createNFTholderTable);
  await fastify.dataBase.query(createNFTCollectionsTable);

  const addNftHolder = async (
    userId: number | null,
    userWallerAddress: string,
    nftAddress: string,
    collectionId: number
  ) => {
    const sql = `insert into nftHolders (userId,userWallerAddress,nftAddress,collectionId) values (?,?,?,?)`;

    await fastify.dataBase.insert(sql, [
      userId,
      userWallerAddress,
      nftAddress,
      collectionId,
    ]);
  };

  const getAllNFTCollectionData = async () => {
    const sql = `select * from nftCollections`;
    const result = await fastify.dataBase.select<NftCollectionsModel>(sql);
    return result?.rows ?? null;
  };

  const setInitialDataForNFTcollectionsTable = async () => {
    const sql = `insert into nftCollections (nftCollectionAddress,rewardForOneItem) values(?,?)`;
    await fastify.dataBase.insert(sql, [BASE_COLLECTION, BASE_REWARD_FOR_ITEM]);
  };

  await setInitialDataForNFTcollectionsTable();

  fastify.decorate("nftHolders", { addNftHolder, getAllNFTCollectionData });
});
