"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { settingsQueries } from "@/features/settings/api/settings.queries";

export function useLocales() {
    const app = useAppBridge();
    const queries = settingsQueries(app);

    return useQuery(queries.locales());
}
