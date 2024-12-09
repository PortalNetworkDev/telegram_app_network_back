export const buyOrSelectSkinBodySchema = {
  type: "object",
  required: ["skinId"],
  properties: {
    skinId: { type: "number" },
  },
};

export const getItemsBodySchema = {
  type: "object",
  required: ["skinType"],
  properties: {
    type: { type: "string", enum: ["generator", "battery"] },
  },
};

export const getAllSkinsByTypeQueryParamsSchema = {
  type: "object",
  required: ["type"],
  properties: {
    type: { type: "string", enum: ["generator", "battery"] },
  },
};

export const getSkinInfoQueryParamsSchema = {
  type: "object",
  required: ["skinId"],
  properties: {
    skinId: { type: "number" },
  },
};
