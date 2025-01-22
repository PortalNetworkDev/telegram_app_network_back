import {
  Transaction,
  TransactionHistoryItem,
  TransactionModel,
} from "./transactions.types";

export const transformSqlRowToTransactionData = (
  input: TransactionModel
): Transaction => ({
  senderId: input.sender_id,
  recipientId: input.recipient_id,
  powerAmount: input.power_amount,
  creationTime: input.creation_time,
});

export const transformTransactionHistoryItemData = (
  transactionData: TransactionModel,
  senderUserName: string,
  recipientUserName: string
): TransactionHistoryItem => {
  return {
    ...transformSqlRowToTransactionData(transactionData),
    senderUserName,
    recipientUserName,
  };
};

export const getTimePeriodSQLCondition = (period: {
  from?: number;
  to?: number;
}) => {
  const { from, to } = period;
  if (from && to) {
    return `creation_time <=${from} AND creation_time >=${to}`;
  }

  if (from && !to) {
    return `creation_time <=${from}`;
  } else {
    return `creation_time >=${to}`;
  }
};
