"use client";

import { useEffect } from "react";
import { DashboardSkeleton } from "@/shared";
import { useRouter, useSearchParams } from "next/navigation";

/*
 * Root Page
 */
export default function RootPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        const dashboardUrl = params ? `/dashboard?${params}` : "/dashboard";

        router.replace(dashboardUrl);
    }, [router, searchParams]);

    return <DashboardSkeleton />;
}
