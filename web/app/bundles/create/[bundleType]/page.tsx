"use client";

import { use } from "react";
import {
    BundleCreationForm,
    BundleFormProvider,
} from "@/bundles/create/[bundleType]/_components/form";
import { useBundleStore } from "@/stores";
import { createBundle } from "@/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { BundleType } from "@/types";
import { BundleFormData } from "@/lib/validation";
import { GlobalForm } from "@/components";
import { bundleTypeMap } from "@/utils";
import { useRouter } from "next/navigation";

export default function CreateBundlePage({
    params,
}: {
    params: Promise<{ bundleType: BundleType }>;
}) {
    const app = useAppBridge();
    const { bundleType: bundleTypeParam } = use(params);
    const { setSaving, resetDirty, resetBundle, setNavigating } = useBundleStore();
    const router = useRouter();

    const bundleType = bundleTypeMap[bundleTypeParam] as BundleType;

    console.log("=== CREATE PAGE DEBUG ===");
    console.log("bundleType from params:", bundleType);
    console.log("typeof bundleType:", typeof bundleType);
    console.log("========================");

    const handleSubmit = async (data: BundleFormData) => {
        setSaving(true);

        try {
            const token = await app.idToken();
            const result = await createBundle(token, {
                ...data,
                type: bundleType,
            });

            if (result.status === "success") {
                console.log("Bundle created successfully:", result);
                // Next.js will automatically show loading.tsx during navigation
                router.push(`/bundles/${result.data.id}/edit?success=created`);
            } else {
                console.error("Validation errors:", result.errors);
            }
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <BundleFormProvider bundleType={bundleType}>
            <GlobalForm
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                discardPath="/bundles"
            >
                <BundleCreationForm bundleType={bundleType} />
            </GlobalForm>
        </BundleFormProvider>
    );
}
