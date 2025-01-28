import { FastifyInstance } from "fastify";

export const saveNotificationInfo = async (
  fastify: FastifyInstance,
  userId: number
) => {
  const affectedRowsNumber =
    await fastify.transactionsNotifications.incrementNotificationAmount(userId);

  if (affectedRowsNumber === 0) {
    await fastify.transactionsNotifications.addNotificationInfoIfNotExists(
      userId
    );
  }
};

export const saveReferralNotificationInfo = async (
  fastify: FastifyInstance,
  userId: number
) => {
  const affectedRows =
    await fastify.referralNotifications.incrementNotificationAmount(userId);
  if (affectedRows === 0) {
    await fastify.referralNotifications.addReferralNotificationIfNotExists(
      userId
    );
  }
};

export const saveInviterNotificationInfo = async (
  fastify: FastifyInstance,
  userId: number
) => {
  const affectedRows =
    await fastify.referralNotifications.incrementNotificationAmount(userId);
  if (affectedRows === 0) {
    await fastify.referralNotifications.addInviterNotificationIfNotExists(
      userId
    );
  }
};
