"use client";

import { ReactNode } from "react";
import { useSettingsQuery } from "@/features/settings";

/**
 * Loads app settings at app initialization.
 */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
    useSettingsQuery();

    return <>{children}</>;
}
