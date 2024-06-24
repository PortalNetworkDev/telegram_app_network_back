'use strict'


module.exports = async function (fastify, opts) {
  fastify.get('/',{onRequest: [fastify.auth]}, async function (request, reply) {
    
    const _user = fastify.getUser(request)
    const user = await fastify.models_user.getUser(_user.id);
    const obj = {balance:0}
    if(user.wallet){
      const {token_balance} = await fastify.utils.getBalances(user.wallet)
      obj.balance = token_balance
    }else{
      obj.balance = 0;
    }

    return {...user, ...obj};

  })
}
