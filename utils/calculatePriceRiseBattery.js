import { MAX_PRICE_FOR_UPGRADE } from "./constants/constants.js";
export const calculatePriceRiseBattery = (batteryLevel, upgradeCost) => 2 ** Math.round((batteryLevel + 1) / 2) * Number(upgradeCost);
export const calculatePriceRiseBatteryWithLimit = (batteryLevel, upgradeCost, limit = MAX_PRICE_FOR_UPGRADE) => {
    const price = calculatePriceRiseBattery(batteryLevel, upgradeCost);
    return price >= limit ? limit : price;
};
