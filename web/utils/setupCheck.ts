import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env from one directory above
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const setupCheck = (): void => {
    try {
        const {
            SHOPIFY_API_KEY,
            SHOPIFY_API_SECRET,
            SCOPES,
            SHOPIFY_API_VERSION,
            DATABASE_URL,
            APP_NAME,
            APP_HANDLE,
        } = process.env;

        const appUrl = process.env.SHOPIFY_APP_URL || "https://example.com";

        if (!SHOPIFY_API_KEY) {
            throw new Error("---> API Key is undefined.");
        }

        if (!SHOPIFY_API_SECRET) {
            throw new Error("---> API Secret is undefined.");
        }

        if (!SCOPES) {
            throw new Error("---> API Scopes are undefined.");
        }

        if (!appUrl) {
            throw new Error("---> App URL is undefined.");
        }

        if (!appUrl.includes("https://")) {
            console.error("---> Please use HTTPS for SHOPIFY_APP_URL.");
        }

        if (!SHOPIFY_API_VERSION) {
            throw new Error("---> API Version is undefined.");
        }

        if (!DATABASE_URL) {
            throw new Error("---> Database string is undefined.");
        }

        if (!APP_NAME || APP_NAME.length < 1) {
            throw new Error(
                // @ts-ignore
                `---> App Name is ${APP_NAME?.length < 1 ? "not entered properly" : "undefined"}.`,
            );
        }

        if (!APP_HANDLE) {
            throw new Error("---> App Handle is undefined.");
        }

        if (APP_HANDLE.includes(" ")) {
            throw new Error(
                "---> Handle must be URL encoded and cannot contain spaces.",
            );
        }

        console.log("--> Setup checks passed successfully.");
    } catch (e) {
        console.error((e as Error).message);
    }
};

export default setupCheck;
