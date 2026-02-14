import { MediaCardProps } from "@/shared";

export function MediaCard({
    title,
    description,
    buttonLabel,
    buttonHref,
    onButtonClick,
    icon,
}: MediaCardProps) {
    return (
        <s-section>
            <s-grid
                gap="base"
                gridTemplateColumns={icon ? "1fr auto" : "1fr"}
                alignItems="center"
                justifyContent="space-between"
            >
                <s-stack gap="base">
                    <s-stack gap="small-300">
                        <s-heading>{title}</s-heading>
                        <s-text>{description}</s-text>
                    </s-stack>
                    {buttonLabel && (
                        <s-button
                            variant="secondary"
                            tone="auto"
                            {...(buttonHref
                                ? { href: buttonHref, target: "_blank" }
                                : {})}
                            {...(onButtonClick
                                ? { onClick: onButtonClick }
                                : {})}
                        >
                            {buttonLabel}
                        </s-button>
                    )}
                </s-stack>

                {icon && <s-stack>{icon}</s-stack>}
            </s-grid>
        </s-section>
    );
}
