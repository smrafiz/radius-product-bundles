import { ReactElement } from "react";
import { AppProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Create a new QueryClient for each test
 */
function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

/**
 * Mock App Bridge config for v4
 */
const mockAppConfig = {
    apiKey: process.env.SHOPIFY_API_KEY || "test-api-key",
    host: btoa("test-shop.myshopify.com/admin"), // v4 uses btoa instead of Buffer
};

/**
 * Mock shopify object for App Bridge v4
 */
const mockShopify = {
    environment: {
        mobile: false,
        pos: false,
        embedded: true,
    },
    idToken: () => Promise.resolve("mock-id-token"),
    sessionToken: () => Promise.resolve("mock-session-token"),
    config: mockAppConfig,
};

interface AllProvidersProps {
    children: React.ReactNode;
}

/**
 * Wrapper with all necessary providers for testing
 */
function AllProviders({ children }: AllProvidersProps) {
    const queryClient = createTestQueryClient();

    return (
        <AppProvider i18n={translations}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </AppProvider>
    );
}

/**
 * Custom render function that includes all providers
 */
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { customRender as render };

/**
 * Mock useAppBridge hook for testing
 */
export const mockUseAppBridge = () => mockShopify;

/**
 * Wait for async operations to complete
 */
export const waitForLoadingToFinish = () =>
    new Promise((resolve) => setTimeout(resolve, 0));
