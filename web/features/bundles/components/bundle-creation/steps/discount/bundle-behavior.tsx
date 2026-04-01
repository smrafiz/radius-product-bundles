"use client";

import { useBundleBehavior } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";
import { ProBadge, useCrossSellStore, usePlan } from "@/shared";

export function BundleBehavior() {
    const t = useTranslations("Bundles.Creation.Discount");
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
    const { canUse } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const canBundleBehavior = canUse("bundle_behavior");

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>{t("behaviorHeading")}</s-heading>
                <s-tooltip id="bundle-behavior-tooltip">
                    <s-text>{t("behaviorTooltip")}</s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="bundle-behavior-tooltip"
                />
            </s-stack>

            {canBundleBehavior ? (
                <s-stack gap="base">
                    {/* Discount Application */}
                    <s-stack gap="small-200">
                        <s-choice-list
                            name="discountApplication"
                            label={t("application")}
                            labelAccessibilityVisibility="exclusive"
                            disabled={isDiscountDisabled}
                            onChange={(e: Event) => {
                                const target =
                                    e.currentTarget as HTMLInputElement & {
                                        values: string[];
                                    };
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
                                {t("applyEntire")}
                            </s-choice>
                            <s-choice
                                value="products"
                                selected={discountApplication === "products"}
                            >
                                {t("applySpecific")}
                            </s-choice>
                        </s-choice-list>

                        {discountApplication === "products" &&
                            !isDiscountDisabled && (
                                <s-stack
                                    direction="inline"
                                    alignItems="center"
                                    gap="small-200"
                                >
                                    {discountedProductIds.size > 0 && (
                                        <s-text color="subdued">
                                            {getSummary()}
                                        </s-text>
                                    )}
                                    <s-button
                                        variant="secondary"
                                        commandFor="discount-products-modal"
                                        command="--show"
                                        onClick={handleOpenModal}
                                    >
                                        {discountedProductIds.size > 0
                                            ? t("editSelection")
                                            : t("selectForDiscount")}
                                    </s-button>
                                </s-stack>
                            )}
                    </s-stack>

                    <s-divider />

                    {/* Free Shipping */}
                    <s-switch
                        name="freeShipping"
                        label={t("freeShipping")}
                        details={t("freeShippingDetails")}
                        checked={freeShipping}
                        onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            handleFreeShippingChange(target.checked);
                        }}
                    />

                    {/* Product Selection Modal */}
                    <s-modal
                        id="discount-products-modal"
                        heading={t("selectForDiscount")}
                        accessibilityLabel={t("selectForDiscount")}
                        onHide={handleModalHide}
                    >
                        <s-stack gap="base">
                            <s-text color="subdued">
                                {t("chooseProducts")}
                            </s-text>

                            <s-checkbox
                                checked={
                                    selectedProducts.size ===
                                        uniqueProducts.length &&
                                    uniqueProducts.length > 0
                                }
                                onChange={toggleAll}
                                label={`Select all (${selectedProducts.size} selected)`}
                            />

                            {uniqueProducts.length > 0 ? (
                                <s-stack gap="small-200">
                                    {uniqueProducts.map((product) => {
                                        const isSelected =
                                            selectedProducts.has(
                                                product.productId,
                                            );

                                        return (
                                            <div
                                                key={product.productId}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    toggleProduct(
                                                        product.productId,
                                                    )
                                                }
                                            >
                                                <div
                                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                        isSelected
                                                            ? "border-[#005bd3] bg-[#f1f1f1]"
                                                            : "border-[#e3e3e3] hover:bg-[#f1f1f1]"
                                                    }`}
                                                >
                                                    <s-checkbox
                                                        checked={isSelected}
                                                        onInput={(e: Event) =>
                                                            e.stopPropagation()
                                                        }
                                                    />

                                                    {product.image ? (
                                                        <div className="w-12 h-12 rounded-md border overflow-hidden flex-shrink-0 border-[#e3e3e3]">
                                                            <s-image
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.title
                                                                }
                                                                aspectRatio="1/1"
                                                                inlineSize="fill"
                                                                objectFit="cover"
                                                                borderRadius="small"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-[#ffffff] border border-[#e3e3e3] rounded-md flex items-center justify-center overflow-hidden">
                                                            <s-icon
                                                                type="image"
                                                                tone="neutral"
                                                            />
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
                                    {t("noProductsYet")}
                                </s-text>
                            )}
                        </s-stack>

                        <s-button
                            slot="secondary-actions"
                            commandFor="discount-products-modal"
                            command="--hide"
                        >
                            {t("cancel")}
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
            ) : (
                <div
                    className="cursor-pointer"
                    onClick={() => openCrossSell(t("behaviorHeading"))}
                >
                    <s-stack gap="base">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <div className="pointer-events-none">
                                <s-choice-list
                                    name="discountApplication-locked"
                                    label={t("application")}
                                    labelAccessibilityVisibility="exclusive"
                                    disabled
                                >
                                    <s-choice
                                        value="bundle"
                                        selected
                                        disabled
                                    >
                                        {t("applyEntire")}
                                    </s-choice>
                                    <s-choice value="products" disabled>
                                        {t("applySpecific")}
                                    </s-choice>
                                </s-choice-list>
                            </div>
                            <ProBadge label={t("behaviorHeading")} />
                        </s-stack>

                        <s-divider />

                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <div className="pointer-events-none">
                                <s-switch
                                    name="freeShipping-locked"
                                    label={t("freeShipping")}
                                    details={t("freeShippingDetails")}
                                    disabled
                                />
                            </div>
                            <ProBadge label={t("freeShipping")} />
                        </s-stack>
                    </s-stack>
                </div>
            )}
        </s-stack>
    );
}
