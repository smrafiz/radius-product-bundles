/**
 *
 * Most of the `Build` config is ommited on purpose since we're not using CLI to run dev
 * Read about config more on:
 * https://shopify.dev/docs/apps/tools/cli/configuration
 *
 */

/**
 * Configuration for the Shopify app
 */
export interface AppConfig {
    name: string;
    handle: string;
    client_id: string;
    application_url: string;
    extension_directories: string[];
    embedded: boolean;
    access_scopes: AccessScopes;
    access: AccessConfig;
    auth: AuthConfig;
    webhooks: WebhooksConfig;
    app_proxy: AppProxyConfig;
    pos: POSConfig;
    preferences: PreferencesConfig;
    build: BuildConfig;
}

/**
 * Access scopes
 */
interface AccessScopes {
    scopes: string;
    optional_scopes: string[];
    use_legacy_install_flow: boolean;
}

/**
 * Access config for Shopify APIs
 */
interface AdminAccessConfig {
    direct_api_mode: "online" | "offline";
    embedded_app_direct_api_access: boolean;
}

interface AccessConfig {
    admin: AdminAccessConfig;
}

/**
 * Authentication configuration
 */
interface AuthConfig {
    redirect_urls: string[];
}

/**
 * Webhook configuration
 */
interface WebhooksConfig {
    api_version: string;
    // subscriptions: WebhookSubscription[];
    // privacy_compliance: PrivacyComplianceConfig;
}

/**
 * Webhook subscription
 */
interface WebhookSubscription {
    topics: string[];
    url: string;
    filter?: string;
    include_fields?: string[];
}

/**
 * GDPR Strings
 */
interface PrivacyComplianceConfig {
    customer_deletion_url: string;
    customer_data_request_url: string;
    shop_deletion_url: string;
}

/**
 * App proxy
 */
interface AppProxyConfig {
    url: string;
    subpath: string;
    prefix: "apps" | "a" | "community" | "tools";
}

/**
 * Point of Sale (POS) configuration
 */
interface POSConfig {
    embedded: boolean;
}

/**
 * Preferences configuration
 */
interface PreferencesConfig {
    url: boolean;
}

/**
 * Preferences configuration
 */
interface BuildConfig {
    include_config_on_deploy: boolean;
    automatically_update_urls_on_dev: boolean;
    dev_store_url: string;
}

export {};
