import { Address, TonClient, TupleBuilder, TupleReader } from "@ton/ton";
import { CronJob } from "cron";
import { FastifyInstance } from "fastify";
import { runWalletRequestWithRetryOnError } from "../utils/ton/ton.utils.js";

interface GetNftOwnersParams {
  itemsAmount: number;
  collectionAddress: string;
  rewardForItem: number;
  collectionId: number;
}

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

  const getNftOwners = async ({
    itemsAmount,
    collectionAddress,
    rewardForItem,
    collectionId,
  }: GetNftOwnersParams) => {
    for (let index = 0; index < itemsAmount; index++) {
      const args = new TupleBuilder();
      args.writeNumber(index);

      const nftAddressByIndexData = await runWalletRequestWithRetryOnError<{
        gas_used: number;
        stack: TupleReader;
      }>(
        async () =>
          client.runMethod(
            Address.parse(collectionAddress),
            "get_nft_address_by_index",
            args.build()
          ),
        4,
        1000
      );

      const currentNftAddress = nftAddressByIndexData?.stack.readAddress();

      if (currentNftAddress) {
        const nftItemData = await runWalletRequestWithRetryOnError(
          async () =>
            client.runMethod(currentNftAddress, "get_nft_data", args.build()),
          4,
          1000
        );

        nftItemData?.stack.skip(4);

        const ownerAddress = nftItemData?.stack.readAddress();
        if (ownerAddress) {
          const userId = await fastify.modelsUser.getUserIdByWalletAddress(
            ownerAddress.toString({ bounceable: false })
          );

          await fastify.nftHolders.addNftHolder(
            userId,
            ownerAddress.toString({ bounceable: false }),
            currentNftAddress.toString(),
            collectionId
          );

          if (userId) {
            //давай бонус за каждый нфт или как-то по другому
            await fastify.miningPower.addPowerBalance(userId, rewardForItem);
          }
        }
      }
    }

    console.log("update NFT holders table");
  };

  const jobAction = async () => {
    const nftCollections = await fastify.nftHolders.getAllNFTCollectionData();

    if (nftCollections) {
      for (let index = 0; index < nftCollections.length; index++) {
        const {
          id,
          rewardForOneItem: rewardForItem,
          nftCollectionAddress: collectionAddress,
        } = nftCollections[index];

        const { stack: collectionData } = await client.runMethod(
          Address.parse(collectionAddress),
          "get_collection_data"
        );

        const itemsAmount = collectionData.readNumber();
        await fastify.utils.sleep(1000);

        await getNftOwners({
          rewardForItem,
          collectionAddress,
          itemsAmount,
          collectionId: id,
        });
      }
    }
  };

  const job = CronJob.from({
    cronTime: "* * 23 * * *",
    onTick: async () => await jobAction(),
    runOnInit: true,
  });

  job.start();
}
