'use strict'

const fp = require('fastify-plugin');

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {

    const balanceHistory = `
        CREATE TABLE IF NOT EXISTS balance_history (
            id bigint NOT NULL,
            user_id bigint NOT NULL,
            token_balance bigint NOT NULL,
            pool_balance bigint NOT NULL,
            create_time date NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await fastify.mysql.insert(balanceHistory)


    async function addHistory(user_id, token_balance, pool_balance){
        let sql = `INSERT INTO balance_history (user_id, token_balance, pool_balance, create_time) VALUES (?,?,?,?)`

        let values = [user_id, token_balance, pool_balance]
        
        await fastify.mysql.insert(sql, values)
    }

    async function getHoleInHistoryTokenBalance(user_id, period = 14){
        let sql = `select * from balance_history where user_id=? and token_balance > 0 and create_time >= (NOW() - INTERVAL ? DAY) `;
        const {rows} = await fastify.mysql.select(sql,[user_id,period])
        return rows
    }


    async function checkTokenBalanceByPeriod(user_id, period = 14){
        const elements = await getHoleInHistoryTokenBalance(user_id,period)

        if(elements.length != period)
            return false
        
        return true;
    }

    async function getHoleInHistoryPoolBalance(user_id, period = 14){
        let sql = `select * from balance_history where user_id=? and pool_balance > 0 and create_time >= (NOW() - INTERVAL ? DAY) `;
        const {rows} = await fastify.mysql.select(sql,[user_id,period])
        return rows
    }


    async function checkPoolBalanceByPeriod(user_id, period = 14){
        const elements = await getHoleInHistoryPoolBalance(user_id,period)

        if(elements.length != period)
            return false
        
        return true;
    }

    


    fastify.decorate("models_balance_history",{
        addHistory,
        getHoleInHistoryTokenBalance,
        checkTokenBalanceByPeriod,
        getHoleInHistoryPoolBalance,
        checkPoolBalanceByPeriod
    })

})