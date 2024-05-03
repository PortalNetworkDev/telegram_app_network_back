const TonWeb = require('tonweb');
const { mnemonicToWalletKey } = require("ton-crypto")

const tonWeb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
    apiKey: "ca8253ab1a7fca43e963b51a18b01ee90e09de19422b23c6f85d1f31304d326d"
}));

const mnemonic = "phone satisfy upper hundred winter exhibit body second fringe nerve tide grid invite life vicious obvious shoulder crater fan bachelor wing upper behind mobile";
const jettonAddressRaw = "EQD9C7igMAsra8LWhq5OLJkNWpf6GPVUONvQIPdkkHKrLl0O";

run()

async function run(){

    var failed = 0;
    var success = 0;

    for (let index = 0; index < 10; index++) {
        const seqno = await sendTonToken("UQCal-ODU_ZfUlzfyUvgApshnzcPeSlwE_HRa1tlCNd5rcOB", `1.${index}`);


        if(seqno){
            success++
        }else{
            failed++;
        }

        console.log("sendTonToken",`1.${index}`, seqno)
    }

    console.log("Faled send transaction", failed)
    console.log("Success send transaction", success)
    
}


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


   // console.log("toAddress", jettonAddress.toString(true, true, true))

    

    const transfer = await wallet.methods.transfer({
        secretKey: key.secretKey,
        toAddress: jettonAddress.toString(true, true, true),
        amount: TonWeb.utils.toNano('0.05'),
        seqno: seqno,
        payload: payload,
        sendMode: 3
    });
    const transferFee = await transfer.estimateFee();   // get estimate fee of transfer
    //console.log("transferFee",transferFee);

    const transferSended = await transfer.send();  // send transfer query to blockchain
    //console.log("transferSended",transferSended);

    const transferQuery = await transfer.getQuery(); // get transfer query Cell
    //console.log("transferQuery",transferQuery);

    i = 0
    let seqnoafter = (await wallet.methods.seqno().call()) || 0;

    while(i < 100){
        seqnoafter = (await wallet.methods.seqno().call()) || 0;

        if(seqnoafter > seqno){
            break;
        }

        await sleep(500)
        i++
    }

    //console.log("seqnoafter",seqnoafter)

//    const history = await tonWeb.getTransactions(walletAddress2);

//    console.log("history",history)

    if(seqnoafter > seqno)
        return seqno;
    else
        return 0;

}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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
    //console.log('Total supply tokens:', data.totalSupply.toString());
   
    const data2 = await jettonWallet.getData();
    //console.log('Jetton balance:', data2.balance.toString());
    //console.log("Jetton wallet address", jettonAddress.toString(true, true, true))

    return {key, wallet, walletAddress, jettonWallet, jettonAddress, jettonMinter}

}