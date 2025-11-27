"use client";

import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export function SettingsAdvanced() {
    const handleChange = (event: CallbackEvent<"s-text-field">) => {};
    const [textValue, setTextValue] = useState<string>("");

    const MAX_LENGTH = 9999;

    const handleChangeArea = (event: CallbackEvent<"s-text-area">) => {
        const { name, value } = event.target as HTMLInputElement;
        if (name === "title") {
            const newValue = value.slice(0, MAX_LENGTH);
            setTextValue(newValue);
        }
    };

    return (
        <s-section>
            <s-stack gap="large">
                <s-heading>
                    <div className="text-lg">Advanced</div>
                </s-heading>
                <s-divider />
                <s-stack gap="small-400">
                    <s-text-field
                        label="Free shipping method title"
                        value=""
                        onChange={handleChange}
                        details="The title for the free shipping method will be used when
                        applying the free shipping discount with Shopify draft
                        orders. If left blank, the bundle name will be used
                        instead."
                    />
                </s-stack>

                <s-stack gap="small-400">
                    <s-text-field
                        label="Currency format"
                        name="currency-format"
                        onChange={handleChange}
                    />
                    <div className="text-[12px] text-[#616161]">
                        {
                            "Leave blank to use the default format. {{ amount }}, {{ amount_no_decimals }}, and {{ amount_with_comma_separator }} will be replaced with the price of your product, while {{ currency_symbol }} will be replaced with the currency symbol. You can use the same formatting as in Shopify stores. "
                        }
                        <s-link
                            target="_blank"
                            tone="neutral"
                            href="https://help.shopify.com/en/manual/international/pricing/currency-formatting"
                        >
                            Read More
                        </s-link>
                    </div>
                </s-stack>

                <s-stack gap="small-400">
                    <s-text-area
                        label="Custom CSS"
                        value={textValue}
                        rows={2}
                        onChange={handleChangeArea}
                        maxLength={MAX_LENGTH}
                    />
                    <s-text>
                        Only use this if you have a good knowledge of CSS.
                    </s-text>
                </s-stack>

                <s-choice-list labelAccessibilityVisibility="exclusive" label="Redirect dynamic" name="redirectdynamic" multiple>
                    <s-choice value="redirect-dynamic-checkout">
                        Redirect dynamic checkout buttons on product page to the
                        checkout
                        <s-text slot="details">
                            By default, Bundler can't apply the discount if the
                            customer uses the wallet buttons (e.g. PayPal
                            Express, ShopPay, etc.). Turning this on will allow
                            Bundler to apply discounts, but will redirect the
                            customer to the standard Shopify Checkout.
                        </s-text>
                    </s-choice>
                    <s-choice value="hide-dynamic-checkout">
                        Hide dynamic checkout buttons in cart
                        <s-text slot="details">
                            If your customers check out using the dynamic
                            checkout buttons on the cart page, then the bundle
                            discounts won't get applied. You can turn this
                            option on and Bundler will hide these buttons on the
                            cart page when the customer qualifies for the bundle
                            discount.
                        </s-text>
                    </s-choice>
                </s-choice-list>
            </s-stack>
        </s-section>
    );
}
