export interface ValidateBundleActionParams {
    shop: string;
    data: unknown;
    includeSecurity?: boolean;
}

export interface BundleOwnershipCheck {
    id: string;
    name: string;
    shop: string;
}

export interface DeleteBundleResult {
    id: string;
    name: string;
}