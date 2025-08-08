import shopify from "@/lib/shopify/initialize-context";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const returnTo = searchParams.get("returnTo");

    if (!shop) {
        return NextResponse.json(
            { error: "Shop parameter is required" },
            { status: 400 },
        );
    }

    console.log(`🔄 Starting OAuth flow for shop: ${shop}`);

    try {
        // Use Shopify's built-in OAuth flow which handles cookies properly
        const { redirect } = await shopify.auth.begin({
            shop,
            callbackPath: "/api/auth/callback",
            isOnline: false, // Use offline tokens for app-level access
            rawRequest: request,
        });

        console.log(`✅ OAuth redirect generated for shop: ${shop}`);
        console.log(`🔗 Redirect URL: ${redirect}`);

        // Add return_to parameter to the redirect if provided
        if (returnTo) {
            const redirectUrl = new URL(redirect);
            redirectUrl.searchParams.append("return_to", returnTo);
            return NextResponse.redirect(redirectUrl.toString());
        }

        return NextResponse.redirect(redirect);
        
    } catch (error) {
        console.error("❌ OAuth begin error:", error);
        return NextResponse.json(
            { 
                error: "Failed to start OAuth flow",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
