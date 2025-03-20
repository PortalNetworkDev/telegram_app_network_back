import { mnemonicToPrivateKey } from "@ton/crypto";
import {
  Address,
  beginCell,
  internal,
  toNano,
  TonClient,
  WalletContractV3R2,
  WalletContractV4,
} from "@ton/ton";
import { FastifyInstance } from "fastify";

export interface TransferNFTparams {
  userAddress: Address;
  nftContractAddress: Address;
  isTestNet: boolean;
  fastify: FastifyInstance;
}

const TOO_MANY_REQUESTS_STATUS = 429;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runWalletRequestWithRetryOnError = async (
  action: () => Promise<any>,
  retryAmount = 4,
  initDelayTime = 1000
) => {
  let i = 0;
  let timeout = initDelayTime;

  while (i < retryAmount) {
    const newTimeout = i < 4 ? timeout + 400 : timeout;

    try {
      await delay(newTimeout);
      await action();
      break;
    } catch (error: any) {
      if (error.status === TOO_MANY_REQUESTS_STATUS) {
        i++;
      }
    }
  }
};

export async function transferNFT({
  userAddress,
  nftContractAddress,
  isTestNet = true,
  fastify,
}: TransferNFTparams) {
  const tonCenterEndpoint = isTestNet
    ? "https://testnet.toncenter.com"
    : "https://toncenter.com";

  const client = new TonClient({
    endpoint: `${tonCenterEndpoint}/api/v2/jsonRPC`,
  });

  const peparedKeyData = await mnemonicToPrivateKey(
    String(fastify.config.mnemonic).split(" ")
  );

  //for future: should use different constructor  version according to wallet version
  const walletContractConstructor = isTestNet
    ? WalletContractV3R2
    : WalletContractV4;

  const ownerWaller = walletContractConstructor.create({
    workchain: 0,
    publicKey: peparedKeyData.publicKey,
  });

  const ownerWalletContract = client.open(ownerWaller);

  const body = beginCell()
    .storeUint(0x5fcc3d14, 32) // NFT transfer op code 0x5fcc3d14
    .storeUint(0, 64) // query_id:uint64
    .storeAddress(userAddress) // new_owner:MsgAddress
    .storeAddress(null) // response_destination:MsgAddress
    .storeBit(false) // custom_payload:(Maybe ^Cell)
    .storeCoins(0) // forward_amount:(VarUInteger 16) (1 nanoTon = toNano("0.000000001"))
    .endCell();

  const transferMessage = internal({
    to: nftContractAddress,
    value: toNano("0.08"), // TON amount to cover fees
    body: body,
  });

  const seqno = await ownerWalletContract.getSeqno();

  await runWalletRequestWithRetryOnError(
    async () => {
      await ownerWalletContract.sendTransfer({
        secretKey: peparedKeyData.secretKey,
        seqno,
        messages: [transferMessage],
      });
    },
    4,
    1000
  );

  let newSecno = seqno;
  await runWalletRequestWithRetryOnError(
    async () => {
      newSecno = await ownerWalletContract.getSeqno();
    },
    20,
    1000
  );

  if (newSecno > seqno) {
    return newSecno;
  }

  return 0;
}
