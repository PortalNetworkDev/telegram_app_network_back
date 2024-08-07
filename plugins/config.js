'use strict'

const fp = require('fastify-plugin')

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {


  const config = {
    "bottoken": process.env.BOTTOKEN,
    "referalreward": process.env.REFERALREWARD,
    "admins": process.env.ADMINS.split(","),
    "dbHost": process.env.DBHOST,
    "dbUser": process.env.DBUSER,
    "dbPassword": process.env.DBPASSWORD,
    "dbName": process.env.DBNAME,
    "dbPort": process.env.DBPORT,
    "mnemonic": process.env.MNEMONIC,
    "tonwebapikey": process.env.TONWEBAPIKEY,
    "jettonaddress": process.env.JETTONADDRESS,
    "minrewardfortransfer": process.env.MINREWARDFORTRANSFER,
    "tokensymbol": process.env.TOKENSYMBOL,
    "lptokenaddress": process.env.LPTOKENADDRESS,
    "jettonaddressraw": process.env.JETTONADDRESSRAW,
    "farmingcollectionaddresraw": process.env.FARMINGCOLLECTIONADDRESSRAW,
    "tonApiToken": process.env.TONAPITOKEN,
    "balanceHistoryInterval": process.env.BALANCEHISTORYINTERVAL,
    "airDropRefSum": process.env.AIRDROPREFSUM,
    "airDropRefMasterId": process.env.AIRDROPREFMASTERID
  }

  fastify.decorate('config', config)
})
