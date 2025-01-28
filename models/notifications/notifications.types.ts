import { ReferralNotificationsService } from "./referrals/referral.types";
import { TransactionsNotificationsService } from "./transactions/transactions.types";

export interface NotificationService {
  transactions: TransactionsNotificationsService;
  referral: ReferralNotificationsService;
}
