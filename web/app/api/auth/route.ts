import { NextRequest, NextResponse } from "next/server";
import { createOAuthState } from "@/lib/shopify/auth/oauth-state-store";
import { isValidShopDomain } from "@/shared";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");
    const returnTo = searchParams.get("returnTo");

    if (!shop || !isValidShopDomain(shop)) {
        return NextResponse.json(
            { error: "Invalid or missing shop domain" },
            { status: 400 },
        );
    }

    try {
        const state = await createOAuthState(shop);

        const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
        authUrl.searchParams.append("client_id", process.env.SHOPIFY_API_KEY!);
        authUrl.searchParams.append("scope", process.env.SCOPES!);
        authUrl.searchParams.append(
            "redirect_uri",
            `${process.env.HOST}/api/auth/callback`,
        );
        authUrl.searchParams.append("state", state);

        if (returnTo) {
            authUrl.searchParams.append("return_to", returnTo);
        }

        return NextResponse.redirect(authUrl.toString());
    } catch (error) {
        console.error("OAuth error:", error);
        return NextResponse.json(
            { error: "Failed to start OAuth flow" },
            { status: 500 },
        );
    }
}
