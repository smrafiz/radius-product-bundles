"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { settingsQueries } from "@/features/settings/api/settings.queries";
import { useEffect } from "react";
import { useSettingsStore } from "@/features/settings/stores/settings.store";

/**
 * Hook to fetch settings from API
 * ```
 */
export function useSettingsQuery() {
    const app = useAppBridge();
    const queries = settingsQueries(app);
    const { setServerData, setLoading } = useSettingsStore();

    const query = useQuery(queries.detail());

    // Sync with Zustand store
    useEffect(() => {
        if (query.data) {
            setServerData(query.data);
        }
    }, [query.data, setServerData]);

    useEffect(() => {
        setLoading(query.isLoading);
    }, [query.isLoading, setLoading]);

    return query;
}
