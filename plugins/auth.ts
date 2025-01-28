"use strict";

import createPlugin from "fastify-plugin";
import CryptoJS from "crypto-js";
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { User } from "../models/user/user.types";
import {
  saveInviterNotificationInfo,
  saveNotificationInfo,
  saveReferralNotificationInfo,
} from "../models/notifications/notifications.utils.js";
import { NotificationsTypes } from "../models/notifications/notifications.constants.js";

export type Authentication = (req: FastifyRequest, res: FastifyReply) => void;
export type GetUserFromRequest = (req: FastifyRequest) => User;

export default createPlugin<FastifyPluginAsync>(async function (fastify, opts) {
  fastify.decorate("getUser", function (req: FastifyRequest) {
    return JSON.parse(
      new URLSearchParams(req.headers.authorization)?.get("user") ?? ""
    ) as User;
  });

  fastify.decorate(
    "auth",
    async function (req: FastifyRequest, res: FastifyReply) {
      if (typeof req.headers.authorization == "undefined") {
        console.log("req.headers.authorization == undefined");
        return res.unauthorized("Access denied");
      }

      if (
        !verifyTelegramWebAppData(
          (fastify.config.bottoken as string) ?? "",
          req.headers.authorization
        )
      ) {
        console.log("Access denied with token:", req.headers.authorization);
        return res.unauthorized("Access denied");
      }

      const user = JSON.parse(
        new URLSearchParams(req.headers.authorization)?.get("user") ?? ""
      );

      if (!(await fastify.modelsUser.userExist(user.id))) {
        await fastify.modelsUser.createUser(user, req.headers.authorization);
        await fastify.modelsTasks.createUserTaskStates(user.id);

        // обновить запись в бд имя и фомилию пользователя если они изменилсь . В бд уже добавленыф пользователяи с измененными именами и вузеразнными буквами
        const initData = new URLSearchParams(req.headers.authorization);

        if (initData && initData.get("start_param")) {
          const userId = Number(initData.get("start_param")?.split("-")[1]);

          if (
            userId &&
            !(await fastify.modelsUser.checkReferaluser(userId, user.id))
          ) {
            await fastify.modelsUser.addReferralUser(userId, user.id);
            await fastify.modelsTasks.compliteTask(7, userId, "");

            await saveReferralNotificationInfo(fastify, userId);

            await saveInviterNotificationInfo(fastify, user.id);
          }
        }
      } else {
        await fastify.modelsUser.updateLastUpdated(user.id);
      }
    }
  );
});

function createPayload(initData: URLSearchParams) {
  let array = [];

  initData.sort();

  for (const [key, value] of initData.entries()) {
    if (key != "hash") array.push(`${key}=${value}`);
  }

  return array.join("\n");
}

function verifyTelegramWebAppData(
  TELEGRAM_BOT_TOKEN: string,
  telegramInitData: string
) {
  const initData = new URLSearchParams(telegramInitData);
  const payload = createPayload(initData);
  const hash = initData.get("hash");
  const secret_key = CryptoJS.HmacSHA256(TELEGRAM_BOT_TOKEN, "WebAppData");
  const calculated_hash = CryptoJS.HmacSHA256(payload, secret_key).toString();

  return calculated_hash === hash;
}
