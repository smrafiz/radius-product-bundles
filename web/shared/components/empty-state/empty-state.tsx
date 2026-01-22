/*
 * Empty State
 */
export function EmptyState({
    heading,
    description,
    image = "/assets/empty.png",
    isSearch = false,
}: {
    heading: string;
    description: string;
    image?: string;
    isSearch?: boolean;
}) {
    return (
        <s-section>
            <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
                <s-box maxInlineSize="200px" maxBlockSize="200px">
                    {isSearch ? (
                        <s-image
                            aspectRatio="1/1"
                            src="data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e"
                            alt="Empty search results"
                        />
                    ) : (
                        <s-image
                            aspectRatio="1/1"
                            src={image}
                            alt="No bundles created yet"
                        />
                    )}
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
