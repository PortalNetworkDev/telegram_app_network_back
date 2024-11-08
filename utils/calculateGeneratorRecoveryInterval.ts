export const calculateGeneratorRecoveryInterval = (
  generatorCapacity: number,
  generatorLevel: number
) => {
  const defaultInterval = 1000;

  const bonusTimePerLvl = generatorLevel * (generatorLevel * 0.25);
  const decreaseIntervalTime = generatorCapacity * 0.001 + bonusTimePerLvl;

  return defaultInterval - decreaseIntervalTime;
};
