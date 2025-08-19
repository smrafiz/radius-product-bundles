
// Convert filter form values to GraphQL-compatible filters
import { ProductSortKeys, ProductStatus } from "@/lib/gql/graphql";

export const buildProductFilters = (formFilters: {
    queryValue?: string;
    statusFilter?: string[];
    vendorFilter?: string;
    collectionFilter?: string[];
    categoryFilter?: string[];
    sortKey?: string;
    reverse?: boolean;
}): ProductFilters => {
    const filters: ProductFilters = {};

    if (formFilters.queryValue) {
        filters.query = formFilters.queryValue;
    }

    if (formFilters.statusFilter && formFilters.statusFilter.length > 0) {
        filters.status = formFilters.statusFilter.map(status =>
            status.toUpperCase() as ProductStatus
        );
    }

    if (formFilters.vendorFilter) {
        filters.vendor = formFilters.vendorFilter;
    }

    if (formFilters.collectionFilter && formFilters.collectionFilter.length > 0) {
        filters.collections = formFilters.collectionFilter;
    }

    if (formFilters.categoryFilter && formFilters.categoryFilter.length > 0) {
        filters.tags = formFilters.categoryFilter;
    }

    if (formFilters.sortKey) {
        // Map string values to enum values
        const sortKeyMap: Record<string, ProductSortKeys> = {
            'title asc': ProductSortKeys.Title,
            'title desc': ProductSortKeys.Title,
            'created asc': ProductSortKeys.CreatedAt,
            'created desc': ProductSortKeys.CreatedAt,
            'vendor asc': ProductSortKeys.Vendor,
            'vendor desc': ProductSortKeys.Vendor,
        };

        filters.sortKey = sortKeyMap[formFilters.sortKey] || ProductSortKeys.Title;
        filters.reverse = formFilters.sortKey.includes('desc');
    }

    return filters;
};

// Get status options from codegen types
export const getStatusOptions = () => [
    { label: 'Active', value: ProductStatus.Active },
    { label: 'Draft', value: ProductStatus.Draft },
    { label: 'Archived', value: ProductStatus.Archived },
];

// Get sort options from codegen types
export const getSortOptions = () => [
    { label: 'Title A-Z', value: 'title asc' },
    { label: 'Title Z-A', value: 'title desc' },
    { label: 'Created (Newest)', value: 'created desc' },
    { label: 'Created (Oldest)', value: 'created asc' },
    { label: 'Vendor A-Z', value: 'vendor asc' },
    { label: 'Vendor Z-A', value: 'vendor desc' },
];