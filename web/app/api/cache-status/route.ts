// /web/app/api/cache-status/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const shop = searchParams.get('shop');

        if (!shop) {
            return NextResponse.json({ error: "Shop parameter required" }, { status: 400 });
        }

        // Check for cache invalidation signals
        const invalidations = (global as any).shopCacheInvalidations as Map<string, any>;

        if (invalidations && invalidations.has(shop)) {
            const invalidation = invalidations.get(shop);

            // Remove after sending to avoid repeated invalidations
            invalidations.delete(shop);

            return NextResponse.json({
                invalidated: true,
                invalidatedAt: invalidation.invalidatedAt,
                changes: invalidation.changes,
                type: invalidation.type
            });
        }

        return NextResponse.json({ invalidated: false });

    } catch (error) {
        console.error("Cache status check error:", error);
        return NextResponse.json(
            { error: "Failed to check cache status" },
            { status: 500 }
        );
    }
}