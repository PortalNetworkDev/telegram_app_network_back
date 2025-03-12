import {
  Address,
  beginCell,
  Cell,
  CellType,
  internal,
  TonClient,
  WalletContractV4,
} from "@ton/ton";
import { mnemonicToWalletKey } from "ton-crypto";

const TEST_MNEMONIIC =
  "dinosaur black ranch digital snack antique across raise misery between route nephew kingdom slab own syrup ecology pretty will divert match quit domain filter";

async function tansferNFT(userAddress: Address, nftContractAddress: Address) {
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
  });

  const peparedKeyData = await mnemonicToWalletKey(TEST_MNEMONIIC.split(" "));
  const ownerWaller = WalletContractV4.create({
    workchain: 0,
    publicKey: peparedKeyData.publicKey,
  });

  const ownerWalletContract = client.open(ownerWaller);

  const body = beginCell()
    .storeUint(0x5fcc3d14, 32) // NFT transfer op code 0x5fcc3d14
    .storeUint(0, 64) // query_id:uint64
    .storeAddress(userAddress) // new_owner:MsgAddress
    .storeAddress(ownerWalletContract.address) // response_destination:MsgAddress
    .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
    .storeCoins(1) // forward_amount:(VarUInteger 16) (1 nanoTon = toNano("0.000000001"))
    .storeUint(0, 1) // forward_payload:(Either Cell ^Cell)
    .endCell();

  const transferMessage = internal({
    to: nftContractAddress,
    value: "0.05", // TON amount to cover fees
    body: body,
  });

  const seqno = await ownerWalletContract.getSeqno();
  await ownerWalletContract.sendTransfer({
    secretKey: peparedKeyData.secretKey,
    seqno,
    messages: [transferMessage],
  });
}

//сделать нфт и отправить с одного кошелка на другой через этот метод
//возможно поможет https://ton-collection-edit.vercel.app/deploy-collection
