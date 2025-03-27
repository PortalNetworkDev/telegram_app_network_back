import { FastifyInstance } from "fastify";
import {
  Transaction,
  TransactionHistoryItem,
  TransactionModel,
} from "./transactions.types";

export const transformSqlRowToTransactionData = (
  input: TransactionModel
): Transaction => ({
  id: input.id,
  senderId: input.sender_id,
  recipientId: input.recipient_id,
  powerAmount: input.power_amount,
  creationTime: input.creation_time,
  type: input.type ?? 'transfer',
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

export const addTransactionForReferralSystemParticipant = async (
  fastify: FastifyInstance,
  inviterId: number,
  referralId: number
) => {
  await fastify.transactions.addTransaction({
    senderId: referralId,
    recipientId: inviterId,
    powerAmount: Number(fastify.config.toReferalPowerReward),
    creationTime: Date.now(),
    type: "invitation",
  });

  await fastify.transactions.addTransaction({
    senderId: inviterId,
    recipientId: referralId,
    powerAmount: Number(fastify.config.forReferalPowerReward),
    creationTime: Date.now(),
    type: "referral",
  });
};
