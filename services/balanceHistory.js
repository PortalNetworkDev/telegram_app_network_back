
module.exports = async function (fastify, opts) {
    var checkInterval = fastify.config.balanceHistoryInterval;
    if (checkInterval == null){
        checkInterval = 1
    }
    var runnded = false;
    setInterval(async function(){


        if(runnded){
            console.log("try to run balanceHistory, runned")
            return
        }

        console.log("run balanceHistory")

        runnded = true;
        const users = await fastify.models_balance_history.getUsersWhoNotSetBalanceHistoryToday();
        

        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            

            if(user.create_time == null){
                let balances = await fastify.utils.getBalances(user.wallet)
                

                if(balances.pool_balance == 0){
                    await fastify.utils.sleep(200);
                    balances.pool_balance = await fastify.utils.getFarmingNft(user.wallet)
                }

                if (balances.token_balance != -1 && balances.pool_balance != -1){
                    await fastify.models_balance_history.addHistory(user.user_id, balances.token_balance, balances.pool_balance)
                }
                
                await fastify.utils.sleep(200);
            }

            
        }


        runnded = false;
    },1000*60*checkInterval)
}