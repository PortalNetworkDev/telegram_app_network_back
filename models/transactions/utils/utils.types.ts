import {Transaction, TransactionHistoryItem, TransactionModel} from "../transactions.types";

export interface TransactionsUtils {
  transformSqlRowToTransactionData: (input: TransactionModel) => Transaction;
  transformTransactionHistoryItemData: (
    transactionData: TransactionModel,
    senderUserName: string,
    recipientUserName: string
  ) => TransactionHistoryItem;
  getTimePeriodSQLCondition: (period: { from?: number; to?: number }) => string;
}
