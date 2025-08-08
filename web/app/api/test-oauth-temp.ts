import { findOfflineSessionByShop } from "@/lib/db/session-storage";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Test session retrieval
        const session = await findOfflineSessionByShop("bundles47.myshopify.com");
        
        if (!session || !session.accessToken) {
            return NextResponse.json({
                success: false,
                error: "No valid session found",
                hasSession: false
            });
        }

        // Test API call with the token
        const shopifyResponse = await fetch(
            `https://bundles47.myshopify.com/admin/api/2025-07/shop.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': session.accessToken,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (shopifyResponse.ok) {
            const shopData = await shopifyResponse.json();
            return NextResponse.json({
                success: true,
                hasSession: true,
                tokenValid: true,
                shop: {
                    name: shopData.shop.name,
                    domain: shopData.shop.domain,
                    email: shopData.shop.email
                },
                sessionInfo: {
                    scope: session.scope,
                    isOnline: session.isOnline,
                    expires: session.expires,
                    tokenPrefix: session.accessToken?.substring(0, 6) + "..."
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                hasSession: true,
                tokenValid: false,
                error: `Shopify API error: ${shopifyResponse.status}`,
                shopifyError: await shopifyResponse.text()
            });
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            hasSession: false
        });
    }
}
