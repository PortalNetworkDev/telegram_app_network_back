const TonWeb = require('tonweb');

module.exports = async function (fastify, opts) {
    fastify.post('/buyrizemultitab', 
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

        let data = await fastify.models_mining_power.getMiningData(user.id)

        const price_rize_multitab = 2**(Math.round((data.multitab-1)/2))*Number(fastify.config.stepMultitabPrice)

        if (data.power_balance < price_rize_multitab){
          return reply.badRequest("not_enough_power");
        }

        await fastify.models_mining_power.buyMultitab(user.id, price_rize_multitab)

        //data = await fastify.models_mining_power.getMiningData(user.id)

        return {
          code:"succcess",
          //power_balance:data.power_balance,
          //generator_limit:data.generator_limit,
          //battery_level:data.battery_level
        }

    })
  }