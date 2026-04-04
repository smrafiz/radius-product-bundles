import { NextRequest, NextResponse } from "next/server";
import { getShop } from "@/shared/repositories/shop.queries";
import { findOfflineSessionByShop, prisma } from "@/shared/repositories";
import { executeGraphQLQuery } from "@/lib/graphql/client";

async function getAccessTokenForShop(shop: string): Promise<string | null> {
    try {
        const session = await findOfflineSessionByShop(shop);
        return session?.accessToken || null;
    } catch (error) {
        console.error(
            `[Billing] Failed to get access token for ${shop}:`,
            error,
        );
        return null;
    }
}

const GET_SUBSCRIPTION_QUERY = `
query GetActiveSubscription {
    currentAppInstallation {
        activeSubscriptions {
            id
            name
            status
            createdAt
            trialDays
            lineItems {
                id
                plan {
                    pricingDetails {
                        ... on AppRecurringPricing {
                            price {
                                amount
                                currencyCode
                            }
                            interval
                        }
                    }
                }
            }
        }
    }
}
`;

export async function GET(request: NextRequest) {
    try {
        const shop = request.headers.get("x-shop-domain");

        if (!shop) {
            return NextResponse.json(
                { error: "Missing shop domain" },
                { status: 400 },
            );
        }

        const shopRecord = await getShop(shop);
        if (!shopRecord) {
            return NextResponse.json(
                { error: "Shop not found" },
                { status: 404 },
            );
        }

        const accessToken = await getAccessTokenForShop(shop);
        if (!accessToken) {
            return NextResponse.json(
                { error: "Shop authentication required" },
                { status: 401 },
            );
        }

        const result = await executeGraphQLQuery({
            query: GET_SUBSCRIPTION_QUERY,
            variables: {},
            shop,
            accessToken,
        });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return NextResponse.json(
                { error: "Failed to fetch subscription" },
                { status: 500 },
            );
        }

        const subscriptions =
            result.data?.currentAppInstallation?.activeSubscriptions || [];

        if (subscriptions.length === 0) {
            return NextResponse.json({
                subscription: null,
                status: "NO_SUBSCRIPTION",
            });
        }

        const sub = subscriptions[0];
        const lineItem = sub.lineItems?.[0];
        const pricing = lineItem?.plan?.pricingDetails;

        return NextResponse.json({
            subscription: {
                id: sub.id,
                name: sub.name,
                status: sub.status,
                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt,
                trialDays: sub.trialDays,
                price: pricing?.price?.amount,
                currencyCode: pricing?.price?.currencyCode,
                interval: pricing?.interval,
            },
            status: sub.status,
        });
    } catch (error) {
        console.error("[Billing] Error fetching subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
