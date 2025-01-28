export const sendByIdBodySchema = {
  type: "object",
  required: ["recipientId", "amount"],
  properties: {
    recipientId: { type: "number" },
    amount: { type: "number" },
  },
};

export const sendByNickNameBodySchema = {
  type: "object",
  required: ["recipient", "amount"],
  properties: {
    recipient: { type: "string" },
    amount: { type: "number" },
  },
};
