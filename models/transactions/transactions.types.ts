export interface Transaction {
  senderId: number;
  recipientId: number;
  powerAmount: number;
  creationTime: number;
  comment?: string;
}

export interface TransactionModel {
  id: number;
  sender_id: number;
  recipient_id: number;
  power_amount: number;
  creation_time: number;
  comment: string;
}
export interface TransactionHistoryItem extends Transaction {
  senderUserName: string;
  recipientUserName: string;
}

export interface TransactionsService {
  addTransaction: (data: Transaction) => Promise<void>;
  getTransactionById: (id: number) => Promise<Transaction | null>;
  getTransactionsByUserId: (
    userId: number,
    limit?: number,
    offset?: number
  ) => Promise<Transaction[]>;
  getTransactionsByUserIdAndTime: (
    userId: number,
    timePeriod: { from?: number; to?: number },
    limit?: number,
    offset?: number
  ) => Promise<Transaction[]>;

  getLastUserTransactions: (userId: number, amount: number) => Promise<Transaction[]>
}
