import { POST } from "../confirm/route";
import { NextRequest } from "next/server";

jest.mock("@/app/api/billing/billing-auth", () => ({
    authenticateBillingRequest: jest.fn().mockRejectedValue(new Error("Unauthorized")),
}));
jest.mock("@/features/pricing/services/subscription.service", () => ({
    confirmSubscriptionService: jest.fn(),
    getAccessTokenForShop: jest.fn(),
    BillingError: class BillingError extends Error {
        constructor(
            msg: string,
            public code: string,
        ) {
            super(msg);
        }
    },
}));

it("returns 401 when no valid session token", async () => {
    const req = new NextRequest("http://localhost/api/billing/confirm", {
        method: "POST",
        body: JSON.stringify({ chargeId: "gid://shopify/AppSubscription/123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
});
