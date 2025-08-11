"use client";

import React, { Suspense } from "react";
import { Inter } from "next/font/google";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";
import Navigation from "@/components/shared/Navigation";
import translations from "@shopify/polaris/locales/en.json";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider i18n={translations}>
            <Suspense fallback={null}>
                <Navigation />
            </Suspense>
            <TanstackProvider>
                <SessionProvider>
                    <ProtectedRoute>
                        <div className={inter.className}>{children}</div>
                    </ProtectedRoute>
                </SessionProvider>
            </TanstackProvider>
        </AppProvider>
    );
}
