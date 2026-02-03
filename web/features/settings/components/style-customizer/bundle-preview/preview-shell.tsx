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

export function PreviewShell({ bundleType }: PreviewShellProps) {
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
        <div className="md:flex border border-gray-200 rounded-xl overflow-hidden min-h-75">
            <LayoutSidebar
                layouts={layouts}
                activeLayout={activeLayout}
                onLayoutChange={setActiveLayout}
                primaryColor={styles.primaryColor}
                bundleType={bundleType}
                heading={heading}
            />

            <PreviewContainer activeDevice={activeDevice} styles={styles}>
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
        </div>
    );
}
