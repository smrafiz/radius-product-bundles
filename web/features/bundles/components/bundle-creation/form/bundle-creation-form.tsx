"use client";

import {
    BundleCreationFormProps,
    BundlePreview,
    HorizontalStepIndicator,
    StepContent,
    StepNavigation,
    useBundleFormManager,
} from "@/features/bundles";
import { GlobalBanner, useAppNavigation } from "@/shared";

/**
 * Bundle creation form
 */
export function BundleCreationForm({
    bundleType,
    bundleName,
}: BundleCreationFormProps) {

    const { bundleData } = useAppNavigation();
    // const { bundleData, setBundleData } = useBundleStore();
    // const { setValue } = useBundleFormMethods();

    // const pathname = usePathname();
    // const isEditMode = pathname.includes("/edit");

    // useEffect(() => {
    //     if (!bundleData.type) {
    //         setBundleData({ ...bundleData, type: bundleType });
    //         setValue("type", bundleType);
    //     }
    // }, [bundleType, bundleData, setBundleData, setValue]);

    // const pageProps = isEditMode
    //     ? {
    //           title: `Edit ${bundleName || getBundleProperty(bundleType, "label")}`,
    //           subtitle: "Update your bundle settings and preview changes",
    //           backAction: {
    //               content: "Back to Bundles",
    //               onAction: goBack,
    //           },
    //       }
    //     : {
    //           title: `Create ${getBundleProperty(bundleType, "label")}`,
    //           subtitle:
    //               "Configure your bundle settings and preview the customer experience",
    //           backAction: {
    //               content: "Bundle Selection",
    //               onAction: goBack,
    //           },
    //       };
    //
    // const pageProps = getPageProps();

    const { pageProps, isEditMode } = useBundleFormManager({
        bundleType,
        bundleName,
    });

    return (
        <s-page>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                {isEditMode ? (
                    <s-stack direction="inline" gap="base">
                        <s-stack paddingBlockStart="small-500">
                            <s-button
                                onClick={bundleData.list}
                                icon="arrow-left"
                            ></s-button>
                        </s-stack>
                        <s-stack direction="inline" gap="base" alignItems="center">
                            <s-heading>
                                <div className="text-xl">{`Edit ${bundleName}`}</div>
                            </s-heading>
                            <s-badge tone="info">
                                 {/*{getBundleProperty(bundleType, "label")} */}
                            </s-badge>
                        </s-stack>
                    </s-stack>
                ) : (
                    <s-stack direction="inline" gap="base">
                        <s-stack paddingBlockStart="small-500">
                            <s-button
                                onClick={bundleData.create()}
                                icon="arrow-left"
                            ></s-button>
                        </s-stack>
                        <s-stack>
                            <s-heading>
                                <div className="text-xl">
                                    {/* {`Create ${getBundleProperty(bundleType, "label")}`} */}
                                </div>
                            </s-heading>
                        </s-stack>
                    </s-stack>
                )}

                <s-stack gap="base">
                    {/* Banner */}
                    <GlobalBanner />

                    {/* Horizontal Step Indicator */}
                    <HorizontalStepIndicator />

                    {/* Navigation Buttons */}
                    {/*<StepNavigation />*/}

                    {/* Main Content Section */}
                    <s-box>
                        <s-grid
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap="base"
                        >
                            <s-grid-item gridColumn="span 7" gridRow="span 1">
                                <StepContent />
                            </s-grid-item>

                            <s-grid-item gridColumn="span 5" gridRow="span 1">
                                <BundlePreview bundleType={bundleType} />
                            </s-grid-item>
                        </s-grid>
                    </s-box>
                </s-stack>
            </s-stack>
        </s-page>
    );
}
