export const getMinersListSchema = {
    type: "object",
    required: ["page"],
    properties: {
        page: { type: "number" },
        limit:{ type: "number" }
    },
  };