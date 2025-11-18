"use client";

export function SettingsBundleWidget() {
    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    <div style={{ fontSize: "18px" }}>
                        Bundle Widget Settings
                    </div>
                </s-heading>
                <s-divider />
                <s-heading>DISPLAY</s-heading>
                <s-checkbox
                    checked
                    label="Show bundles on product pages"
                    details="Uncheck if you don't want to show bundle widget on product pages automatically."
                />
                <s-checkbox
                    label="Show multiple bundles on product pages (won't affect volume discounts)"
                    details="Check if you want to display all bundles relevant to the current product on product pages."
                />

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

                <s-heading>PRICE</s-heading>
                <s-checkbox checked label="Show products prices" />
                <s-checkbox
                    label="Use compare at price as base price in bundle widget"
                    details="Compare at price can only be used for display purposes in bundle widget. It won't be used when calculating the actual discount at checkout."
                />
                <s-stack>
                    <s-checkbox label="Show unit price" />
                    <s-stack paddingInlineStart="large-200">
                        <s-paragraph>
                            {
                                "Unit price will be displayed for products which have the unit price configured. Unit prices are available only for Shopify stores from France or Germany. Read more."
                            }
                            <s-link
                                target="_blank"
                                href="https://help.shopify.com/en/manual/products/details/product-pricing/unit-pricing"
                            >
                                Read More
                            </s-link>
                        </s-paragraph>
                    </s-stack>
                </s-stack>

                <s-divider />

                <s-heading>LINKS</s-heading>
                <s-checkbox checked label="Open links in new tabs" />
                <s-checkbox
                    label="Enable product links in bundle widgets"
                    details="Uncheck if you don't want to have links in the widgets which lead to the individual product pages."
                />

                <s-divider />

                <s-heading>WIDGET DISPLAY</s-heading>
                <s-checkbox
                    checked
                    label="Animate add to cart button"
                    details="Add to cart button in widgets will bounce to attract attention."
                />
                <s-checkbox label="Show if product is out of stock and hide unavailable variants in dropdowns" />
                <s-checkbox
                    checked
                    label="Disable add to cart button on bundles with 1 or more unavailable products"
                    details="Add to cart button will be disabled if one or more products in the bundle are unavailable for purchase."
                />
                <s-text-field
                    label="Out of stock text on add to cart button"
                    value="Out of stock"
                    placeholder="Out of stock"
                    details="This text will be displayed on add to cart button if one or more products are unavailable."
                />

                <s-divider />

                <s-heading>QUANTITY FIELD</s-heading>
                <s-checkbox
                    label="Show quantity field before add to cart button"
                    details="Turn this on if you want to show the quantity input field before the add to cart button in the bundle widgets."
                />
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

                <s-heading>STYLE OPTIONS</s-heading>
                <s-checkbox
                    label="Use retina images"
                    details="Product images will be served in higher resolution, suitable for retina displays, but your Google Pagespeed score might get downgraded for that."
                />
                <s-checkbox
                    checked
                    label="Make product boxes same size"
                    details="The height of product boxes in the row will be the same."
                />
                <s-checkbox
                    checked
                    label="Align images at the top of the product card"
                />
                <s-checkbox
                    label="List each product name in a new line for variant level bundles with a custom bundle image"
                    details="This setting only applies to variant level bundles which have a custom bundle image set. If you turn it on, each product name in the bundle will be listed in it's own line."
                />
                <s-checkbox
                    label="Show only variant name on products in variant level bundles"
                    details="Display only variant name and hide the product name on your bundle widget for variant level bundles."
                />
            </s-stack>
        </s-section>
    );
}
