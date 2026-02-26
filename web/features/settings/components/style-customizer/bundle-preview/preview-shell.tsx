"use client";

import { PreviewShellProps, usePreviewShell } from "@/features/settings";
import { LayoutSidebar } from "./layout-sidebar";
import { PreviewContainer } from "./preview-container";
import { BundleWidget } from "@/shared";
import {
    DEFAULT_DISPLAY_OPTIONS,
    PLACEHOLDER_PRICING,
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
        setActiveLayout,
    } = usePreviewShell(bundleType);

    return (
        <div className="rtpb-preview-shell">
            <LayoutSidebar
                layouts={layouts}
                activeLayout={activeLayout}
                onLayoutChange={setActiveLayout}
                primaryColor={styles.primaryColor}
                bundleType={bundleType}
                heading={heading}
            />

            <div ref={scrollRef} className="rtpb-preview-scroll">
                <div className="rtpb-blur-top" />
                <PreviewContainer
                    activeDevice={activeDevice}
                    styles={styles}
                    isCartBanner={isCartBanner}
                >
                    {isCartBanner ? (
                        <Template activeLayout={activeLayout} />
                    ) : (
                        <BundleWidget
                            styles={styles}
                            displayOptions={DEFAULT_DISPLAY_OPTIONS}
                            pricing={PLACEHOLDER_PRICING}
                            hideFooter={bundleType === "BOGO" || bundleType === "BUY_X_GET_Y"}
                            hideHeader={bundleType === "BOGO" || bundleType === "BUY_X_GET_Y"}
                        >
                            <Template activeLayout={activeLayout} />
                        </BundleWidget>
                    )}
                </PreviewContainer>
                <div className="rtpb-blur-bottom" />
            </div>
        </div>
    );
}
