"use client";

export function DashboardBuilderAddons() {
    return (
        <s-section>
            <s-grid
                gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                gap="base"
                alignItems="center"
            >
                {/* LEFT SIDE: Video Thumbnail */}
                <s-grid-item gridColumn="auto">
                    <img
                        className="rounded-md w-full object-cover"
                        alt="Builder Addons"
                        src="/assets/shopbuilder.jpg"
                    />
                </s-grid-item>
                {/* RIGHT SIDE: Info */}
                <s-grid-item gridColumn="auto">
                    <s-stack gap="small">
                        <s-heading>
                            ShopBuilder – Elementor WooCommerce Builder Addons
                        </s-heading>
                        <s-text>
                            WooCommerce unknown printer took a galley of type
                            and scrambled make a type specimen book. It has
                            survived not only five centuries typesetting,
                            remaining essentially
                        </s-text>
                        <s-button
                            variant="secondary"
                            tone="auto"
                            onClick={() => {
                                console.log("clicked");
                            }}
                        >
                            See details
                        </s-button>
                    </s-stack>
                </s-grid-item>
            </s-grid>
        </s-section>
    );
}
