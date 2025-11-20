"use client";

export function SettingsGeneral() {
    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    <div className="text-lg">General</div>
                </s-heading>
                <s-divider />
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

                <s-choice-list label="This page is where customers are redirected after adding bundle products to the cart." name="checkout" multiple>
                    <s-choice value="disable-payments">
                        Disable hide payments buttons
                        <s-text slot="details">
                            The app normally hides third-party payment buttons (Paypal, Amazon, Google Play) in the cart, as discounts only apply through the standard checkout button.
                        </s-text>
                    </s-choice>
                    <s-choice value="disable-bundle">
                        Enable stock control
                        <s-text slot="details">
                            Disables the bundle button if there is no stock for bundle product.
                        </s-text>
                    </s-choice>
                    <s-choice value="disable-cart">
                        Disable Cart Locale
                        <s-text slot="details">
                            Disables the redirect to cart page that includes the locale in the url. Example: store.com/fr/cart.
                        </s-text>
                    </s-choice>
                    <s-choice value="work-widget">
                        Work only with Widget
                        <s-text slot="details">
                            By default our app will work anytime a Bundle matches the visitor's cart, using this option the Bundle will match just if the Bundle was added using the Bundle Widget.
                        </s-text>
                    </s-choice>
                </s-choice-list>

            </s-stack>
        </s-section>
    );
}
