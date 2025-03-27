import { FastifyPluginAsync } from "fastify";
import createPlugin from "fastify-plugin";
import { MAX_PRICE_FOR_UPGRADE } from "../constants/constants.js";

export default createPlugin<FastifyPluginAsync>(async (fastify, opts) => {
  const calculateGeneratorRecoveryInterval = (
    generatorCapacity: number,
    generatorLevel: number
  ) => {
    const defaultInterval = 1000;

    const bonusTimePerLvl = generatorLevel * (generatorLevel * 0.25);
    const decreaseIntervalTime = generatorCapacity * 0.001 + bonusTimePerLvl;

    return defaultInterval - decreaseIntervalTime;
  };

  const calculatePriceRiseBattery = (
    batteryLevel: number,
    upgradeCost: number
  ) => 2 ** Math.round((batteryLevel + 1) / 2) * Number(upgradeCost);

  const calculatePriceRiseBatteryWithLimit = (
    batteryLevel: number,
    upgradeCost: number,
    limit: number = MAX_PRICE_FOR_UPGRADE
  ) => {
    const price = calculatePriceRiseBattery(batteryLevel, upgradeCost);

    return price >= limit ? limit : price;
  };

  const calculateUserMiningLevel = (
    userBalance: number,
    powerBalanceForFirstLevel: number
  ) => Math.floor((userBalance / powerBalanceForFirstLevel) ** (1 / 1.9));

  const getNextMiningLevelEdge = (
    currentLvl: number,
    powerBalanceForFirstLevel: number
  ) => Math.floor(powerBalanceForFirstLevel * Math.pow(currentLvl + 1, 1.9));

  fastify.decorate("calculationUtils", {
    calculatePriceRiseBattery,
    calculatePriceRiseBatteryWithLimit,
    calculateGeneratorRecoveryInterval,
    calculateUserMiningLevel,
    getNextMiningLevelEdge
  });
});
