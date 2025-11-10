/*
 * Actions types
 */

/**
 * Validate bundle action params
 */
export interface ValidateBundleActionParams {
    shop: string;
    data: unknown;
    includeSecurity?: boolean;
}

/**
 * Delete bundle result
 */
export interface DeleteBundleResult {
    id: string;
    name: string;
}
