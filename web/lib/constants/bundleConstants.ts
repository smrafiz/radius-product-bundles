import { DiscountType } from '@/types';

export const DISCOUNT_TYPES: { label: string; value: DiscountType }[] = [
    { label: 'Percentage', value: 'PERCENTAGE' },
    { label: 'Fixed Amount', value: 'FIXED_AMOUNT' },
    { label: 'Custom Price', value: 'CUSTOM_PRICE' },
    { label: 'Free Shipping', value: 'FREE_SHIPPING' },
    { label: 'No Discount', value: 'NO_DISCOUNT' },
];

export const WIDGET_LAYOUTS = [
    { label: 'Horizontal Layout', value: 'horizontal' as const, description: 'Products displayed side by side' },
    { label: 'Vertical Layout', value: 'vertical' as const, description: 'Products stacked vertically' },
    { label: 'Grid Layout', value: 'grid' as const, description: 'Products in a responsive grid' },
];

export const WIDGET_POSITIONS = [
    { label: 'Above Add to Cart', value: 'above_cart' as const },
    { label: 'Below Add to Cart', value: 'below_cart' as const },
    { label: 'In Product Description', value: 'description' as const },
    { label: 'Custom Position', value: 'custom' as const },
];

export const COLOR_THEMES = [
    { label: 'Brand', value: 'brand' as const, background: 'bg-fill-brand' },
    { label: 'Success', value: 'success' as const, background: 'bg-fill-success' },
    { label: 'Warning', value: 'warning' as const, background: 'bg-fill-warning' },
    { label: 'Critical', value: 'critical' as const, background: 'bg-fill-critical' },
];

export const BUNDLE_STEPS = [
    { number: 1, title: 'Products', description: 'Select products for your bundle' },
    { number: 2, title: 'Configuration', description: 'Set up discount rules and behavior' },
    { number: 3, title: 'Display', description: 'Customize appearance and layout' },
    { number: 4, title: 'Review', description: 'Review and publish your bundle' },
];

export const VALIDATION_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_DISCOUNT_VALUE: 'Discount value must be greater than 0',
    INVALID_PERCENTAGE: 'Percentage discount cannot exceed 100%',
    NEGATIVE_VALUE: 'Value cannot be negative',
    NO_PRODUCTS_SELECTED: 'At least one product must be selected',
    INVALID_MIN_ORDER: 'Minimum order value must be greater than 0',
    INVALID_MAX_DISCOUNT: 'Maximum discount amount must be greater than 0',
} as const;