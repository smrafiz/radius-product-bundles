'use client';

import React, { useState, useCallback } from 'react';
import {
    Modal,
    Button,
    BlockStack,
    InlineStack,
    Text,
    Checkbox,
    Box,
    Scrollable,
    Filters,
    ChoiceList,
    TextField,
    Card,
    Divider
} from '@shopify/polaris';

interface Product {
    id: string;
    title: string;
    price: number;
    image?: string;
    variants: number;
    quantity: number;
    available?: number;
    type?: string;
    status?: 'active' | 'draft' | 'archived';
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
}

// Mock product data
const mockProducts: Product[] = [
    {
        id: 'snowboard1',
        title: 'The Draft Snowboard',
        price: 2629.95,
        image: 'https://via.placeholder.com/80x80/E3F2FD/1976D2?text=SB1',
        variants: 1,
        quantity: 1,
        status: 'active',
        vendor: 'Snowboard Inc',
        sku: 'SB-DRAFT-001',
        collection: 'Winter Collection',
        category: 'Snowboards'
    },
    {
        id: 'snowboard2',
        title: 'The Collection Snowboard: Liquid',
        price: 749.95,
        image: 'https://via.placeholder.com/80x80/E8F5E8/388E3C?text=SB2',
        variants: 1,
        quantity: 1,
        status: 'active',
        vendor: 'Snowboard Inc',
        sku: 'SB-LIQUID-001',
        collection: 'Winter Collection',
        category: 'Snowboards'
    },
    {
        id: 'snowboard3',
        title: 'The Out of Stock Snowboard',
        price: 885.95,
        image: 'https://via.placeholder.com/80x80/FFF3E0/F57C00?text=SB3',
        variants: 1,
        quantity: 1,
        status: 'active',
        vendor: 'Snowboard Inc',
        sku: 'SB-STOCK-001',
        collection: 'Winter Collection',
        category: 'Snowboards'
    },
    {
        id: 'snowboard4',
        title: 'The Inventory Not Tracked Snowboard',
        price: 949.95,
        image: 'https://via.placeholder.com/80x80/F3E5F5/7B1FA2?text=SB4',
        variants: 1,
        quantity: 1,
        status: 'active',
        vendor: 'Snowboard Inc',
        sku: 'SB-INV-001',
        collection: 'Winter Collection',
        category: 'Snowboards'
    },
    {
        id: 'snowboard5',
        title: 'The Videographer Snowboard',
        price: 1299.95,
        image: 'https://via.placeholder.com/80x80/FFE0B2/FF8F00?text=SB5',
        variants: 1,
        quantity: 1,
        status: 'active',
        vendor: 'Snowboard Inc',
        sku: 'SB-VIDEO-001',
        collection: 'Pro Collection',
        category: 'Snowboards'
    }
];

export default function ProductSelectionModal({ isOpen, onClose, onProductsSelected, selectedProductIds }: Props) {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [queryValue, setQueryValue] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<string[] | undefined>(undefined);
    const [vendorFilter, setVendorFilter] = useState<string | undefined>(undefined);
    const [collectionFilter, setCollectionFilter] = useState<string[] | undefined>(undefined);
    const [categoryFilter, setCategoryFilter] = useState<string[] | undefined>(undefined);

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

    const handleQueryValueRemove = useCallback(
        () => setQueryValue(undefined),
        [],
    );

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
            key: 'status',
            label: 'Product status',
            filter: (
                <ChoiceList
                    title="Product status"
                    titleHidden
                    choices={[
                        { label: 'Active', value: 'active' },
                        { label: 'Draft', value: 'draft' },
                        { label: 'Archived', value: 'archived' },
                    ]}
                    selected={statusFilter || []}
                    onChange={handleStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'vendor',
            label: 'Vendor',
            filter: (
                <TextField
                    label="Vendor"
                    value={vendorFilter}
                    onChange={handleVendorChange}
                    autoComplete="off"
                    labelHidden
                />
            ),
            shortcut: true,
        },
        {
            key: 'collection',
            label: 'Collection',
            filter: (
                <ChoiceList
                    title="Collection"
                    titleHidden
                    choices={[
                        { label: 'Winter Collection', value: 'Winter Collection' },
                        { label: 'Pro Collection', value: 'Pro Collection' },
                        { label: 'Accessories', value: 'Accessories' },
                        { label: 'Gift Cards', value: 'Gift Cards' },
                    ]}
                    selected={collectionFilter || []}
                    onChange={handleCollectionChange}
                    allowMultiple
                />
            ),
        },
        {
            key: 'category',
            label: 'Category',
            filter: (
                <ChoiceList
                    title="Category"
                    titleHidden
                    choices={[
                        { label: 'Snowboards', value: 'Snowboards' },
                        { label: 'Equipment', value: 'Equipment' },
                        { label: 'Digital', value: 'Digital' },
                        { label: 'Maintenance', value: 'Maintenance' },
                    ]}
                    selected={categoryFilter || []}
                    onChange={handleCategoryChange}
                    allowMultiple
                />
            ),
        },
    ];

    const appliedFilters = [];
    if (!isEmpty(statusFilter)) {
        appliedFilters.push({
            key: 'status',
            label: disambiguateLabel('status', statusFilter),
            onRemove: handleStatusRemove,
        });
    }
    if (!isEmpty(vendorFilter)) {
        appliedFilters.push({
            key: 'vendor',
            label: disambiguateLabel('vendor', vendorFilter),
            onRemove: handleVendorRemove,
        });
    }
    if (!isEmpty(collectionFilter)) {
        appliedFilters.push({
            key: 'collection',
            label: disambiguateLabel('collection', collectionFilter),
            onRemove: handleCollectionRemove,
        });
    }
    if (!isEmpty(categoryFilter)) {
        appliedFilters.push({
            key: 'category',
            label: disambiguateLabel('category', categoryFilter),
            onRemove: handleCategoryRemove,
        });
    }

    // Filter products based on search and filters
    const filteredProducts = mockProducts.filter(product => {
        let matchesQuery = true;
        if (queryValue) {
            matchesQuery =
                product.title.toLowerCase().includes(queryValue.toLowerCase()) ||
                product.id.toLowerCase().includes(queryValue.toLowerCase()) ||
                product.sku?.toLowerCase().includes(queryValue.toLowerCase()) ||
                false;
        }

        const matchesStatus = isEmpty(statusFilter) || statusFilter?.includes(product.status || '');
        const matchesVendor = isEmpty(vendorFilter) || product.vendor?.toLowerCase().includes(vendorFilter?.toLowerCase() || '');
        const matchesCollection = isEmpty(collectionFilter) || collectionFilter?.includes(product.collection || '');
        const matchesCategory = isEmpty(categoryFilter) || categoryFilter?.includes(product.category || '');

        return matchesQuery && matchesStatus && matchesVendor && matchesCollection && matchesCategory;
    });

    const handleProductToggle = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleAdd = () => {
        const productsToAdd = mockProducts.filter(p => selectedProducts.includes(p.id));
        onProductsSelected(productsToAdd);
        setSelectedProducts([]);
    };

    const handleCancel = () => {
        setSelectedProducts([]);
        onClose();
    };

    const isProductSelected = (productId: string) => {
        return selectedProducts.includes(productId) || selectedProductIds.includes(productId);
    };

    const formatPrice = (price: number) => {
        return `Tk ${price.toFixed(2)}`;
    };

    function disambiguateLabel(key: string, value: any) {
        switch (key) {
            case 'status':
                return value?.map((val: string) => `Status: ${val}`).join(', ');
            case 'vendor':
                return `Vendor: ${value}`;
            case 'collection':
                return value?.map((val: string) => `Collection: ${val}`).join(', ');
            case 'category':
                return value?.map((val: string) => `Category: ${val}`).join(', ');
            default:
                return value;
        }
    }

    function isEmpty(
        value: string | string[] | undefined,
    ): boolean {
        if (Array.isArray(value)) {
            return value.length === 0;
        } else {
            return value === '' || value == null;
        }
    }

    return (
        <Modal
            open={isOpen}
            onClose={handleCancel}
            title="Add products"
            primaryAction={{
                content: 'Select',
                onAction: handleAdd,
                disabled: selectedProducts.length === 0
            }}
            secondaryActions={[{
                content: 'Cancel',
                onAction: handleCancel
            }]}
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

                    {/* Clean Product List */}
                    <div style={{ height: '450px' }}>
                        <Scrollable shadow style={{ height: '100%' }}>
                            <BlockStack gap="0">
                                {filteredProducts.map((product, index) => (
                                    <React.Fragment key={product.id}>
                                        <Box padding="400">
                                            <InlineStack align="space-between" blockAlign="center">
                                                <InlineStack gap="400" blockAlign="center">
                                                    <Checkbox
                                                        checked={isProductSelected(product.id)}
                                                        onChange={() => handleProductToggle(product.id)}
                                                        disabled={selectedProductIds.includes(product.id)}
                                                    />

                                                    {/* Product Image */}
                                                    <Box
                                                        borderRadius="100"
                                                        minWidth="80px"
                                                        minHeight="80px"
                                                        style={{
                                                            backgroundImage: `url(${product.image})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            border: '1px solid #E1E3E5'
                                                        }}
                                                    />

                                                    {/* Product Title */}
                                                    <Text variant="bodyLg" fontWeight="medium">
                                                        {product.title}
                                                    </Text>
                                                </InlineStack>

                                                {/* Product Price */}
                                                <Text variant="bodyLg" fontWeight="medium">
                                                    {formatPrice(product.price)}
                                                </Text>
                                            </InlineStack>
                                        </Box>
                                        {index < filteredProducts.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <Box padding="800">
                                        <InlineStack align="center">
                                            <BlockStack gap="200" inlineAlign="center">
                                                <Text variant="bodyMd" tone="subdued">
                                                    No products found
                                                </Text>
                                                <Text variant="bodySm" tone="subdued">
                                                    Try adjusting your search or filters
                                                </Text>
                                            </BlockStack>
                                        </InlineStack>
                                    </Box>
                                )}
                            </BlockStack>
                        </Scrollable>
                    </div>

                    {/* Selected Count */}
                    {selectedProducts.length > 0 && (
                        <Text variant="bodySm" tone="subdued">
                            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                        </Text>
                    )}
                </BlockStack>
            </Modal.Section>
        </Modal>
    );
}