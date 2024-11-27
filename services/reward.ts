"use strict";

import { FastifyInstance } from "fastify";
import { ReferralUser } from "../models/user/user.types";
import { TaskModel } from "../models/tasks/tasks.types";

export default async function (fastify: FastifyInstance) {
  const checkInterval = 5;
  let runnded = false;
  setInterval(async function () {
    if (runnded) {
      console.log("try to run sendRewards, runned");
      return;
    }

    console.log("run sendRewards");

    const users = await fastify.modelsUser.getUsers();
    runnded = true;
    if (users) {
      for (let index = 0; index < users.length; index++) {
        const user = users[index];

        let referalUsersUnrewarded =
          await fastify.modelsUser.getReferalUsersUnrewarded(user.id);
        if (
          user.referal_reward > Number(fastify.config.referalreward) &&
          fastify.config.setSpecialReferalReward
        ) {
          referalUsersUnrewarded =
            await fastify.modelsUser.getReferalUsersUnrewardedSpecial(user.id);
        }

        const userTasks = await fastify.modelsTasks.getUserTasks(
          user.id,
          "and is_complite = 1 and is_rewarded = 0"
        );

        let airDrop = 0; //airdrop
        const checkUser = await fastify.modelsUser.checkAirDropUser(
          Number(fastify.config.airDropRefMasterId),
          user.id
        );
        if (checkUser) {
          airDrop = Number(fastify.config.airDropRefSum);
        }
        const sumAD = airDrop;

        const sum =
          sumReferalUsersUnrewarded(
            referalUsersUnrewarded?.rows ?? [],
            user.referal_reward
          ) +
          sumUnrewardedTasks(userTasks ?? []) +
          Number(sumAD);

        if (sum >= Number(fastify.config.minrewardfortransfer) && user.wallet) {
          console.log(
            "Try to transfer token to user",
            user.id,
            "amount",
            Number(sum).toFixed(1),
            "ref",
            sumReferalUsersUnrewarded(
              referalUsersUnrewarded?.rows ?? [],
              user.referal_reward
            ),
            "task",
            sumUnrewardedTasks(userTasks ?? []),
            "Airdrop",
            sumAD
          );

          try {
            let seqno = await fastify.sendTonToken(
              user.wallet,
              +Number(sum).toFixed(1),
              "Portal network airdrop"
            );

            if (!seqno) {
              console.log("Failed: Token transfer to user seqno:", seqno);
              return false;
            }

            console.log("Success: Token transfer to user seqno:", seqno);
            if (referalUsersUnrewarded?.rows) {
              for (
                let index = 0;
                index < referalUsersUnrewarded.rows.length;
                index++
              ) {
                const el = referalUsersUnrewarded.rows[index];
                await fastify.modelsUser.setRewarded(
                  el.user_id,
                  el.referal_user_id
                );
              }
            }
            if (userTasks) {
              for (let index = 0; index < userTasks.length; index++) {
                const task = userTasks[index];
                await fastify.modelsTasks.setRewardedTask(task.id, user.id, "");
              }
            }

            if (sumAD > 0) {
              const masterId = fastify.config.airDropRefMasterId;
              await fastify.modelsUser.setRewarded(Number(masterId), user.id);
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
    runnded = false;
  }, 1000 * 60 * checkInterval);
}

function sumReferalUsersUnrewarded(
  referalUsersUnrewarded: ReferralUser[],
  reward: number
) {
  let sum = 0;
  if (referalUsersUnrewarded.length) {
    /*for (let index = 0; index < referalUsersUnrewarded.length; index++) {
            const el = referalUsersUnrewarded[index];
            sum = sum+el.reward;
            
        }*/
    sum = referalUsersUnrewarded.length * reward;
  }

  return sum;
}

function sumUnrewardedTasks(tasks: TaskModel[]) {
  let sum = 0;
  if (tasks.length) {
    for (let index = 0; index < tasks.length; index++) {
      const el = tasks[index];
      if (el.type == "referal") {
        continue;
      }
      sum = sum + el.reward;
    }
  }
  return sum;
}
