"use client";

export function SettingsGeneral() {

    return (
        <s-section heading="General">
            <s-stack gap="base">
                <s-paragraph>
                    Configure the general behavior of the app, including
                    discount settings, redirects, and more.
                </s-paragraph>
                <s-select label="Redirect page">
                    <s-option value="1">Cart Page</s-option>
                    <s-option value="2">Checkout</s-option>
                    <s-option value="3">
                        No redirect / Open cart drawer
                    </s-option>
                </s-select>
                <s-paragraph>
                    This page is where customers are redirected after adding
                    bundle products to the cart.
                </s-paragraph>
                <s-checkbox
                    label="Disable hide payments buttons"
                    details="The app normally hides third-party payment buttons (Paypal, Amazon, Google Play) in the cart, as discounts only apply through the standard checkout button."
                />
                <s-checkbox
                    label="Enable stock control"
                    details="Disables the bundle button if there is no stock for bundle product."
                />
                <s-checkbox
                    label="Disable Cart Locale"
                    details="Disables the redirect to cart page that includes the locale in the url. Example: store.com/fr/cart."
                />
                <s-checkbox
                    label="Work only with Widget"
                    details="By default our app will work anytime a Bundle matches the visitor's cart, using this option the Bundle will match just if the Bundle was added using the Bundle Widget."
                />
            </s-stack>
        </s-section>
    );
}
