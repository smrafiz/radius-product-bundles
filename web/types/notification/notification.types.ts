import type {
    NotificationType as PrismaNotificationType,
    NotificationPriority as PrismaNotificationPriority,
    AlertRuleStatus as PrismaAlertRuleStatus,
    AlertFrequency as PrismaAlertFrequency
} from "@prisma/client";

export type NotificationType = PrismaNotificationType;
export type NotificationPriority = PrismaNotificationPriority;
export type AlertRuleStatus = PrismaAlertRuleStatus;
export type AlertFrequency = PrismaAlertFrequency;

export interface Notification {
    id: string;
    shop: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any; // JSON
    read: boolean;
    priority: NotificationPriority;
    actionLabel?: string;
    actionUrl?: string;
    createdAt: Date;
    expiresAt?: Date;
}

export interface AlertRule {
    id: string;
    shop: string;
    name: string;
    type: NotificationType;
    status: AlertRuleStatus;
    conditions: any; // JSON
    threshold?: number;
    comparison?: string;
    deliveryMethods: any; // JSON
    frequency: AlertFrequency;
    triggerCount: number;
    lastTriggered?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNotificationPayload {
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    priority?: NotificationPriority;
    actionLabel?: string;
    actionUrl?: string;
    expiresAt?: Date;
}

export interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    aiRecommendations: boolean;
    enabledTypes: NotificationType[];
}