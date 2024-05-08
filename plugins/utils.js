'use strict'

const fp = require('fastify-plugin')
const TonWeb = require('tonweb');
const tonweb = new TonWeb();
// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {

    async function getJettonBalance(wallet){

        let ubalance = 0;

        try {
                        
            const _req = await fetch(`https://tonapi.io/v2/accounts/${wallet}/jettons`)

            if(_req.status == 200){
                const req = await _req.json()
            
                for (let index = 0; index < req.balances.length; index++) {
                    const balance = req.balances[index];
                    
                    if(balance.jetton.address == fastify.config.jettonaddressraw ){
                        ubalance = tonweb.utils.fromNano( balance.balance)

                        if(ubalance.split(".").length == 2){
                            ubalance = Number(Number(ubalance).toFixed(2))
                        }else{
                            ubalance = Number(ubalance)
                        }

                        break;
                    }
                }
            }

        } catch (error) {
            console.log("cannot getJettonBalance", error)  
        }


        return ubalance;
    }

    async function getJettonPoolBalance(wallet){

        let ubalance = 0;

        try {
            const _req = await fetch(`https://tonapi.io/v2/accounts/${wallet}/jettons`)


            if(_req.status == 200){
                const req = await _req.json()
                
                for (let index = 0; index < req.balances.length; index++) {
                    const balance = req.balances[index];
                    
                    if(balance.jetton.address == fastify.config.pltokenaddress){
                        ubalance = tonweb.utils.fromNano( balance.balance)
                    }
                }
            }

        } catch (error) {
            console.log("cannot getJettonPoolBalance", error)
        }


        return Number(ubalance);
    }


    async function getBalances(wallet){

        let jettonbalance = 0;
        let poolbalance = 0;
        let tryCount = 0;

        try {

            var _req;


            while(tryCount < 5){
                _req = await fetch(`https://tonapi.io/v2/accounts/${wallet}/jettons`)


                if(_req.status == 200)
                    break;


                tryCount++;
            }
            


            if(_req.status == 200){
                const req = await _req.json()
                
                for (let index = 0; index < req.balances.length; index++) {
                    const balance = req.balances[index];
                    
                    if(balance.jetton.address == fastify.config.pltokenaddress){
                        poolbalance = tonweb.utils.fromNano( balance.balance)
                    }

                    if(balance.jetton.address == fastify.config.jettonaddressraw){
                        jettonbalance = tonweb.utils.fromNano( balance.balance)
                    }

                }
            }

        } catch (error) {
            console.log("cannot getBalances", error)
        }


        return {
            pool_balance:Number(poolbalance),
            token_balance: Number(jettonbalance)
        };
    }

    function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

    fastify.decorate('utils', {
        getJettonBalance,
        getJettonPoolBalance,
        getBalances,
        sleep
    })
})
