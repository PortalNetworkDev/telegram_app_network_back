import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  let checkInterval = Number(fastify.config.balanceHistoryInterval);
  if (!checkInterval || checkInterval === null) {
    checkInterval = 1;
  }
  let runnded = false;
  setInterval(async function () {
    if (runnded) {
      console.log("try to run balanceHistory, runned");
      return;
    }

    console.log("run balanceHistory");

    runnded = true;
    const users =
      await fastify.modelsBalanceHistory.getUsersWhoNotSetBalanceHistoryToday();

    if (users) {
      for (let index = 0; index < users.length; index++) {
        const user = users[index];

        if (user.create_time == null) {
          let balances = await fastify.utils.getBalances(user.wallet);

          if (balances.pool_balance == 0) {
            await fastify.utils.sleep(200);
            balances.pool_balance = await fastify.utils.getFarmingNft(
              user.wallet
            );
          }

          if (balances.token_balance != -1 && balances.pool_balance != -1) {
            await fastify.modelsBalanceHistory.addHistory(
              user.id,
              balances.token_balance,
              balances.pool_balance
            );
          }

          await fastify.utils.sleep(200);
        }
      }
    }

    runnded = false;
  }, 1000 * 60 * checkInterval);
}
