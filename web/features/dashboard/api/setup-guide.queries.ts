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
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    }),
});
