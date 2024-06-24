'use strict'

module.exports = async function (fastify, opts) {

    const checkInterval = 1;

    setInterval(async function(){
        console.log("RUN checkJetton")
        
        const users = await fastify.models_user.getActiveUsers()

        
        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            const tasks = await fastify.models_tasks.getUserTasks(user.id, "and user_task_state.is_complite = 0 and tasks.type = 'checkJetton'");
            for (let index = 0; index < tasks.length; index++) {
                const task = tasks[index];
                if(user.wallet){
                    let isComplite = await fastify.utils.checkBuyTokenStonFi(user.wallet)
                    let isLongStored = await fastify.models_balance_history.checkDaysInHistoryTokenBalance(user.id);
                    
                    if(isComplite && isLongStored){
                        await fastify.models_tasks.compliteTask(task.id, user.id, "")
                    }

                    await fastify.utils.sleep(200)
                }

            }
        }
    },1000*60*checkInterval)
}




