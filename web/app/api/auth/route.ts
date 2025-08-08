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

    // Build the OAuth URL
    const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    authUrl.searchParams.append("client_id", process.env.SHOPIFY_API_KEY!);
    authUrl.searchParams.append(
        "scope",
        process.env.SCOPES || "read_products,read_orders",
    );
    authUrl.searchParams.append(
        "redirect_uri",
        `${process.env.SHOPIFY_APP_URL}/api/auth/callback`,
    );
    authUrl.searchParams.append("state", "your-state-here");

    if (returnTo) {
        authUrl.searchParams.append("return_to", returnTo);
    }

    return NextResponse.redirect(authUrl.toString());
}
