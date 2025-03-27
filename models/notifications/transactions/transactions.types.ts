export interface TransactionsNotificationsModel {
  id: number;
  userID: number;
  recentTransactionsAmount: number;
  type: number;
}

export interface TransactionsNotificationsService {
  addNotificationInfo(
    userId: number,
    transactionsAmount: number,
    type: number
  ): Promise<void>;

  addNotificationInfoIfNotExists(userId: number): Promise<void>;
  incrementNotificationAmount: (userId: number) => Promise<number>;
  resetNotificationAmount: (userId: number) => Promise<void>;
  getNotificationAmount: (userId: number) => Promise<number>;
}
