import { DataBaseQueryResult } from "../../plugins/mysql/mysql.types";

export interface MiningPowerModal {
  rowid: number;
  user_id: number;
  poe_balance: number;
  level: number;
  power_balance: number;
  battery_balance: number;
  battery_capacity: number;
  battery_level: number;
  generator_limit: number;
  generator_balance: number;
  generator_level: number;
  multitab: number;
  time_last_spin: string;
  time_last_claim: string;
  time_last_update: string;
}

export interface MiningPowerService {
  createUserMiningData: (
    userId: number,
    batteryCapacity: number,
    generatorLimit: number
  ) => Promise<DataBaseQueryResult<MiningPowerModal> | null>;

  getMiningData: (userId: number) => Promise<MiningPowerModal | null>;

  updatePowerBalance: (userId: number, powerBalance: number) => Promise<void>;

  addPowerBalance: (userId: number, addPowerBalance: number) => Promise<void>;

  updateBatteryBalance: (
    userId: number,
    addPowerBalance: number
  ) => Promise<void>;

  updateBatteryCapacity: (
    userId: number,
    batteryCapacity: number
  ) => Promise<void>;

  updateGeneratorLimit: (
    userId: number,
    generatorLimit: number
  ) => Promise<void>;

  updateGeneratorBalance: (
    userId: number,
    generatorBalance: number
  ) => Promise<void>;

  claimBattery: (userId: number) => Promise<void>;

  generatingEnergy: (
    userId: number,
    generatorBalance: number,
    batteryBalance: number
  ) => Promise<void>;

  updatePoeBalance: (userId: number, poeBalance: number) => Promise<void>;

  updateBatteryGeneratorBalance: (
    userId: number,
    batteryBalance: number,
    generatorBalance: number
  ) => Promise<void>;

  buyBatteryCapacity: (
    userId: number,
    batteryCapacity: number,
    price: number
  ) => Promise<void>;

  buyGeneratorLimit: (
    userId: number,
    batteryCapacity: number,
    price: number
  ) => Promise<void>;

  buyMultitab: (userId: number, price: number) => Promise<void>;

  getUserPowerBalance: (userId: number) => Promise<number>;

  subtractPowerBalance: (
    userId: number,
    addPowerBalance: number
  ) => Promise<void>;

  reduceUserPowerBalance: (userId: number, amount: number) => Promise<void>;
}
