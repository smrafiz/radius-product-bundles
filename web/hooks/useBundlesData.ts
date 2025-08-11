import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useBundlesStore } from "@/lib/stores/bundlesStore";
import { getBundleMetrics, getBundles } from "@/actions/bundles.action";

export const useBundlesData = () => {
    const app = useAppBridge();
    const { setBundles, setLoading, setError, showToast } =
        useBundlesStore();

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = await app.idToken();
                const [bundlesResult] = await Promise.all([
                    getBundles(token),
                ]);

                if (!mounted) return;

                if (bundlesResult.status === "success") {
                    setBundles(bundlesResult.data || []);
                } else {
                    const errorMsg =
                        bundlesResult.message || "Failed to load bundles";
                    setError(errorMsg);
                    showToast(errorMsg);
                    setBundles([]);
                }
            } catch (err) {
                if (!mounted) return;
                console.error("Bundles load error:", err);
                const errorMsg = "Failed to load bundle data";
                setError(errorMsg);
                showToast(errorMsg);
                setBundles([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadData();

        return () => {
            mounted = false;
        };
    }, [app, setBundles, setLoading, setError, showToast]);
};
