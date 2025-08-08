import { NextRequest, NextResponse } from "next/server";
import {
    findOfflineSessionByShop,
    SessionNotFoundError,
} from "@/lib/db/session-storage";

export async function POST(request: NextRequest) {
    try {
        const { shop, host } = await request.json();

        if (!shop) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Shop parameter required",
                },
                { status: 400 },
            );
        }

        console.log(`🔍 Looking for session in DB for shop: ${shop}`);

        // Check if valid session exists in the database
        const session = await findOfflineSessionByShop(shop);

        if (session && session.accessToken) {
            // Check if the session is not expired
            const now = new Date();
            const isExpired =
                session.expires && new Date(session.expires) < now;

            if (!isExpired) {
                console.log(`✅ Found valid session for shop: ${shop}`);

                return NextResponse.json({
                    success: true,
                    session: {
                        token: session.accessToken,
                        shop: session.shop,
                        expires: session.expires,
                    },
                });
            } else {
                console.log(`⏰ Session expired for shop: ${shop}`);
            }
        } else {
            console.log(`❌ No session found for shop: ${shop}`);
        }

        return NextResponse.json(
            {
                success: false,
                error: "No valid session found",
            },
            { status: 404 },
        );
    } catch (error) {
        if (error instanceof SessionNotFoundError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Session not found",
                },
                { status: 404 },
            );
        }

        console.error("Session refresh error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Session refresh failed",
            },
            { status: 500 },
        );
    }
}
