"use client";

import React, { useCallback, useState } from "react";
import {
    BlockStack,
    Box,
    Card,
    Checkbox,
    ChoiceList,
    Divider,
    Filters,
    InlineStack,
    Modal,
    Scrollable,
    Text,
    TextField,
} from "@shopify/polaris";
import {
    GetProductsDocument,
    GetProductsQuery,
    GetProductsQueryVariables,
} from "@/lib/gql/graphql";
import { useGraphQL } from "@/hooks/useGraphQL";

interface Product {
    id: string;
    title: string;
    price: number;
    image?: string;
    variants: number;
    quantity: number;
    available?: number;
    type?: string;
    status?: "active" | "draft" | "archived";
    vendor?: string;
    sku?: string;
    collection?: string;
    category?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProductsSelected: (products: Product[]) => void;
    selectedProductIds: string[];
    shop: string;
}

export default function ProductSelectionModal({
    isOpen,
    onClose,
    onProductsSelected,
    selectedProductIds,
    shop,
}: Props) {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [queryValue, setQueryValue] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string[] | undefined>(
        undefined,
    );
    const [vendorFilter, setVendorFilter] = useState<string | undefined>(
        undefined,
    );
    const [collectionFilter, setCollectionFilter] = useState<
        string[] | undefined
    >(undefined);
    const [categoryFilter, setCategoryFilter] = useState<string[] | undefined>(
        undefined,
    );
    const [first, setFirst] = useState(50);

    // Build GraphQL query variables
    const variables: GetProductsQueryVariables = {
        first,
        query: buildShopifyQuery(
            queryValue,
            statusFilter,
            vendorFilter,
            collectionFilter,
            categoryFilter,
        ),
    };

    // Fetch products using useGraphQL hook
    const { data, isLoading, error } = useGraphQL<
        GetProductsQuery,
        GetProductsQueryVariables
    >(GetProductsDocument, shop, variables);

    const products = data?.products?.edges?.map((edge) => edge.node) ?? [];

    // ------------------ Selection Logic ------------------
    const handleProductToggle = (productId: string) => {
        setSelectedProducts((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        );
    };

    const handleAdd = () => {
        const productsToAdd = products.filter((p) =>
            selectedProducts.includes(p.id),
        );
        onProductsSelected(productsToAdd);
        setSelectedProducts([]);
    };

    const handleCancel = () => {
        setSelectedProducts([]);
        onClose();
    };

    const isProductSelected = (productId: string) => {
        return (
            selectedProducts.includes(productId) ||
            selectedProductIds.includes(productId)
        );
    };

    // ------------------ Filters ------------------
    const handleFiltersQueryChange = useCallback(
        (value: string) => setQueryValue(value),
        [],
    );
    const handleStatusChange = useCallback(
        (value: string[]) => setStatusFilter(value),
        [],
    );
    const handleVendorChange = useCallback(
        (value: string) => setVendorFilter(value),
        [],
    );
    const handleCollectionChange = useCallback(
        (value: string[]) => setCollectionFilter(value),
        [],
    );
    const handleCategoryChange = useCallback(
        (value: string[]) => setCategoryFilter(value),
        [],
    );

    const handleStatusRemove = useCallback(
        () => setStatusFilter(undefined),
        [],
    );
    const handleVendorRemove = useCallback(
        () => setVendorFilter(undefined),
        [],
    );
    const handleCollectionRemove = useCallback(
        () => setCollectionFilter(undefined),
        [],
    );
    const handleCategoryRemove = useCallback(
        () => setCategoryFilter(undefined),
        [],
    );
    const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);

    const handleFiltersClearAll = useCallback(() => {
        handleStatusRemove();
        handleVendorRemove();
        handleCollectionRemove();
        handleCategoryRemove();
        handleQueryValueRemove();
    }, [
        handleStatusRemove,
        handleVendorRemove,
        handleCollectionRemove,
        handleCategoryRemove,
        handleQueryValueRemove,
    ]);

    const filters = [
        {
            key: "status",
            label: "Product status",
            filter: (
                <ChoiceList
                    titleHidden
                    choices={[
                        { label: "Active", value: "active" },
                        { label: "Draft", value: "draft" },
                        { label: "Archived", value: "archived" },
                    ]}
                    selected={statusFilter || []}
                    onChange={handleStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: "vendor",
            label: "Vendor",
            filter: (
                <TextField
                    labelHidden
                    value={vendorFilter || ""}
                    onChange={handleVendorChange}
                    autoComplete="off"
                />
            ),
            shortcut: true,
        },
        {
            key: "collection",
            label: "Collection",
            filter: (
                <ChoiceList
                    titleHidden
                    choices={[
                        {
                            label: "Winter Collection",
                            value: "Winter Collection",
                        },
                        { label: "Pro Collection", value: "Pro Collection" },
                        { label: "Accessories", value: "Accessories" },
                        { label: "Gift Cards", value: "Gift Cards" },
                    ]}
                    selected={collectionFilter || []}
                    onChange={handleCollectionChange}
                    allowMultiple
                />
            ),
        },
        {
            key: "category",
            label: "Category",
            filter: (
                <ChoiceList
                    titleHidden
                    choices={[
                        { label: "Snowboards", value: "Snowboards" },
                        { label: "Equipment", value: "Equipment" },
                        { label: "Digital", value: "Digital" },
                        { label: "Maintenance", value: "Maintenance" },
                    ]}
                    selected={categoryFilter || []}
                    onChange={handleCategoryChange}
                    allowMultiple
                />
            ),
        },
    ];

    const appliedFilters = [];
    if (!isEmpty(statusFilter))
        appliedFilters.push({
            key: "status",
            label: disambiguateLabel("status", statusFilter),
            onRemove: handleStatusRemove,
        });
    if (!isEmpty(vendorFilter))
        appliedFilters.push({
            key: "vendor",
            label: disambiguateLabel("vendor", vendorFilter),
            onRemove: handleVendorRemove,
        });
    if (!isEmpty(collectionFilter))
        appliedFilters.push({
            key: "collection",
            label: disambiguateLabel("collection", collectionFilter),
            onRemove: handleCollectionRemove,
        });
    if (!isEmpty(categoryFilter))
        appliedFilters.push({
            key: "category",
            label: disambiguateLabel("category", categoryFilter),
            onRemove: handleCategoryRemove,
        });

    // ------------------ Utility Functions ------------------
    function buildShopifyQuery(
        search: string,
        status?: string[],
        vendor?: string,
        collections?: string[],
        categories?: string[],
    ) {
        const queries: string[] = [];
        if (search) queries.push(`${search}*`);
        if (status?.length)
            queries.push(status.map((s) => `status:${s}`).join(" OR "));
        if (vendor) queries.push(`vendor:${vendor}`);
        if (collections?.length)
            queries.push(
                collections.map((c) => `collection:${c}`).join(" OR "),
            );
        if (categories?.length)
            queries.push(
                categories.map((c) => `product_type:${c}`).join(" OR "),
            );
        return queries.join(" ");
    }

    function disambiguateLabel(key: string, value: any) {
        switch (key) {
            case "status":
                return value?.map((v: string) => `Status: ${v}`).join(", ");
            case "vendor":
                return `Vendor: ${value}`;
            case "collection":
                return value?.map((v: string) => `Collection: ${v}`).join(", ");
            case "category":
                return value?.map((v: string) => `Category: ${v}`).join(", ");
            default:
                return value;
        }
    }

    function isEmpty(value: string | string[] | undefined) {
        if (Array.isArray(value)) return value.length === 0;
        else return !value;
    }

    const formatPrice = (price: number) => `Tk ${price.toFixed(2)}`;

    // ------------------ Render ------------------
    return (
        <Modal
            open={isOpen}
            onClose={handleCancel}
            title="Add products"
            primaryAction={{
                content: "Select",
                onAction: handleAdd,
                disabled: selectedProducts.length === 0,
            }}
            secondaryActions={[{ content: "Cancel", onAction: handleCancel }]}
            large
        >
            <Modal.Section>
                <BlockStack gap="400">
                    {/* Filters */}
                    <Card>
                        <Filters
                            queryValue={queryValue}
                            filters={filters}
                            appliedFilters={appliedFilters}
                            onQueryChange={handleFiltersQueryChange}
                            onQueryClear={handleQueryValueRemove}
                            onClearAll={handleFiltersClearAll}
                        />
                    </Card>

                    {/* Product List */}
                    <div style={{ height: "450px" }}>
                        <Scrollable shadow style={{ height: "100%" }}>
                            <BlockStack gap="0">
                                {isLoading && (
                                    <Text variant="bodyMd" tone="subdued">
                                        Loading products...
                                    </Text>
                                )}
                                {!isLoading && products.length === 0 && (
                                    <Text variant="bodyMd" tone="subdued">
                                        No products found
                                    </Text>
                                )}
                                {products.map((product) => (
                                    <React.Fragment key={product.id}>
                                        <Box padding="400">
                                            <InlineStack
                                                align="space-between"
                                                blockAlign="center"
                                            >
                                                <InlineStack
                                                    gap="400"
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
                                                    <Box
                                                        borderRadius="100"
                                                        minWidth="80px"
                                                        minHeight="80px"
                                                        style={{
                                                            backgroundImage: `url(${product.images?.edges?.[0]?.node?.url})`,
                                                            backgroundSize:
                                                                "cover",
                                                            backgroundPosition:
                                                                "center",
                                                            border: "1px solid #E1E3E5",
                                                        }}
                                                    />
                                                    <Text
                                                        variant="bodyLg"
                                                        fontWeight="medium"
                                                    >
                                                        {product.title}
                                                    </Text>
                                                </InlineStack>
                                                <Text
                                                    variant="bodyLg"
                                                    fontWeight="medium"
                                                >
                                                    Tk{" "}
                                                    {parseFloat(
                                                        product.priceRangeV2
                                                            ?.minVariantPrice
                                                            .amount || "0",
                                                    ).toFixed(2)}
                                                </Text>
                                            </InlineStack>
                                        </Box>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </BlockStack>
                        </Scrollable>
                    </div>

                    {/* Selected Count */}
                    {selectedProducts.length > 0 && (
                        <Text variant="bodySm" tone="subdued">
                            {selectedProducts.length} product
                            {selectedProducts.length !== 1 ? "s" : ""} selected
                        </Text>
                    )}
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}
