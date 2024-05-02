'use strict'

module.exports = async function (fastify, opts) {
    const checkInterval = 5;
    setInterval(async function(){

        console.log("run sendRewards")

        const users = await fastify.models_user.getUsers();

        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            const referalUsersUnrewarded = await fastify.models_user.getReferalUsersUnrewarded(user.id)
                    
            const userTasks = await fastify.models_tasks.getUserTasks(user.id, "and is_complite = 1 and is_rewarded = 0");


            const sum = sumReferalUsersUnrewarded(referalUsersUnrewarded) + sumUnrewardedTasks(userTasks)

            if(sum > fastify.config.minrewardfortransfer && user.wallet){
                
                try {
                    
                    let txId = await fastify.sendTonToken(user.wallet, Number(sum).toFixed(1))
                    console.log("Token transfer to user", user.id, "amount", Number(sum).toFixed(1), "txid", txId)
                    
                    for (let index = 0; index < referalUsersUnrewarded.length; index++) {
                        const el = referalUsersUnrewarded[index];
                        await fastify.models_user.setRewarded(el.user_id, el.referal_user_id)
                    }

                    for (let index = 0; index < userTasks.length; index++) {
                        const task = userTasks[index];
                        await fastify.models_tasks.setRewardedTask(task.id,user.id, "")
                    }

                    await fastify.utils.sleep(5000)
                } catch (error) {
                    console.log(error)
                }
            }


        }
    },1000*60*checkInterval)
}


function sumReferalUsersUnrewarded(referalUsersUnrewarded){
    let sum = 0;
    if(referalUsersUnrewarded.length){
        for (let index = 0; index < referalUsersUnrewarded.length; index++) {
            const el = referalUsersUnrewarded[index];
            sum = sum+el.reward;
            
        }
    }

    return sum;
}

function sumUnrewardedTasks(tasks){
    let sum = 0;
    if(tasks.length){
        for (let index = 0; index < tasks.length; index++) {
            const el = tasks[index];
            sum = sum+el.reward;
        }
    }
    return sum;
}
// /sum