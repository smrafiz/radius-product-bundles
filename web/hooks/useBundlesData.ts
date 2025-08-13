import { useEffect } from "react";
import { getBundles } from "@/actions/bundles.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useBundlesStore } from "@/lib/stores/bundlesStore";

export const useBundlesData = () => {
    const app = useAppBridge();
    const { fetchBundles, setBundles, setLoading, setError, showToast } =
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

    useEffect(() => {
        let mounted = true;

        const loadBundles = async () => {
            try {
                const token = await app.idToken();
                if (!mounted) return;
                fetchBundles(token);
            } catch (err) {
                console.error("Failed to fetch bundles:", err);
            }
        };

        void loadBundles();

        return () => { mounted = false; };
    }, [app, fetchBundles]);
};
