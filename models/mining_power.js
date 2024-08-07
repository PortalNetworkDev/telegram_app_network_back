'use strict'

const fp = require('fastify-plugin');

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {

    const miningData = `
        CREATE TABLE IF NOT EXISTS mining_data (
            rowid bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id bigint NOT NULL,
            poe_balance float NOT NULL DEFAULT 0,
            power_balance bigint NOT NULL DEFAULT 0,
            battery_balance bigint NOT NULL DEFAULT 0,
            battery_capacity bigint NOT NULL DEFAULT 0,
            battery_level int NOT NULL DEFAULT 0,
            generator_limit bigint NOT NULL DEFAULT 0,
            generator_balance bigint NOT NULL DEFAULT 0,
            generator_level int NOT NULL DEFAULT 0,
            time_last_spin datetime NOT NULL,
            time_last_claim datetime NOT NULL,
            time_last_update datetime NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await fastify.mysql.insert(miningData)

    async function createUserMiningData(user_id, battery_capacity, generator_limit){
        let sql = `INSERT INTO mining_data (user_id, battery_capacity, generator_limit, time_last_spin, time_last_claim, time_last_update) VALUES (?,?,?, NOW(), NOW(), NOW())`

        let values = [user_id, battery_capacity, generator_limit]
        
        await fastify.mysql.insert(sql, values)
    }

    async function getMiningData(user_id){
        let sql = `select * from mining_data where user_id=?`;
        let {rows} = await fastify.mysql.select(sql,[user_id])

        if(rows.length == 0){
            console.log("Creating mining data for user", user_id)
            await createUserMiningData(user_id, fastify.config.batteryStart, fastify.config.generatorStart)
            rows = await fastify.mysql.select(sql,[user_id])
        }

        return rows[0]
    }

    async function updatePowerBalance(user_id, power_balance) {
        let sql = `update mining_data set power_balance = ? where user_id = ?`;
        await fastify.mysql.update(sql,[power_balance, user_id])
    }

    async function updateBatteryBalance(user_id, battery_balance) {
        let sql = `update mining_data set battery_balance = ? where user_id = ?`;
        await fastify.mysql.update(sql,[battery_balance, user_id])
    }


    async function updateGeneratorBalance(user_id, generator_balance) {
        let sql = `update mining_data set generator_balance = ? where user_id = ?`;
        await fastify.mysql.update(sql,[generator_balance, user_id])
    }

    async function updatePoeBalance(user_id, poe_balance) {
        let sql = `update mining_data set poe_balance = ? where user_id = ?`;
        await fastify.mysql.update(sql,[poe_balance, user_id])
    }

    async function updateBatteryCapacity(user_id, battery_capacity) {
        let sql = `update mining_data set battery_capacity = ? where user_id = ?`;
        await fastify.mysql.update(sql,[battery_capacity, user_id])
    }

    async function updateGeneratorLimit(user_id, generator_limit) {
        let sql = `update mining_data set generator_limit = ? where user_id = ?`;
        await fastify.mysql.update(sql,[generator_limit, user_id])
    }

    
    //по нескольку сразу по кейсам

    async function claimBattery(user_id) {
        let sql = `update mining_data set power_balance=power_balance+battery_balance, battery_balance = 0, time_last_claim = NOW() where user_id = ?`;
        await fastify.mysql.update(sql,[user_id])
    }

    async function generatingEnergy(user_id, generator_balance, battery_balance) {
        let sql = `update mining_data set generator_balance = ?, battery_balance = ?, time_last_spin = NOW(), time_last_update = NOW() where user_id = ?`;
        await fastify.mysql.update(sql,[generator_balance, battery_balance, user_id])
    }

    async function updateBatteryGeneratorBalance(user_id, battery_balance, generator_balance) {
        let sql = `update mining_data set generator_balance = ?, battery_balance = ?, time_last_update = NOW() where user_id = ?`;
        await fastify.mysql.update(sql,[generator_balance, battery_balance, user_id])
    }

    async function buyBatteryCapacity(user_id, battery_capacity, price) {
        let sql = `update mining_data set battery_capacity = ?, power_balance=power_balance-?, battery_level=battery_level+1 where user_id = ?`;
        await fastify.mysql.update(sql,[battery_capacity, price, user_id])
    }

    async function buyGeneratorLimit(user_id, generator_limit, price) {
        let sql = `update mining_data set generator_limit = ?, power_balance=power_balance-?, generator_level=generator_level+1 where user_id = ?`;
        await fastify.mysql.update(sql,[generator_limit, price, user_id])
    }


   


    fastify.decorate("models_mining_power",{
        createUserMiningData,
        getMiningData,
        updatePowerBalance,
        updateBatteryBalance,
        updateBatteryCapacity,
        updateGeneratorLimit,
        updateGeneratorBalance,
        claimBattery,
        generatingEnergy,
        updatePoeBalance,
        updateBatteryGeneratorBalance,
        buyBatteryCapacity,
        buyGeneratorLimit,
    })

})
