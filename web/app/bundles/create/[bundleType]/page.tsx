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
import { useGlobalBanner } from "@/hooks";

export default function CreateBundlePage({
    params,
}: {
    params: Promise<{ bundleType: BundleType }>;
}) {
    const app = useAppBridge();
    const { bundleType: bundleTypeParam } = use(params);
    const router = useRouter();

    const { setSaving, resetDirty, resetBundle, setNavigating } =
        useBundleStore();
    const { showSuccess, showError } = useGlobalBanner();

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
                // Store success message for one-time display
                showSuccess("Bundle created successfully!", {
                    content:
                        "Your bundle has been created and is ready to go live.",
                    autoHide: true,
                    duration: 4000,
                });

                // Navigate without URL params
                router.push(`/bundles/${result.data.id}/edit`);
            } else {
                console.error("Validation errors:", result.errors);
                showError("Failed to create bundle", {
                    content: "Please check your inputs and try again.",
                });
            }
        } catch (error) {
            console.error("Submit error:", error);
            showError("Unexpected error occurred", {
                content: "Please try again later.",
            });
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
