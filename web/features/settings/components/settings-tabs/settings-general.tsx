"use client";

import { useSettingsField } from "@/features/settings";
import { DISCOUNT_TYPES } from "@/features/bundles";

/**
 * General settings component
 *
 * Handles core app behavior including defaults, cart behavior, discount, and localization.
 * Integrates with React Hook Form via useSettingsField hook.
 */
export function SettingsGeneral() {
    // Defaults Section
    const defaultDiscountType = useSettingsField({
        name: "defaultDiscountType",
    });
    const defaultDiscountValue = useSettingsField({
        name: "defaultDiscountValue",
    });
    const maxBundleProducts = useSettingsField({ name: "maxBundleProducts" });
    const maxBundlesPerShop = useSettingsField({ name: "maxBundlesPerShop" });

    // Cart Behavior Section
    const redirectAfterCart = useSettingsField({ name: "redirectAfterCart" });
    const hidePaymentButtons = useSettingsField({ name: "hidePaymentButtons" });
    const enableStockValidation = useSettingsField({
        name: "enableStockValidation",
    });

    // Discount Section
    const discountTitle = useSettingsField({ name: "discountTitle" });
    const trackOrdersWithoutDiscount = useSettingsField({
        name: "trackOrdersWithoutDiscount",
    });

    // Localization Section
    const currencyDisplay = useSettingsField({ name: "currencyDisplay" });
    const disableCartLocale = useSettingsField({ name: "disableCartLocale" });

    return (
        <s-stack gap="large">
            {/* Defaults Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Defaults</s-heading>
                        <s-tooltip id="defaults-tooltip">
                            <s-text>
                                Default values applied when creating new
                                bundles.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="defaults-tooltip"
                        />
                    </s-stack>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <s-select
                            label="Default discount type"
                            name="defaultDiscountType"
                            value={defaultDiscountType.value}
                            onChange={defaultDiscountType.onShopifyChange}
                            details="Applied to new bundles by default"
                            error={defaultDiscountType.error}
                        >
                            {Object.values(DISCOUNT_TYPES).map((discount) => (
                                <s-option key={discount.id} value={discount.id}>
                                    {discount.label}
                                </s-option>
                            ))}
                        </s-select>

                        <s-number-field
                            label="Default discount value"
                            name="defaultDiscountValue"
                            min={0}
                            max={100}
                            value={defaultDiscountValue.value}
                            onChange={defaultDiscountValue.onShopifyChange}
                            details="Default percentage or fixed amount"
                            error={defaultDiscountValue.error}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <s-number-field
                            label="Max products per bundle"
                            name="maxBundleProducts"
                            min={2}
                            max={50}
                            value={maxBundleProducts.value}
                            onChange={maxBundleProducts.onShopifyChange}
                            details="Maximum products allowed in a single bundle"
                            error={maxBundleProducts.error}
                        />

                        <s-number-field
                            label="Max bundles per shop"
                            name="maxBundlesPerShop"
                            readOnly={true}
                            min={1}
                            max={500}
                            value={maxBundlesPerShop.value}
                            details="Total bundles limit (based on your plan)"
                        />
                    </div>
                </s-stack>
            </s-section>

            {/* Cart Behavior Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Cart Behavior</s-heading>
                        <s-tooltip id="cart-behavior-tooltip">
                            <s-text>
                                Control how the app interacts with the cart and
                                checkout.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="cart-behavior-tooltip"
                        />
                    </s-stack>

                    <s-select
                        label="Redirect after add to cart"
                        name="redirectAfterCart"
                        value={redirectAfterCart.value}
                        onChange={redirectAfterCart.onShopifyChange}
                        details="Where customers go after adding a bundle to cart"
                        error={redirectAfterCart.error}
                    >
                        <s-option value="cart">Cart page</s-option>
                        <s-option value="checkout">Checkout</s-option>
                        <s-option value="none">
                            Stay on page (no redirect)
                        </s-option>
                        <s-option value="drawer">Open cart drawer</s-option>
                    </s-select>

                    <s-stack gap="base">
                        <s-switch
                            name="hidePaymentButtons"
                            label="Hide third-party payment buttons"
                            details="Hides PayPal, Apple Pay, etc. in cart since bundle discounts only apply through standard checkout."
                            checked={hidePaymentButtons.value}
                            onChange={hidePaymentButtons.onShopifyChange}
                        />

                        <s-switch
                            name="enableStockValidation"
                            label="Enable stock validation"
                            details="Disables the bundle button when any product in the bundle is out of stock."
                            checked={enableStockValidation.value}
                            onChange={enableStockValidation.onShopifyChange}
                        />
                    </s-stack>
                </s-stack>
            </s-section>

            {/* Discount Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Discount</s-heading>
                        <s-tooltip id="discount-tooltip">
                            <s-text>
                                Configure how discounts are displayed and
                                tracked.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="discount-tooltip"
                        />
                    </s-stack>

                    <s-text-field
                        label="Discount title"
                        name="discountTitle"
                        placeholder="Bundle Discount"
                        value={discountTitle.value}
                        onChange={discountTitle.onShopifyChange}
                        details="Customers will see this in their cart and at checkout."
                        maxLength={60}
                        error={discountTitle.error}
                    />

                    <s-switch
                        name="trackOrdersWithoutDiscount"
                        label="Track orders without discount"
                        details="By default, only orders with discounts are tracked. Enable this to track any order containing bundle products."
                        checked={trackOrdersWithoutDiscount.value}
                        onChange={trackOrdersWithoutDiscount.onShopifyChange}
                    />
                </s-stack>
            </s-section>

            {/* Localization Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Localization</s-heading>
                        <s-tooltip id="localization-tooltip">
                            <s-text>
                                Settings for multi-currency and multi-language
                                stores.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="localization-tooltip"
                        />
                    </s-stack>

                    <s-select
                        label="Currency display"
                        name="currencyDisplay"
                        value={currencyDisplay.value}
                        onChange={currencyDisplay.onShopifyChange}
                        details="How prices are displayed in the bundle widget"
                        error={currencyDisplay.error}
                    >
                        <s-option value="store">Use store default</s-option>
                        <s-option value="code">
                            Always show currency code (e.g., USD)
                        </s-option>
                        <s-option value="symbol">
                            Always show symbol (e.g., $)
                        </s-option>
                    </s-select>

                    <s-switch
                        name="disableCartLocale"
                        label="Disable cart locale redirect"
                        details="Prevents redirect to localized cart URLs (e.g., /fr/cart). Enable this if you have issues with multi-language stores."
                        checked={disableCartLocale.value}
                        onChange={disableCartLocale.onShopifyChange}
                    />
                </s-stack>
            </s-section>
        </s-stack>
    );
}
