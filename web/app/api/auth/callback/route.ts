import { Session } from "@shopify/shopify-api";
import { NextRequest, NextResponse } from "next/server";
import { registerWebhooks, runAppSetup } from "@/lib/shopify";
import { createSessionConfig, isValidShopifyToken } from "@/shared";
import { storeSession, upsertShop } from "@/shared/repositories";
import { markSetupComplete, markWebhooksRegistered } from "@/features/webhooks";

/**
 * OAuth Callback (Legacy support)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");
    const host = searchParams.get("host");
    const returnTo = searchParams.get("return_to");

    if (!code || !shop) {
        return NextResponse.json(
            { error: "Missing required OAuth parameters" },
            { status: 400 },
        );
    }

    try {
        console.log("[OAuth] Processing callback for shop:", shop);

        const tokenResponse = await fetch(
            `https://${shop}/admin/oauth/access_token`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: process.env.SHOPIFY_API_KEY,
                    client_secret: process.env.SHOPIFY_API_SECRET,
                    code: code,
                }),
            },
        );

        if (!tokenResponse.ok) {
            throw new Error(`Token exchange failed: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();

        if (!isValidShopifyToken(tokenData.access_token)) {
            throw new Error("Invalid access token format received");
        }

        const sessionState = state || crypto.randomUUID();
        const sessionConfig = createSessionConfig(
            shop,
            tokenData.access_token,
            tokenData.scope,
            sessionState,
        );

        const session = new Session(sessionConfig);

        await storeSession(session);
        await upsertShop(shop);

        console.log("[OAuth] Session stored, running setup...");

        // Run app setup
        const setupResult = await runAppSetup(tokenData.access_token, shop);

        if (setupResult.success) {
            await markSetupComplete(shop);
            console.log("[OAuth] ✅ Setup complete");
        } else {
            console.warn("[OAuth] ⚠️ Setup warning:", setupResult.error);
        }

        // Register webhooks
        try {
            await registerWebhooks(session);
            await markWebhooksRegistered(shop);
            console.log("[OAuth] ✅ Webhooks registered");
        } catch (webhookError) {
            console.error(
                "[OAuth] ❌ Webhook registration failed:",
                webhookError,
            );
        }

        const baseUrl = returnTo || "/dashboard";
        const redirectUrl = new URL(baseUrl, request.url);
        redirectUrl.searchParams.set("shop", shop);
        if (host) redirectUrl.searchParams.set("host", host);
        redirectUrl.searchParams.set("embedded", "1");

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error) {
        console.error("[OAuth] Callback error:", error);
        return NextResponse.json(
            {
                error: "OAuth authentication failed",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
