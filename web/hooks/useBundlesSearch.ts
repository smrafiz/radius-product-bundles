import { useAppBridge } from "@shopify/app-bridge-react";
import { useBundlesStore } from "@/lib/stores/bundlesStore";

export function useBundlesSearch() {
    const app = useAppBridge();
    const { setSearch, debouncedFetchBundles } = useBundlesStore();

    const handleSearchChange = async (value: string) => {
        setSearch(value);
        const token = await app.idToken();
        debouncedFetchBundles(token);
    };

    return { handleSearchChange };
}