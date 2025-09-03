"use client";

import React from "react";
import { bundleTypeMap } from "@/utils";
import { useBundleStore } from "@/stores";
import { GlobalForm } from "@/components";
import { notFound } from "next/navigation";
import { BundleCreationForm } from "@/bundles/create/[bundleType]/_components/form";

interface Props {
    params: Promise<{ bundleType: string }>;
}

export default function BundleCreationPage({ params }: Props) {
    const { bundleType: bundleTypeParam } = React.use(params);
    const bundleType = bundleTypeMap[bundleTypeParam];

    if (!bundleType) {
        notFound();
    }

    const bundleData = useBundleStore((s) => s.bundleData);
    const resetDirty = useBundleStore((s) => s.resetDirty);

    const handleSubmit = () => {
        console.log("Submitted bundle data:", bundleData);
    };

    return (
        <GlobalForm
            onSubmit={handleSubmit}
            resetDirty={resetDirty}
            discardPath={"/bundles/create"}
        >
            <BundleCreationForm bundleType={bundleType} />
        </GlobalForm>
    );
}
