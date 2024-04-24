'use strict'


module.exports = async function (fastify, opts) {
  fastify.get('/',{onRequest: [fastify.auth]}, async function (request, reply) {
    
    const _user = fastify.getUser(request)
    const user = await fastify.models_user.getUser(_user.id);

    if(user.wallet){
      user.balance = await fastify.utils.getJettonBalance(user.wallet)
    }else{
      user.balance = 0;
    }

    return user;

  })
}
