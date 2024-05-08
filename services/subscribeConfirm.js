'use strict'
const TelegramBot = require('node-telegram-bot-api');
module.exports = async function (fastify, opts) {

    const checkInterval = 1;

    setInterval(async function(){
        console.log("RUN subscribeConfirm")

        const bot = new TelegramBot(fastify.config.bottoken);

        const users = await fastify.models_user.getActiveUsers()


        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            const tasks = await fastify.models_tasks.getUserTasks(user.id, "and user_task_state.is_complite = 0 and tasks.type = 'checkSubscribe'");
            for (let index = 0; index < tasks.length; index++) {
                const task = tasks[index];
                try {
                    const check = await bot.getChatMember(task.description,user.id)

                    if(check.status != "left"){
                        await fastify.models_tasks.compliteTask(task.id, user.id, "")
                    }
                } catch (error) {
                    console.log("subscribeConfirm", user.id , ">",task.description, "failed", "cannot get info", error)
                }

            }
        }
    },1000*60*checkInterval)
}




