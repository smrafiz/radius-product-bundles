/**
 * Shopify Webhook Types
 *
 * Type definitions for Shopify webhook payloads
 */

/**
 * Line item property (e.g., _bundle_id, _bundle_name)
 */
export interface ShopifyLineItemProperty {
    name: string;
    value: string;
}

/**
 * Order line item
 */
export interface ShopifyLineItem {
    id: number;
    variant_id: number;
    product_id?: number;
    title: string;
    quantity: number;
    price: string;
    sku?: string;
    variant_title?: string;
    vendor?: string;
    fulfillment_service?: string;
    product_exists?: boolean;
    fulfillable_quantity?: number;
    grams?: number;
    total_discount?: string;
    properties?: ShopifyLineItemProperty[];
}

/**
 * Customer information in order
 */
export interface ShopifyCustomer {
    id: number;
    email: string;
    accepts_marketing?: boolean;
    created_at?: string;
    updated_at?: string;
    first_name?: string;
    last_name?: string;
    orders_count: number;
    state?: string;
    total_spent?: string;
    last_order_id?: number;
    note?: string;
    verified_email?: boolean;
    phone?: string;
    tags?: string;
}

/**
 * Shopify Order (from webhook)
 */
export interface ShopifyOrder {
    id: number;
    admin_graphql_api_id?: string;
    app_id?: number;
    browser_ip?: string;
    buyer_accepts_marketing?: boolean;
    cancel_reason?: string;
    cancelled_at?: string;
    cart_token?: string;
    checkout_id?: number;
    checkout_token?: string;
    client_details?: any;
    closed_at?: string;
    confirmed?: boolean;
    contact_email?: string;
    created_at: string;
    currency: string;
    current_subtotal_price?: string;
    current_total_discounts?: string;
    current_total_price?: string;
    current_total_tax?: string;
    customer_locale?: string;
    device_id?: string;
    discount_codes?: any[];
    email: string;
    estimated_taxes?: boolean;
    financial_status: string;
    fulfillment_status?: string;
    gateway?: string;
    landing_site?: string;
    landing_site_ref?: string;
    location_id?: number;
    name: string;
    note?: string;
    note_attributes?: any[];
    number?: number;
    order_number?: number;
    order_status_url?: string;
    original_total_duties_set?: any;
    payment_gateway_names?: string[];
    phone?: string;
    presentment_currency?: string;
    processed_at?: string;
    processing_method?: string;
    reference?: string;
    referring_site?: string;
    source_identifier?: string;
    source_name?: string;
    source_url?: string;
    subtotal_price?: string;
    tags?: string;
    tax_lines?: any[];
    taxes_included?: boolean;
    test?: boolean;
    token?: string;
    total_discounts?: string;
    total_line_items_price?: string;
    total_outstanding?: string;
    total_price: string;
    total_price_usd?: string;
    total_shipping_price_set?: any;
    total_tax?: string;
    total_tip_received?: string;
    total_weight?: number;
    updated_at?: string;
    user_id?: number;

    // Important fields
    line_items: ShopifyLineItem[];
    customer?: ShopifyCustomer;
    billing_address?: any;
    shipping_address?: any;
    fulfillments?: any[];
    refunds?: any[];
}

/**
 * Shop update webhook payload
 */
export interface ShopifyShop {
    id: number;
    name: string;
    email: string;
    domain: string;
    province?: string;
    country: string;
    address1?: string;
    zip?: string;
    city?: string;
    source?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    primary_locale: string;
    address2?: string;
    created_at: string;
    updated_at: string;
    country_code: string;
    country_name: string;
    currency: string;
    customer_email?: string;
    timezone: string;
    iana_timezone: string;
    shop_owner: string;
    money_format: string;
    money_with_currency_format: string;
    weight_unit: string;
    province_code?: string;
    taxes_included?: boolean;
    auto_configure_tax_inclusivity?: boolean;
    tax_shipping?: boolean;
    county_taxes?: boolean;
    plan_display_name: string;
    plan_name: string;
    has_discounts?: boolean;
    has_gift_cards?: boolean;
    myshopify_domain: string;
    google_apps_domain?: string;
    google_apps_login_enabled?: boolean;
    money_in_emails_format: string;
    money_with_currency_in_emails_format: string;
    eligible_for_payments?: boolean;
    requires_extra_payments_agreement?: boolean;
    password_enabled?: boolean;
    has_storefront?: boolean;
    eligible_for_card_reader_giveaway?: boolean;
    finances?: boolean;
    primary_location_id?: number;
    cookie_consent_level?: string;
    visitor_tracking_consent_preference?: string;
    checkout_api_supported?: boolean;
    multi_location_enabled?: boolean;
    setup_required?: boolean;
    pre_launch_enabled?: boolean;
    enabled_presentment_currencies?: string[];
}

/**
 * Product update webhook payload
 */
export interface ShopifyProduct {
    id: number;
    title: string;
    body_html?: string;
    vendor: string;
    product_type?: string;
    created_at: string;
    handle: string;
    updated_at: string;
    published_at?: string;
    template_suffix?: string;
    published_scope?: string;
    tags?: string;
    status: string;
    admin_graphql_api_id: string;
    variants: any[];
    options?: any[];
    images?: any[];
    image?: any;
}
