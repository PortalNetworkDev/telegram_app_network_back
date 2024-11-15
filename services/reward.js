'use strict'

module.exports = async function (fastify, opts) {
    const checkInterval = 5;
    var runnded = false;
    setInterval(async function(){


        if(runnded){
            console.log("try to run sendRewards, runned")
            return
        }

        console.log("run sendRewards")

        const users = await fastify.models_user.getUsers();
        runnded = true;

        for (let index = 0; index < users.length; index++) {
            const user = users[index];

            let referalUsersUnrewarded = await fastify.models_user.getReferalUsersUnrewarded(user.id)
            if (user.referal_reward>fastify.config.referalreward && fastify.config.setSpecialReferalReward) {
                referalUsersUnrewarded = await fastify.models_user.getReferalUsersUnrewardedSpecial(user.id)
            }
            
                    
            const userTasks = await fastify.models_tasks.getUserTasks(user.id, "and is_complite = 1 and is_rewarded = 0");
            
            let airDrop = 0//airdrop
            const checkUser = await fastify.models_user.checkAirDropUser(fastify.config.airDropRefMasterId, user.id);
            if (checkUser) {
                airDrop = fastify.config.airDropRefSum;
            }
            const sumAD = airDrop

            const sum = sumReferalUsersUnrewarded(referalUsersUnrewarded, user.referal_reward) + sumUnrewardedTasks(userTasks) + Number(sumAD);

            if(sum >= fastify.config.minrewardfortransfer && user.wallet){

                console.log("Try to transfer token to user", user.id, "amount", Number(sum).toFixed(1), "ref", sumReferalUsersUnrewarded(referalUsersUnrewarded, user.referal_reward), "task", sumUnrewardedTasks(userTasks), "Airdrop", sumAD)
                
                try {
                    
                    let seqno = await fastify.sendTonToken(user.wallet, Number(sum).toFixed(1), "Portal network airdrop")

                    if(!seqno){
                        console.log("Failed: Token transfer to user seqno:", seqno)
                        return false;
                    }

                    console.log("Success: Token transfer to user seqno:", seqno)
                    
                    for (let index = 0; index < referalUsersUnrewarded.length; index++) {
                        const el = referalUsersUnrewarded[index];
                        await fastify.models_user.setRewarded(el.user_id, el.referal_user_id)
                    }

                    for (let index = 0; index < userTasks.length; index++) {
                        const task = userTasks[index];
                        await fastify.models_tasks.setRewardedTask(task.id,user.id, "")
                    }

                    if (sumAD > 0) {
                        const masterId = fastify.config.airDropRefMasterId;
                        await fastify.models_user.setRewarded(masterId, user.id)
                    }

                } catch (error) {
                    console.log(error)
                }
            }


        }

        runnded = false;
    },1000*60*checkInterval)
}


function sumReferalUsersUnrewarded(referalUsersUnrewarded, reward){
    let sum = 0;
    if(referalUsersUnrewarded.length){
        /*for (let index = 0; index < referalUsersUnrewarded.length; index++) {
            const el = referalUsersUnrewarded[index];
            sum = sum+el.reward;
            
        }*/
        sum = referalUsersUnrewarded.length*reward
    }

    return sum;
}

function sumUnrewardedTasks(tasks){
    let sum = 0;
    if(tasks.length){
        for (let index = 0; index < tasks.length; index++) {
            const el = tasks[index];
            if (el.type == "referal") {
                continue
            }
            sum = sum+el.reward;
        }
    }   
    return sum;
}