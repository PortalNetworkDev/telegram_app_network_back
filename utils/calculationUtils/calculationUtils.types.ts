export interface CalculationUtils {
  calculatePriceRiseBattery: (
    batteryLevel: number,
    upgradeCost: number
  ) => number;
  calculatePriceRiseBatteryWithLimit: (
    batteryLevel: number,
    upgradeCost: number,
    limit?: number
  ) => number;
  calculateGeneratorRecoveryInterval: (
    generatorCapacity: number,
    generatorLevel: number
  ) => number;

  calculateUserMiningLevel: (
    userBalance: number,
    powerBalanceForFirstLevel: number
  ) => number;

  getNextMiningLevelEdge: (
    currentLvl: number,
    powerBalanceForFirstLevel: number
  ) => number;
}
