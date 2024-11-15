import { FastifyInstance } from "fastify";
import Schema from "fluent-json-schema";

interface Body {
  recipient: string;
  senderId: number;
  amount: number;
}

const params = Schema.object()
  .prop("recipient", Schema.string())
  .prop("senderId", Schema.number())
  .prop("amount", Schema.number());
const schema = { params };

//TODO: how to get tg ID by username
export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: Body }>("/send", { schema }, async (request, reply) => {
    const senderId = request.body.senderId;
    const recipientName = request.body.recipient;
    const sendPowerAmount = request.body.amount;

    if (typeof sendPowerAmount !== "number") {
      return {
        statusCose: "400",
        description: "Bad request",
        message: "Amount should be number",
      };
    }

    if (recipientName && senderId) {
      const [senderInstance, recipientInstance, senderBalance] =
        await Promise.all([
          // @ts-ignore: Unreachable code error
          fastify.models_user.getUser(senderId),
          // @ts-ignore: Unreachable code error
          fastify.models_user.getUserByNickname(recipientName),
          // @ts-ignore: Unreachable code error
          fastify.models_mining_power.getUserPowerBalance(senderId),
        ]);

      // как найти именно того получателя с нужным id если он может поменять ник а в базе у меня старый
      // @ts-ignore: Unreachable code error
      if (recipientInstance.some((item) => item.id === senderInstance.id)) {
        return {
          statusCose: "400",
          description: "Bad request",
          message: "Recipient and sender should not be same",
        };
      }

      if (senderBalance < sendPowerAmount) {
        return {
          statusCose: "400",
          description: "Bad request",
          message: "Sender has not enough power value to send",
        };
      }

      if (recipientInstance.length > 1 || !recipientInstance[0]) {
        return {
          statusCose: "400",
          description: "Bad request",
          message: "Recipient do not exists",
        };
      }

      try {
        // @ts-ignore: Unreachable code error
        await fastify.models_mining_power.addPowerBalance(
          recipientInstance[0].id,
          sendPowerAmount
        );
      } catch (error) {
        console.log("error in addPowerBalance", error);
      }

      try {
        // @ts-ignore: Unreachable code error
        await fastify.models_mining_power.subtractPowerBalance(
          senderInstance.id,
          sendPowerAmount
        );
      } catch (error) {
        console.log("error in subtractPowerBalance", error);
      }

      try {
        await fastify.transactions.addTransaction({
          senderId: senderInstance.id,
          recipientId: recipientInstance[0].id,
          powerAmount: sendPowerAmount,
          creationTime: Date.now(),
        });
      } catch (error) {
        console.log("error in addTransaction", error);
      }
    }

    return { statusCose: 200, status: "ok" };
  });
}
