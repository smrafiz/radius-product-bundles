/*
 * Empty State
 */
export function EmptyState({
    heading,
    description,
    image = "/assets/empty.png",
}: {
    heading: string;
    description: string;
    image?: string;
}) {
    return (
        <s-section>
            <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
                <s-box maxInlineSize="200px" maxBlockSize="200px">
                    <s-image
                        aspectRatio="1/1"
                        src={image}
                        alt="No bundles created yet"
                    />
                </s-box>
                <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
                    <s-stack alignItems="center">
                        <s-heading>{heading}</s-heading>
                        <s-paragraph>
                            <span className="mt-2 block text-center">
                                {description}
                            </span>
                        </s-paragraph>
                    </s-stack>
                </s-grid>
            </s-grid>
        </s-section>
    );
}
