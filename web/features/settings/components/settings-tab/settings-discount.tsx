"use client";
import React, { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export function SettingsDiscount() {
    const [title, setTitle] = useState<string>("");

    const handleChange = (event: CallbackEvent<"s-text-field">) => {
        const { name, value } = event.target as HTMLInputElement;
        if (name === "title") {
            const newValue = value.slice(0, 60);
            setTitle(newValue);
        }
    };

    const handleChoiceChange = (event: CallbackEvent<"s-choice-list">) => {
        console.log('Values: ', event.currentTarget.values)
    };

    return (
        <s-section heading="Discount">
            <s-stack gap="base">
                <s-paragraph>
                    Settings related to the discounts applied by the app.
                </s-paragraph>
                <s-checkbox
                    label="Disable discount"
                    details="Enabling this option will display the bundle interface but not apply any discounts. Note: This option disables completely the discount functionality."
                />
                <s-checkbox
                    label="Track orders without discount"
                    details="By default, the app tracks only orders with discounts. Enabling this allows the app to track any order containing bundles."
                />

                <s-stack gap="small-400">
                    <s-select label="Discount type" name="discountType">
                        <s-option value="discount_code">Discount Code</s-option>
                        <s-option value="draft_order">Draft Order</s-option>
                        <s-option value="shopify_functions_v1">
                            Shopify Functions
                        </s-option>
                        <s-option value="shopify_functions_v2">
                            Shopify Functions V2
                        </s-option>
                    </s-select>

                    <s-paragraph>
                        To learn more about discount types, please read this
                        article.
                    </s-paragraph>
                </s-stack>
                <s-choice-list
                    label="Discount combinations"
                    name="discounts_combinations"
                    multiple
                    onChange={handleChoiceChange}
                >
                    <s-choice value="new-order" selected>
                        New order notifications
                    </s-choice>
                    <s-choice value="low-stock">Low stock alerts</s-choice>
                    <s-choice value="customer-review">
                        Customer review notifications
                    </s-choice>
                    <s-choice value="shipping-updates">
                        Shipping updates
                    </s-choice>
                </s-choice-list>

                <s-stack gap="small-400">
                    <s-text-field
                        label="Discount title"
                        name="title"
                        placeholder="Bundle Discount"
                        value={title}
                        onChange={handleChange}
                        maxLength={60}
                    />
                    <s-text>
                        Customers will see this in their cart and at checkout.
                    </s-text>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
