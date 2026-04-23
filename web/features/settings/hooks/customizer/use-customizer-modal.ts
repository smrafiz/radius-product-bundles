"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { settingsQueries, useSettingsStore } from "@/features/settings";

export function useCustomizerModal() {
    const app = useAppBridge();
    const queryClient = useQueryClient();
    const queries = settingsQueries(app);
    const appWindowRef = useRef<HTMLElement>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleClose = useCallback(() => {
        setIsSyncing(true);
        queryClient
            .fetchQuery({ ...queries.detail(), staleTime: 0 })
            .then((freshData) => {
                if (freshData) {
                    useSettingsStore.getState().setServerData(freshData);
                }
            })
            .finally(() => setIsSyncing(false));
    }, [queryClient, queries]);

    const handleCloseRef = useRef(handleClose);
    handleCloseRef.current = handleClose;

    useEffect(() => {
        const appWindow = appWindowRef.current;

        if (!appWindow) {
            return;
        }

        const handler = () => {
            handleCloseRef.current();
        };

        appWindow.addEventListener("hide", handler);

        return () => {
            appWindow.removeEventListener("hide", handler);
        };
    }, []);

    return {
        appWindowRef,
        isSyncing,
    };
}
