import fs from "fs";
import "dotenv/config";
import path from "path";
import toml from "@iarna/toml";
import setupCheck from "@/utils/shopify/setupCheck";
import type { AppConfig } from "@/_developer/types/toml";

// Initialize config
const config: AppConfig = {} as AppConfig;

try {
    setupCheck(); // Ensure all env vars are loaded

    let appUrl =
        process.env.HOST ||
        process.env.SHOPIFY_APP_URL ||
        process.env.APP_URL ||
        "https://www.app.example.com/";

    if (appUrl.endsWith("/")) {
        appUrl = appUrl.slice(0, -1);
    }

    // Global app config
    config.name = process.env.APP_NAME!;
    config.handle = process.env.APP_HANDLE!;
    config.client_id = process.env.SHOPIFY_API_KEY!;
    config.application_url = appUrl;
    config.embedded = true;
    config.extension_directories = ["./extension/extensions/**"];

    // App Proxy Configuration
    // config.app_proxy = {
    //     url: `${appUrl}/api/proxy`,
    //     subpath: "bundle-api",
    //     prefix: "apps",
    // };

    // Build section
    config.build = {
        include_config_on_deploy: true,
        automatically_update_urls_on_dev:
            process.env.AUTO_UPDATE_URL === "true",
        dev_store_url: process.env.DEV_STORE_URL ?? "",
    };

    // Webhooks
    config.webhooks = {
        api_version: process.env.SHOPIFY_API_VERSION!,
    };

    // Access
    if (
        process.env.DIRECT_API_MODE &&
        process.env.EMBEDDED_APP_DIRECT_API_ACCESS
    ) {
        config.access = {
            admin: {
                direct_api_mode: process.env.DIRECT_API_MODE as
                    | "online"
                    | "offline",
                embedded_app_direct_api_access:
                    process.env.EMBEDDED_APP_DIRECT_API_ACCESS === "true",
            },
        };
    }

    // Access scopes
    config.access_scopes = {
        scopes: process.env.SCOPES!,
        optional_scopes:
            process.env.SHOPIFY_API_OPTIONAL_SCOPES?.split(",")
                .map((s) => s.trim())
                .filter(Boolean) || [],
        use_legacy_install_flow: false,
    };

    // Auth
    config.auth = {
        redirect_urls: [
            `${appUrl}/api/auth/callback`,
            `${appUrl}/api/auth/oauth/callback`,
        ],
    };

    // PoS support
    config.pos = {
        embedded: process.env.POS_EMBEDDED === "true",
    };

    // === Write TOML Files ===

    const addHeader = (str: string) =>
        `# Avoid writing to toml directly. Use your .env file instead\n\n${str}`;

    const extensionsDir = path.join("..", "extension");
    const baseTomlPath = path.join(process.cwd(), "shopify.app.toml");
    const globalTomlPath = path.join(process.cwd(), "..", "shopify.app.toml");
    const extensionTomlPath = path.join(extensionsDir, "shopify.app.toml");
    const vercelTomlPath = path.join(
        process.cwd(),
        "shopify.app.app-next-vercel.toml",
    );

    // 1. Base TOML (root)
    fs.writeFileSync(baseTomlPath, addHeader(toml.stringify(config as any)));
    console.log("✅ Written TOML to root");

    // 2. Vercel TOML (same config, different file name)
    fs.writeFileSync(vercelTomlPath, addHeader(toml.stringify(config as any)));
    console.log("✅ Written TOML for Vercel");

    // 3. Extension TOMLs
    if (fs.existsSync(extensionsDir)) {
        config.extension_directories = ["extension/extensions/**"];
        fs.writeFileSync(
            globalTomlPath,
            addHeader(toml.stringify(config as any)),
        );
        console.log("✅ Written TOML to parent");

        config.extension_directories = ["./extensions/**"];
        fs.writeFileSync(
            extensionTomlPath,
            addHeader(toml.stringify(config as any)),
        );
        console.log("✅ Written TOML to extension");
    }
} catch (e: any) {
    console.error("❌ An error occurred while writing TOML files");
    console.error(e.message || e);
}
