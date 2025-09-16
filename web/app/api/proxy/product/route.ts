import { NextRequest, NextResponse } from "next/server";
import { bundleQueries } from "@/lib/queries";
import { authenticate } from "@/lib/shopify/unified-auth";

export async function GET(request: NextRequest) {
    console.log("🚀 API ROUTE HIT!", {
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
    });

    return NextResponse.json({
        success: true,
        message: "API route is working!",
        timestamp: new Date().toISOString(),
        url: request.url
    });
}

// export async function GET(request: NextRequest) {
//     return NextResponse.json(
//         {
//             success: true,
//             error: "This is an attempt to fetch bundle data",
//             bundles: [],
//             count: 0,
//         },
//         { status: 200 }
//     );
//     // try {
//     //     // Verify the app proxy request and get session
//     //     const { session } = await authenticate(request);
//     //     console.log(session);
//     //
//     //     if (!session) {
//     //         return NextResponse.json(
//     //             { error: "Invalid app proxy request - no session" },
//     //             { status: 401 }
//     //         );
//     //     }
//     //
//     //     const { searchParams } = new URL(request.url);
//     //     const productId = searchParams.get("productId");
//     //
//     //     if (!productId) {
//     //         return NextResponse.json(
//     //             { error: "productId parameter is required" },
//     //             { status: 400 }
//     //         );
//     //     }
//     //
//     //     console.log("App Proxy Request:", {
//     //         shop: session.shop,
//     //         productId,
//     //         url: request.url,
//     //     });
//     //
//     //     // Fetch bundles for the product
//     //     const bundles = await bundleQueries.findByProductId(productId, session.shop);
//     //
//     //     const transformedBundles = bundles.map((bundle) => ({
//     //         id: bundle.id,
//     //         name: bundle.name,
//     //         description: bundle.description,
//     //         type: bundle.type,
//     //         discountType: bundle.discountType,
//     //         discountValue: bundle.discountValue,
//     //         status: bundle.status,
//     //         products:
//     //             bundle.bundleProducts?.map((bp) => ({
//     //                 id: bp.productId,
//     //                 variantId: bp.variantId,
//     //                 quantity: bp.quantity,
//     //                 role: bp.role,
//     //                 displayOrder: bp.displayOrder,
//     //                 isRequired: bp.isRequired,
//     //             })) || [],
//     //         settings: bundle.settings
//     //             ? {
//     //                 layout: bundle.settings.layout,
//     //                 theme: bundle.settings.theme,
//     //                 position: bundle.settings.position,
//     //                 showPrices: bundle.settings.showPrices,
//     //                 showSavings: bundle.settings.showSavings,
//     //                 showProductImages: bundle.settings.showProductImages,
//     //             }
//     //             : null,
//     //     }));
//     //
//     //     // Return only active bundles
//     //     return NextResponse.json({
//     //         success: true,
//     //         bundles: transformedBundles.filter((b) => b.status === "ACTIVE"),
//     //         count: transformedBundles.length,
//     //     });
//     // } catch (error) {
//     //     console.error("Bundle Proxy API Error:", error);
//     //     return NextResponse.json(
//     //         {
//     //             success: false,
//     //             error: "Failed to fetch bundle data",
//     //             bundles: [],
//     //             count: 0,
//     //         },
//     //         { status: 500 }
//     //     );
//     // }
// }