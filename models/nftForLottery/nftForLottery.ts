import createPlugin from "fastify-plugin";
import { NftForLottery } from "./nftForLottery.types";

export default createPlugin(async function (fastify, opts) {
  const createNFTforLotteryTable = `CREATE TABLE IF NOT EXISTS nftForLottery (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            nftCollectionAddress VARCHAR(255),
            nftAddress VARCHAR(255),
            isHasWinner boolean DEFAULT false,
            wasSended boolean DEFAULT false,
            winnerUserId BIGINT DEFAULT null
        );`;

  await fastify.dataBase.query(createNFTforLotteryTable);

  const getAllNftsWithoutWinner = async () => {
    const sql = `select * from nftForLottery where isHasWinner = false`;
    const result = await fastify.dataBase.select<NftForLottery>(sql);

    return result?.rows ?? null;
  };

  const setWinnerForNft = async (userId: number, nftId: number) => {
    const sql = `update nftForLottery set isHasWinner = true,winnerUserId = ? where id = ?`;
    await fastify.dataBase.update(sql, [userId, nftId]);
  };

  const setIsNftSendToWinnerUser = async (nftId: number) => {
    const sql = `update nftForLottery set wasSended = true where id= ?`;
    await fastify.dataBase.update(sql, [nftId]);
  };

  fastify.decorate("nftForLotteryService", {
    getAllNftsWithoutWinner,
    setWinnerForNft,
    setIsNftSendToWinnerUser,
  });
});
