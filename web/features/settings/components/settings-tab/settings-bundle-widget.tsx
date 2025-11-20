"use client";

export function SettingsBundleWidget() {
    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    <div className="text-lg">
                        Bundle Widget Settings
                    </div>
                </s-heading>
                <s-divider />

                <s-choice-list label="DISPLAY" name="display" multiple>
                    <s-choice value="show-bundle" selected>
                        Show bundles on product pages
                        <s-text slot="details">
                            Uncheck if you don't want to show bundle widget on product pages automatically.
                        </s-text>
                    </s-choice>
                    <s-choice value="show-multiple-bundle">
                        Show multiple bundles on product pages (won't affect volume discounts)
                        <s-text slot="details">
                            Check if you want to display all bundles relevant to the current product on product pages.
                        </s-text>
                    </s-choice>
                </s-choice-list>

                <s-divider />

                <s-select
                    label="Redirect users after they add products to the cart"
                    details="Set where you want to redirect users when they add bundled products to the cart via add to cart button in bundle widget."
                >
                    <s-option value="checkout">
                        To checkout (recommended)
                    </s-option>
                    <s-option value="cart">To Cart</s-option>
                    <s-option value="stay">Don't redirect</s-option>
                </s-select>

                <s-divider />

                <s-choice-list label="PRICE" name="price" multiple>
                    <s-choice value="show-price" selected>
                        Show products prices
                    </s-choice>
                    <s-choice value="use-compare-price">
                        Use compare at price as base price in bundle widget
                        <s-text slot="details">
                            Compare at price can only be used for display purposes in bundle widget. It won't be used when calculating the actual discount at checkout.
                        </s-text>
                    </s-choice>
                    <s-choice value="show-unit-price">
                        Show unit price
                        <s-text slot="details">
                            Unit price will be displayed for products which have the unit price configured. Unit prices are available only for Shopify stores from France or Germany.
                        </s-text>
                    </s-choice>
                </s-choice-list>

                <s-divider />

                <s-choice-list label="LINKS" name="links" multiple>
                    <s-choice value="open-links" selected>
                        Open links in new tabs
                    </s-choice>
                    <s-choice value="enable-product-links">
                        Enable product links in bundle widgets
                        <s-text slot="details">
                            Uncheck if you don't want to have links in the widgets which lead to the individual product pages.
                        </s-text>
                    </s-choice>
                </s-choice-list>

                <s-divider />

                <s-choice-list label="WIDGET DISPLAY" name="widget-display" multiple>
                    <s-choice value="animate-cart-button" selected>
                        Animate add to cart button
                        <s-text slot="details">
                            Add to cart button in widgets will bounce to attract attention.
                        </s-text>
                    </s-choice>
                    <s-choice value="product-out-stock">
                        Show if product is out of stock and hide unavailable variants in dropdowns
                    </s-choice>
                    <s-choice value="disable-cart-button" selected>
                        Disable add to cart button on bundles with 1 or more unavailable products
                        <s-text slot="details">
                            Add to cart button will be disabled if one or more products in the bundle are unavailable for purchase.
                        </s-text>
                    </s-choice>
                </s-choice-list>

                <s-text-field
                    label="Out of stock text on add to cart button"
                    value="Out of stock"
                    placeholder="Out of stock"
                    details="This text will be displayed on add to cart button if one or more products are unavailable."
                />

                <s-divider />

                <s-choice-list label="QUANTITY FIELD" name="quantity-field" multiple>
                    <s-choice value="animate-cart-button" selected>
                        Show quantity field before add to cart button
                        <s-text slot="details">
                            Turn this on if you want to show the quantity input field before the add to cart button in the bundle widgets.
                        </s-text>
                    </s-choice>
                </s-choice-list>

                <s-text-field
                    label="Quantity field label"
                    value="Quantity"
                    placeholder="Quantity"
                    details="This text will be displayed on the quantity input field next to the add to cart button. Leave empty if you don't want to display the label."
                />
                <s-checkbox
                    checked
                    label="Show bundles with unpublished products"
                    details="Turn this on to show the bundle widgets even if some products in the bundle are not published in your shop."
                />

                <s-divider />

                <s-choice-list label="STYLE OPTIONS" name="style-options" multiple>
                    <s-choice value="use-retina-image">
                        Use retina images
                        <s-text slot="details">
                            Product images will be served in higher resolution, suitable for retina displays, but your Google Pagespeed score might get downgraded for that.
                        </s-text>
                    </s-choice>
                    <s-choice value="product-box-size" selected>
                        Make product boxes same size
                        <s-text slot="details">
                            The height of product boxes in the row will be the same.
                        </s-text>
                    </s-choice>
                    <s-choice value="align-image" selected>
                        Align images at the top of the product card
                    </s-choice>
                    <s-choice value="list-product-name" selected>
                        List each product name in a new line for variant level bundles with a custom bundle image
                        <s-text slot="details">
                            This setting only applies to variant level bundles which have a custom bundle image set. If you turn it on, each product name in the bundle will be listed in it's own line.
                        </s-text>
                    </s-choice>
                    <s-choice value="show-variant-product" selected>
                        Show only variant name on products in variant level bundles
                        <s-text slot="details">
                            Display only variant name and hide the product name on your bundle widget for variant level bundles.
                        </s-text>
                    </s-choice>
                </s-choice-list>
            </s-stack>
        </s-section>
    );
}
