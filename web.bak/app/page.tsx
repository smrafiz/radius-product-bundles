"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardSkeleton } from "@/components/shared/Skeletons";

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
