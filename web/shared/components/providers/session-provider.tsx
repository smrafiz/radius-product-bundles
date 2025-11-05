"use client";

import { ReactNode } from "react";
import { useSessionProvider } from "@/shared";

export function SessionProvider({ children }: { children: ReactNode }) {
    useSessionProvider();
    return <>{children}</>;
}
