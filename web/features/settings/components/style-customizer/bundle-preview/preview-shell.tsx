"use client";

import {
    BundleAddToCart,
    BundleHeader,
    BundlePricing,
    LayoutSidebar,
    PreviewContainer,
    PreviewShellProps,
    usePreviewShell,
} from "@/features/settings";

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

            <div
                ref={scrollRef}
                className="rtpb-preview-scroll"
            >
                <div className="rtpb-blur-top" />
                <PreviewContainer activeDevice={activeDevice} styles={styles} isCartBanner={isCartBanner}>
                    {isCartBanner ? (
                        <Template activeLayout={activeLayout} />
                    ) : (
                        <>
                            <BundleHeader />
                            <Template activeLayout={activeLayout} />
                            <BundlePricing />
                            <BundleAddToCart />
                        </>
                    )}
                </PreviewContainer>
                <div className="rtpb-blur-bottom" />
            </div>
        </div>
    );
}
