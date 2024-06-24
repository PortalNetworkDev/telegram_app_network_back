'use strict'
const TelegramBot = require('node-telegram-bot-api');
module.exports = async function (fastify, opts) {

    const checkInterval = 1;
    const en_tasks = await fastify.utils.csvParser("./db/taskstranslate_en.csv")

    setInterval(async function(){
        console.log("RUN subscribeConfirm")

        const bot = new TelegramBot(fastify.config.bottoken);

        const users = await fastify.models_user.getActiveUsers()


        for (let uindex = 0; uindex < users.length; uindex++) {
            const user = users[uindex];
            const tasks = await fastify.models_tasks.getUserTasks(user.id, "and user_task_state.is_complite = 0 and tasks.type = 'checkSubscribe'");

            for (let index = 0; index < tasks.length; index++) {
                const task = tasks[index];

                if(user.language_code != "ru"){
                    task.description = en_tasks[task.id-1].description;
                }

                try {
                    const check = await bot.getChatMember(task.description,user.id)

                    if(check.status != "left"){
                        await fastify.models_tasks.compliteTask(task.id, user.id, "")
                    }
                } catch (error) {
                    //console.log("subscribeConfirm", user.id , ">",task.description, "failed", "cannot get info")
                }

            }
        }
    },1000*60*checkInterval)
}




