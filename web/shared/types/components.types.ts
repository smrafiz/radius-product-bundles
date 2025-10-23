export interface CalloutButtonProps {
    content: string;
    props?: {
        url?: string;
        external?: boolean;
    };
    tone?:
        | "success"
        | "info"
        | "critical"
        | "warning"
        | "auto"
        | "neutral"
        | "caution"
        | undefined;
}

export interface CalloutCardProps {
    title: string;
    icon: string;
    description: string;
    primaryButton?: CalloutButtonProps | null;
}
