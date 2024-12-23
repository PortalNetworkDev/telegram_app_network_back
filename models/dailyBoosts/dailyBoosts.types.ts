export interface GeneratorRecoveryBoostModel {
  id: number;
  userId: number;
  amountAttemptsLeft: number;
  previousActivationTime: number;
  maxAvailableAttempts: number;
}

export interface GeneratorRecoveryBoostService {
  reduceUserAttemptsForRecoverGenerator: (
    userId: number,
    amount: number
  ) => Promise<void>;
  getMaxAvailableAttempts: () => Promise<number | null>;

  getGeneratorRecoveryBoostInfoByUserId: (
    userId: number
  ) => Promise<GeneratorRecoveryBoostModel | null>;

  amountAttemptsLeftByUserId: (userId: number) => Promise<number | null>;

  addUserIntoTable: (
    userId: number,
    attemptsLeft: number,
    previousActivationTime: number,
    maxAvailableAttempts: number
  ) => Promise<void>;
  getPreviousActivationTime: (userId: number) => Promise<number | null>;
}
