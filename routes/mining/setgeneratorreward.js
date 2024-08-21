const TonWeb = require('tonweb');

module.exports = async function (fastify, opts) {
    fastify.post('/setgeneratorreward', 
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
        },
        body: {
          type: 'object',
          properties: {
            power: { type: 'number' },
          },
          required: ['power']
        }
    },
    onRequest: [fastify.auth]
    }, 
    async function (request, reply) {

        let { power } = request.body
      
        const user = fastify.getUser(request)

        let data = await fastify.models_mining_power.getMiningData(user.id)

        const now = new Date();
        const lastUpdate = new Date(data.time_last_update)
        let batteryBalance = data.battery_balance
        let generatorBalance = data.generator_balance

        if (data.battery_balance < data.battery_capacity || data.generator_balance < data.generator_limit) {

          batteryBalance = data.battery_balance + (now - lastUpdate)*data.poe_balance*Number(fastify.config.powerPrice)/3600
          generatorBalance = data.generator_balance + (now - lastUpdate)/1000/Number(fastify.config.recoveryGeneratorLim)
    
          if (batteryBalance > data.battery_capacity) {
            batteryBalance = data.battery_capacity
          } 
    
          if (generatorBalance > data.generator_limit) {
            generatorBalance = data.generator_limit
          }
        }

        if (generatorBalance == 0){
          return reply.badRequest("zero_gen_balance");
        }

        if (batteryBalance == data.battery_capacity){
          return reply.badRequest("battery_is_full");
        }

        if (power <= generatorBalance && power <= data.battery_capacity-batteryBalance) {
          await fastify.models_mining_power.generatingEnergy(user.id, generatorBalance-power, batteryBalance+power)
        } else {
          const minPow = (generatorBalance < data.battery_capacity-batteryBalance) ? generatorBalance : data.battery_capacity-batteryBalance
          await fastify.models_mining_power.generatingEnergy(user.id, generatorBalance-minPow, batteryBalance+minPow) 
        }

        //data = await fastify.models_mining_power.getMiningData(_user.id)

        return {

          //power_price: fastify.config.powerPrice,
          //power_poe: fastify.config.powerPrice*data.poe_balance,
          //power_balance:data.power_balance,
          //battery_capacity: data.battery_capacity,
          //battery_level: data.battery_level,
          //generator_limit: data.generator_limit,
          //generator_level: data.generator_level,
          
          //generator_balance: data.generator_balance,
          //battery_balance: data.battery_balance,
          
          code:"succcess"
        }

    })
  }