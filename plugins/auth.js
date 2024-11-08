'use strict'

import createPlugin from "fastify-plugin";
import CryptoJS from 'crypto-js'

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default createPlugin(async function (fastify, opts) {
    fastify.decorate("getUser",  function(req){
        return JSON.parse(new URLSearchParams(req.headers.authorization).get("user"))
    })

    fastify.decorate('auth', async function(req, res){

        if(typeof req.headers.authorization == "undefined"){
            console.log("req.headers.authorization == undefined")
            return res.unauthorized("Access denied");
        }

        if(!verifyTelegramWebAppData(fastify.config.bottoken,req.headers.authorization)){
            console.log("Access denied with token:", req.headers.authorization)
            return res.unauthorized("Access denied");
        }


        const user = JSON.parse(new URLSearchParams(req.headers.authorization).get("user"));

        if(!await fastify.models_user.userExist(user.id)){
            await fastify.models_user.createUser(user, req.headers.authorization)
            await fastify.models_tasks.createUserTaskStates(user.id)
            

            const initData = new URLSearchParams(req.headers.authorization);
                        
            if(initData.get("start_param")){

                const user_id = initData.get("start_param").split("-")[1]

                if(!await fastify.models_user.checkReferaluser(user_id, user.id)){
                    await fastify.models_user.addReferalUser(user_id, user.id);
                    await fastify.models_tasks.compliteTask(7,user_id,"")
                }    
            }

        }else{
            await fastify.models_user.updateLastUpdated(user.id)
        }

    })
})

function createpayload(initData){
    
    let array = []
    
    initData.sort()

    for (const [key, value] of initData.entries()) {
        if(key != "hash")
            array.push(`${key}=${value}`)
    }

    return array.join("\n")
}

function verifyTelegramWebAppData(TELEGRAM_BOT_TOKEN,telegramInitData){
    const initData = new URLSearchParams(telegramInitData);
    const payload = createpayload(initData)
    const hash = initData.get("hash");
    const secret_key = CryptoJS.HmacSHA256(TELEGRAM_BOT_TOKEN, "WebAppData");
    const calculated_hash = CryptoJS.HmacSHA256(payload, secret_key).toString();
    return calculated_hash === hash;
}


