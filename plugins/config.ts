"use strict";

import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  //TODO: are config vars always string or they acn be number?

  const config = {
    bottoken: process.env.BOTTOKEN,
    referalreward: process.env.REFERALREWARD,
    admins: process.env.ADMINS?.split(","),
    dbHost: process.env.DBHOST,
    dbUser: process.env.DBUSER,
    dbPassword: process.env.DBPASSWORD,
    dbName: process.env.DBNAME,
    dbPort: process.env.DBPORT,
    mnemonic: process.env.MNEMONIC,
    tonwebapikey: process.env.TONWEBAPIKEY,
    jettonaddress: process.env.JETTONADDRESS,
    minrewardfortransfer: process.env.MINREWARDFORTRANSFER,
    tokensymbol: process.env.TOKENSYMBOL,
    lptokenaddress: process.env.LPTOKENADDRESS,
    jettonaddressraw: process.env.JETTONADDRESSRAW,
    farmingcollectionaddresraw: process.env.FARMINGCOLLECTIONADDRESSRAW,
    tonApiToken: process.env.TONAPITOKEN,
    balanceHistoryInterval: process.env.BALANCEHISTORYINTERVAL,
    airDropRefSum: process.env.AIRDROPREFSUM,
    airDropRefMasterId: process.env.AIRDROPREFMASTERID,
    powerPrice: process.env.POWERPRICE,
    batteryStart: process.env.BATTERYSTART,
    generatorStart: process.env.GENERATORSTART,
    stepBatteryPrice: process.env.STEPBATTERYPRICE,
    stepGeneratorPrice: process.env.STEPGENERATORPRICE,
    stepBatteryCap: process.env.STEPBATTERYCAP,
    stepGeneratorLim: process.env.STEPGENERATORLIM,
    recoveryGeneratorLim: process.env.RECOVERYGENERATORLIM,
    stepMultitabPrice: process.env.STEPMULTITABPRICE,
    forReferalPowerReward: process.env.FORREFERALPOWERREWARD,
    toReferalPowerReward: process.env.TOREFERALPOWERREWARD,
    shopLotteryRollPrice: process.env.SHOP_LOTTERY_ROLL_PRICE,
    maxAvailableAttemptsToRecoveryGenerator:
      process.env.MAX_AVAILABLE_ATTEMPTS_TO_RECOVER_GENERATOR,
    recoveryGeneratorBootsActivationPeriodLimit:
      process.env.RECOVERY_GENERATOR_BOOST_ACTIVATION_PERIOD_LIMIT,
    maxDayNumberForClaimGift : process.env.MAX_DAY_NUMBER_FOR_CLAIM_GIFT,
  };

  fastify.decorate("config", config);
});
