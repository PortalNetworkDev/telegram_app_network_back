export const MAX_DAY_NUMBER_TO_CLAIM_GIFT = 7;
export const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
export const ONE_MIN = 60 * 1000;

export const RESPONSE_CODES = {
  2001: { code: 2001, message: "User already claim daily gift" },
  2002: { code: 2002, message: "User already claim all daily gift" },
} as const;
