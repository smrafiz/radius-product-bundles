/**
 * Pricing card types
 */
export interface PricingCardItemInfo {
    id: string;
    title: string;
    description: string;
    features: string[];
    price: string;
    frequency: string;
    primaryButton: {
        content: string;
        loading?: boolean;
        props: {
            variant: "primary" | "secondary";
            external?: boolean;
            disabled?: boolean;
        };
    };
    featuredText?: string;
    onSubscribe?: () => void;
}

/**
 * Pricing faqs types
 */
export interface PricingFaqItemInfo {
    id: string;
    title: string;
    description: string;
}
