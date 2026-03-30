import { useAppBridge } from "@shopify/app-bridge-react";
import { type ClientPlanData, planKeys } from "@/shared";
import { fetchPlanData } from "@/shared/actions/plan.actions";

export const planQueries = (app: ReturnType<typeof useAppBridge>) => ({
    data: () => ({
        queryKey: planKeys.data(),
        queryFn: async (): Promise<ClientPlanData> => {
            const token = await app.idToken();
            if (!token) {
                throw new Error("No session token");
            }

            const result = await fetchPlanData(token);
            if (result.status === "success" && result.data) {
                return result.data;
            }

            throw new Error(result.message ?? "Failed to fetch plan data");
        },
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 2,
    }),
});
