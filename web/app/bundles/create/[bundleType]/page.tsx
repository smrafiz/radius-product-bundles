"use client";

import React from "react";
import { bundleTypeMap } from "@/utils";
import { useBundleStore } from "@/stores";
import { GlobalForm } from "@/components";
import { notFound } from "next/navigation";
import { BundleFormProvider } from "./_components/form/BundleFormProvider";
import { BundleCreationForm } from "@/bundles/create/[bundleType]/_components/form";
import { useBundleFormWithGlobalForm } from "@/hooks/bundle/useBundleFormWithGlobalForm";

import type { BundleType } from "@/types";

interface Props {
    params: Promise<{ bundleType: string }>;
}

export default function BundleCreationPage({ params }: Props) {
    const { bundleType: bundleTypeParam } = React.use(params);
    const bundleType = bundleTypeMap[bundleTypeParam] as BundleType;

    if (!bundleType) {
        notFound();
    }

    const resetDirty = useBundleStore((s) => s.resetDirty);
    const { handleGlobalFormSubmit } = useBundleFormWithGlobalForm(bundleType);

    return (
        <BundleFormProvider bundleType={bundleType}>
            <GlobalForm
                onSubmit={handleGlobalFormSubmit}
                resetDirty={resetDirty}
                discardPath={"/bundles/create"}
            >
                <BundleCreationForm bundleType={bundleType} />
            </GlobalForm>
        </BundleFormProvider>
    );
}