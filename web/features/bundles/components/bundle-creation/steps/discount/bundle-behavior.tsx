"use client";

import { useBundleBehavior } from "@/features/bundles";

/**
 * Bundle behavior configuration component
 */
export function BundleBehavior() {
    const {
        discountApplication,
        discountedProductIds,
        freeShipping,
        selectedProducts,
        uniqueProducts,
        isDiscountDisabled,
        toggleProduct,
        toggleAll,
        handleConfirm,
        handleModalHide,
        handleRadioChange,
        handleFreeShippingChange,
        handleOpenModal,
        getSummary,
    } = useBundleBehavior();

    return (
        <s-stack gap="base">
            <s-heading>Bundle Behavior</s-heading>

            {/* Discount Application */}
            <s-stack gap="small-200">
                <s-choice-list
                    name="discountApplication"
                    label="Discount Application"
                    labelAccessibilityVisibility="exclusive"
                    disabled={isDiscountDisabled}
                    onChange={(e: Event) => {
                        const target = e.currentTarget as HTMLInputElement & { values: string[] };
                        const value = target.values?.[0];
                        if (value) {
                            handleRadioChange(value);
                        }
                    }}
                >
                    <s-choice
                        value="bundle"
                        selected={discountApplication === "bundle"}
                    >
                        Apply discount to entire bundle
                    </s-choice>
                    <s-choice
                        value="products"
                        selected={discountApplication === "products"}
                    >
                        Apply discount to specific products only
                    </s-choice>
                </s-choice-list>

                {/* Product selection button - only when "Specific products" is selected */}
                {discountApplication === "products" && !isDiscountDisabled && (
                    <s-stack direction="inline" alignItems="center" gap="small-200">
                        {discountedProductIds.size > 0 && (
                            <s-text color="subdued">{getSummary()}</s-text>
                        )}
                        <s-button
                            variant="secondary"
                            commandFor="discount-products-modal"
                            command="--show"
                            onClick={handleOpenModal}
                        >
                            {discountedProductIds.size > 0 ? "Edit selection" : "Select products"}
                        </s-button>
                    </s-stack>
                )}
            </s-stack>

            <s-divider />

            {/* Free Shipping */}
            <s-switch
                name="freeShipping"
                label="Include free shipping"
                details="Offer free shipping when this bundle is purchased."
                checked={freeShipping}
                onInput={(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    handleFreeShippingChange(target.checked);
                }}
            />

            {/* Product Selection Modal */}
            <s-modal
                id="discount-products-modal"
                heading="Select products for discount"
                onHide={handleModalHide}
            >
                <s-stack gap="base">
                    <s-text color="subdued">
                        Choose which products should receive the discount.
                    </s-text>

                    {/* Select All */}
                    <s-checkbox
                        checked={
                            selectedProducts.size === uniqueProducts.length &&
                            uniqueProducts.length > 0
                        }
                        onChange={toggleAll}
                        label={`Select all (${selectedProducts.size} selected)`}
                    />

                    {/* Product List */}
                    {uniqueProducts.length > 0 ? (
                        <s-stack gap="small-200">
                            {uniqueProducts.map((product) => {
                                const isSelected = selectedProducts.has(product.productId);

                                return (
                                    <div
                                        key={product.productId}
                                        className="cursor-pointer"
                                        onClick={() => toggleProduct(product.productId)}
                                    >
                                        <div
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                isSelected
                                                    ? "border-[var(--p-color-border-focus)] bg-[var(--p-color-bg-surface-secondary)]"
                                                    : "border-[var(--p-color-border)] hover:bg-[var(--p-color-bg-surface-hover)]"
                                            }`}
                                        >
                                            <s-checkbox
                                                checked={isSelected}
                                                onInput={(e: Event) => e.stopPropagation()}
                                            />

                                            {product.image ? (
                                                <div className="w-12 h-12 rounded-lg border overflow-hidden flex-shrink-0 border-[var(--p-color-border)]">
                                                    <s-image
                                                        src={product.image}
                                                        alt={product.title}
                                                        aspectRatio="1/1"
                                                        inlineSize="fill"
                                                        objectFit="cover"
                                                        borderRadius="small"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-[var(--p-color-bg-surface)] border border-[var(--p-color-border)] rounded-[var(--p-border-radius-150)] flex items-center justify-center overflow-hidden">
                                                    <s-icon type="image" tone="neutral" />
                                                </div>
                                            )}

                                            <s-stack gap="none">
                                                <s-text type="strong">
                                                    {product.title}
                                                </s-text>
                                            </s-stack>
                                        </div>
                                    </div>
                                );
                            })}
                        </s-stack>
                    ) : (
                        <s-text color="subdued">
                            No products in bundle. Add products first.
                        </s-text>
                    )}
                </s-stack>

                <s-button
                    slot="secondary-actions"
                    commandFor="discount-products-modal"
                    command="--hide"
                >
                    Cancel
                </s-button>

                <s-button
                    slot="primary-action"
                    variant="primary"
                    onClick={handleConfirm}
                    commandFor="discount-products-modal"
                    command="--hide"
                    disabled={selectedProducts.size === 0}
                >
                    Select ({selectedProducts.size})
                </s-button>
            </s-modal>
        </s-stack>
    );
}