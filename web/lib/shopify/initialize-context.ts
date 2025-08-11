import "@shopify/shopify-api/adapters/web-api";
import {
    shopifyApi,
    LATEST_API_VERSION,
    LogSeverity,
} from "@shopify/shopify-api";
import { loadSession, storeSession, deleteSession } from "@/lib/db/session-storage";

const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: process.env.SCOPES?.split(",") || ["write_products"],
    hostName: process.env.HOST?.replace(/https?:\/\//, "") || "",
    hostScheme: "https",
    isEmbeddedApp: true,
    apiVersion: LATEST_API_VERSION,
    logger: {
        level:
            process.env.NODE_ENV === "development"
                ? LogSeverity.Debug
                : LogSeverity.Error,
    },
    sessionStorage: {
        storeSession: async (session) => {
            await storeSession(session);
            return true;
        },
        loadSession: async (id) => {
            try {
                return await loadSession(id);
            } catch (error) {
                return undefined;
            }
        },
        deleteSession: async (id) => {
            await deleteSession(id);
            return true;
        },
    },
});

export default shopify;
