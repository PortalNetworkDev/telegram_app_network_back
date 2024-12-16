export const sendByIdBodySchema = {
  type: "object",
  required: ["recipientId"],
  properties: {
    recipientId: { type: "number" },
    amount: { type: "number" },
  },
};

export const sendByNickNameBodySchema = {
  type: "object",
  required: ["recipient"],
  properties: {
    recipient: { type: "string" },
    amount: { type: "number" },
  },
};
