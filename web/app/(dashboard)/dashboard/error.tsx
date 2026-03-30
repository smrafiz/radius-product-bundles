"use client";

import { FeatureError } from "@/shared/components/feedback/feature-error";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return <FeatureError error={error} reset={reset} />;
}
