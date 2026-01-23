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
                <s-heading>{title}</s-heading>
                <s-text>{description}</s-text>

                {primaryButton && (
                    <s-stack gap="small">
                        {primaryButton.props?.url && (
                            <s-button
                                variant="secondary"
                                tone="auto"
                                icon={icon as any}
                                href={primaryButton.props.url}
                                target={primaryButton.props.external ? "_blank" : "_self"}
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
