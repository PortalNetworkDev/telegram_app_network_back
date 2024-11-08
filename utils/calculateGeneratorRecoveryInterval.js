export const calculateGeneratorRecoveryInterval = (generatorCapacity, generatorLevel) => {
    const defaultInterval = 1000;
    const bonusTimePerLvl = generatorLevel * (generatorLevel * 0.25);
    const decreaseIntervalTime = generatorCapacity * 0.001 + bonusTimePerLvl;
    return defaultInterval - decreaseIntervalTime;
};
