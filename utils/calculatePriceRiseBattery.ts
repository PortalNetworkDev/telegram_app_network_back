import { MAX_PRICE_FOR_UPGRADE } from "./constants/constants";

export const calculatePriceRiseBattery = (
  batteryLevel: number,
  upgradeCost: number
) => 2 ** Math.round((batteryLevel + 1) / 2) * Number(upgradeCost);

export const calculatePriceRiseBatteryWithLimit = (
  batteryLevel: number,
  upgradeCost: number,
  limit: number = MAX_PRICE_FOR_UPGRADE
) => {
  const price = calculatePriceRiseBattery(batteryLevel, upgradeCost);

  return price >= limit ? limit : price;
};
