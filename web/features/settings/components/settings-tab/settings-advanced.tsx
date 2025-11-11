"use client";

import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export function SettingsAdvanced() {
    const handleChange = (event: CallbackEvent<"s-text-field">) => {};
    const [title, setTitle] = useState<string>("");

    const handleChangeArea = (event: CallbackEvent<"s-text-area">) => {
        const { name, value } = event.target as HTMLInputElement;
        if (name === "title") {
            const newValue = value.slice(0, 999);
            setTitle(newValue);
        }
    };
    return (
        <s-section>
            <s-stack gap="large">
                <s-heading>
                    <div style={{ fontSize: "18px" }}>Advanced</div>
                </s-heading>
                <s-divider />
                <s-stack gap="small-400">
                    <s-text-field
                        label="Free shipping method title"
                        value=""
                        placeholder=""
                        onChange={handleChange}
                    />
                    <s-paragraph>
                        The title for the free shipping method will be used when
                        applying the free shipping discount with Shopify draft
                        orders. If left blank, the bundle name will be used
                        instead.
                    </s-paragraph>
                </s-stack>

                <s-stack gap="small-400">
                    <s-text-field
                        label="Currency format"
                        name="Currency format"
                        placeholder=""
                        onChange={handleChange}
                    />
                    <s-paragraph>
                        {
                            "Leave blank to use the default format. {{ amount }}, {{ amount_no_decimals }}, and {{ amount_with_comma_separator }} will be replaced with the price of your product, while {{ currency_symbol }} will be replaced with the currency symbol. You can use the same formatting as in Shopify stores."
                        }<s-link target="_blank" href="https://help.shopify.com/en/manual/international/pricing/currency-formatting">Read More</s-link>
                    </s-paragraph>
                </s-stack>

                <s-stack gap="small-400">
                    <s-text-area
                        label="Custom CSS"
                        value={title}
                        rows={2}
                        onChange={handleChangeArea}
                        maxLength={999}
                    />
                    <s-text>
                        Only use this if you have a good knowledge of CSS.
                    </s-text>
                </s-stack>

                <s-checkbox
                    label="Redirect dynamic checkout buttons on product page to the checkout"
                    details="By default, Bundler can't apply the discount if the customer uses the wallet buttons (e.g. PayPal Express, ShopPay, etc.). Turning this on will allow Bundler to apply discounts, but will redirect the customer to the standard Shopify Checkout."
                />
                <s-checkbox
                    label="Hide dynamic checkout buttons in cart"
                    details="If your customers check out using the dynamic checkout buttons on the cart page, then the bundle discounts won't get applied. You can turn this option on and Bundler will hide these buttons on the cart page when the customer qualifies for the bundle discount."
                />

            </s-stack>
        </s-section>
    );
}
