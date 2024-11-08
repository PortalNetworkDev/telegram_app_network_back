import createPlugin from "fastify-plugin";
import { MAX_PRICE_FOR_UPGRADE } from "../constants/constants.js";
export default createPlugin((fastify, opts, done) => {
    const calculateGeneratorRecoveryInterval = (generatorCapacity, generatorLevel) => {
        const defaultInterval = 1000;
        const bonusTimePerLvl = generatorLevel * (generatorLevel * 0.25);
        const decreaseIntervalTime = generatorCapacity * 0.001 + bonusTimePerLvl;
        return defaultInterval - decreaseIntervalTime;
    };
    const calculatePriceRiseBattery = (batteryLevel, upgradeCost) => 2 ** Math.round((batteryLevel + 1) / 2) * Number(upgradeCost);
    const calculatePriceRiseBatteryWithLimit = (batteryLevel, upgradeCost, limit = MAX_PRICE_FOR_UPGRADE) => {
        const price = calculatePriceRiseBattery(batteryLevel, upgradeCost);
        return price >= limit ? limit : price;
    };
    fastify.decorate("calculationUtils", {
        calculatePriceRiseBattery,
        calculatePriceRiseBatteryWithLimit,
        calculateGeneratorRecoveryInterval,
    });
    done();
});
