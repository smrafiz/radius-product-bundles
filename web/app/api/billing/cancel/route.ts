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

const CANCEL_SUBSCRIPTION_MUTATION = `
mutation CancelAppSubscription($id: ID!) {
    appSubscriptionCancel(id: $id) {
        userErrors {
            field
            message
        }
        appSubscription {
            id
            status
        }
    }
}
`;

export async function POST(request: NextRequest) {
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

        const currentSubscriptionId = (shopRecord as any).subscriptionId;
        if (!currentSubscriptionId) {
            return NextResponse.json(
                { error: "No active subscription found" },
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

        const result = await executeGraphQLQuery({
            query: CANCEL_SUBSCRIPTION_MUTATION,
            variables: { id: currentSubscriptionId },
            shop,
            accessToken,
        });

        if (result.errors) {
            console.error("[Billing] GraphQL errors:", result.errors);
            return NextResponse.json(
                { error: "Failed to cancel subscription" },
                { status: 500 },
            );
        }

        const { appSubscriptionCancel } = result.data;
        if (appSubscriptionCancel.userErrors?.length > 0) {
            return NextResponse.json(
                { errors: appSubscriptionCancel.userErrors },
                { status: 400 },
            );
        }

        await prisma.shop.update({
            where: { domain: shop },
            data: {
                subscriptionStatus: "CANCELLED",
                subscriptionUpdatedAt: new Date(),
            },
        });

        return NextResponse.json({
            subscription: appSubscriptionCancel.appSubscription,
        });
    } catch (error) {
        console.error("[Billing] Error cancelling subscription:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
