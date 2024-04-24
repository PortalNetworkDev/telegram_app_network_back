module.exports = async function (fastify, opts) {
    fastify.post('/setUserReward', 
    {schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' }
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: {
                error: { type: 'string' },
                message: { type: 'string',enum:["user_does_not_exist", "access_denied"] },
            }   
          },
        },
        body: {
          type: 'object',
          properties: {
            user_id: { type: 'number', minimum:1 },
            reward: { type: 'number', minimum:1 },
          },
          required: ['user_id','reward']
        }
    },
    onRequest: [fastify.auth]
    }, 
    async function (request, reply) {
    
        const _user = fastify.getUser(request)
        const user = await fastify.models_user.getUser(_user.id);
        
        if(!fastify.config.admins.includes(user.username))
            return reply.badRequest("access_denied");

    
        const { user_id, reward } = request.body


        if(!await fastify.models_user.userExist(user_id))
          return reply.badRequest("user_does_not_exist");

        await fastify.models_user.updateReward(user_id, reward)
  
        return {code:"succcess"}
    })
  }