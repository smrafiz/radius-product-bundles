import { verifyRequest } from "@/lib/shopify/verify";
import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken, isSessionExpired, formatErrorResponse } from "@/utils";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = extractBearerToken(authHeader);

        if (!token) {
            return NextResponse.json(
                {
                    valid: false,
                    error: "Missing or invalid authorization header",
                },
                { status: 401 },
            );
        }

        // Extract and verify the session token
        const { shop, session } = await verifyRequest(request, true);

        if (!session || !session.accessToken) {
            return NextResponse.json(
                { valid: false, error: "Invalid session" },
                { status: 401 },
            );
        }

        // Check if session is expired using utility function
        if (isSessionExpired(session.expires)) {
            return NextResponse.json(
                { valid: false, error: "Session expired" },
                { status: 401 },
            );
        }

        return NextResponse.json({
            valid: true,
            shop,
            sessionId: session.id,
            isOnline: session.isOnline,
            scope: session.scope,
        });
    } catch (error) {
        console.error("Session validation error:", error);

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes("JWT")) {
                return NextResponse.json(
                    { valid: false, error: "Invalid session token" },
                    { status: 401 },
                );
            }

            if (error.message.includes("expired")) {
                return NextResponse.json(
                    { valid: false, error: "Session expired" },
                    { status: 401 },
                );
            }
        }

        const errorResponse = formatErrorResponse(error, "Session validation failed");
        return NextResponse.json(
            { valid: false, ...errorResponse },
            { status: 500 }
        );
    }
}
