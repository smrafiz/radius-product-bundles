import { Product } from "@/shared";
import {
    GetBundleProductsDocument,
    GetBundleProductsQuery,
} from "@/lib/graphql/generated/graphql";
import { NextRequest, NextResponse } from "next/server";
import { findOfflineSessionByShop } from "@/shared/repositories";
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
        const { searchParams } = request.nextUrl;
        const shop = searchParams.get("shop");
        const productId = searchParams.get("productId");

        if (!shop || !productId) {
            return NextResponse.json(
                { error: "Missing required parameters" },
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
                    const product = item as Product;
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
                        console.log(`Looking for product: ${bp.productId}`); // This should be gid://shopify/Product/xxx
                        const shopifyProduct = productMap.get(bp.productId); // KEY: Make sure this matches exactly
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
                    status: bundle.status,
                    products: transformedProducts,
                    settings: bundle.settings
                        ? {
                              layout: bundle.settings.layout,
                              theme: bundle.settings.theme,
                              position: bundle.settings.position,
                              showPrices: bundle.settings.showPrices,
                              showSavings: bundle.settings.showSavings,
                              enableHyperLink:
                                  bundle.settings.enableHyperLink,
                          }
                        : null,
                };
            }),
        );

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
