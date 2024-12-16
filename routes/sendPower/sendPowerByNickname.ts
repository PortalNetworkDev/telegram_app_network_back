import { FastifyInstance, FastifyReply } from "fastify";
import {
  sendByIdBodySchema,
  sendByNickNameBodySchema,
} from "./sendPower.schemes.js";
import { UserModel } from "../../models/user/user.types";

interface Body {
  recipient: string;
  amount: number;
}
interface RequestHandlerParams {
  fastify: FastifyInstance;
  reply: FastifyReply;
  sendPowerAmount: number;
  senderId: number;
  recipient: {
    name?: string;
    id?: number;
  };
}

const validateUsers = (
  recipientInstance: UserModel | null,
  senderInstance: UserModel | null,
  senderBalance: number,
  sendPowerAmount: number,
  reply: FastifyReply
) => {
  if (recipientInstance?.id === senderInstance?.id) {
    return reply.badRequest("Recipient and sender should not be same");
  }

  if (senderBalance < sendPowerAmount) {
    return reply.badRequest("Sender has not enough power value to send");
  }

  if (!recipientInstance) {
    return reply.badRequest("Recipient do not exists");
  }

  if (!senderInstance) {
    return reply.badRequest("Sender do not exists");
  }

  return reply;
};

const makeTransferOfPower = async (
  fastify: FastifyInstance,
  recipientInstance: UserModel | null,
  senderInstance: UserModel | null,
  sendPowerAmount: number
) => {
  try {
    await fastify.miningPower.addPowerBalance(
      recipientInstance?.id ?? 0,
      sendPowerAmount
    );
  } catch (error) {
    console.log("error in addPowerBalance", error);
  }

  try {
    await fastify.miningPower.subtractPowerBalance(
      senderInstance?.id ?? 0,
      sendPowerAmount
    );
  } catch (error) {
    console.log("error in subtractPowerBalance", error);
  }

  try {
    await fastify.transactions.addTransaction({
      senderId: senderInstance?.id ?? 0,
      recipientId: recipientInstance?.id ?? 0,
      powerAmount: sendPowerAmount,
      creationTime: Date.now(),
    });
  } catch (error) {
    console.log("error in addTransaction", error);
  }
};

const handleRequest = async ({
  fastify,
  reply,
  sendPowerAmount,
  senderId,
  recipient,
}: RequestHandlerParams) => {
  const recipientInfoQuery = recipient.name
    ? fastify.modelsUser.getUserByNickname(recipient.name)
    : fastify.modelsUser.getUser(recipient.id ?? 0);

  const [senderInstance, recipientInstance, senderBalance] = await Promise.all([
    fastify.modelsUser.getUser(senderId),
    recipientInfoQuery,
    fastify.miningPower.getUserPowerBalance(senderId),
  ]);

  validateUsers(
    recipientInstance,
    senderInstance,
    senderBalance,
    sendPowerAmount,
    reply
  );

  await makeTransferOfPower(
    fastify,
    recipientInstance,
    senderInstance,
    sendPowerAmount
  );

  return { statusCose: 200, status: "ok" };
};

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>(
    "/send",
    { schema: { body: sendByNickNameBodySchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const senderId = fastify.getUser(request).id;
      const recipientName = request.body.recipient;
      const sendPowerAmount = request.body.amount;

      if (sendPowerAmount < 0) {
        return reply.badRequest("Funds amount should be more then 0");
      }

      if (recipientName && senderId) {
        await handleRequest({
          fastify,
          reply,
          sendPowerAmount,
          senderId,
          recipient: { name: recipientName },
        });
      }
    }
  );

  fastify.post<{ Body: { recipientId: number; amount: number } }>(
    "/sendById",
    { schema: { body: sendByIdBodySchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const senderId = fastify.getUser(request).id;

      const recipientId = request.body.recipientId;
      const sendPowerAmount = request.body.amount;

      if (sendPowerAmount < 0) {
        return reply.badRequest("Funds amount should be more then 0");
      }

      if (recipientId && senderId) {
        await handleRequest({
          fastify,
          reply,
          sendPowerAmount,
          senderId,
          recipient: { id: recipientId },
        });
      }
    }
  );
}
