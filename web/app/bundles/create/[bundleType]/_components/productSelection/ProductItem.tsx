"use client";

import {
    Badge,
    BlockStack,
    Box,
    Button,
    Checkbox,
    Divider,
    Icon,
    InlineStack,
    Text,
    Thumbnail,
} from "@shopify/polaris";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ImageIcon,
    SearchIcon,
} from "@shopify/polaris-icons";
import {
    useProductSelectionStore,
    VariantItem,
} from "@/bundles/create/[bundleType]/_components/productSelection";

import { Product } from "@/types";
import { formatCurrency } from "@/utils";

interface Props {
    product: Product;
    isLast: boolean;
    isDisabled: boolean;
}

export const ProductItem = ({ product, isLast, isDisabled }: Props) => {
    const {
        expandedProducts,
        isProductSelected,
        toggleProductSelection,
        isProductIndeterminate,
        toggleProductExpansion,
    } = useProductSelectionStore();

    const handleProductToggle = () => {
        if (!isDisabled) {
            toggleProductSelection(product, []);
        }
    };

    // Determine checkbox state
    const getCheckboxState = () => {
        if (isProductSelected(product)) {
            return true;
        } else if (isProductIndeterminate(product)) {
            return "indeterminate";
        } else {
            return false;
        }
    };

    const handleExpansionToggle = () => {
        toggleProductExpansion(product.id);
    };

    const renderProductImage = () => {
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
            <div className="w-10 h-10 bg-[var(--p-color-bg-surface-hover)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center">
                <Icon source={ImageIcon} tone="subdued" />
            </div>
        );
    };

    const renderProductStatus = () => {
        if (!product.status) return null;

        const statusConfig = {
            ACTIVE: { tone: "success" as const, label: "Active" },
            DRAFT: { tone: "warning" as const, label: "Draft" },
            ARCHIVED: { tone: "critical" as const, label: "Archived" },
        };

        const config =
            statusConfig[product.status as keyof typeof statusConfig];
        if (!config) return null;

        return <Badge tone={config.tone}>{config.label}</Badge>;
    };

    const getMinPrice = () => {
        if (product.variants && product.variants.length > 0) {
            return Math.min(
                ...product.variants.map((v) => parseFloat(v.price)),
            ).toFixed(2);
        }
        return "0.00";
    };

    const getInventoryDisplay = () => {
        if (!product.variants || product.variants.length === 0) {
            return null;
        }

        const trackedVariants = product.variants.filter(
            (variant) => variant.inventoryItem?.tracked === true,
        );

        if (trackedVariants.length === 0) {
            return null;
        }

        if (trackedVariants.length === product.variants.length) {
            const totalInventory = trackedVariants.reduce(
                (sum, variant) => sum + (variant.inventoryQuantity || 0),
                0,
            );

            if (totalInventory === 0) {
                return { text: "Out of stock", tone: "critical" as const };
            } else {
                return {
                    text: `${totalInventory} available`,
                    tone: "subdued" as const,
                };
            }
        }

        return { text: "Mixed inventory tracking", tone: "subdued" as const };
    };

    const isExpanded = expandedProducts.has(product.id);
    const hasMultipleVariants = product.variants && product.variants.length > 1;
    const inventoryDisplay = getInventoryDisplay();

    return (
        <>
            {/* Product Header */}
            <Box padding="300">
                <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="300" blockAlign="center">
                        <Checkbox
                            label=""
                            checked={getCheckboxState()}
                            onChange={handleProductToggle}
                            disabled={isDisabled}
                        />
                        {renderProductImage()}
                        <BlockStack gap="100">
                            <InlineStack gap="200" blockAlign="center">
                                <Text
                                    as="p"
                                    variant="bodyMd"
                                    fontWeight="medium"
                                >
                                    {product.title}
                                </Text>
                                {renderProductStatus()}
                                {hasMultipleVariants && (
                                    <Badge tone="info">
                                        {`${product.variants.length} variants`}
                                    </Badge>
                                )}
                            </InlineStack>
                            {product.productType && (
                                <Text as="p" variant="bodySm" tone="subdued">
                                    {product.productType}
                                </Text>
                            )}
                            {inventoryDisplay && (
                                <Text
                                    as="p"
                                    variant="bodySm"
                                    tone={inventoryDisplay.tone}
                                >
                                    {inventoryDisplay.text}
                                </Text>
                            )}
                        </BlockStack>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                        {!hasMultipleVariants && (
                            <Text as="p" variant="bodyMd" fontWeight="medium">
                                {formatCurrency(getMinPrice())}
                            </Text>
                        )}
                        {hasMultipleVariants && (
                            <Button
                                variant="plain"
                                size="slim"
                                icon={
                                    isExpanded ? ChevronUpIcon : ChevronDownIcon
                                }
                                onClick={handleExpansionToggle}
                            >
                                Variants
                            </Button>
                        )}
                    </InlineStack>
                </InlineStack>
            </Box>

            {/* Variants */}
            {hasMultipleVariants && isExpanded && (
                <Box
                    paddingInlineStart="600"
                    paddingInlineEnd="300"
                    paddingBlockEnd="200"
                >
                    <BlockStack gap="100">
                        {product.variants.map((variant) => (
                            <VariantItem
                                key={variant.id}
                                product={product}
                                variant={variant}
                            />
                        ))}
                    </BlockStack>
                </Box>
            )}

            {!isLast && <Divider />}
        </>
    );
};
