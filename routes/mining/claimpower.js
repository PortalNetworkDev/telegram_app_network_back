const TonWeb = require('tonweb');

module.exports = async function (fastify, opts) {
    fastify.post('/claimpower', 
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

        await fastify.models_mining_power.claimBattery(user.id)

        //const data = await fastify.models_mining_power.getMiningData(_user.id)

        return {
          code:"succcess",
          //power_balance:data.power_balance,
          //battery_balance:data.battery_balance
        }

    })
  }