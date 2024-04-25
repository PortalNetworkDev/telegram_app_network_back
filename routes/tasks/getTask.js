'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/getTask/:id',{onRequest: [fastify.auth]}, async function (request, reply) {
    const user = fastify.getUser(request)
    const task = await fastify.models_tasks.getUserTaskByTaskId(user.id, request.params.id)
    console.log(user.id, request.params.id,task)
    return task;
  })
}
