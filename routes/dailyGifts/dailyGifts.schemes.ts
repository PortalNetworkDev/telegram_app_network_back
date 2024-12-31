export const ClaimDailyGiftSchema = {
  type: "object",
  required: ["giftId"],
  properties: {
    giftId: { type: "integer" },
  },
};
