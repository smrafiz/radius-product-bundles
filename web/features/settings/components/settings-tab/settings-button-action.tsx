"use client";

import { CallbackEvent } from "@shopify/polaris-types";

export function SettingsButtonAction() {

    const handleChange = (event: CallbackEvent<"s-choice-list">) => {
        console.log('Values: ', event.currentTarget.values)
    }

    return (
        <s-section heading="Button Action">
            <s-paragraph>Manage what page the customer is taken to after clicking the bundle button.</s-paragraph>

            <s-choice-list
                name="button_action"
                onChange={handleChange}
                details="Please contact support in order to activate this option."
            >
                <s-choice value="cart" selected>Cart</s-choice>
                <s-choice value="checkout">Checkout</s-choice>
                <s-choice value="cart_drawer">Cart drawer (mini cart)</s-choice>
            </s-choice-list>
        </s-section>
    );
}
