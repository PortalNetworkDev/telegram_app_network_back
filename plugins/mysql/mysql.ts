"use strict";

import { fastifyMysql, MySQLRowDataPacket } from "@fastify/mysql";
import createPlugin from "fastify-plugin";

import { FastifyPluginAsync } from "fastify";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  const { config } = fastify;

  fastify
    // @ts-ignore: Unreachable code error
    .register(fastifyMysql, {
      promise: true,
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
    });

  const select = async (sql: string, values?: any[]) => {
    try {
      const connection = await fastify.mysql.getConnection();
      const [rows, fields] = await connection.execute<MySQLRowDataPacket[]>(
        sql,
        values
      );
      connection.release();

      return { rows, fields };
    } catch (err) {
      console.log(err);

      return null;
    }
  };

  const insert = async (sql: string, values?: any[]) => {
    try {
      const connection = await fastify.mysql.getConnection();
      const [rows, fields] = await connection.execute<MySQLRowDataPacket[]>(
        sql,
        values
      );

      connection.release();

      return { rows, fields };
    } catch (err) {
      console.log(err);

      return null;
    }
  };

  const update = insert;
  const query = insert;

  fastify.decorate("dataBase", { select, insert, update, query });
});
