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
            const req = await _req.json()
            
            for (let index = 0; index < req.balances.length; index++) {
                const balance = req.balances[index];
                // TODO: change compare to check address
                if(balance.jetton.symbol == "POE" || balance.jetton.symbol == "TPOE" ){
                    ubalance = tonweb.utils.fromNano( balance.balance)
                }
            }
        } catch (error) {
            console.log("cannot getJettonBalance", error)  
        }


        return Number(ubalance);
    }

    async function getJettonPoolBalance(wallet){

        let ubalance = 0;

        try {
            const _req = await fetch(`https://tonapi.io/v2/accounts/${wallet}/jettons`)
            const req = await _req.json()
            console.log("getJettonPoolBalance req",_req.status,req)
            for (let index = 0; index < req.balances.length; index++) {
                const balance = req.balances[index];
                // TODO: change compare to check address
                if(balance.jetton.symbol == "POE-pTON LP" || balance.jetton.symbol == "TPOE-pTON LP" ){
                    ubalance = tonweb.utils.fromNano( balance.balance)
                }
            }
        } catch (error) {
            console.log("cannot getJettonPoolBalance", error)
        }


        return Number(ubalance);
    }

    function sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }

    fastify.decorate('utils', {
        getJettonBalance,
        getJettonPoolBalance,
        sleep
    })
})
