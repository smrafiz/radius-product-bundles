import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const shop = searchParams.get('shop');

        if (!shop) {
            return NextResponse.json(
                { success: false, error: 'Shop parameter required' },
                { status: 400 }
            );
        }

        const productId = decodeURIComponent(params.productId);
        console.log('Fetching bundles for product:', productId, 'shop:', shop);

        // Find bundles that include this product
        const bundles = await prisma.bundle.findMany({
            where: {
                shop: shop,
                isActive: true,
                bundleProducts: {
                    some: {
                        productId: productId
                    }
                }
            },
            include: {
                bundleProducts: {
                    include: {
                        product: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (bundles.length === 0) {
            return NextResponse.json({
                success: true,
                bundles: []
            });
        }

        // Transform bundles for frontend
        const transformedBundles = await Promise.all(
            bundles.map(async (bundle) => {
                const products = await Promise.all(
                    bundle.bundleProducts.map(async (bp) => {
                        // Fetch additional product data from Shopify if needed
                        const productData = bp.product || await fetchProductFromShopify(bp.productId, shop);

                        return {
                            id: bp.productId,
                            variantId: bp.variantId || `gid://shopify/ProductVariant/${bp.productId.split('/').pop()}`,
                            title: productData?.title || 'Product',
                            image: productData?.image || null,
                            price: bp.price || productData?.price || 0,
                            compareAtPrice: bp.compareAtPrice || productData?.compareAtPrice || null,
                            quantity: bp.quantity,
                            isRequired: bp.isRequired,
                            position: bp.position
                        };
                    })
                );

                return {
                    id: bundle.id,
                    name: bundle.name,
                    description: bundle.description,
                    discountType: bundle.discountType,
                    discountValue: bundle.discountValue,
                    isActive: bundle.isActive,
                    products: products.sort((a, b) => a.position - b.position)
                };
            })
        );

        return NextResponse.json({
            success: true,
            bundles: transformedBundles
        });

    } catch (error) {
        console.error('Bundle API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function fetchProductFromShopify(productId: string, shop: string) {
    // Implement Shopify API call to fetch product data
    // This is a placeholder - implement based on your Shopify API setup
    try {
        // Your Shopify API implementation here
        return null;
    } catch (error) {
        console.error('Error fetching product from Shopify:', error);
        return null;
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}