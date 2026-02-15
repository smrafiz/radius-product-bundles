import { CalloutCardProps } from "@/shared";

export function CalloutCard({
    title,
    icon,
    description,
    primaryButton = null,
}: CalloutCardProps) {
    return (
        <s-section>
            <s-stack gap="small">
                <s-stack gap="small-300">
                    <s-heading>{title}</s-heading>
                    <s-text>{description}</s-text>
                </s-stack>

                {primaryButton && (
                    <s-stack>
                        {primaryButton.props?.url && (
                            <s-button
                                variant="secondary"
                                tone="auto"
                                icon={icon as any}
                                href={primaryButton.props.url}
                                target={
                                    primaryButton.props.external
                                        ? "_blank"
                                        : "_self"
                                }
                            >
                                {primaryButton.content}
                            </s-button>
                        )}
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
