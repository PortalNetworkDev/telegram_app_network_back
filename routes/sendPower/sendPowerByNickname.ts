import { FastifyInstance, FastifyReply } from "fastify";
import {
  sendByIdBodySchema,
  sendByNickNameBodySchema,
} from "./sendPower.schemes.js";
import { UserModel } from "../../models/user/user.types";
import { saveNotificationInfo } from "../../models/notifications/notifications.utils.js";
import { NotificationsTypes } from "../../models/notifications/notifications.constants.js";

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
  sendPowerAmount: number
) => {
  if (recipientInstance?.id === senderInstance?.id) {
    return {
      isValid: false,
      message: "Recipient and sender should not be same",
      code: 4001,
    };
  }

  if (senderBalance < sendPowerAmount) {
    return {
      isValid: false,
      message: "Sender has not enough power value to send",
      code: 4002,
    };
  }

  if (!recipientInstance) {
    return { isValid: false, message: "Recipient do not exists", code: 4003 };
  }

  if (!senderInstance) {
    return { isValid: false, message: "Sender do not exists", code: 4004 };
  }

  return { isValid: true };
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

    await saveNotificationInfo(fastify, recipientInstance?.id ?? 0);
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

  const { isValid, message, code } = validateUsers(
    recipientInstance,
    senderInstance,
    senderBalance,
    sendPowerAmount
  );

  if (!isValid) {
    return reply.code(400).send({ message, code });
  }

  await makeTransferOfPower(
    fastify,
    recipientInstance,
    senderInstance,
    sendPowerAmount
  );

  reply.code(200).send({ statusCose: 200, status: "ok" });
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
        return reply.code(400).send({
          message: "Funds amount should be more then 0",
          code: 4005,
        });
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
        return reply.code(400).send({
          message: "Funds amount should be more then 0",
          code: 4005,
        });
      }

      await handleRequest({
        fastify,
        reply,
        sendPowerAmount,
        senderId,
        recipient: { id: recipientId },
      });
    }
  );
}
