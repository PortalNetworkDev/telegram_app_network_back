"use strict";

import createPlugin from "fastify-plugin";
import mysql from "@fastify/mysql";

export default createPlugin(async function (fastify, opts) {
  const { config } = fastify;

  await fastify.register(mysql, {
    promise: true,
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
  });

  fastify.mysql.select = async function (sql, values) {
    try {
      const connection = await fastify.mysql.getConnection(
        (err, connection) => {
          if (err) {
            console.log("Error while connecting ", err);
          } else {
            if (connection) connection.release();
            console.log("Database Connected Successfully!");
          }
        }
      );
      const [rows, fields] = await connection.execute(sql, values);
      connection.release();

      return { rows, fields };
    } catch (err) {
      console.log(err);
    }
  };

  fastify.mysql.insert = async function (sql, values) {
    try {
      const connection = await fastify.mysql.getConnection(
        (err, connection) => {
          if (err) {
            console.log("Error while connecting ", err);
          } else {
            if (connection) connection.release();
            console.log("Database Connected Successfully!");
          }
        }
      );
      const [result, fields] = await connection.execute(sql, values);
      connection.release();
      return { result, fields };
    } catch (err) {
      console.log(err);
    }
  };

  fastify.mysql.update = fastify.mysql.insert;
  fastify.mysql.query = fastify.mysql.insert;
});
