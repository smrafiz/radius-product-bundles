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

    try {
        // Generate secure state parameter
        const state = `${shop}-${Date.now()}-${Math.random().toString(36).substring(2)}`;

        // Build OAuth URL
        const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
        authUrl.searchParams.append("client_id", process.env.SHOPIFY_API_KEY!);
        authUrl.searchParams.append("scope", process.env.SCOPES!);
        authUrl.searchParams.append("redirect_uri", `${process.env.HOST}/api/auth/callback`);
        authUrl.searchParams.append("state", state);

        if (returnTo) {
            authUrl.searchParams.append("return_to", returnTo);
        }

        return NextResponse.redirect(authUrl.toString());
        
    } catch (error) {
        console.error("OAuth error:", error);
        return NextResponse.json(
            { 
                error: "Failed to start OAuth flow",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
