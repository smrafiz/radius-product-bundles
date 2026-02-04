import {
    GetBundleProductsDocument,
    GetBundleProductsQuery,
} from "@/lib/graphql/generated/graphql";
import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { findOfflineSessionByShop } from "@/shared/repositories";
import { verifyProxyRequest } from "@/lib/shopify/proxy/verify-proxy";
import { executeProxyGraphQL } from "@/lib/graphql/client/proxy-client";
import { findBundlesByProductId } from "@/features/bundles/repositories";

async function getAccessTokenForShop(shop: string): Promise<string | null> {
    try {
        const session = await findOfflineSessionByShop(shop);
        return session?.accessToken || null;
    } catch (error) {
        console.error(`Failed to get access token for shop ${shop}:`, error);
        return null;
    }
}

async function fetchProductDetails(
    productIds: string[],
    shop: string,
): Promise<GetBundleProductsQuery["nodes"]> {
    console.log("Fetching products with IDs:", productIds);

    const productsQuery = await executeProxyGraphQL<GetBundleProductsQuery>(
        GetBundleProductsDocument,
        { ids: productIds },
        shop,
    );

    if (productsQuery.error || !productsQuery.data) {
        console.error("Products query failed:", productsQuery.error);
        return [];
    }

    return productsQuery.data.nodes || [];
}

export async function GET(request: NextRequest) {
    try {
        // Verify Shopify App Proxy signature
        const proxyResult = verifyProxyRequest(request);

        if (proxyResult instanceof NextResponse) {
            return proxyResult;
        }

        const { shop } = proxyResult;

        const { searchParams } = request.nextUrl;
        const productId = searchParams.get("productId");
        const ids = searchParams.get("ids");

        const shopRecord = await getShop(shop);
        const ttl = shopRecord?.appSettings?.cacheTtl ?? 300;
        const cacheHeaders: HeadersInit = ttl > 0
            ? { "Cache-Control": `public, max-age=${ttl}` }
            : { "Cache-Control": "no-store" };

        // ⭐ NEW: Optimized route - fetch only product details by IDs
        if (ids) {
            console.log("[API] Optimized fetch: products by IDs");

            const productIds = ids.split(",").map((id) => {
                const trimmed = id.trim();
                if (!trimmed.includes("gid://")) {
                    return `gid://shopify/Product/${trimmed}`;
                }
                return trimmed;
            });

            // Fetch from Shopify using existing method
            const products = await fetchProductDetails(productIds, shop);

            // Transform to widget format
            const transformedProducts = products
                .filter((item): item is NonNullable<typeof item> => {
                    return item !== null && item !== undefined;
                })
                .map((item) => {
                    // Type assertion for the product
                    const product = item as any; // Use 'any' to avoid complex type issues

                    // Get variant - handle both possible structures
                    const variant =
                        product.variants?.nodes?.[0] || product.variants?.[0];

                    // Parse prices safely
                    const parsePrice = (price: any): number => {
                        if (!price) return 0;
                        const parsed = parseFloat(String(price));
                        return isNaN(parsed) ? 0 : parsed * 100; // Convert to cents
                    };

                    return {
                        id: product.id || "",
                        title: product.title || "Unknown Product",
                        price: parsePrice(variant?.price),
                        compareAtPrice: parsePrice(variant?.compareAtPrice),
                        image:
                            product.featuredMedia?.image?.url ||
                            product.featuredImage?.url ||
                            null,
                        handle: product.handle || "",
                        variantId: variant?.id || "",
                        available: variant?.availableForSale ?? true,
                    };
                });

            return NextResponse.json({
                success: true,
                products: transformedProducts,
            }, { headers: cacheHeaders });
        }

        // OLD route: Full bundle data (requires productId)
        if (!productId) {
            return NextResponse.json(
                { error: "Missing productId parameter" },
                { status: 400 },
            );
        }

        // Step 1: Get bundles from Prisma
        const bundles = await findBundlesByProductId(productId, shop);

        if (!bundles?.length) {
            return NextResponse.json({
                success: true,
                bundles: [],
                count: 0,
            });
        }

        // Step 2: Get access token for GraphQL calls
        const accessToken = await getAccessTokenForShop(shop);
        if (!accessToken) {
            return NextResponse.json(
                { error: "Shop authentication required" },
                { status: 401 },
            );
        }

        // Step 3: Transform bundles with GraphQL product data
        const transformedBundles = await Promise.all(
            bundles.map(async (bundle) => {
                // Extract all unique product IDs from bundle
                const productIds = Array.from(
                    new Set([
                        bundle.mainProductId,
                        ...(bundle.bundleProducts?.map((bp) => bp.productId) ||
                            []),
                    ]),
                ).filter((id): id is string => id !== null);

                // Fetch product details from Shopify
                const shopifyProducts = await fetchProductDetails(
                    productIds,
                    shop,
                );

                const productMap = new Map();
                shopifyProducts?.forEach((item) => {
                    const product = item as any;
                    if (product && product.id) {
                        console.log(
                            "Adding to map:",
                            product.id,
                            "->",
                            product.title,
                        );
                        productMap.set(product.id, product);
                    }
                });

                console.log("Product map size:", productMap.size);
                console.log("Product map keys:", Array.from(productMap.keys()));

                // Transform bundle products with Shopify data
                const transformedProducts =
                    bundle.bundleProducts?.map((bp) => {
                        console.log(`Looking for product: ${bp.productId}`);
                        const shopifyProduct = productMap.get(
                            bp.productId,
                        ) as any;
                        console.log(
                            "Found shopify product:",
                            shopifyProduct?.title || "NOT FOUND",
                        );

                        const variant = shopifyProduct?.variants?.nodes?.[0];
                        console.log("Variant data:", variant);

                        const price = variant?.price
                            ? parseFloat(variant.price)
                            : 0;
                        const compareAtPrice = variant?.compareAtPrice
                            ? parseFloat(variant.compareAtPrice)
                            : 0;

                        console.log(
                            "Parsed prices - price:",
                            price,
                            "compareAtPrice:",
                            compareAtPrice,
                        );

                        return {
                            id: bp.productId,
                            variantId: bp.variantId || variant?.id || "",
                            quantity: bp.quantity,
                            role: bp.role,
                            displayOrder: bp.displayOrder,
                            isRequired: bp.isRequired,

                            // Shopify product data
                            title: shopifyProduct?.title || "Unknown Product",
                            price: price,
                            compareAtPrice: compareAtPrice,
                            featuredImage:
                                shopifyProduct?.featuredMedia?.image?.url ||
                                null,
                            handle: shopifyProduct?.handle || "",
                        };
                    }) || [];

                console.log(
                    "Transformed products:",
                    transformedProducts.map((p) => ({
                        id: p.id,
                        title: p.title,
                        price: p.price,
                    })),
                );

                return {
                    id: bundle.id,
                    name: bundle.name,
                    description: bundle.description,
                    type: bundle.type,
                    discountType: bundle.discountType,
                    discountValue: bundle.discountValue,
                    minOrderValue: bundle.minOrderValue || 0,
                    maxDiscountAmount: bundle.maxDiscountAmount || 0,
                    discountApplication: bundle.discountApplication || "bundle",
                    discountedProductIds: bundle.discountedProductIds || [],
                    freeShipping: bundle.freeShipping || false,
                    status: bundle.status,
                    products: transformedProducts,
                    settings: bundle.settings
                        ? {
                              layout: bundle.settings.layout,
                              theme: bundle.settings.theme,
                              showImages: bundle.settings.showImages,
                              showComparePrices:
                                  bundle.settings.showComparePrices,
                              showQuantity: bundle.settings.showQuantity,
                              showFreeShipping:
                                  bundle.settings.showFreeShipping,
                              showPrices: bundle.settings.showPrices,
                              showSavings: bundle.settings.showSavings,
                              enableHyperLink: bundle.settings.enableHyperLink,
                          }
                        : null,
                };
            }),
        );

        return NextResponse.json({
            success: true,
            bundles: transformedBundles.filter((b) => b.status === "ACTIVE"),
            count: transformedBundles.length,
        }, { headers: cacheHeaders });
    } catch (error) {
        console.error("Bundle Proxy API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch bundle data" },
            { status: 500 },
        );
    }
}
