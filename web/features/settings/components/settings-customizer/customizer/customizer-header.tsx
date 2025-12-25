export function CustomizerHeader() {
    return (
        <s-section>
            <s-stack
                direction="inline"
                alignItems="center"
                justifyContent="space-between"
            >
                <s-stack>
                    <s-heading>Bundle type</s-heading>
                </s-stack>
                <s-stack>
                    <s-button-group gap="none">
                        <s-button slot="secondary-actions">Desktop</s-button>
                        <s-button slot="secondary-actions">Tablet</s-button>
                        <s-button slot="secondary-actions">Mobile</s-button>
                    </s-button-group>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
