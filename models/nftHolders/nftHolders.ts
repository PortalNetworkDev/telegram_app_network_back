import createPlugin from "fastify-plugin";

export default createPlugin(async function (fastify, opts) {
  // create sql event for rewarding users
  // create js cron service that will call ton net for prossesing nft
  // create nft helper functions for working with ton Nft
  const createTable = ` CREATE TABLE IF NOT EXISTS nftHolders (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            userId BIGINT DEFAULT null,
            userWallerAddress VARCHAR(255),
            nftAddress VARCHAR(255),
            isRewarded BOOLEAN DEFAULT false
        );`;

  await fastify.dataBase.query(createTable);

  const addNftHolder = async (
    userId: number | null,
    userWallerAddress: string,
    nftAddress: string
  ) => {
    const sql = `insert into nftHolders (userId,userWallerAddress,nftAddress) values (?,?,?)`;
    await fastify.dataBase.insert(sql, [userId, userWallerAddress, nftAddress]);
  };

  fastify.decorate("nftHolders", { addNftHolder });
});
