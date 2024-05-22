'use strict'

const fp = require('fastify-plugin');

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {

    const balanceHistory = `
        CREATE TABLE IF NOT EXISTS balance_history (
            id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id bigint NOT NULL,
            token_balance float NOT NULL,
            pool_balance float NOT NULL,
            create_time date NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;
    await fastify.mysql.insert(balanceHistory)


    async function addHistory(user_id, token_balance, pool_balance){
        let sql = `INSERT INTO balance_history (user_id, token_balance, pool_balance, create_time) VALUES (?,?,?,NOW())`

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

    async function getUsersWhoNotSetBalanceHistoryToday(){
        /*const sql = `select 
        users.id as user_id , 
        users.wallet as wallet, 
        (select create_time 
            from balance_history 
            where user_id=users.id 
            and create_time >= (NOW() - INTERVAL 1 DAY)
        ) as create_time 
        from users 
        where wallet != "";`*/

        const sql = `SELECT
        users.id AS user_id,
        users.wallet AS wallet,
        (SELECT create_time
         FROM balance_history
         WHERE user_id = users.id
           AND create_time >= (NOW() - INTERVAL 1 DAY)
        ) AS create_time
        FROM users
        WHERE wallet != ""
        AND users.id IN (
          SELECT user_id
          FROM user_task_state
          WHERE task_id = 8
            AND is_complite = 0
        );`
        //добавлено что не выполнено задание 8
        const {rows} = await fastify.mysql.select(sql)
        return rows
    }

    async function checkDaysInHistoryTokenBalance(user_id, period = 3){
        let sql = `
        SELECT COUNT(*) AS count 
        FROM balance_history 
        WHERE user_id = ? 
        AND token_balance > 0 
    `;
        const {rows} = await fastify.mysql.select(sql,[user_id])
        const count = rows[0].count;

        if (count >= period)
            return true

        return false
    }

    fastify.decorate("models_balance_history",{
        addHistory,
        getHoleInHistoryTokenBalance,
        checkTokenBalanceByPeriod,
        getHoleInHistoryPoolBalance,
        checkPoolBalanceByPeriod,
        getUsersWhoNotSetBalanceHistoryToday,
        checkDaysInHistoryTokenBalance
    })

})
