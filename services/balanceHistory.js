
module.exports = async function (fastify, opts) {
    const checkInterval = 1;
    var runnded = false;
    setInterval(async function(){


        if(runnded){
            console.log("try to run balanceHistory, runned")
            return
        }

        console.log("run balanceHistory")

        const users = await fastify.models_balance_history.getUsersWhoNotSetBalanceHistoryToday();
        runnded = true;

        console.log(users)

        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            

            if(user.create_time == null){
                let balances = await fastify.utils.getBalances(user.wallet)

                await fastify.models_balance_history.addHistory(user.user_id, balances.token_balance,balances.pool_balance)
            }

            await fastify.utils.sleep(300);
        }


        runnded = false;
    },1000*60*checkInterval)
}