const TonWeb = require('tonweb');

module.exports = async function (fastify, opts) {
    fastify.post('/buyrizegenerator', 
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
                message: { type: 'string' },
            }   
          },
        }
    },
    onRequest: [fastify.auth]
    }, 
    async function (request, reply) {
      
        const user = fastify.getUser(request)

        let data = await fastify.models_mining_power.getMiningData(_user.id)

        const price_rize_generator = 2^(data.generator_level+1)*fastify.config.stepGeneratorPrice
        const power_rize_generator = data.generator_limit+fastify.config.stepGeneratorLim

        if (data.power_balance < price_rize_generator){
          return reply.badRequest("not_enough_power");
        }

        await fastify.models_mining_power.buyGeneratorLimit(user.id, power_rize_generator, price_rize_generator)

        data = await fastify.models_mining_power.getMiningData(_user.id)

        return {
          code:"succcess",
          power_balance:data.power_balance,
          generator_limit:data.generator_limit,
          battery_level:data.battery_level
        }

    })
  }