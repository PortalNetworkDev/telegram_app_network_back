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
            console.log("select before init connection")
            const connection = await f.mysql.getConnection()     
            console.log("select after init connection")
            const [rows, fields] = await connection.execute(sql, values);
            console.log("select after execute")
            connection.release()
            console.log("select after release")
            f.mysql.connection.end();
            console.log("select after f.mysql.connection.end")
            return {rows,fields}
          } catch (err) {
            console.log(err);
          }
    }

    f.mysql.insert = async function(sql,values) {
        try {     
            console.log("insert|update before init connection")
            const connection = await f.mysql.getConnection()     
            console.log("insert|update after init connection")  
            const [result, fields] = await connection.execute(sql, values);
            console.log("insert|update after execute")
            connection.release()
            console.log("insert|update after release")
            f.mysql.connection.end();
            console.log("insert|update after f.mysql.connection.end")
            return {result,fields}
          } catch (err) {
            console.log(err);
          }
    }

    f.mysql.update = f.mysql.insert; // same
})
