/**
 * Loading spinner component
 */
export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
    return (
        <s-stack direction="inline" gap="none" alignItems="center">
            <s-spinner size="base" accessibility-label={label} />
        </s-stack>
    );
}
