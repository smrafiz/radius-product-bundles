import { useEffect, useState } from "react";
import type { CreateBundlePayload } from "@/types";
import { useBundleStore } from "@/stores";

interface LoadBundleOptions {
    bundleId: string;
    fetchBundle: (id: string) => Promise<CreateBundlePayload>; // function to fetch data from API
}

export function useLoadBundle({ bundleId, fetchBundle }: LoadBundleOptions) {
    const setBundleData = useBundleStore((state) => state.setBundleData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!bundleId) return;

        setLoading(true);
        fetchBundle(bundleId)
            .then((data) => {
                setBundleData(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Failed to load bundle:", err);
                setError("Failed to load bundle data.");
            })
            .finally(() => setLoading(false));
    }, [bundleId, fetchBundle, setBundleData]);

    return { loading, error };
}
