"use client";

import React, {
    useState,
    useCallback,
    useMemo,
    useRef,
    useEffect,
} from "react";
import {
    Modal,
    Button,
    BlockStack,
    InlineStack,
    Text,
    Checkbox,
    Box,
    Scrollable,
    ChoiceList,
    Card,
    Divider,
    Thumbnail,
    Badge,
    RadioButton,
    Spinner,
    TextField,
    Select,
    Popover,
    Icon,
} from "@shopify/polaris";
import {
    SearchIcon,
    FilterIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@shopify/polaris-icons";
import { useGraphQL } from "@/hooks/useGraphQL";
import { request } from "graphql-request";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

// Import your existing GraphQL documents
import {
    GetProductsDocument,
    GetCollectionsForFiltersDocument,
} from "@/lib/gql/graphql";

// Import the generated types
import type {
    GetProductsQuery,
    GetProductsQueryVariables,
    GetCollectionsForFiltersQuery,
    GetCollectionsForFiltersQueryVariables,
} from "@/types/admin.generated";

const url = `shopify:admin/api/${LATEST_API_VERSION}/graphql.json`;

// ------------------ Custom debounce hook with better timing ------------------
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Don't debounce if value is empty (immediate clear)
        if (!value) {
            setDebouncedValue(value);
            return;
        }

        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

interface ProductVariant {
    id: string;
    title: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
    availableForSale: boolean;
    inventoryQuantity: number;
    image?: {
        url: string;
        altText?: string;
    };
    selectedOptions: Array<{
        name: string;
        value: string;
    }>;
}

interface Product {
    id: string;
    title: string;
    handle: string;
    vendor?: string;
    productType?: string;
    tags: string[];
    totalInventory?: number;
    status?: string;
    featuredImage?: {
        url: string;
        altText?: string;
    };
    variants: ProductVariant[];
    collections: Array<{
        id: string;
        title: string;
    }>;
}

interface SelectedItem {
    type: "product" | "variant";
    productId: string;
    variantId?: string;
    title: string;
    price: string;
    image?: string;
    sku?: string;
}

interface FilterState {
    status: string;
    productType: string;
    vendor: string;
    collection: string;
    tags: string[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProductsSelected: (items: SelectedItem[]) => void;
    selectedProductIds: string[];
    title?: string;
}

const FILTER_OPTIONS = {
    status: [
        { label: "All", value: "" },
        { label: "Active", value: "ACTIVE" },
        { label: "Draft", value: "DRAFT" },
        { label: "Archived", value: "ARCHIVED" },
    ],
};

export default function _ProductSelectionModal({
    isOpen,
    onClose,
    onProductsSelected,
    selectedProductIds,
    title = "Add products",
}: Props) {
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchBy, setSearchBy] = useState<string>("all");
    const [filters, setFilters] = useState<FilterState>({
        status: "",
        productType: "",
        vendor: "",
        collection: "",
        tags: [],
    });
    const [filterPopoverActive, setFilterPopoverActive] =
        useState<boolean>(false);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
        new Set(),
    );

    const debouncedSearch = useDebounce(searchInput, 500); // Increased debounce
    const [first] = useState(10); // Start with fewer products
    const [hasLoadedMore, setHasLoadedMore] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Build search query
    const buildSearchQuery = useCallback(() => {
        let query = "";

        if (debouncedSearch) {
            switch (searchBy) {
                case "title":
                    query += `title:*${debouncedSearch}*`;
                    break;
                case "sku":
                    query += `sku:*${debouncedSearch}*`;
                    break;
                case "barcode":
                    query += `barcode:*${debouncedSearch}*`;
                    break;
                default:
                    query += `*${debouncedSearch}*`;
            }
        }

        // Add filters
        if (filters.status) {
            query += query
                ? ` AND status:${filters.status}`
                : `status:${filters.status}`;
        } else {
            query += query ? ` AND status:ACTIVE` : `status:ACTIVE`;
        }

        if (filters.productType) {
            query += query
                ? ` AND product_type:"${filters.productType}"`
                : `product_type:"${filters.productType}"`;
        }
        if (filters.vendor) {
            query += query
                ? ` AND vendor:"${filters.vendor}"`
                : `vendor:"${filters.vendor}"`;
        }
        if (filters.collection) {
            query += query
                ? ` AND collection_id:${filters.collection}`
                : `collection_id:${filters.collection}`;
        }
        if (filters.tags.length > 0) {
            const tagsQuery = filters.tags
                .map((tag) => `tag:"${tag}"`)
                .join(" OR ");
            query += query ? ` AND (${tagsQuery})` : `(${tagsQuery})`;
        }

        return query || "status:ACTIVE";
    }, [debouncedSearch, searchBy, filters]);

    // Fetch all products first (for filter options)
    const allProductsVariables: GetProductsQueryVariables = {
        first: 100,
        query: "status:ACTIVE",
    };

    const allProductsQuery = useGraphQL<
        GetProductsQuery,
        GetProductsQueryVariables
    >(GetProductsDocument, allProductsVariables);

    // Filtered products query
    const productsVariables: GetProductsQueryVariables = {
        first,
        query: buildSearchQuery(),
        sortKey: "UPDATED_AT",
        reverse: true,
    };

    const productsQuery = useGraphQL<
        GetProductsQuery,
        GetProductsQueryVariables
    >(GetProductsDocument, productsVariables);

    // Load more products manually
    const loadMoreProducts = useCallback(async () => {
        if (isLoadingMore || !nextCursor) return;

        setIsLoadingMore(true);
        try {
            // Use the request function from graphql-request like the hook does
            const result = await request(url, GetProductsDocument, {
                ...productsVariables,
                after: nextCursor,
            });

            const newProducts = result?.products?.edges || [];

            if (newProducts.length > 0) {
                const transformedProducts = newProducts.map((edge: any) => {
                    const node = edge.node;
                    return {
                        id: node.id,
                        title: node.title,
                        handle: node.handle,
                        vendor: node.vendor || undefined,
                        productType: node.productType || undefined,
                        tags: node.tags || [],
                        totalInventory: node.totalInventory || 0,
                        status: node.status,
                        featuredImage: node.featuredImage
                            ? {
                                  url: node.featuredImage.url,
                                  altText:
                                      node.featuredImage.altText || undefined,
                              }
                            : undefined,
                        variants: (node.variants?.nodes || []).map(
                            (variant: any) => ({
                                id: variant.id,
                                title: variant.title,
                                sku: variant.sku || undefined,
                                price: variant.price,
                                compareAtPrice:
                                    variant.compareAtPrice || undefined,
                                availableForSale: variant.availableForSale,
                                inventoryQuantity:
                                    variant.inventoryQuantity || 0,
                                image: variant.image
                                    ? {
                                          url: variant.image.url,
                                          altText:
                                              variant.image.altText ||
                                              undefined,
                                      }
                                    : undefined,
                                selectedOptions: variant.selectedOptions || [],
                            }),
                        ),
                        collections: (node.collections?.edges || []).map(
                            (collectionEdge: any) => ({
                                id: collectionEdge.node.id,
                                title: collectionEdge.node.title,
                            }),
                        ),
                    };
                });

                setAllLoadedProducts((prev) => [
                    ...prev,
                    ...transformedProducts,
                ]);
                setNextCursor(result?.products?.pageInfo?.endCursor || null);
            }
        } catch (error) {
            console.error("Error loading more products:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, nextCursor, productsVariables]);

    // Scroll handler for pagination
    const handleScroll = useCallback(() => {
        if (!scrollRef.current || !nextCursor || isLoadingMore) return;

        const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
        const threshold = 50;

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            loadMoreProducts();
        }
    }, [nextCursor, isLoadingMore, loadMoreProducts]);

    // Attach scroll listener
    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener("scroll", handleScroll);
            return () =>
                scrollElement.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    // Collections data
    const collectionsVariables: GetCollectionsForFiltersQueryVariables = {
        query: "",
        first: 50,
    };

    const collectionsQuery = useGraphQL<
        GetCollectionsForFiltersQuery,
        GetCollectionsForFiltersQueryVariables
    >(GetCollectionsForFiltersDocument, collectionsVariables);

    // Extract filter options from all products data
    const filterOptions = useMemo(() => {
        if (!allProductsQuery.data?.products?.edges) {
            return { types: [], vendors: [], tags: [] };
        }

        const types = new Set<string>();
        const vendors = new Set<string>();
        const tags = new Set<string>();

        allProductsQuery.data.products.edges.forEach((edge) => {
            const product = edge.node;
            if (product.productType) types.add(product.productType);
            if (product.vendor) vendors.add(product.vendor);
            (product.tags || []).forEach((tag) => tags.add(tag));
        });

        return {
            types: Array.from(types).sort(),
            vendors: Array.from(vendors).sort(),
            tags: Array.from(tags).sort(),
        };
    }, [allProductsQuery.data]);

    // Transform initial products data and manage state
    useEffect(() => {
        if (!isOpen) return; // only work when modal is open

        // Reset products before a new search/filter
        setAllLoadedProducts([]);
        setNextCursor(null);

        if (productsQuery.data?.products?.edges) {
            const transformedProducts = productsQuery.data.products.edges.map(edge => {
                const node = edge.node;
                return {
                    id: node.id,
                    title: node.title,
                    handle: node.handle,
                    vendor: node.vendor || undefined,
                    productType: node.productType || undefined,
                    tags: node.tags || [],
                    totalInventory: node.totalInventory || 0,
                    status: node.status,
                    featuredImage: node.featuredImage
                        ? { url: node.featuredImage.url, altText: node.featuredImage.altText || undefined }
                        : undefined,
                    variants: (node.variants?.nodes || []).map(variant => ({
                        id: variant.id,
                        title: variant.title,
                        sku: variant.sku || undefined,
                        price: variant.price,
                        compareAtPrice: variant.compareAtPrice || undefined,
                        availableForSale: variant.availableForSale,
                        inventoryQuantity: variant.inventoryQuantity || 0,
                        image: variant.image ? { url: variant.image.url, altText: variant.image.altText || undefined } : undefined,
                        selectedOptions: variant.selectedOptions || [],
                    })),
                    collections: (node.collections?.edges || []).map(colEdge => ({
                        id: colEdge.node.id,
                        title: colEdge.node.title,
                    })),
                };
            });

            setAllLoadedProducts(transformedProducts);
            setNextCursor(productsQuery.data.products.pageInfo.endCursor);
        }
    }, [isOpen, productsQuery.data, debouncedSearch, filters]);

    // Clear loaded products when search/filters change
    useEffect(() => {
        setAllLoadedProducts([]);
        setNextCursor(null);
    }, [debouncedSearch, filters]);

    // Use accumulated products for display
    const products = allLoadedProducts;

    // Selection handlers
    const handleProductToggle = useCallback(
        (product: Product) => {
            const productSelected = selectedItems.some(
                (item) =>
                    item.type === "product" && item.productId === product.id,
            );

            if (productSelected) {
                setSelectedItems((prev) =>
                    prev.filter((item) => item.productId !== product.id),
                );
            } else {
                // Only create variant items if variants exist
                if (product.variants && product.variants.length > 0) {
                    const newItems: SelectedItem[] = product.variants.map(
                        (variant) => ({
                            type: "variant",
                            productId: product.id,
                            variantId: variant.id,
                            title: `${product.title} - ${variant.title}`,
                            price: variant.price,
                            image:
                                variant.image?.url ||
                                product.featuredImage?.url,
                            sku: variant.sku,
                        }),
                    );
                    setSelectedItems((prev) => [...prev, ...newItems]);
                }
            }
        },
        [selectedItems],
    );

    const handleVariantToggle = useCallback(
        (product: Product, variant: ProductVariant) => {
            const variantSelected = selectedItems.some(
                (item) =>
                    item.type === "variant" && item.variantId === variant.id,
            );

            if (variantSelected) {
                setSelectedItems((prev) =>
                    prev.filter((item) => item.variantId !== variant.id),
                );
            } else {
                const newItem: SelectedItem = {
                    type: "variant",
                    productId: product.id,
                    variantId: variant.id,
                    title: `${product.title} - ${variant.title}`,
                    price: variant.price,
                    image: variant.image?.url || product.featuredImage?.url,
                    sku: variant.sku,
                };
                setSelectedItems((prev) => [...prev, newItem]);
            }
        },
        [selectedItems],
    );

    const handleSelectAll = () => {
        const availableItems: SelectedItem[] = [];
        products.forEach((product) => {
            if (
                !selectedProductIds.includes(product.id) &&
                product.variants &&
                product.variants.length > 0
            ) {
                product.variants.forEach((variant) => {
                    availableItems.push({
                        type: "variant",
                        productId: product.id,
                        variantId: variant.id,
                        title: `${product.title} - ${variant.title}`,
                        price: variant.price,
                        image: variant.image?.url || product.featuredImage?.url,
                        sku: variant.sku,
                    });
                });
            }
        });
        setSelectedItems(availableItems);
    };

    const handleDeselectAll = () => {
        setSelectedItems([]);
    };

    const isProductSelected = useCallback(
        (product: Product) => {
            return (
                selectedItems.some(
                    (item) =>
                        item.type === "product" &&
                        item.productId === product.id,
                ) ||
                (product.variants &&
                    product.variants.length > 0 &&
                    product.variants.every((variant) =>
                        selectedItems.some(
                            (item) => item.variantId === variant.id,
                        ),
                    ))
            );
        },
        [selectedItems],
    );

    const isVariantSelected = useCallback(
        (variant: ProductVariant) => {
            return selectedItems.some((item) => item.variantId === variant.id);
        },
        [selectedItems],
    );

    const toggleProductExpansion = (productId: string) => {
        setExpandedProducts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    // Filter handlers
    const handleFilterChange = (
        key: keyof FilterState,
        value: string | string[],
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "",
            productType: "",
            vendor: "",
            collection: "",
            tags: [],
        });
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
        key !== "tags" ? value !== "" : (value as string[]).length > 0,
    );

    const activeFilterCount = Object.entries(filters).filter(([key, value]) =>
        key !== "tags" ? value !== "" : (value as string[]).length > 0,
    ).length;

    const handleAdd = useCallback(() => {
        onProductsSelected(selectedItems);
        setSelectedItems([]);
        setSearchInput("");
        clearFilters();
        onClose();
    }, [selectedItems, onProductsSelected, onClose]);

    const handleCancel = useCallback(() => {
        setSelectedItems([]);
        setSearchInput("");
        clearFilters();
        onClose();
    }, [onClose]);

    // Render helpers
    const renderProductImage = (product: Product) => {
        if (product.featuredImage) {
            return (
                <Thumbnail
                    source={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    size="small"
                />
            );
        }
        return (
            <div
                style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#f6f6f7",
                    border: "1px solid #e1e3e5",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon source={SearchIcon} tone="subdued" />
            </div>
        );
    };

    const renderProductStatus = (status?: string) => {
        if (!status) return null;

        const statusConfig = {
            ACTIVE: { tone: "success" as const, label: "Active" },
            DRAFT: { tone: "warning" as const, label: "Draft" },
            ARCHIVED: { tone: "subdued" as const, label: "Archived" },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        if (!config) return null;

        return <Badge tone={config.tone}>{config.label}</Badge>;
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleCancel}
            title={title}
            primaryAction={{
                content: `Add ${selectedItems.length > 0 ? `(${selectedItems.length})` : ""}`,
                onAction: handleAdd,
                disabled: selectedItems.length === 0,
            }}
            secondaryActions={[{ content: "Cancel", onAction: handleCancel }]}
            large
        >
            <Modal.Section>
                <BlockStack gap="400">
                    {/* Search and Filter Section */}
                    <Card padding="0">
                        <Box padding="400">
                            <BlockStack gap="300">
                                {/* Search Bar */}
                                <InlineStack gap="200" align="space-between">
                                    <div style={{ flex: 1 }}>
                                        <TextField
                                            placeholder="Search products"
                                            value={searchInput}
                                            onChange={setSearchInput}
                                            prefix={
                                                <Icon source={SearchIcon} />
                                            }
                                            clearButton
                                            onClearButtonClick={() =>
                                                setSearchInput("")
                                            }
                                            autoComplete="off"
                                        />
                                    </div>
                                    <Select
                                        options={[
                                            {
                                                label: "Search by All",
                                                value: "all",
                                            },
                                            {
                                                label: "Search by Title",
                                                value: "title",
                                            },
                                            {
                                                label: "Search by SKU",
                                                value: "sku",
                                            },
                                            {
                                                label: "Search by Barcode",
                                                value: "barcode",
                                            },
                                        ]}
                                        value={searchBy}
                                        onChange={setSearchBy}
                                    />
                                </InlineStack>

                                {/* Filter Toggle */}
                                <InlineStack gap="200" align="space-between">
                                    <Popover
                                        active={filterPopoverActive}
                                        activator={
                                            <Button
                                                onClick={() =>
                                                    setFilterPopoverActive(
                                                        !filterPopoverActive,
                                                    )
                                                }
                                                disclosure={
                                                    filterPopoverActive
                                                        ? "up"
                                                        : "down"
                                                }
                                                icon={FilterIcon}
                                            >
                                                Add filter
                                                {activeFilterCount > 0 &&
                                                    ` (${activeFilterCount})`}
                                            </Button>
                                        }
                                        onClose={() =>
                                            setFilterPopoverActive(false)
                                        }
                                        preferredAlignment="left"
                                    >
                                        <div
                                            style={{
                                                padding: "16px",
                                                minWidth: "300px",
                                            }}
                                        >
                                            <BlockStack gap="300">
                                                <Select
                                                    label="Status"
                                                    options={
                                                        FILTER_OPTIONS.status
                                                    }
                                                    value={filters.status}
                                                    onChange={(value) =>
                                                        handleFilterChange(
                                                            "status",
                                                            value,
                                                        )
                                                    }
                                                />

                                                <Select
                                                    label="Product Type"
                                                    options={[
                                                        {
                                                            label: "All",
                                                            value: "",
                                                        },
                                                        ...filterOptions.types.map(
                                                            (type) => ({
                                                                label: type,
                                                                value: type,
                                                            }),
                                                        ),
                                                    ]}
                                                    value={filters.productType}
                                                    onChange={(value) =>
                                                        handleFilterChange(
                                                            "productType",
                                                            value,
                                                        )
                                                    }
                                                />

                                                <Select
                                                    label="Vendor"
                                                    options={[
                                                        {
                                                            label: "All",
                                                            value: "",
                                                        },
                                                        ...filterOptions.vendors.map(
                                                            (vendor) => ({
                                                                label: vendor,
                                                                value: vendor,
                                                            }),
                                                        ),
                                                    ]}
                                                    value={filters.vendor}
                                                    onChange={(value) =>
                                                        handleFilterChange(
                                                            "vendor",
                                                            value,
                                                        )
                                                    }
                                                />

                                                {collectionsQuery.data
                                                    ?.collections?.edges && (
                                                    <BlockStack gap="200">
                                                        <Text
                                                            variant="bodyMd"
                                                            fontWeight="medium"
                                                        >
                                                            Collections
                                                        </Text>
                                                        <BlockStack gap="100">
                                                            {collectionsQuery.data.collections.edges
                                                                .slice(0, 5)
                                                                .map((edge) => (
                                                                    <RadioButton
                                                                        key={
                                                                            edge
                                                                                .node
                                                                                .id
                                                                        }
                                                                        label={
                                                                            edge
                                                                                .node
                                                                                .title
                                                                        }
                                                                        checked={
                                                                            filters.collection ===
                                                                            edge
                                                                                .node
                                                                                .id
                                                                        }
                                                                        id={
                                                                            edge
                                                                                .node
                                                                                .id
                                                                        }
                                                                        name="collections"
                                                                        onChange={() =>
                                                                            handleFilterChange(
                                                                                "collection",
                                                                                filters.collection ===
                                                                                    edge
                                                                                        .node
                                                                                        .id
                                                                                    ? ""
                                                                                    : edge
                                                                                          .node
                                                                                          .id,
                                                                            )
                                                                        }
                                                                    />
                                                                ))}
                                                        </BlockStack>
                                                    </BlockStack>
                                                )}

                                                <InlineStack gap="200">
                                                    <Button
                                                        size="slim"
                                                        onClick={clearFilters}
                                                    >
                                                        Clear all
                                                    </Button>
                                                    <Button
                                                        size="slim"
                                                        variant="primary"
                                                        onClick={() =>
                                                            setFilterPopoverActive(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        Done
                                                    </Button>
                                                </InlineStack>
                                            </BlockStack>
                                        </div>
                                    </Popover>

                                    {/* Bulk Actions */}
                                    {products.length > 0 && (
                                        <InlineStack gap="200">
                                            <Button
                                                size="slim"
                                                onClick={handleSelectAll}
                                            >
                                                Select all
                                            </Button>
                                            <Button
                                                size="slim"
                                                onClick={handleDeselectAll}
                                            >
                                                Deselect all
                                            </Button>
                                        </InlineStack>
                                    )}
                                </InlineStack>
                            </BlockStack>
                        </Box>
                    </Card>

                    {/* Loading State */}
                    {productsQuery.loading && (
                        <Box paddingY="800">
                            <InlineStack align="center">
                                <Spinner
                                    accessibilityLabel="Loading products"
                                    size="large"
                                />
                            </InlineStack>
                        </Box>
                    )}

                    {/* Error State */}
                    {productsQuery.error && (
                        <Card>
                            <Box padding="400">
                                <Text tone="critical">
                                    Error loading products. Please try again.
                                </Text>
                            </Box>
                        </Card>
                    )}

                    {/* Product List */}
                    {!productsQuery.loading && !productsQuery.error && (
                        <Card padding="0">
                            <div
                                style={{
                                    height: "500px", // Fixed height instead of maxHeight
                                    minHeight: "500px", // Ensure minimum height
                                    overflow: "auto",
                                    border: "1px solid #e1e3e5",
                                    borderRadius: "6px",
                                }}
                                ref={scrollRef}
                            >
                                {products.length === 0 ? (
                                    <Box padding="800">
                                        <InlineStack align="center">
                                            <Text
                                                variant="bodyLg"
                                                tone="subdued"
                                            >
                                                No products found
                                            </Text>
                                        </InlineStack>
                                    </Box>
                                ) : (
                                    <BlockStack gap="0">
                                        {products.map((product, index) => (
                                            <React.Fragment key={product.id}>
                                                {/* Product Header */}
                                                <Box padding="300">
                                                    <InlineStack
                                                        align="space-between"
                                                        blockAlign="center"
                                                    >
                                                        <InlineStack
                                                            gap="300"
                                                            blockAlign="center"
                                                        >
                                                            <Checkbox
                                                                checked={isProductSelected(
                                                                    product,
                                                                )}
                                                                onChange={() =>
                                                                    handleProductToggle(
                                                                        product,
                                                                    )
                                                                }
                                                                disabled={selectedProductIds.includes(
                                                                    product.id,
                                                                )}
                                                            />
                                                            {renderProductImage(
                                                                product,
                                                            )}
                                                            <BlockStack gap="100">
                                                                <InlineStack
                                                                    gap="200"
                                                                    blockAlign="center"
                                                                >
                                                                    <Text
                                                                        variant="bodyMd"
                                                                        fontWeight="medium"
                                                                    >
                                                                        {
                                                                            product.title
                                                                        }
                                                                    </Text>
                                                                    {renderProductStatus(
                                                                        product.status,
                                                                    )}
                                                                    {product.variants &&
                                                                        product
                                                                            .variants
                                                                            .length >
                                                                            1 && (
                                                                            <Badge tone="info">
                                                                                {
                                                                                    product
                                                                                        .variants
                                                                                        .length
                                                                                }{" "}
                                                                                variants
                                                                            </Badge>
                                                                        )}
                                                                </InlineStack>
                                                                {product.productType && (
                                                                    <Text
                                                                        variant="bodySm"
                                                                        tone="subdued"
                                                                    >
                                                                        {
                                                                            product.productType
                                                                        }
                                                                    </Text>
                                                                )}
                                                                <Text
                                                                    variant="bodySm"
                                                                    tone="subdued"
                                                                >
                                                                    {
                                                                        product.totalInventory
                                                                    }{" "}
                                                                    available
                                                                </Text>
                                                            </BlockStack>
                                                        </InlineStack>
                                                        <InlineStack
                                                            gap="200"
                                                            blockAlign="center"
                                                        >
                                                            <Text
                                                                variant="bodyMd"
                                                                fontWeight="medium"
                                                            >
                                                                From ৳
                                                                {product.variants &&
                                                                product.variants
                                                                    .length > 0
                                                                    ? Math.min(
                                                                          ...product.variants.map(
                                                                              (
                                                                                  v,
                                                                              ) =>
                                                                                  parseFloat(
                                                                                      v.price,
                                                                                  ),
                                                                          ),
                                                                      ).toFixed(
                                                                          2,
                                                                      )
                                                                    : "0.00"}
                                                            </Text>
                                                            {product.variants &&
                                                                product.variants
                                                                    .length >
                                                                    1 && (
                                                                    <Button
                                                                        variant="plain"
                                                                        size="slim"
                                                                        icon={
                                                                            expandedProducts.has(
                                                                                product.id,
                                                                            )
                                                                                ? ChevronUpIcon
                                                                                : ChevronDownIcon
                                                                        }
                                                                        onClick={() =>
                                                                            toggleProductExpansion(
                                                                                product.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        {expandedProducts.has(
                                                                            product.id,
                                                                        )
                                                                            ? "Hide"
                                                                            : "Show"}{" "}
                                                                        variants
                                                                    </Button>
                                                                )}
                                                        </InlineStack>
                                                    </InlineStack>
                                                </Box>

                                                {/* Variants */}
                                                {product.variants &&
                                                    product.variants.length >
                                                        1 &&
                                                    expandedProducts.has(
                                                        product.id,
                                                    ) && (
                                                        <Box
                                                            paddingInlineStart="600"
                                                            paddingInlineEnd="300"
                                                            paddingBlockEnd="200"
                                                        >
                                                            <BlockStack gap="100">
                                                                {product.variants.map(
                                                                    (
                                                                        variant,
                                                                    ) => (
                                                                        <Box
                                                                            key={
                                                                                variant.id
                                                                            }
                                                                            padding="200"
                                                                            background="bg-surface-secondary"
                                                                        >
                                                                            <InlineStack
                                                                                align="space-between"
                                                                                blockAlign="center"
                                                                            >
                                                                                <InlineStack
                                                                                    gap="200"
                                                                                    blockAlign="center"
                                                                                >
                                                                                    <Checkbox
                                                                                        checked={isVariantSelected(
                                                                                            variant,
                                                                                        )}
                                                                                        onChange={() =>
                                                                                            handleVariantToggle(
                                                                                                product,
                                                                                                variant,
                                                                                            )
                                                                                        }
                                                                                    />

                                                                                    {variant.image && (
                                                                                        <Thumbnail
                                                                                            source={
                                                                                                variant
                                                                                                    .image
                                                                                                    .url
                                                                                            }
                                                                                            alt={
                                                                                                variant
                                                                                                    .image
                                                                                                    .altText ||
                                                                                                variant.title
                                                                                            }
                                                                                            size="extraSmall"
                                                                                        />
                                                                                    )}

                                                                                    <BlockStack gap="050">
                                                                                        <Text
                                                                                            variant="bodySm"
                                                                                            fontWeight="medium"
                                                                                        >
                                                                                            {
                                                                                                variant.title
                                                                                            }
                                                                                        </Text>
                                                                                        <InlineStack gap="200">
                                                                                            {variant.sku && (
                                                                                                <Text
                                                                                                    variant="caption"
                                                                                                    tone="subdued"
                                                                                                >
                                                                                                    SKU:{" "}
                                                                                                    {
                                                                                                        variant.sku
                                                                                                    }
                                                                                                </Text>
                                                                                            )}
                                                                                            <Text
                                                                                                variant="caption"
                                                                                                tone="subdued"
                                                                                            >
                                                                                                {
                                                                                                    variant.inventoryQuantity
                                                                                                }{" "}
                                                                                                available
                                                                                            </Text>
                                                                                        </InlineStack>
                                                                                    </BlockStack>
                                                                                </InlineStack>

                                                                                <BlockStack
                                                                                    gap="050"
                                                                                    inlineAlign="end"
                                                                                >
                                                                                    <Text
                                                                                        variant="bodySm"
                                                                                        fontWeight="medium"
                                                                                    >
                                                                                        ৳
                                                                                        {parseFloat(
                                                                                            variant.price,
                                                                                        ).toFixed(
                                                                                            2,
                                                                                        )}
                                                                                    </Text>
                                                                                    {variant.compareAtPrice &&
                                                                                        parseFloat(
                                                                                            variant.compareAtPrice,
                                                                                        ) >
                                                                                            parseFloat(
                                                                                                variant.price,
                                                                                            ) && (
                                                                                            <Text
                                                                                                variant="caption"
                                                                                                tone="subdued"
                                                                                                textDecorationLine="line-through"
                                                                                            >
                                                                                                ৳
                                                                                                {parseFloat(
                                                                                                    variant.compareAtPrice,
                                                                                                ).toFixed(
                                                                                                    2,
                                                                                                )}
                                                                                            </Text>
                                                                                        )}
                                                                                </BlockStack>
                                                                            </InlineStack>
                                                                        </Box>
                                                                    ),
                                                                )}
                                                            </BlockStack>
                                                        </Box>
                                                    )}

                                                {index <
                                                    products.length - 1 && (
                                                    <Divider />
                                                )}
                                            </React.Fragment>
                                        ))}

                                        {/* Loading more indicator */}
                                        {nextCursor && isLoadingMore && (
                                            <Box padding="400">
                                                <InlineStack align="center">
                                                    <Spinner size="small" />
                                                    <Text
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                        Loading more products...
                                                    </Text>
                                                </InlineStack>
                                            </Box>
                                        )}

                                        {/* End of results indicator */}
                                        {!nextCursor &&
                                            products.length > 10 && (
                                                <Box padding="400">
                                                    <InlineStack align="center">
                                                        <Text
                                                            variant="bodySm"
                                                            tone="subdued"
                                                        >
                                                            All products loaded
                                                            ({products.length}{" "}
                                                            total)
                                                        </Text>
                                                    </InlineStack>
                                                </Box>
                                            )}
                                    </BlockStack>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Selection Summary */}
                    {selectedItems.length > 0 && (
                        <Box padding="200">
                            <Text variant="bodySm" tone="subdued">
                                {selectedItems.length} item
                                {selectedItems.length !== 1 ? "s" : ""} selected
                            </Text>
                        </Box>
                    )}
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}
