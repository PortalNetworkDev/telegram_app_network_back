import { Address, TonClient, TupleBuilder } from "@ton/ton";
import { CronJob } from "cron";
import { FastifyInstance } from "fastify";
const NFT_COLLECTION_FOR_REWARDING =
  "EQDY0DNSHjoYbAG75kndTImurw0vLaowr_-kDkN8Kme6HGc4";

async function createTonClient(testnet: boolean, fastify: FastifyInstance) {
  const tonCenterEndpoint = testnet
    ? "https://testnet.toncenter.com"
    : "https://toncenter.com";

  const client = new TonClient({
    endpoint: `${tonCenterEndpoint}/api/v2/jsonRPC`,
    apiKey: String(fastify.config.tonwebapikey) ?? "",
  });
  return client;
}

export default async function (fastify: FastifyInstance) {
  const client = await createTonClient(false, fastify);

  const { stack: collectionData } = await client.runMethod(
    Address.parse(NFT_COLLECTION_FOR_REWARDING),
    "get_collection_data"
  );

  const itemsInCollectionAmount = collectionData.readNumber();

  const getNftOwners = async (itemsAmount: number) => {
    for (let index = 0; index < itemsAmount; index++) {
      const args = new TupleBuilder();
      args.writeNumber(index);

      const { stack } = await client.runMethod(
        Address.parse(NFT_COLLECTION_FOR_REWARDING),
        "get_nft_address_by_index",
        args.build()
      );

      const currentNftAddress = stack.readAddress();

      if (currentNftAddress) {
        const nftItemData = await client.runMethod(
          currentNftAddress,
          "get_nft_data",
          args.build()
        );

        nftItemData.stack.skip(4);

        const ownerAddress = nftItemData.stack.readAddress();

        const userId = await fastify.modelsUser.getUserIdByWalletAddress(
          ownerAddress.toString({ bounceable: false })
        );

        await fastify.nftHolders.addNftHolder(
          userId,
          ownerAddress.toString({ bounceable: false }),
          currentNftAddress.toString()
        );

        if (userId) {
          //давай бонус за каждый нфт или как-то по другому
          await fastify.miningPower.addPowerBalance(userId, 100);
        }
      }
    }

    console.log("update NFT holders table");
  };

  //TODO: for test get info about 10-20 items
  // when push to server change to `itemsInCollectionAmount`
  const job = CronJob.from({
    cronTime: "* * 23 * * *",
    onTick: async () => await getNftOwners(30),
    runOnInit: true,
  });

  job.start();
}
//reward users
//update mining_data inner join nftHolders on nftHolders.`userId` =`mining_data`.`user_id` set power_balance = power_balance + 10000 where nftHolders.`userId` is not null;
//
