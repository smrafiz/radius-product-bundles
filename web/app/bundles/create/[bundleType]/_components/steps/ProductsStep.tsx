'use client';

import React, { useState } from 'react';
import {
    BlockStack,
    Text,
    Card,
    Button,
    InlineStack,
    TextField,
    Icon,
    Box
} from '@shopify/polaris';
import { PlusIcon, DeleteIcon, DragHandleIcon } from '@shopify/polaris-icons';
import { useBundleStore } from "@/lib/stores/bundleStore";
import ProductSelectionModal from './ProductSelectionModal';

interface Product {
    id: string;
    title: string;
    price: number;
    image?: string;
    variants: number;
    quantity: number;
}

export default function ProductsStep() {
    const { bundleData, updateBundleField } = useBundleStore();
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([
        {
            id: 'snowboard2',
            title: 'The Collection Snowboard: Liquid',
            price: 749.95,
            image: 'https://via.placeholder.com/60x60/E8F5E8/388E3C?text=SB2',
            variants: 1,
            quantity: 1
        },
        {
            id: 'snowboard5',
            title: 'The Videographer Snowboard',
            price: 1299.95,
            image: 'https://via.placeholder.com/60x60/FFE0B2/FF8F00?text=SB5',
            variants: 1,
            quantity: 1
        }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddProducts = () => {
        setIsModalOpen(true);
    };

    const handleProductsSelected = (products: Product[]) => {
        setSelectedProducts([...selectedProducts, ...products]);
        setIsModalOpen(false);
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const handleQuantityChange = (productId: string, quantity: number) => {
        setSelectedProducts(selectedProducts.map(p =>
            p.id === productId ? { ...p, quantity } : p
        ));
    };

    const handleClearAll = () => {
        setSelectedProducts([]);
    };

    return (
        <BlockStack gap="500">
            <BlockStack gap="200">
                <Text variant="headingLg" as="h2">
                    Products
                </Text>
                <Text variant="bodySm" tone="subdued">
                    Select products to include in your bundle
                </Text>
            </BlockStack>

            {/* Products Section */}
            <Card>
                <BlockStack gap="400">
                    {/* Header */}
                    <InlineStack align="space-between" blockAlign="center">
                        <Button
                            variant="primary"
                            icon={PlusIcon}
                            onClick={handleAddProducts}
                        >
                            Add Products
                        </Button>

                        {selectedProducts.length > 0 && (
                            <Button
                                variant="plain"
                                tone="critical"
                                icon={DeleteIcon}
                                onClick={handleClearAll}
                            >
                                Clear all
                            </Button>
                        )}
                    </InlineStack>

                    {/* Selected Products List with Sortable Design */}
                    {selectedProducts.length > 0 ? (
                        <BlockStack gap="200">
                            {selectedProducts.map((product) => (
                                <Card key={product.id} background="bg-surface-secondary">
                                    <Box padding="300">
                                        <InlineStack align="space-between" blockAlign="center" gap="400">
                                            {/* Drag Handle */}
                                            <Icon source={DragHandleIcon} tone="subdued" />

                                            {/* Product Info */}
                                            <InlineStack gap="300" blockAlign="center">
                                                {/* Product Image */}
                                                <Box
                                                    borderRadius="100"
                                                    minWidth="60px"
                                                    minHeight="60px"
                                                    style={{
                                                        backgroundImage: `url(${product.image})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        border: '1px solid #E1E3E5'
                                                    }}
                                                />

                                                {/* Product Title */}
                                                <Text variant="bodyMd" fontWeight="medium">
                                                    {product.title}
                                                </Text>
                                            </InlineStack>

                                            {/* Quantity & Remove */}
                                            <InlineStack gap="300" blockAlign="center">
                                                <TextField
                                                    value={product.quantity.toString()}
                                                    onChange={(value) => handleQuantityChange(product.id, parseInt(value) || 1)}
                                                    type="number"
                                                    min="1"
                                                    autoComplete="off"
                                                    style={{ width: '80px' }}
                                                />

                                                <Button
                                                    variant="plain"
                                                    icon={DeleteIcon}
                                                    onClick={() => handleRemoveProduct(product.id)}
                                                />
                                            </InlineStack>
                                        </InlineStack>
                                    </Box>
                                </Card>
                            ))}
                        </BlockStack>
                    ) : (
                        <Box padding="800" background="bg-surface-secondary" borderRadius="200">
                            <InlineStack align="center">
                                <BlockStack gap="200" inlineAlign="center">
                                    <Text variant="bodyMd" tone="subdued">
                                        No products selected
                                    </Text>
                                    <Text variant="bodySm" tone="subdued">
                                        Add products to create your bundle
                                    </Text>
                                </BlockStack>
                            </InlineStack>
                        </Box>
                    )}
                </BlockStack>
            </Card>

            {/* Product Selection Modal */}
            <ProductSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProductsSelected={handleProductsSelected}
                selectedProductIds={selectedProducts.map(p => p.id)}
            />
        </BlockStack>
    );
}