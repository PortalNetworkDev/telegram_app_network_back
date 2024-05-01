'use strict'

const fp = require('fastify-plugin')

var CryptoJS = require("crypto-js");

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
    fastify.decorate("getUser",  function(req){
        return JSON.parse(new URLSearchParams(req.headers.authorization).get("user"))
    })

    fastify.decorate('auth', async function(req, res){

        if(typeof req.headers.authorization == "undefined")
            return res.unauthorized("Access denied");

        if(!verifyTelegramWebAppData(fastify.config.bottoken,req.headers.authorization))
            return res.unauthorized("Access denied");

        const user = JSON.parse(new URLSearchParams(req.headers.authorization).get("user"));

        if(!await fastify.models_user.userExist(user.id)){
            await fastify.models_user.createUser(user, req.headers.authorization)
            await fastify.models_tasks.createUserTaskStates(user.id)
            

            const initData = new URLSearchParams(req.headers.authorization);
                        
            if(initData.get("start_param")){

                const user_id = initData.get("start_param").split("-")[1]

                console.log("++++user_id++++", user_id)

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

function createpayload(auth){
    const initData = new URLSearchParams(auth);


    let payload = `auth_date=${initData.get("auth_date")}\nchat_instance=${initData.get("chat_instance")}\nchat_type=${initData.get("chat_type")}\n`;
    
    if(initData.get("start_param")){
        payload = payload+`start_param=${initData.get("start_param")}\n`
    }


    let user = "";



    let _split = auth.split("&")

    for (let index = 0; index < _split.length; index++) {
        const element = _split[index];
        
        let _elem = element.split("=")

        if(_elem[0] == "user"){
            user = decodeURI(_elem[1]).replaceAll("%3A", ":").replaceAll("%2C",",");
        }
    }
    
    return payload+"user="+user;
}

function verifyTelegramWebAppData(TELEGRAM_BOT_TOKEN,telegramInitData){
    const initData = new URLSearchParams(telegramInitData);
    const payload = createpayload(telegramInitData)
    const hash = initData.get("hash");

    const secret_key = CryptoJS.HmacSHA256(TELEGRAM_BOT_TOKEN, "WebAppData");
    //console.log("secret_key", secret_key.toString())
    const calculated_hash = CryptoJS.HmacSHA256(payload, secret_key).toString();
    //console.log("calculated_hash", calculated_hash)
    //console.log("hash",hash)
    return calculated_hash === hash;
}


