"use strict";

import createPlugin from "fastify-plugin";
import TonWeb from "tonweb";
import { mnemonicToWalletKey } from "ton-crypto";

export type SendTonToken = (
  walletAddress2: string,
  tokenAmount: number,
  textMessage?: string
) => Promise<number>;

//TODO: refactor: new TonWeb call in several palace
export default createPlugin(async function (fastify, opts) {
  const tonWeb = new TonWeb(
    new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
      apiKey: (fastify?.config?.tonwebapikey as string) ?? "",
    })
  );

  const mnemonic = (fastify.config.mnemonic as string) ?? "";
  const jettonAddressRaw = (fastify.config.jettonaddress as string) ?? "";

  async function sendTonToken(
    walletAddress2: string,
    tokenAmount: number,
    textMessage = "Mini app transfer"
  ) {
    const { key, wallet, jettonWallet, walletAddress, jettonAddress } =
      await loadWallet();

    const seqno = (await wallet.methods.seqno().call()) || 0;

    if (typeof seqno !== "number" || seqno < 0) {
      console.log(seqno);
      throw new Error("Invalid seqno value");
    }

    const comment = new Uint8Array([
      ...new Uint8Array(4),
      ...new TextEncoder().encode(textMessage),
    ]);

    const amount = TonWeb.utils.toNano(tokenAmount);
    // заменил jettonAmount на tokenAmount так как судя по типам в исходниках, такого поля там нет но есть tokenAmount. Обратить внимание есть будут ошибки
    const payload = await jettonWallet.createTransferBody({
      tokenAmount: amount,
      toAddress: new TonWeb.utils.Address(walletAddress2),
      forwardAmount: TonWeb.utils.toNano("0.01"),
      forwardPayload: comment,
      responseAddress: walletAddress,
    });

    const transfer = await wallet.methods.transfer({
      secretKey: key.secretKey,
      toAddress: jettonAddress.toString(true, true, true),
      amount: TonWeb.utils.toNano("0.05"),
      seqno: seqno,
      payload: payload,
      sendMode: 3,
    });

    await transfer.estimateFee(); // get estimate fee of transfer

    await transfer.send(); // send transfer query to blockchain

    let i = 0;
    let seqnoafter = (await wallet.methods.seqno().call()) || 0;

    while (i < 100) {
      seqnoafter = (await wallet.methods.seqno().call()) || 0;

      if (seqnoafter > seqno) {
        break;
      }

      await fastify.utils.sleep(5000);
      i++;
    }

    if (seqnoafter > seqno) return seqno;
    else return 0;
  }

  async function loadWallet() {
    const key = await mnemonicToWalletKey(mnemonic.split(" "));

    const senderPublicKey = key.publicKey;
    const WalletClass = tonWeb.wallet.all.v4R2;
    const wallet = new WalletClass(tonWeb.provider, {
      publicKey: senderPublicKey,
    });

    const walletAddress = await wallet.getAddress();

    //тут ругается на address: jettonAddressRaw, потом посмотреть в доке по TonWeb в чем проблема
    // @ts-ignore: Unreachable code error
    const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonWeb.provider, {
      address: jettonAddressRaw,
    });

    const jettonAddress = await jettonMinter.getJettonWalletAddress(
      walletAddress
    );
    const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonWeb.provider, {
      address: jettonAddress,
    });

    // const data = await jettonMinter.getJettonData();
    //console.log('Total supply tokens:', data.totalSupply.toString());

    // const data2 = await jettonWallet.getData();
    //console.log('Jetton balance:', data2.balance.toString());
    //console.log("Jetton wallet address", jettonAddress.toString(true, true, true))

    return {
      key,
      wallet,
      walletAddress,
      jettonWallet,
      jettonAddress,
      jettonMinter,
    };
  }

  fastify.decorate("sendTonToken", sendTonToken);
});
