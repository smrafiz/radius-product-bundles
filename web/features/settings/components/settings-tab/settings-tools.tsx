"use client";

export function SettingsTools() {

    return (
        <s-stack>
            <s-section heading="Tools">
                <s-stack
                    gap="none"
                    border="base"
                    borderRadius="base"
                    overflow="hidden"
                >
                    <s-box padding="small-100">
                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="center"
                            gap="base"
                        >
                            <s-box>
                                <s-heading>Reset app settings</s-heading>
                                <s-paragraph color="subdued">
                                    Reset all settings to their default values. This action
                                    cannot be undone.
                                </s-paragraph>
                            </s-box>
                            <s-button tone="critical">Reset</s-button>
                        </s-grid>
                    </s-box>
                    <s-box paddingInline="small-100">
                        <s-divider />
                    </s-box>

                    <s-box padding="small-100">
                        <s-grid
                            gridTemplateColumns="1fr auto"
                            alignItems="center"
                            gap="base"
                        >
                            <s-box>
                                <s-heading>Export settings</s-heading>
                                <s-paragraph color="subdued">
                                    Download a backup of all your current settings.
                                </s-paragraph>
                            </s-box>
                            <s-button>Export</s-button>
                        </s-grid>
                    </s-box>
                </s-stack>
            </s-section>
        </s-stack>
    );
}
