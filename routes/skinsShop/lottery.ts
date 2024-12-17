import { FastifyInstance } from "fastify";
import { doLotteryRollSchema } from "./lottery.schemes.js";

enum LotType {
  "lose",
  "poe",
  "power",
  "nft",
}

interface Lot {
  type: LotType;
  value: number | null;
  position: number;
  imageUrl: string;
}

const DEFAULT_ROLL_PRICE = 1000;

const loses: Lot[] = [
  { type: LotType.lose, value: null, position: 0, imageUrl: "url" },
  { type: LotType.lose, value: null, position: 0, imageUrl: "url" },
  { type: LotType.lose, value: null, position: 0, imageUrl: "url" },
  { type: LotType.lose, value: null, position: 0, imageUrl: "url" },
  { type: LotType.lose, value: null, position: 0, imageUrl: "url" },
];

const poe: Lot[] = [
  { type: LotType.poe, value: 5, position: 0, imageUrl: "url" },
  { type: LotType.poe, value: 10, position: 0, imageUrl: "url" },
  { type: LotType.poe, value: 10, position: 0, imageUrl: "url" },
];

const nft: Lot[] = [
  { type: LotType.nft, value: null, position: 0, imageUrl: "url" },
  { type: LotType.nft, value: null, position: 0, imageUrl: "url" },
  { type: LotType.nft, value: null, position: 0, imageUrl: "url" },
];

const power: Lot[] = [
  { type: LotType.power, value: 1000, position: 0, imageUrl: "url" },
  { type: LotType.power, value: 1500, position: 0, imageUrl: "url" },
  { type: LotType.power, value: 2000, position: 0, imageUrl: "url" },
  { type: LotType.power, value: 2500, position: 0, imageUrl: "url" },
];

const shufflePoll = (poll: Lot[]) => {
  const data = [...poll];

  for (let index = data.length - 1; index > 0; index--) {
    let nextIndex = Math.floor(Math.random() * (index + 1));

    [data[index], data[nextIndex]] = [data[nextIndex], data[index]];
  }
  return data;
};

//добавить картинки в ответ
//добавить прибавку ресурсов если юзер выбил приз
// отнимать power за попытку

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: { position: number } }>(
    "/roll",
    { schema: { body: doLotteryRollSchema }, onRequest: [fastify.auth] },
    async (request, reply) => {
      const user = fastify.getUser(request);
      const userSelectedLotteryPosition = request.body.position;
      const poll: Lot[] = loses.concat(power).concat(poe).concat(nft);

      if (userSelectedLotteryPosition < 0) {
        return reply.badRequest("Position should be positive number");
      }
      if (userSelectedLotteryPosition > poll.length) {
        return reply.badRequest(
          `Position should be less or equal ${poll.length - 1}`
        );
      }

      const userBalance = await fastify.miningPower.getUserPowerBalance(
        user.id
      );

      //TODO: брать из конфига
      if (userBalance < DEFAULT_ROLL_PRICE) {
        return reply.badRequest("Does not enough funds to make roll");
      }

      const result = shufflePoll(poll).map((item, index) => ({
        ...item,
        position: index,
        type: LotType[item.type],
      }));

      return { status: "ok", items: result };
    }
  );
}
