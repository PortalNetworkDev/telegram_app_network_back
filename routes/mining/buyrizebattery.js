const TonWeb = require('tonweb');

module.exports = async function (fastify, opts) {
    fastify.post('/buyrizebattery', 
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

        const price_rize_battery = 2^(data.battery_level+1)*Number(fastify.config.stepBatteryPrice)
        const power_rize_battery = data.battery_capacity+Number(fastify.config.stepBatteryCap)

        if (data.power_balance < price_rize_battery){
          return reply.badRequest("not_enough_power");
        }

        await fastify.models_mining_power.buyBatteryCapacity(user.id, power_rize_battery, price_rize_battery)

        //data = await fastify.models_mining_power.getMiningData(_user.id)

        return {
          code:"succcess",
          //power_balance:data.power_balance,
          //battery_capacity:data.battery_capacity,
          //battery_level:data.battery_level
        }

    })
  }