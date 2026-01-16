import { SortField, SortOrder } from "@/features/analytics";

/**
 * Parameters for paginated bundles action
 */
export interface GetPaginatedBundlesParams {
    sessionToken: string;
    startDate: string;
    endDate: string;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    page?: number;
    perPage?: number;
    search?: string;
}
