import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { recentBundlesQueries } from "@/features/dashboard";

export function useRecentBundles(limit = 5) {
    const app = useAppBridge();
    const queries = recentBundlesQueries(app);
    return useQuery(queries.list(limit));
}
