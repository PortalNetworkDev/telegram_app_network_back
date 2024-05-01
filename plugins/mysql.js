'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (f, opts) {
    await f.register(require('@fastify/mysql'), {
        promise: true,
        host: f.config.dbHost,
        port: f.config.dbPort,
        user: f.config.dbUser,
        password: f.config.dbPassword,
        database: f.config.dbName,
    })


    f.mysql.select = async function(sql,values) {
        try {     

            const connection = await f.mysql.getConnection()     
            const [rows, fields] = await connection.execute(sql, values);
            connection.release()

            return {rows,fields}
          } catch (err) {
            console.log(err);
          }
    }

    f.mysql.insert = async function(sql,values) {
        try {     
            const connection = await f.mysql.getConnection()     
            const [result, fields] = await connection.execute(sql, values);
            connection.release()
            return {result,fields}
          } catch (err) {
            console.log(err);
          }
    }

    f.mysql.update = f.mysql.insert; // same
})
