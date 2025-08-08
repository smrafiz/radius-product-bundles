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

        // Use Shopify's built-in callback handler which manages cookies properly
        const { session } = await shopify.auth.callback({
            rawRequest: request,
        });

        console.log(`✅ OAuth callback successful for shop: ${shop}`);
        console.log(`📋 Session details: ID=${session.id}, isOnline=${session.isOnline}`);

        // Store session in the database
        await storeSession(session);
        console.log(`✅ Session stored for shop: ${shop}`);

        // Build redirect URL with proper parameters
        const baseUrl = returnTo || "/dashboard";
        const redirectUrl = new URL(baseUrl, request.url);
        
        // Always include shop parameter
        redirectUrl.searchParams.set("shop", shop);
        
        // Include host parameter if available
        if (host) {
            redirectUrl.searchParams.set("host", host);
        }

        // For embedded apps, add embedded parameter
        redirectUrl.searchParams.set("embedded", "1");

        console.log(`🔄 Redirecting to: ${redirectUrl.toString()}`);
        return NextResponse.redirect(redirectUrl.toString());
        
    } catch (error) {
        console.error("❌ OAuth callback error:", error);
        
        // Provide more specific error information
        let errorMessage = "OAuth authentication failed";
        if (error instanceof Error) {
            if (error.message.includes("OAuth cookie")) {
                errorMessage = "OAuth session expired or invalid. Please try installing the app again.";
            } else if (error.message.includes("Invalid")) {
                errorMessage = "Invalid OAuth parameters. Please check your app configuration.";
            }
        }
        
        return NextResponse.json(
            { 
                error: errorMessage,
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
