export interface ValidateBundleActionParams {
    shop: string;
    data: unknown;
    includeSecurity?: boolean;
}

export interface DeleteBundleResult {
    id: string;
    name: string;
}