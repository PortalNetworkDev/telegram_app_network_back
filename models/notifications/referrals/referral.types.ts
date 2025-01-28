export interface ReferralNotificationsModel {
  id: number;
  userId: number;
  notificationAmount: number;
  isReferral: boolean;
  isInviter: boolean;
  inviterUserId?: number;
  referralUserId?: number;
}

export type ReferralNotifications = Omit<ReferralNotificationsModel, "id">;

export interface ReferralNotificationsService {
  getNotificationInfo(
    userId: number
  ): Promise<ReferralNotificationsModel[] | null>;
  incrementNotificationAmount(userId: number): Promise<number>;
  addInviterNotificationIfNotExists(
    userId: number
  ): Promise<void>;
  addReferralNotificationIfNotExists(
    userId: number
  ): Promise<void>;
  resetNotificationAmount(userId: number): Promise<void>;
  getNotificationAmount(userId: number): Promise<number>;
}
