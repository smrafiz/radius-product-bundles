import { NextRequest, NextResponse } from "next/server";
import { bundleQueries } from "@/lib/queries";

export async function GET(
    request: NextRequest,
    { params }: { params: { productId: string } },
) {
    try {
        const { productId } = params;
        const { searchParams } = new URL(request.url);
        const shop = searchParams.get("shop");

        if (!shop || !productId) {
            return NextResponse.json(
                { error: "Shop and productId parameters are required" },
                { status: 400 },
            );
        }

        // Find bundles that include this product
        const bundles = await bundleQueries.findByProductId(productId, shop);

        // Transform the data for frontend consumption
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
        console.error("Bundle API Error:", error);
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

// CORS headers for cross-origin requests
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
