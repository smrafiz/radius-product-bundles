"use client";


import { ErrorCard } from "@/app/(dashboard)/dashboard/_components";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="p-8">
            <ErrorCard error={error.message} onRetry={reset} />
        </div>
    );
}
