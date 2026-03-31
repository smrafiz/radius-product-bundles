"use client";

import { PreviewShellProps, usePreviewShell } from "@/features/settings";
import { useSettingsStore } from "@/features/settings/stores/settings.store";
import { LayoutSidebar } from "./layout-sidebar";
import { PreviewContainer } from "./preview-container";
import { BundleWidget } from "@/shared";
import {
    DEFAULT_DISPLAY_OPTIONS,
    PLACEHOLDER_PRICING,
    PREVIEW_LABELS,
} from "@/shared/constants/bundle-widget.constants";

import "@/styles/components/bundle.css";

export function PreviewShell({ bundleType, scrollRef }: PreviewShellProps) {
    const {
        activeLayout,
        activeDevice,
        styles,
        layouts,
        heading,
        Template,
        isCartBanner,
        isLayoutLocked,
        setActiveLayout,
    } = usePreviewShell(bundleType);

    const serverData = useSettingsStore((s) => s.serverData);
    const savedLabels = serverData?.labels as
        | Record<string, string>
        | undefined;
    const previewLabels = {
        ...PREVIEW_LABELS,
        ...Object.fromEntries(
            Object.entries(savedLabels ?? {}).filter(([, val]) => val !== ""),
        ),
    };

    return (
        <div className="rtpb-preview-shell">
            <LayoutSidebar
                layouts={layouts}
                activeLayout={activeLayout}
                onLayoutChange={setActiveLayout}
                primaryColor={styles.primaryColor}
                bundleType={bundleType}
                heading={heading}
                isLayoutLocked={isLayoutLocked}
            />

            <div ref={scrollRef} className="rtpb-preview-scroll">
                <div className="rtpb-blur-top" />
                <PreviewContainer
                    activeDevice={activeDevice}
                    activeLayout={activeLayout}
                    styles={styles}
                    isCartBanner={isCartBanner}
                >
                    {isCartBanner ? (
                        <Template
                            activeLayout={activeLayout}
                            activeDevice={activeDevice}
                        />
                    ) : (
                        <BundleWidget
                            styles={styles}
                            displayOptions={DEFAULT_DISPLAY_OPTIONS}
                            pricing={PLACEHOLDER_PRICING}
                            labels={previewLabels}
                            hideFooter={
                                bundleType === "BOGO" ||
                                bundleType === "BUY_X_GET_Y"
                            }
                            hideHeader={
                                bundleType === "BOGO" ||
                                bundleType === "BUY_X_GET_Y"
                            }
                            hideOriginalPrice={
                                activeLayout === "COMPACT" &&
                                bundleType === "FIXED_BUNDLE"
                            }
                        >
                            <Template
                                activeLayout={activeLayout}
                                activeDevice={activeDevice}
                            />
                        </BundleWidget>
                    )}
                </PreviewContainer>
                <div className="rtpb-blur-bottom" />
            </div>
        </div>
    );
}
