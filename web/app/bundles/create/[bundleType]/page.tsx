"use client";

import { use } from "react";
import { bundleTypeMap } from "@/utils";
import { useBundleStore } from "@/stores";
import { GlobalForm } from "@/components";
import { notFound } from "next/navigation";
import { BundleFormProvider } from "./_components/form/BundleFormProvider";
import { BundleCreationForm } from "@/bundles/create/[bundleType]/_components/form";
import { useGlobalForm } from "@/hooks/bundle/useGlobalForm";

import type { BundleType } from "@/types";

interface Props {
    params: Promise<{ bundleType: string }>;
}

export default function BundleCreationPage({ params }: Props) {
    const { bundleType: bundleTypeParam } = use(params);
    const bundleType = bundleTypeMap[bundleTypeParam] as BundleType;

    if (!bundleType) {
        notFound();
    }

    const resetDirty = useBundleStore((s) => s.resetDirty);
    const { handleGlobalFormSubmit } = useGlobalForm(bundleType);

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
