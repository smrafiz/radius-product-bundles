export const buildProductSearchQuery = (filters: {
    query?: string;
    categories?: string[];
    collections?: string;
    tags?: string[];
    types?: string[];
    vendors?: string[];
    status?: string;
}) => {
    const queryParts: string[] = [];

    if (filters.query) {
        queryParts.push(`title:*${filters.query}* OR sku:*${filters.query}*`);
    }

    if (filters.categories && filters.categories.length > 0) {
        const categoriesQuery = filters.categories.map(cat => `category:${cat}`).join(' OR ');
        queryParts.push(`(${categoriesQuery})`);
    }

    if (filters.collections) {
        queryParts.push(`collection_id:${filters.collections}`);
    }

    if (filters.tags && filters.tags.length > 0) {
        const tagsQuery = filters.tags.map(tag => `tag:"${tag}"`).join(' OR ');
        queryParts.push(`(${tagsQuery})`);
    }

    if (filters.types && filters.types.length > 0) {
        const typesQuery = filters.types.map(type => `product_type:"${type}"`).join(' OR ');
        queryParts.push(`(${typesQuery})`);
    }

    if (filters.vendors && filters.vendors.length > 0) {
        const vendorsQuery = filters.vendors.map(vendor => `vendor:"${vendor}"`).join(' OR ');
        queryParts.push(`(${vendorsQuery})`);
    }

    // Always include status filter
    queryParts.push(`status:${filters.status || 'ACTIVE'}`);

    return queryParts.length > 0 ? queryParts.join(' AND ') : 'status:ACTIVE';
};

export const formatPrice = (price: string | number, currency: string = 'Tk'): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${currency} ${numericPrice.toFixed(2)}`;
};

export const getVariantDisplayName = (variant: {
    title: string;
    selectedOptions: Array<{ name: string; value: string }>;
}): string => {
    if (variant.title === 'Default Title') {
        return variant.selectedOptions
            .map(option => option.value)
            .join(' / ') || 'Default';
    }
    return variant.title;
};