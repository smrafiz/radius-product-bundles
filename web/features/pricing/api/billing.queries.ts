import {
    billingQueryKeys,
    type BillingStatusResponse,
} from "@/features/pricing";
import { queryOptions } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

async function fetchBillingStatus(
    sessionToken: string,
): Promise<BillingStatusResponse> {
    const res = await fetch("/api/billing/status", {
        headers: { Authorization: `Bearer ${sessionToken}` },
    });
    if (!res.ok) {
        throw new Error(`Billing status fetch failed: ${res.status}`);
    }
    return (await res.json()) as Promise<BillingStatusResponse>;
}

export function billingQueries(app: ReturnType<typeof useAppBridge>) {
    return {
        status: () =>
            queryOptions({
                queryKey: billingQueryKeys.status(),
                queryFn: async () => {
                    const token = await app.idToken();
                    return fetchBillingStatus(token);
                },
                staleTime: 30_000,
                gcTime: 60_000,
                refetchOnWindowFocus: false,
            }),
    };
}
