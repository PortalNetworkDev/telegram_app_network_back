'use strict'

const fp = require('fastify-plugin')
const TonWeb = require('tonweb');
const { mnemonicToWalletKey } = require("ton-crypto")


// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
    const tonWeb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
        apiKey: fastify.config.tonwebapikey
    }));
    
    const mnemonic = fastify.config.mnemonic;
    const jettonAddressRaw = fastify.config.jettonaddress;

    async function sendTonToken(walletAddress2, tokenAmount, textMessage = "Mini app transfer" ) {

        const {key, wallet, jettonWallet, walletAddress, jettonAddress} = await loadWallet()
        const seqno = (await wallet.methods.seqno().call()) || 0;
        if (typeof seqno !== 'number' || seqno < 0) {
            console.log(seqno)
            throw new Error('Invalid seqno value');
        }
        const comment = new Uint8Array([... new Uint8Array(4), ... new TextEncoder().encode(textMessage)]);
        const amount = TonWeb.utils.toNano(tokenAmount);
    
    
        const payload = await jettonWallet.createTransferBody({
            jettonAmount: amount, 
            toAddress: new TonWeb.utils.Address(walletAddress2), 
            forwardAmount: TonWeb.utils.toNano('0.01'), 
            forwardPayload: comment, 
            responseAddress: walletAddress
        });
    
    
        console.log("toAddress", jettonAddress.toString(true, true, true))
    
        
    
        const txId = await wallet.methods.transfer({
            secretKey: key.secretKey,
            toAddress: jettonAddress.toString(true, true, true),
            amount: TonWeb.utils.toNano('0.05'),
            seqno: seqno,
            payload: payload,
            sendMode: 3
        }).send();
    
        return txId;
    }
    
    
    async function loadWallet(){

        const key = await mnemonicToWalletKey(mnemonic.split(" "))
    
        const senderPublicKey = key.publicKey;
        const WalletClass = tonWeb.wallet.all.v4R2;
        const wallet = new WalletClass(tonWeb.provider, {
            publicKey: senderPublicKey
        });
    
        const walletAddress = await wallet.getAddress();
    
        const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonWeb.provider, {address: jettonAddressRaw});
    
        const jettonAddress = await jettonMinter.getJettonWalletAddress(walletAddress);
        const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonWeb.provider,{address: jettonAddress});
    
        const data = await jettonMinter.getJettonData();
        console.log('Total supply tokens:', data.totalSupply.toString());
       
        const data2 = await jettonWallet.getData();
        console.log('Jetton balance:', data2.balance.toString());
        console.log("Jetton wallet address", jettonAddress.toString(true, true, true))
    
        return {key, wallet, walletAddress, jettonWallet, jettonAddress, jettonMinter}
    
    }
    
    fastify.decorate('sendTonToken', sendTonToken)
})








