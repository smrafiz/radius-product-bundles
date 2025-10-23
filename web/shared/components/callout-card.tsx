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
                <s-stack direction="inline" gap="small-200">
                    <s-icon type={icon as any} />
                    <s-heading>{title}</s-heading>
                </s-stack>

                <s-text>{description}</s-text>

                {primaryButton && (
                    <s-stack gap="small">
                        {primaryButton.props?.url && (
                            <s-link
                                href={primaryButton.props.url}
                                target={
                                    primaryButton.props.external
                                        ? "_blank"
                                        : "_self"
                                }
                            >
                                {primaryButton.content}
                            </s-link>
                        )}
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
