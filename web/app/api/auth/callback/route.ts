import { Session } from "@shopify/shopify-api";
import { NextRequest, NextResponse } from "next/server";
import { registerWebhooks, runAppSetup } from "@/lib/shopify";
import { createSessionConfig, isValidShopifyToken, isValidShopDomain } from "@/shared";
import { storeSession, upsertShop } from "@/shared/repositories";
import { markSetupComplete, markWebhooksRegistered } from "@/features/webhooks";
import { verifyOAuthHmac } from "@/lib/shopify/auth/verify-hmac";
import { validateAndConsumeOAuthState } from "@/lib/shopify/auth/oauth-state-store";

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

    if (!isValidShopDomain(shop)) {
        return NextResponse.json(
            { error: "Invalid shop domain" },
            { status: 400 },
        );
    }

    if (!verifyOAuthHmac(searchParams)) {
        return NextResponse.json(
            { error: "HMAC verification failed" },
            { status: 403 },
        );
    }

    if (!state || !(await validateAndConsumeOAuthState(shop, state))) {
        return NextResponse.json(
            { error: "Invalid or expired OAuth state" },
            { status: 403 },
        );
    }

    try {
        const tokenResponse = await fetch(
            `https://${shop}/admin/oauth/access_token`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: process.env.SHOPIFY_API_KEY,
                    client_secret: process.env.SHOPIFY_API_SECRET,
                    code,
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

        const sessionConfig = createSessionConfig(
            shop,
            tokenData.access_token,
            tokenData.scope,
            state,
        );

        const session = new Session(sessionConfig);

        await storeSession(session);
        await upsertShop(shop);

        const setupResult = await runAppSetup(tokenData.access_token, shop);
        if (setupResult.success) {
            await markSetupComplete(shop);
        }

        try {
            await registerWebhooks(session);
            await markWebhooksRegistered(shop);
        } catch (webhookError) {
            console.error("[OAuth] Webhook registration failed:", webhookError);
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
            { error: "OAuth authentication failed" },
            { status: 500 },
        );
    }
}
