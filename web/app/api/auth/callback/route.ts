import shopify from "@/lib/shopify/initialize-context";
import { NextRequest, NextResponse } from "next/server";
import { storeSession } from "@/lib/db/session-storage";

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
        console.log(`✅ Processing OAuth callback for shop: ${shop}`);

        // Exchange code for access token
        const { session } = await shopify.auth.callback({
            rawRequest: request,
        });

        // Store session in the database
        await storeSession(session);
        console.log(`✅ Session stored for shop: ${shop}`);

        // Redirect back to the app with session parameters
        const redirectUrl = new URL(returnTo || "/dashboard", request.url);
        redirectUrl.searchParams.set("shop", shop);
        if (host) redirectUrl.searchParams.set("host", host);

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error) {
        console.error("OAuth callback error:", error);
        return NextResponse.json(
            { error: "OAuth authentication failed" },
            { status: 500 },
        );
    }
}
