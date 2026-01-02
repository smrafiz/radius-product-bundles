/*
 * API Types
 */

/*
 * API Response Interface
 */
export interface ApiResponse<T = any> {
    status: "success" | "error";
    data?: T;
    message?: string;
    errors?: string[];
}

/*
 * API Error Interface
 */
export interface ApiError {
    status: "error";
    message: string;
    errors?: string[];
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
}

/*
 * Analytics Event Payload
 */
export interface AnalyticsEventPayload {
    type: "bundle_view" | "bundle_add_to_cart" | "page_view";
    bundleId?: string;
    productId?: string;
    customerId?: string;
    productIds?: string[];
    totalValue?: number;
    discountValue?: number;
    pageType?: string;
    url?: string;
    timestamp?: string;
}
