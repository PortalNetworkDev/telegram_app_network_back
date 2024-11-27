import { FastifyPluginCallback } from "fastify";
import {
  Transaction,
  TransactionHistoryItem,
  TransactionModel,
} from "../transactions.types";

import createPlugin from "fastify-plugin";

export default createPlugin<FastifyPluginCallback>(async (fastify, opts) => {
  const transformSqlRowToTransactionData = (
    input: TransactionModel
  ): Transaction => ({
    senderId: input.sender_id,
    recipientId: input.recipient_id,
    powerAmount: input.power_amount,
    creationTime: input.creation_time,
  });

  const transformTransactionHistoryItemData = (
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

  const getTimePeriodSQLCondition = (period: {
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

  fastify.decorate("transactionsUtils", {
    transformSqlRowToTransactionData,
    transformTransactionHistoryItemData,
    getTimePeriodSQLCondition,
  });
});
