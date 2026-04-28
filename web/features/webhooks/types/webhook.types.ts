/**
 * Webhook types and interfaces
 */
import { ShopifyLineItem } from "@/shared";

/*
 * WebhookSubscription interface
 */
export interface WebhookSubscription {
    id: string;
    topic: string;
    callbackUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

/*
 * WebhookRegistrationResult interface
 */
export interface WebhookRegistrationResult {
    success: boolean;
    errors?: string[];
}

/*
 * InitializationStatus interface
 */
export interface InitializationStatus {
    shop: string | null;
    setupComplete: boolean;
    webhooksRegistered: boolean;
    needsInitialization: boolean;
}

/*
 * BundleAggregation interface
 */
export interface BundleAggregation {
    items: ShopifyLineItem[];
    totalRevenue: number;
}
