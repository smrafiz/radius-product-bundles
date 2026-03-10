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
import { calculateDiscountAmount } from "@/features/bundles/utils/calculators/bundle-calculations";

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

function buildProductMap(
    products: GetBundleProductsQuery["nodes"],
): Map<string, any> {
    const map = new Map<string, any>();
    products.forEach((item) => {
        const product = item as any;
        if (product?.id) map.set(product.id, product);
    });
    return map;
}

function getPrice(product: any): number {
    return parseFloat(product?.variants?.nodes?.[0]?.price || "0");
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
        const cacheHeaders: HeadersInit =
            ttl > 0
                ? { "Cache-Control": `public, max-age=${ttl}` }
                : { "Cache-Control": "no-store" };

        // Fetch only product details by IDs
        if (ids) {
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
                    const product = item as any;
                    // Get variant - handle both possible structures
                    const variant =
                        product.variants?.nodes?.[0] || product.variants?.[0];

                    // Parse prices safely
                    const parsePrice = (price: any): number => {
                        if (!price) {
                            return 0;
                        }

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

            return NextResponse.json(
                {
                    success: true,
                    products: transformedProducts,
                },
                { headers: cacheHeaders },
            );
        }

        if (!productId) {
            return NextResponse.json(
                { error: "Missing productId parameter" },
                { status: 400 },
            );
        }

        const bundles = await findBundlesByProductId(productId, shop);

        if (!bundles?.length) {
            return NextResponse.json({
                success: true,
                bundles: [],
                count: 0,
            });
        }

        const accessToken = await getAccessTokenForShop(shop);
        if (!accessToken) {
            return NextResponse.json(
                { error: "Shop authentication required" },
                { status: 401 },
            );
        }

        const allProductIds = new Set<string>();
        bundles.forEach((b) => {
            if (b.mainProductId) allProductIds.add(b.mainProductId);
            b.bundleProducts?.forEach((bp) =>
                allProductIds.add(bp.productId),
            );
        });

        const allProducts = await fetchProductDetails(
            [...allProductIds],
            shop,
        );
        const productMap = buildProductMap(allProducts);

        const globalPriorityType =
            shopRecord?.appSettings?.bundlePriorityType ?? "index_based";

        let savingsMap: Map<string, number> | null = null;
        if (globalPriorityType === "discount_based") {
            savingsMap = new Map<string, number>();
            bundles.forEach((b) => {
                const bundlePrice =
                    b.bundleProducts?.reduce((sum, bp) => {
                        return (
                            sum +
                            (getPrice(productMap.get(bp.productId))) * bp.quantity
                        );
                    }, 0) || 0;
                const savings = calculateDiscountAmount(
                    bundlePrice,
                    b.discountType || "PERCENTAGE",
                    b.discountValue || 0,
                    b.maxDiscountAmount || 0,
                );
                savingsMap!.set(b.id, savings);
            });
        }

        const sortedBundles = bundles.sort((a, b) => {
            const aScore =
                globalPriorityType === "discount_based"
                    ? (savingsMap?.get(a.id) ?? a.discountValue)
                    : (a.priority ?? 0);
            const bScore =
                globalPriorityType === "discount_based"
                    ? (savingsMap?.get(b.id) ?? b.discountValue)
                    : (b.priority ?? 0);

            if (bScore !== aScore) return bScore - aScore;
            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        });
        const topBundle = sortedBundles[0];

        const transformedProducts =
            topBundle.bundleProducts?.map((bp) => {
                const shopifyProduct = productMap.get(bp.productId) as any;
                const variant = shopifyProduct?.variants?.nodes?.[0];
                const price = variant?.price
                    ? parseFloat(variant.price)
                    : 0;
                const compareAtPrice = variant?.compareAtPrice
                    ? parseFloat(variant.compareAtPrice)
                    : 0;

                // BOGO/BUY_X_GET_Y bundles created before role auto-assignment
                // may have all products stored with the default "INCLUDED" role.
                // Fall back to positional assignment so the widget renders correctly.
                const isBxgy =
                    topBundle.type === "BOGO" || topBundle.type === "BUY_X_GET_Y";
                if (isBxgy) {
                    const hasExplicitRole = transformedProducts.some(
                        (p) => p.role === "TRIGGER" || p.role === "REWARD",
                    );
                    if (!hasExplicitRole) {
                        transformedProducts.forEach((p, index) => {
                            p.role = index === 0 ? "TRIGGER" : "REWARD";
                        });
                    }
                }

                return {
                    id: bp.productId,
                    variantId: bp.variantId || variant?.id || "",
                    quantity: bp.quantity,
                    role: bp.role,
                    displayOrder: bp.displayOrder,
                    isRequired: bp.isRequired,
                    title: shopifyProduct?.title || "Unknown Product",
                    price,
                    compareAtPrice,
                    featuredImage:
                        shopifyProduct?.featuredMedia?.image?.url || null,
                    handle: shopifyProduct?.handle || "",
                    available: variant?.availableForSale ?? true,
                };
            }) || [];

        const transformedBundle = {
            id: topBundle.id,
            name: topBundle.name,
            description: topBundle.description,
            type: topBundle.type,
            discountType: topBundle.discountType,
            discountValue: topBundle.discountValue,
            minOrderValue: topBundle.minOrderValue || 0,
            maxDiscountAmount: topBundle.maxDiscountAmount || 0,
            discountApplication: topBundle.discountApplication || "bundle",
            discountedProductIds: topBundle.discountedProductIds || [],
            freeShipping: topBundle.freeShipping || false,
            status: topBundle.status,
            products: transformedProducts,
            settings: topBundle.settings
                ? {
                      layout: topBundle.settings.layout,
                      theme: topBundle.settings.theme,
                      showImages: topBundle.settings.showImages,
                      showComparePrices:
                          topBundle.settings.showComparePrices,
                      showQuantity: topBundle.settings.showQuantity,
                      showFreeShipping:
                          topBundle.settings.showFreeShipping,
                      showPrices: topBundle.settings.showPrices,
                      showSavings: topBundle.settings.showSavings,
                      enableHyperLink: topBundle.settings.enableHyperLink,
                  }
                : null,
        };

        const activeBundles = transformedBundle.status === "ACTIVE"
            ? [transformedBundle]
            : [];

        return NextResponse.json(
            {
                success: true,
                bundles: activeBundles,
                count: activeBundles.length,
            },
            { headers: cacheHeaders },
        );
    } catch (error) {
        if (
            error instanceof Error &&
            (error as any).digest === "NEXT_PRERENDER_INTERRUPTED"
        ) {
            throw error;
        }
        console.error("Bundle Proxy API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch bundle data" },
            { status: 500 },
        );
    }
}
