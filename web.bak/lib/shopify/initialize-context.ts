import "@shopify/shopify-api/adapters/web-api";
import {
    shopifyApi,
    LogSeverity,
} from "@shopify/shopify-api";
import { SHOPIFY_API_VERSION } from "@/lib/constants";

const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: process.env.SCOPES?.split(",") || ["write_products"],
    hostName: process.env.HOST?.replace(/https?:\/\//, "") || "",
    hostScheme: "https",
    isEmbeddedApp: true,
    apiVersion: SHOPIFY_API_VERSION,
    logger: {
        level:
            process.env.NODE_ENV === "development"
                ? LogSeverity.Debug
                : LogSeverity.Error,
    },
});

export default shopify;
