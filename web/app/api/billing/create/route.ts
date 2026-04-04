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

const CREATE_SUBSCRIPTION_MUTATION = `
mutation CreateAppSubscription($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!) {
    appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems) {
        userErrors {
            field
            message
        }
        appSubscription {
            id
            name
            status
            createdAt
        }
        confirmationUrl
    }
}
`;

interface CreateSubscriptionInput {
    planName: string;
    price: number;
    currencyCode: string;
    interval: "EVERY_30_DAYS" | "ANNUAL";
    returnUrl: string;
    trialDays?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as CreateSubscriptionInput;
        const {
            planName,
            price,
            currencyCode,
            interval,
            returnUrl,
            trialDays,
        } = body;

        // Get shop from auth header or query
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

        // Check if already has active subscription
        const currentSubscriptionId = (shopRecord as any).subscriptionId;
        const currentSubscriptionStatus = (shopRecord as any)
            .subscriptionStatus;

        if (currentSubscriptionId && currentSubscriptionStatus === "ACTIVE") {
            return NextResponse.json(
                { error: "Already has active subscription" },
                { status: 400 },
            );
        }

        const accessToken = await getAccessTokenForShop(shop);
        if (!accessToken) {
            return NextResponse.json(
                { error: "Shop authentication required" },
                { status: 401 },
            );
        }

        const mutation = CREATE_SUBSCRIPTION_MUTATION;
        const result = await executeGraphQLQuery({
            query: mutation,
            variables: {
                name: planName,
                returnUrl: `${returnUrl}?shop=${shop}`,
                lineItems: [
                    {
                        plan: {
                            appRecurringPricingDetails: {
                                price: {
                                    amount: price,
                                    currencyCode: currencyCode,
                                },
                                interval: interval,
                                ...(trialDays && { trialDays: trialDays }),
                            },
                        },
                    },
                ],
            },
            shop,
            accessToken,
        });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return NextResponse.json(
                { error: "Failed to create subscription" },
                { status: 500 },
            );
        }

        const { appSubscriptionCreate } = result.data;
        if (appSubscriptionCreate.userErrors?.length > 0) {
            return NextResponse.json(
                { errors: appSubscriptionCreate.userErrors },
                { status: 400 },
            );
        }

        const subscription = appSubscriptionCreate.appSubscription;
        const confirmationUrl = appSubscriptionCreate.confirmationUrl;

        await prisma.shop.update({
            where: { domain: shop },
            data: {
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionCreatedAt: new Date(subscription.createdAt),
                subscriptionPlan: planName,
            },
        });

        return NextResponse.json({
            subscription: {
                id: subscription.id,
                status: subscription.status,
                createdAt: subscription.createdAt,
            },
            confirmationUrl,
        });
    } catch (error) {
        console.error("[Billing] Error creating subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
