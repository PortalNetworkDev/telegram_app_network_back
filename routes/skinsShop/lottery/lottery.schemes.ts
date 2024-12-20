export const doLotteryRollSchema = {
  type: "object",
  required: ["position"],
  properties: {
    position: { type: "integer" },
  },
};
