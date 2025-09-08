import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useDashboardStore } from "@/stores";
import { getBundleMetrics, getBundles } from "@/actions";

export const useDashboardData = () => {
    const app = useAppBridge();
    const { setBundles, setMetrics, setLoading, setError, showToast } =
        useDashboardStore();

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = await app.idToken();
                const [bundlesResult, metricsResult] = await Promise.all([
                    getBundles(token),
                    getBundleMetrics(token),
                ]);

                if (!mounted) return;

                if (bundlesResult.status === "success") {
                    setBundles(bundlesResult.data || []);
                } else {
                    setError(bundlesResult.message || "Failed to load bundles");
                    showToast(
                        bundlesResult.message || "Failed to load bundles",
                    );
                }

                if (metricsResult.status === "success") {
                    const data = metricsResult.data;
                    setMetrics({
                        totalRevenue: data.totals?.revenue || 0,
                        revenueAllTime: data.totals?.revenueAllTime || 0,
                        totalViews: data.totals?.views || 0,
                        avgConversionRate: data.metrics?.conversionRate || 0,
                        totalBundles: data?.totals?.totalBundles || 0,
                        activeBundles: data?.totals?.activeBundles || 0,
                        revenueGrowth: data.growth?.revenue || 0,
                        conversionGrowth: data.growth?.conversion || 0,
                    });
                } else {
                    setMetrics({
                        totalRevenue: 0,
                        revenueAllTime: 0,
                        totalViews: 0,
                        avgConversionRate: 0,
                        totalBundles: 0,
                        activeBundles: 0,
                        revenueGrowth: 0,
                        conversionGrowth: 0,
                    });
                }
            } catch (err) {
                if (!mounted) return;
                console.error("Dashboard load error:", err);
                setError("Failed to load dashboard data");
                showToast("Failed to load dashboard data");
                setBundles([]);
                setMetrics({
                    totalRevenue: 0,
                    revenueAllTime: 0,
                    totalViews: 0,
                    avgConversionRate: 0,
                    totalBundles: 0,
                    activeBundles: 0,
                    revenueGrowth: 0,
                    conversionGrowth: 0,
                });
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadData();

        return () => {
            mounted = false;
        };
    }, [app, setBundles, setMetrics, setLoading, setError, showToast]);
};
