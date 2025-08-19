"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    Icon,
    InlineStack,
    Modal,
    Popover,
    Select,
    Spinner,
    Text,
    TextField,
    Thumbnail,
} from "@shopify/polaris";
import { FilterIcon, SearchIcon } from "@shopify/polaris-icons";
import {
    GetProductsDocument,
    GetProductsQuery,
    GetProductsQueryVariables,
} from "@/lib/gql/graphql";
import { useGraphQL } from "@/hooks/useGraphQL";

// ------------------ Custom debounce hook ------------------
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

interface Product {
    id: string;
    title: string;
    price: number;
    image?: string;
    variants: number;
    quantity: number;
    handle?: string;
    type?: string;
    compareAtPrice?: number;
    status?: string;
    vendor?: string;
}

interface FilterState {
    status: string;
    productType: string;
    vendor: string;
    availability: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProductsSelected: (products: Product[]) => void;
    selectedProductIds: string[];
    title?: string;
}

const FILTER_OPTIONS = {
    status: [
        { label: "All", value: "" },
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
    ],
    availability: [
        { label: "All", value: "" },
        { label: "Available", value: "available" },
        { label: "Unavailable", value: "unavailable" },
    ],
};

export default function ProductSelectionModal({
    isOpen,
    onClose,
    onProductsSelected,
    selectedProductIds,
    title = "Add products",
}: Props) {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchBy, setSearchBy] = useState<string>("all");
    const [filters, setFilters] = useState<FilterState>({
        status: "",
        productType: "",
        vendor: "",
        availability: "",
    });
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [filterPopoverActive, setFilterPopoverActive] =
        useState<boolean>(false);

    const debouncedSearch = useDebounce(searchInput, 300);
    const [first] = useState(50);
    const scrollRef = useRef<HTMLDivElement>(null);

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
        }
        if (filters.productType) {
            query += query
                ? ` AND product_type:${filters.productType}`
                : `product_type:${filters.productType}`;
        }
        if (filters.vendor) {
            query += query
                ? ` AND vendor:${filters.vendor}`
                : `vendor:${filters.vendor}`;
        }

        return query;
    }, [debouncedSearch, searchBy, filters]);

    // ------------------ GraphQL query ------------------
    const variables: GetProductsQueryVariables = {
        first,
        query: buildSearchQuery(),
        sortKey: "UPDATED_AT",
        reverse: true,
    };

    const { data, isLoading, error, refetch } = useGraphQL<
        GetProductsQuery,
        GetProductsQueryVariables
    >(GetProductsDocument, variables);

    const products =
        data?.products?.edges.map((edge) => {
            const node = edge.node;
            const firstVariant = node.variants.edges[0]?.node;
            return {
                id: node.id,
                title: node.title,
                price: parseFloat(firstVariant?.price || "0"),
                compareAtPrice: parseFloat(firstVariant?.compareAtPrice || "0"),
                image: node.featuredImage?.url,
                variants: node.variants.edges.length,
                quantity: node.totalInventory ?? 0,
                handle: node.handle,
                type: node.productType,
                status: node.status?.toLowerCase(),
                vendor: node.vendor,
            };
        }) ?? [];

    const hasNextPage = data?.products?.pageInfo.hasNextPage;

    // ------------------ Selection handlers ------------------
    const handleProductToggle = (productId: string) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        );
    };

    const handleSelectAll = () => {
        const availableProductIds = products
            .filter((p) => !selectedProductIds.includes(p.id))
            .map((p) => p.id);

        setSelectedProducts(availableProductIds);
    };

    const handleDeselectAll = () => {
        setSelectedProducts([]);
    };

    const handleAdd = () => {
        const productsToAdd = products.filter((p) =>
            selectedProducts.includes(p.id),
        );
        onProductsSelected(productsToAdd);
        setSelectedProducts([]);
        setSearchInput("");
        setFilters({
            status: "",
            productType: "",
            vendor: "",
            availability: "",
        });
    };

    const handleCancel = () => {
        setSelectedProducts([]);
        setSearchInput("");
        setFilters({
            status: "",
            productType: "",
            vendor: "",
            availability: "",
        });
        onClose();
    };

    const isProductSelected = (productId: string) => {
        return (
            selectedProducts.includes(productId) ||
            selectedProductIds.includes(productId)
        );
    };

    // ------------------ Filter handlers ------------------
    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "",
            productType: "",
            vendor: "",
            availability: "",
        });
        setShowFilters(false);
    };

    const hasActiveFilters = Object.values(filters).some(
        (filter) => filter !== "",
    );
    const activeFilterCount = Object.values(filters).filter(
        (filter) => filter !== "",
    ).length;

    // ------------------ Scroll handler for pagination ------------------
    const handleScroll = useCallback(() => {
        if (!scrollRef.current || !hasNextPage || isLoading) return;
        const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            // Implement fetchMore logic here if needed
            console.log("Load more products");
        }
    }, [hasNextPage, isLoading]);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener("scroll", handleScroll);
            return () =>
                scrollElement.removeEventListener("scroll", handleScroll);
        }
    }, [handleScroll]);

    // ------------------ Render helpers ------------------
    const renderProductImage = (product: Product) => {
        if (product.image) {
            return (
                <Thumbnail
                    source={product.image}
                    alt={product.title}
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
            active: { tone: "success" as const, label: "Active" },
            draft: { tone: "warning" as const, label: "Draft" },
            archived: { tone: "subdued" as const, label: "Archived" },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        if (!config) return null;

        return <Badge tone={config.tone}>{config.label}</Badge>;
    };

    // ------------------ Main render ------------------
    return (
        <Modal
            open={isOpen}
            onClose={handleCancel}
            title={title}
            primaryAction={{
                content: `Add ${selectedProducts.length > 0 ? `(${selectedProducts.length})` : ""}`,
                onAction: handleAdd,
                disabled: selectedProducts.length === 0,
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
                                                minWidth: "200px",
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
                                                    label="Availability"
                                                    options={
                                                        FILTER_OPTIONS.availability
                                                    }
                                                    value={filters.availability}
                                                    onChange={(value) =>
                                                        handleFilterChange(
                                                            "availability",
                                                            value,
                                                        )
                                                    }
                                                />
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
                    {isLoading && (
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
                    {error && (
                        <Card>
                            <Box padding="400">
                                <Text tone="critical">
                                    Error loading products. Please try again.
                                </Text>
                            </Box>
                        </Card>
                    )}

                    {/* Product List */}
                    {!isLoading && !error && (
                        <Card padding="0">
                            <div
                                style={{
                                    maxHeight: "500px",
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
                                                                    product.id,
                                                                )}
                                                                onChange={() =>
                                                                    handleProductToggle(
                                                                        product.id,
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
                                                                </InlineStack>
                                                                {product.type && (
                                                                    <Text
                                                                        variant="bodySm"
                                                                        tone="subdued"
                                                                    >
                                                                        {
                                                                            product.type
                                                                        }
                                                                    </Text>
                                                                )}
                                                                <Text
                                                                    variant="bodySm"
                                                                    tone="subdued"
                                                                >
                                                                    {
                                                                        product.quantity
                                                                    }{" "}
                                                                    available
                                                                </Text>
                                                            </BlockStack>
                                                        </InlineStack>
                                                        <Text
                                                            variant="bodyMd"
                                                            fontWeight="medium"
                                                        >
                                                            ৳
                                                            {product.price.toFixed(
                                                                2,
                                                            )}
                                                        </Text>
                                                    </InlineStack>
                                                </Box>
                                                {index <
                                                    products.length - 1 && (
                                                    <Divider />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </BlockStack>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Selection Summary */}
                    {selectedProducts.length > 0 && (
                        <Box padding="200">
                            <Text variant="bodySm" tone="subdued">
                                {selectedProducts.length} product
                                {selectedProducts.length !== 1 ? "s" : ""}{" "}
                                selected
                            </Text>
                        </Box>
                    )}
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}
