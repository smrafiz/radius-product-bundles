"use client";

import { Inter } from "next/font/google";
import { ReactNode, Suspense } from "react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";
import Navigation from "@/components/shared/Navigation";
import { DehydratedState } from "@tanstack/react-query";
import translations from "@shopify/polaris/locales/en.json";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export default function Providers({ children, dehydratedState }: { children: ReactNode, dehydratedState?: DehydratedState | null }) {
    return (
        <AppProvider i18n={translations}>
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            <TanstackProvider dehydratedState={dehydratedState}>
                <SessionProvider>
                    <ProtectedRoute>
                        <div className={inter.className}>{children}</div>
                    </ProtectedRoute>
                </SessionProvider>
            </TanstackProvider>
        </AppProvider>
    );
}
