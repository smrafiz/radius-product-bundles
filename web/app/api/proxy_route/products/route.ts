// web/app/apps/api/bundles/product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bundleQueries } from "@/lib/queries";

export async function GET(request: NextRequest) {
    try {
        // This automatically verifies signature and provides session
        // const { session } = await authenticate.public.appProxy(request);
        //
        // if (!session) {
        //     return NextResponse.json(
        //         { error: "Invalid app proxy request - no session" },
        //         { status: 401 }
        //     );
        // }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json(
                { error: "productId parameter is required" },
                { status: 400 },
            );
        }

        console.log("App Proxy Request:", {
            shop: session.shop,
            productId,
            url: request.url,
        });

        // Your existing bundle logic
        const bundles = await bundleQueries.findByProductId(
            productId,
            session.shop,
        );

        const transformedBundles = bundles.map((bundle) => ({
            id: bundle.id,
            name: bundle.name,
            description: bundle.description,
            type: bundle.type,
            discountType: bundle.discountType,
            discountValue: bundle.discountValue,
            status: bundle.status,
            products:
                bundle.bundleProducts?.map((bp) => ({
                    id: bp.productId,
                    variantId: bp.variantId,
                    quantity: bp.quantity,
                    role: bp.role,
                    displayOrder: bp.displayOrder,
                    isRequired: bp.isRequired,
                })) || [],
            settings: bundle.settings
                ? {
                      layout: bundle.settings.layout,
                      theme: bundle.settings.theme,
                      position: bundle.settings.position,
                      showPrices: bundle.settings.showPrices,
                      showSavings: bundle.settings.showSavings,
                      showProductImages: bundle.settings.showProductImages,
                  }
                : null,
        }));

        return NextResponse.json({
            success: true,
            bundles: transformedBundles.filter((b) => b.status === "ACTIVE"),
            count: transformedBundles.length,
        });
    } catch (error) {
        console.error("Bundle Proxy API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch bundle data",
                bundles: [],
                count: 0,
            },
            { status: 500 },
        );
    }
}
