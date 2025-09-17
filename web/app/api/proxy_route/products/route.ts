import { NextRequest, NextResponse } from "next/server";
import { bundleQueries } from "@/lib/queries";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;

        // shop name from proxy request
        const shop = searchParams.get("shop");

        if (!shop) {
            return NextResponse.json(
                { error: "Missing shop parameter" },
                { status: 400 },
            );
        }

        const productId = searchParams.get("productId");
        if (!productId) {
            return NextResponse.json(
                { error: "productId parameter is required" },
                { status: 400 },
            );
        }

        // fetch bundles for this shop + product
        const bundles = await bundleQueries.findByProductId(productId, shop);
        console.log(bundles, productId, shop);

        const transformedBundles = bundles.map((bundle) => ({
            id: bundle.id,
            name: bundle.name,
            description: bundle.description,
            type: bundle.type,
            discountType: bundle.discountType,
            discountValue: bundle.discountValue,
            status: bundle.status,
            products: bundle.bundleProducts?.map((bp) => ({
                id: bp.productId,
                variantId: bp.variantId,
                quantity: bp.quantity,
                role: bp.role,
                displayOrder: bp.displayOrder,
                isRequired: bp.isRequired,

                product: bp.product
                    ? {
                        id: bp.product.id,
                        title: bp.product.title,
                        handle: bp.product.handle,
                        featuredImage: bp.product.featuredImage?.url || null,
                        priceRange: bp.product.priceRangeV2
                            ? {
                                min: bp.product.priceRangeV2.minVariantPrice.amount,
                                max: bp.product.priceRangeV2.maxVariantPrice.amount,
                                currencyCode: bp.product.priceRangeV2.minVariantPrice.currencyCode,
                            }
                            : null,
                    }
                    : null,
            })) || [],
            settings: bundle.settings ? {
                layout: bundle.settings.layout,
                theme: bundle.settings.theme,
                position: bundle.settings.position,
                showPrices: bundle.settings.showPrices,
                showSavings: bundle.settings.showSavings,
                showProductImages: bundle.settings.showProductImages,
            } : null,
        }));

        return NextResponse.json({
            success: true,
            bundles: transformedBundles.filter((b) => b.status === "ACTIVE"),
            count: transformedBundles.length,
        });
    } catch (error) {
        console.error("Bundle Proxy API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch bundle data" },
            { status: 500 },
        );
    }
}