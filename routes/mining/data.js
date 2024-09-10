'use strict'


module.exports = async function (fastify, opts) {
  fastify.get('/data',{onRequest: [fastify.auth]}, async function (request, reply) {
    
    const _user = fastify.getUser(request)
    

    const data = await fastify.models_mining_power.getMiningData(_user.id)

    const now = new Date();
    const lastUpdate = new Date(data.time_last_update)

    let batteryBalance = data.battery_balance
    let generatorBalance = data.generator_balance

    if (data.battery_balance < data.battery_capacity || data.generator_balance < data.generator_limit) {

      batteryBalance = data.battery_balance + ((now - lastUpdate)/1000)*data.poe_balance*Number(fastify.config.powerPrice)/3600
      generatorBalance = data.generator_balance + ((now - lastUpdate)/1000)/Number(fastify.config.recoveryGeneratorLim)

      if (batteryBalance > data.battery_capacity) {
        batteryBalance = data.battery_capacity
      } 

      if (generatorBalance > data.generator_limit) {
        generatorBalance = data.generator_limit
      }

      await fastify.models_mining_power.updateBatteryGeneratorBalance(_user.id, batteryBalance, generatorBalance)
    }
    

    const obj = {
      power_price: Number(fastify.config.powerPrice), 
      power_poe: Number(fastify.config.powerPrice)*data.poe_balance,
      power_balance:data.power_balance,    
      battery_balance: batteryBalance,
      battery_capacity: data.battery_capacity, 
      battery_level: data.battery_level,      
      generator_limit: data.generator_limit, 
      generator_balance: generatorBalance, 
      generator_level: data.generator_level, 
      price_rize_generator: 2**(data.generator_level)*Number(fastify.config.stepGeneratorPrice),
      power_rize_generator: Number(fastify.config.stepGeneratorLim),
      price_rize_battery: 2**(data.battery_level+1)*Number(fastify.config.stepBatteryPrice),
      power_rize_battery: Number(fastify.config.stepBatteryCap)*(1+0.2*data.battery_level),
      recovery_power_lim: Number(fastify.config.recoveryGeneratorLim),
      multitab: data.multitab,
      price_rize_multitab: 2**(data.multitab-1)*Number(fastify.config.stepMultitabPrice),
      level: data.level

    }

    //console.log('Mining data:', obj);

    return {...obj};

  })
}
