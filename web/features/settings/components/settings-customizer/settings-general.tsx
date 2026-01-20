"use client";

import { DISCOUNT_TYPES } from "@/features/bundles";

/**
 * General settings component
 *
 * Handles core app behavior including defaults, cart behavior, and localization.
 */
export function SettingsGeneral() {
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
                            details="Applied to new bundles by default"
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
                            value="10"
                            details="Default percentage or fixed amount"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <s-number-field
                            label="Max products per bundle"
                            name="maxBundleProducts"
                            placeholder="10"
                            min={2}
                            max={50}
                            details="Maximum products allowed in a single bundle"
                        />

                        <s-number-field
                            label="Max bundles per shop"
                            name="maxBundlesPerShop"
                            readOnly={true}
                            min={1}
                            max={500}
                            value={"5"}
                            details="Total bundles limit (based on plan)"
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
                        details="Where customers go after adding a bundle to cart"
                    >
                        <s-option value="cart">Cart page</s-option>
                        <s-option value="checkout">Checkout</s-option>
                        <s-option value="none">
                            Stay on page (no redirect)
                        </s-option>
                        <s-option value="drawer">Open cart drawer</s-option>
                    </s-select>

                    <s-stack gap="base">
                        {/* Hide Payment Buttons */}
                        <s-switch
                            name="hidePaymentButtons"
                            label="Hide third-party payment buttons"
                            details="Hides PayPal, Apple Pay, etc. in cart since
                                    bundle discounts only apply through standard
                                    checkout."
                        />

                        {/* Enable Stock Validation */}
                        <s-switch
                            name="enableStockValidation"
                            label="Enable stock validation"
                            details="Disables the bundle button when any product
                                    in the bundle is out of stock."
                            defaultChecked
                        />
                    </s-stack>
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
                        details="How prices are displayed in the bundle widget"
                    >
                        <s-option value="store">Use store default</s-option>
                        <s-option value="code">
                            Always show currency code (e.g., USD)
                        </s-option>
                        <s-option value="symbol">
                            Always show symbol (e.g., $)
                        </s-option>
                    </s-select>

                    {/* Disable Cart Locale */}
                    <s-switch
                        name="disableCartLocale"
                        label="Disable cart locale redirect"
                        details="Prevents redirect to localized cart URLs (e.g.,
                                /fr/cart). Enable this if you have issues with
                                multi-language stores."
                    />
                </s-stack>
            </s-section>
        </s-stack>
    );
}
