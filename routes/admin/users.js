'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/users',{onRequest: [fastify.auth]}, async function (request, reply) {
    
    const _user = fastify.getUser(request)
    const user = await fastify.models_user.getUser(_user.id);
    
    if(!fastify.config.admins.includes(user.username))
        return reply.badRequest("access_denied");

    return await fastify.models_user.getUsers();

  })
}
