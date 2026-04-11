import { useAppBridge } from "@shopify/app-bridge-react";
import { SetupGuideData, setupGuideKeys } from "@/features/dashboard";
import { getSetupGuideAction } from "@/features/dashboard/actions/setup-guide.action";

export const setupGuideQueries = (app: ReturnType<typeof useAppBridge>) => ({
    progress: () => ({
        queryKey: setupGuideKeys.progress(),
        queryFn: async (): Promise<SetupGuideData> => {
            const token = await app.idToken();
            const result = await getSetupGuideAction(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data!;
        },
        // 5 min client-side stale time — the server action uses `use cache`
        // with a 10 min TTL so repeat fetches within that window are instant.
        // Step mutations and dismiss call invalidateSetupGuideCache + invalidate
        // the React Query key, so freshness is maintained on writes.
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    }),
});
