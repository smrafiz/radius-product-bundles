"use client";

import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { checkWidgetBlockStatusAction } from "@/features/dashboard/actions/widget-block-status.action";

export function useWidgetStatus({
    shopDomain,
    apiKey,
}: {
    shopDomain: string;
    apiKey: string;
}) {
    const app = useAppBridge();
    const [isBlockActive, setIsBlockActive] = useState<boolean | null>(null);

    useEffect(() => {
        if (!app || !shopDomain) return;

        app.idToken().then((token) => {
            checkWidgetBlockStatusAction(token).then((result) => {
                setIsBlockActive(
                    result.status === "success" ? (result.data ?? false) : false,
                );
            });
        });
    }, [app, shopDomain]);

    const themeEditorUrl =
        shopDomain && apiKey
            ? `https://${shopDomain}/admin/themes/current/editor?template=product&addAppBlockId=${apiKey}/app-block&target=newAppsSection`
            : null;

    return {
        isBlockActive,
        isChecking: isBlockActive === null,
        themeEditorUrl,
    };
}
