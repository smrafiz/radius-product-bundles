import { NextRequest, NextResponse } from "next/server";
import { storeSession } from "@/lib/db/session-storage";
import { Session } from "@shopify/shopify-api";

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
        // Exchange code for access token
        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.SHOPIFY_API_KEY,
                client_secret: process.env.SHOPIFY_API_SECRET,
                code: code,
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error(`Token exchange failed: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();

        // Validate token format
        if (!tokenData.access_token || !tokenData.access_token.startsWith('shpat_')) {
            throw new Error("Invalid access token format received");
        }

        // Create session object
        const session = new Session({
            id: `offline_${shop}`,
            shop: shop,
            accessToken: tokenData.access_token,
            scope: tokenData.scope,
            isOnline: false,
            state: state || undefined,
        });

        // Store session in the database
        await storeSession(session);

        // Build redirect URL with proper parameters
        const baseUrl = returnTo || "/dashboard";
        const redirectUrl = new URL(baseUrl, request.url);
        
        redirectUrl.searchParams.set("shop", shop);
        
        if (host) {
            redirectUrl.searchParams.set("host", host);
        }

        redirectUrl.searchParams.set("embedded", "1");

        return NextResponse.redirect(redirectUrl.toString());
        
    } catch (error) {
        console.error("OAuth callback error:", error);
        
        return NextResponse.json(
            { 
                error: "OAuth authentication failed",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
