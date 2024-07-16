'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {


    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id BIGINT NOT NULL, 
            wallet VARCHAR(255) NOT NULL , 
            first_name VARCHAR(255) NOT NULL , 
            last_name VARCHAR(255) NOT NULL , 
            username VARCHAR(255) NOT NULL , 
            language_code VARCHAR(3) NOT NULL , 
            is_premium BOOLEAN NOT NULL , 
            allows_write_to_pm BOOLEAN NOT NULL , 
            referal_reward FLOAT NOT NULL , 
            last_updated BIGINT NOT NULL ,
            tg_token TEXT,
            PRIMARY KEY (\`id\`)
        ) ENGINE = InnoDB CHARSET=utf8mb3 COLLATE utf8mb3_general_ci;
    `;

    const userReferalsTable = `
        CREATE TABLE IF NOT EXISTS referal_users (
            user_id BIGINT NOT NULL,
            referal_user_id BIGINT NOT NULL,
            reward FLOAT NOT NULL,
            is_rewarded BOOLEAN DEFAULT 0,
            last_updated BIGINT
        ) ENGINE = InnoDB CHARSET=utf8mb3 COLLATE utf8mb3_general_ci;`;

    await fastify.mysql.insert(usersTable)
    await fastify.mysql.insert(userReferalsTable)

    const createUser = async (user, tg_token) => {
        if(user.first_name)
            user.first_name = user.first_name.replace(/[^a-zA-Z0-9а-яё ]/g, "")

        if(user.last_name)
            user.last_name = user.last_name.replace(/[^a-zA-Z0-9а-яё ]/g, "")

        let sql = `INSERT INTO users (id, first_name,last_name,username,language_code,is_premium,allows_write_to_pm, last_updated,referal_reward,wallet, tg_token) 
        VALUES (?, ?,?,?,?,?,?, ?,?,"",?)`
        let values = [user.id, user.first_name,(user.last_name) ? user.last_name : "", (user.username) ? user.username: "",user.language_code,(user.is_premium) ? user.is_premium: 0,(user.allows_write_to_pm) ? user.allows_write_to_pm : 0, Date.now(), fastify.config.referalreward, tg_token]
        
        await fastify.mysql.insert(sql, values)
    }

    const addReferalUser = async (user_id, referal_user_id) => {

        const user = await getUser(user_id);

        let sql = `INSERT INTO referal_users (user_id, referal_user_id, reward, is_rewarded, last_updated)
        VALUES (?, ?, ?, ?, ?)
        `
        let values = [user_id, referal_user_id, user.referal_reward, 0, Date.now()]
        await fastify.mysql.insert(sql, values)
    }

    const checkReferaluser = async (user_id, referal_user_id) => {
        const {rows} = await fastify.mysql.select("select * from referal_users where user_id = ? and referal_user_id = ?",[user_id, referal_user_id])
        
        if(!rows.length){
            return false;
        }else{
            return true;
        }
    }

    const countReferalUsers = async (user_id) => {
        const {rows} = await fastify.mysql.select("select count(*) from referal_users JOIN user_task_state on user_task_state.user_id = referal_users.referal_user_id where referal_users.user_id = ? and user_task_state.task_id = 5 and user_task_state.is_complite = 1",[user_id])
        return rows[0]["count(*)"];
    }

    const getReferalUsersUnrewarded = async (user_id) => {
        const {rows} = await fastify.mysql.select(`
            select  
            referal_users.user_id as user_id,
            referal_users.referal_user_id as referal_user_id,
            referal_users.reward as reward,
            referal_users.is_rewarded as is_rewarded,
            referal_users.last_updated as last_updated
            from referal_users JOIN user_task_state on user_task_state.user_id = referal_users.referal_user_id where referal_users.user_id = ? and referal_users.is_rewarded = 0 and user_task_state.task_id = 5 and user_task_state.is_complite = 1;
        `,[user_id])
        return rows;
    }

    const setRewarded = async (user_id, referal_user_id) => {
        let sql = `update referal_users set is_rewarded = 1 where user_id = ? and referal_user_id = ?`;
        console.log("setRewarded", user_id, referal_user_id)
        await fastify.mysql.update(sql,[user_id, referal_user_id])
    }


    const updateLastUpdated = async (id) => {
        let sql = `update users set last_updated = ? where id = ?`;
        await fastify.mysql.update(sql,[Date.now(), id])
    }

    const updateWallet = async (id, wallet) => {
        let sql = `update users set wallet = ? where id = ?`;
        await fastify.mysql.update(sql,[wallet, id])
    }

    const sameWalletExist = async (id, wallet) => {
        const {rows} = await fastify.mysql.select("select count(*) from users where wallet = ? and id != ?",[wallet, id])
        if (rows[0]["count(*)"]>0)
            return true
        return false
    }

    const updateReward = async (id, referal_reward) => {
        let sql = `update users set referal_reward = ? where id = ?`;
        await fastify.mysql.update(sql,[referal_reward, id])
    }

    const userExist = async (id) => {
        const {rows} = await fastify.mysql.select("select * from users where id = ?",[id])

        if(!rows.length){
            return false;
        }else{
            return true;
        }
    }

    const getUser = async (id) => {
        const {rows} = await fastify.mysql.select("select * from users where id = ?",[id])
        if(!rows.length){
            return false;
        }else{
            return rows[0];
        }
    }

    const getUsers = async (id) => {
        const {rows} = await fastify.mysql.select("select * from users")
        return rows
    }

    const getActiveUsers = async (id) => {
        const {rows} = await fastify.mysql.select("select * from users where last_updated > UNIX_TIMESTAMP(NOW() - INTERVAL 1 HOUR)*1000")
        return rows
    }

    const checkAirDropUser = async (user_id, referal_user_id) => {
        const {rows} = await fastify.mysql.select("select * from referal_users where user_id = ? and referal_user_id = ? and is_rewarded = 0",[user_id, referal_user_id])
        
        if(!rows.length){
            return false;
        }else{
            return true;
        }
    }

    if(!await userExist(1))
        await createUser({
            "id": 1,
            "first_name": "Durov",
            "last_name": "Tester",
            "username": "durov",
            "language_code": "ru",
            "is_premium": true,
            "allows_write_to_pm": true
        },"")

    fastify.decorate("models_user",{
        createUser,
        userExist,
        updateLastUpdated,
        updateWallet,
        sameWalletExist,
        getUser,
        addReferalUser,
        checkReferaluser,
        getUsers,
        updateReward,
        getActiveUsers,
        getReferalUsersUnrewarded,
        setRewarded,
        countReferalUsers,
        checkAirDropUser
    })


})
