"use strict";

import createPlugin from "fastify-plugin";
import TonWeb from "tonweb";

import csv from "csv-parser";
import fileSystem from "fs";

export default createPlugin(async function (fastify, opts) {
  const tonweb = new TonWeb();

  async function checkBuyTokenStonFi(wallet) {
    let have = false;
    let tryCount = 0;

    try {
      let _req;

      while (tryCount < 5) {
        _req = await fetch(
          `https://tonapi.io/v2/accounts/${wallet}/events?initiator=true&subject_only=true&limit=100`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${fastify.config.tonApiToken}`,
            },
          }
        );

        if (_req.status == 200) break;

        await sleep(300);
        tryCount++;
      }

      if (_req.status == 200) {
        const req = await _req.json();

        for (let index = 0; index < req.events.length; index++) {
          const event = req.events[index];

          for (let iActions = 0; iActions < event.actions.length; iActions++) {
            const action = event.actions[iActions];
            if (action.type == "JettonSwap") {
              if (
                action.JettonSwap.dex == "stonfi" &&
                action.status == "ok" &&
                action.JettonSwap.jetton_master_out?.address ==
                  fastify.config.jettonaddressraw
              ) {
                have = true;
                break;
              }
            }
          }

          if (have) {
            break;
          }
        }
      }
    } catch (error) {
      console.log("cannot checkBuyTokenStonFi", error);
    }

    return have;
  }

  async function getFarmingNft(wallet) {
    let poolbalance = 0;
    let tryCount = 0;

    try {
      let _req;

      while (tryCount < 2) {
        _req = await fetch(`https://tonapi.io/v2/accounts/${wallet}/nfts`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fastify.config.tonApiToken}`,
          },
        });

        if (_req.status == 200) break;

        console.log("cannot getFarmingNft, status", _req.status);
        tryCount++;
        await sleep(300);
      }

      if (_req.status == 200) {
        const req = await _req.json();

        for (let index = 0; index < req.nft_items.length; index++) {
          const nft = req.nft_items[index];

          if (
            nft?.collection?.address ==
            fastify.config.farmingcollectionaddresraw
          ) {
            poolbalance = 10101;
          }
        }
      } else {
        poolbalance = -1;
      }
    } catch (error) {
      console.log("cannot getFarmingNft", error);
      poolbalance = -1;
    }

    return poolbalance;
  }

  async function getBalances(wallet) {
    let jettonbalance = 0;
    let poolbalance = 0;
    let tryCount = 0;

    try {
      let _req;

      while (tryCount < 2) {
        _req = await fetch(`https://tonapi.io/v2/accounts/${wallet}/jettons`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fastify.config.tonApiToken}`,
          },
        });

        if (_req.status == 200) break;

        console.log("cannot get balance, status", _req.status);
        tryCount++;
        await sleep(300);
      }

      if (_req.status == 200) {
        const req = await _req.json();

        for (let index = 0; index < req.balances.length; index++) {
          const balance = req.balances[index];

          if (balance.jetton.address == fastify.config.lptokenaddress) {
            poolbalance = tonweb.utils.fromNano(balance.balance);
          }

          if (balance.jetton.address == fastify.config.jettonaddressraw) {
            jettonbalance = tonweb.utils.fromNano(balance.balance);
          }
        }
      } else {
        jettonbalance = -1;
        poolbalance = -1;
      }
    } catch (error) {
      console.log("cannot getBalances", error);
      jettonbalance = -1;
      poolbalance = -1;
    }

    return {
      pool_balance: Number(poolbalance),
      token_balance: Number(jettonbalance),
    };
  }

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function csvParser(file, delimeter = ",") {
    return new Promise(function (resolve, reject) {
      const results = [];

      fileSystem
        .createReadStream(file)
        .pipe(csv({ separator: delimeter }))
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", () => {
          resolve(results);
        });
    });
  }

  fastify.decorate("utils", {
    getBalances,
    getFarmingNft,
    checkBuyTokenStonFi,
    sleep,
    csvParser,
  });
});
