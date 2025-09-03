// components/bundles/BundleForm.tsx (Fixed version)
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
    Badge,
    Banner,
    Button,
    Card,
    DataTable,
    FormLayout,
    Layout,
    Modal,
    Page,
    Select,
    Spinner,
    Text,
    TextField,
    BlockStack,
    InlineStack,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";

import { useBundleForm } from "@/hooks/bundle/useBundleForm";
import { BundleFormData } from "@/lib/validation/bundleSchema";
import { DISCOUNT_TYPES } from "@/lib/constants";

interface BundleFormProps {
    bundleId?: string;
    initialData?: Partial<BundleFormData>;
    onSuccess?: (data: any) => void;
    onCancel?: () => void;
}

export default function BundleForm({
                                       bundleId,
                                       initialData,
                                       onSuccess,
                                       onCancel,
                                   }: BundleFormProps) {
    const [showExitModal, setShowExitModal] = useState(false);

    const {
        form,
        productFields,
        addProduct,
        removeProductAt,
        updateProductQuantity,
        handleSubmit,
        isLoading,
        isDirty,
        isValid,
        hasErrors,
        showDiscountValue,
        isPercentageDiscount,
        discountType,
        productCount,
        leaveConfirmation,
        getFieldError,
        resetForm,
    } = useBundleForm({
        bundleId,
        initialData,
        onSuccess,
        onError: (error) => console.error("Bundle form error:", error),
    });

    // Handle exit with confirmation
    const handleExit = async () => {
        if (isDirty) {
            setShowExitModal(true);
        } else {
            onCancel?.();
        }
    };

    const confirmExit = async () => {
        try {
            await leaveConfirmation();
            onCancel?.();
        } catch (error) {
            // User cancelled
            setShowExitModal(false);
        }
    };

    // Mock product picker - replace with your actual implementation
    const handleAddProduct = () => {
        // This would open your product picker
        // For now, adding a mock product
        addProduct({
            id: `product-${Date.now()}`,
            title: `Sample Product ${productCount + 1}`,
            price: "29.99",
            selectedVariant: { id: `variant-${Date.now()}`, price: "29.99" },
        });
    };

    // Product table rows for display
    const productTableRows = productFields.map((product, index) => [
        product.title || `Product ${product.productId}`,
        <Controller
            key={`quantity-${index}`}
            name={`products.${index}.quantity`}
            control={form.control}
            render={({ field, fieldState }) => (
                <TextField
                    label=""
                    type="number"
                    min={1}
                    max={99}
                    error={fieldState.error?.message}
                    {...field}
                    value={field.value.toString()}
                    onChange={(value) => {
                        const numValue = parseInt(value) || 1;
                        field.onChange(numValue);
                        updateProductQuantity(index, numValue);
                    }}
                    autoComplete="off"
                />
            )}
        />,
        product.price ? `$${product.price}` : "-",
        <Badge key={`badge-${index}`} tone={index === 0 ? "attention" : "info"}>
            {index === 0 ? "Main" : "Bundle"}
        </Badge>,
        <Button
            key={`remove-${index}`}
            icon={DeleteIcon}
            variant="tertiary"
            tone="critical"
            onClick={() => removeProductAt(index)}
            accessibilityLabel={`Remove ${product.title}`}
        />,
    ]);

    return (
        <>
            <Page
                title={bundleId ? "Edit Bundle" : "Create Bundle"}
                subtitle={isDirty ? "You have unsaved changes" : undefined}
                titleMetadata={
                    isDirty ? (
                        <Badge tone="warning">Unsaved changes</Badge>
                    ) : undefined
                }
                breadcrumbs={[{ content: "Bundles", url: "/bundles" }]}
                primaryAction={{
                    content: bundleId ? "Update Bundle" : "Create Bundle",
                    onAction: handleSubmit,
                    loading: isLoading,
                    disabled: !isValid,
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: handleExit,
                        disabled: isLoading,
                    },
                ]}
            >
                {/* Loading overlay */}
                {isLoading && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                        }}
                    >
                        <Card>
                            <div
                                style={{ padding: "40px", textAlign: "center" }}
                            >
                                <BlockStack gap="400" align="center">
                                    <Spinner size="large" />
                                    <Text variant="headingMd">
                                        {bundleId
                                            ? "Updating bundle..."
                                            : "Creating bundle..."}
                                    </Text>
                                </BlockStack>
                            </div>
                        </Card>
                    </div>
                )}

                <Layout>
                    {/* Error banner */}
                    {hasErrors && (
                        <Layout.Section>
                            <Banner
                                tone="critical"
                                title="Please fix the following errors:"
                            >
                                <BlockStack gap="200">
                                    {Object.entries(form.formState.errors).map(
                                        ([field, error]) => (
                                            <Text key={field} variant="bodyMd">
                                                • {error.message}
                                            </Text>
                                        ),
                                    )}
                                </BlockStack>
                            </Banner>
                        </Layout.Section>
                    )}

                    {/* SaveBar status */}
                    {isDirty && (
                        <Layout.Section>
                            <Banner tone="info">
                                <Text variant="bodyMd">
                                    <strong>SaveBar Active:</strong> Your
                                    changes are being tracked. Use the SaveBar
                                    at the bottom to save or discard changes.
                                </Text>
                            </Banner>
                        </Layout.Section>
                    )}

                    {/* Main form */}
                    <Layout.Section>
                        <Card>
                            <div style={{ padding: "20px" }}>
                                <form onSubmit={handleSubmit}>
                                    <FormLayout>
                                        {/* Bundle Name */}
                                        <Controller
                                            name="name"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <TextField
                                                    label="Bundle Name"
                                                    placeholder="Enter bundle name..."
                                                    error={
                                                        fieldState.error
                                                            ?.message
                                                    }
                                                    helpText="Choose a descriptive name for your bundle"
                                                    autoComplete="off"
                                                    {...field}
                                                />
                                            )}
                                        />

                                        {/* Description */}
                                        <Controller
                                            name="description"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <TextField
                                                    label="Description (Optional)"
                                                    multiline={3}
                                                    placeholder="Describe your bundle..."
                                                    error={
                                                        fieldState.error
                                                            ?.message
                                                    }
                                                    helpText="Help customers understand what's included"
                                                    autoComplete="off"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            )}
                                        />

                                        {/* Products Section */}
                                        <div>
                                            <BlockStack gap="400">
                                                <InlineStack
                                                    align="space-between"
                                                    blockAlign="center"
                                                >
                                                    <Text variant="headingMd">
                                                        Products ({productCount})
                                                    </Text>
                                                    <Button
                                                        onClick={handleAddProduct}
                                                    >
                                                        Add Products
                                                    </Button>
                                                </InlineStack>

                                                {getFieldError("products") && (
                                                    <Banner tone="critical">
                                                        <Text variant="bodyMd">
                                                            {getFieldError(
                                                                "products",
                                                            )}
                                                        </Text>
                                                    </Banner>
                                                )}

                                                {productFields.length === 0 ? (
                                                    <Card sectioned>
                                                        <BlockStack
                                                            gap="300"
                                                            align="center"
                                                        >
                                                            <Text
                                                                variant="headingMd"
                                                                tone="subdued"
                                                            >
                                                                No products selected
                                                            </Text>
                                                            <Text
                                                                variant="bodyMd"
                                                                tone="subdued"
                                                            >
                                                                Add products to
                                                                create your bundle
                                                            </Text>
                                                            <Button
                                                                variant="primary"
                                                                onClick={
                                                                    handleAddProduct
                                                                }
                                                            >
                                                                Add Products
                                                            </Button>
                                                        </BlockStack>
                                                    </Card>
                                                ) : (
                                                    <DataTable
                                                        columnContentTypes={[
                                                            "text",
                                                            "numeric",
                                                            "text",
                                                            "text",
                                                            "text",
                                                        ]}
                                                        headings={[
                                                            "Product",
                                                            "Quantity",
                                                            "Price",
                                                            "Type",
                                                            "Action",
                                                        ]}
                                                        rows={productTableRows}
                                                    />
                                                )}
                                            </BlockStack>
                                        </div>

                                        {/* Discount Configuration */}
                                        <FormLayout.Group>
                                            <Controller
                                                name="discountType"
                                                control={form.control}
                                                render={({
                                                             field,
                                                             fieldState,
                                                         }) => (
                                                    <Select
                                                        label="Discount Type"
                                                        options={DISCOUNT_TYPES}
                                                        error={
                                                            fieldState.error
                                                                ?.message
                                                        }
                                                        {...field}
                                                    />
                                                )}
                                            />

                                            {showDiscountValue && (
                                                <Controller
                                                    name="discountValue"
                                                    control={form.control}
                                                    render={({
                                                                 field,
                                                                 fieldState,
                                                             }) => (
                                                        <TextField
                                                            label={
                                                                isPercentageDiscount
                                                                    ? "Discount (%)"
                                                                    : "Discount Amount ($)"
                                                            }
                                                            type="number"
                                                            min="0"
                                                            max={
                                                                isPercentageDiscount
                                                                    ? "100"
                                                                    : undefined
                                                            }
                                                            prefix={
                                                                !isPercentageDiscount
                                                                    ? "$"
                                                                    : undefined
                                                            }
                                                            suffix={
                                                                isPercentageDiscount
                                                                    ? "%"
                                                                    : undefined
                                                            }
                                                            error={
                                                                fieldState.error
                                                                    ?.message
                                                            }
                                                            autoComplete="off"
                                                            {...field}
                                                            value={
                                                                field.value?.toString() ||
                                                                ""
                                                            }
                                                            onChange={(value) =>
                                                                field.onChange(
                                                                    parseFloat(
                                                                        value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                        />
                                                    )}
                                                />
                                            )}
                                        </FormLayout.Group>

                                        {/* Advanced Options */}
                                        <FormLayout.Group>
                                            <Controller
                                                name="minOrderValue"
                                                control={form.control}
                                                render={({
                                                             field,
                                                             fieldState,
                                                         }) => (
                                                    <TextField
                                                        label="Minimum Order Value (Optional)"
                                                        type="number"
                                                        min="0"
                                                        prefix="$"
                                                        error={
                                                            fieldState.error
                                                                ?.message
                                                        }
                                                        helpText="Minimum cart value required"
                                                        autoComplete="off"
                                                        {...field}
                                                        value={
                                                            field.value?.toString() ||
                                                            ""
                                                        }
                                                        onChange={(value) =>
                                                            field.onChange(
                                                                parseFloat(
                                                                    value,
                                                                ) || 0,
                                                            )
                                                        }
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="maxDiscountAmount"
                                                control={form.control}
                                                render={({
                                                             field,
                                                             fieldState,
                                                         }) => (
                                                    <TextField
                                                        label="Maximum Discount (Optional)"
                                                        type="number"
                                                        min="0"
                                                        prefix="$"
                                                        error={
                                                            fieldState.error
                                                                ?.message
                                                        }
                                                        helpText="Cap the maximum discount"
                                                        autoComplete="off"
                                                        {...field}
                                                        value={
                                                            field.value?.toString() ||
                                                            ""
                                                        }
                                                        onChange={(value) =>
                                                            field.onChange(
                                                                parseFloat(
                                                                    value,
                                                                ) || 0,
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                        </FormLayout.Group>

                                        {/* Bundle Status */}
                                        <Controller
                                            name="status"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Select
                                                    label="Bundle Status"
                                                    options={[
                                                        {
                                                            label: "Draft",
                                                            value: "DRAFT",
                                                        },
                                                        {
                                                            label: "Active",
                                                            value: "ACTIVE",
                                                        },
                                                        {
                                                            label: "Paused",
                                                            value: "PAUSED",
                                                        },
                                                        {
                                                            label: "Scheduled",
                                                            value: "SCHEDULED",
                                                        },
                                                    ]}
                                                    error={
                                                        fieldState.error
                                                            ?.message
                                                    }
                                                    helpText="Choose the initial status for your bundle"
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </FormLayout>
                                </form>
                            </div>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>

            {/* Exit confirmation modal */}
            <Modal
                open={showExitModal}
                onClose={() => setShowExitModal(false)}
                title="Unsaved Changes"
                primaryAction={{
                    content: "Leave Without Saving",
                    onAction: confirmExit,
                    destructive: true,
                }}
                secondaryActions={[
                    {
                        content: "Continue Editing",
                        onAction: () => setShowExitModal(false),
                    },
                ]}
            >
                <Modal.Section>
                    <Text variant="bodyMd">
                        You have unsaved changes. Are you sure you want to
                        leave? Your changes will be lost.
                    </Text>
                </Modal.Section>
            </Modal>
        </>
    );
}