export interface SyncMetafieldResult {
    success: boolean;
    bundleCount?: number;
    error?: string;
    syncedItems: string[];
}

export interface WebhookInfo {
    id: string;
    topic: string;
    callbackUrl: string | null;
    createdAt: string;
}

export interface WebhookCheckResult {
    webhooks: WebhookInfo[];
    totalCount: number;
    expectedTopics: string[];
    missingTopics: string[];
    gdprTopics: string[];
}

export interface WebhookRegisterResult {
    success: boolean;
    registered: string[];
    failed: { topic: string; error: string }[];
}
