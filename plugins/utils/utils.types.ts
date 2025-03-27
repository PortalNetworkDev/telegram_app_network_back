export interface Utils {
  getBalances: (wallet: string) => Promise<{
    pool_balance: number;
    token_balance: number;
  }>;

  getFarmingNft: (wallet: string) => Promise<number>;
  checkBuyTokenStonFi: (wallet: string) => Promise<boolean>;
  sleep: (ms: number) => Promise<unknown>;
  csvParser: <T>(file: string, delimeter?: string) => Promise<T[]>;
}

export interface CsvTaskFileProps {
  id: number;
  title: string;
  label: string;
  description: string;
  type: string;
  category_id: number;
  reward: number;
  icon_url: string;
  other: string;
}

export interface CsvCategoryFileProps {
  id: number;
  label: string;
  description: string;
}
