'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/getUserTaskByTaskId/:id',{onRequest: [fastify.auth]}, async function (request, reply) {
    const user = fastify.getUser(request)
    const task = await fastify.models_tasks.getUserTaskByTaskId(user.id, request.params.id)
    
    return task;
  })
}
