import "@testing-library/jest-dom";
import { resetPrismaMock } from "../mocks/prisma/prisma.mock";
import { shopifyMock } from "../mocks/shopify/shopify-graphql.mock";

jest.mock("zustand", () => {
    const createStore = () => ({
        getState: () => ({}),
        setState: jest.fn(),
        subscribe: jest.fn(),
    });
    return {
        __esModule: true,
        default: createStore,
        create: createStore,
    };
});

jest.mock("@/features/analytics", () => ({}));
jest.mock("@/features/settings", () => ({}));
jest.mock("@/features/bundles/repositories", () => ({}));
jest.mock("@/features/bundles/api", () => ({}));
jest.mock("@/features/bundles/services", () => ({}));
jest.mock("@/features/bundles/actions", () => ({}));

jest.mock("@/shared/repositories/prisma-connect", () => ({
    prisma: {},
}));

jest.mock("@/lib/shopify/setup/ensure-setup", () => ({}));
jest.mock("@/lib/shopify", () => ({}));

jest.mock("zod", () => {
    const chainable = () => ({
        optional: () => chainable(),
        regex: () => chainable(),
        default: () => chainable(),
    });
    return {
        __esModule: true,
        default: {
            string: () => chainable(),
            number: () => chainable(),
            boolean: () => chainable(),
            object: () => chainable(),
            enum: () => chainable(),
            nativeEnum: () => chainable(),
        },
        object: () => chainable(),
        enum: () => chainable(),
        string: () => chainable(),
        number: () => chainable(),
        boolean: () => chainable(),
        nativeEnum: () => chainable(),
    };
});

jest.mock("@/features/dashboard", () => ({}));
jest.mock("@/features/bundles/hooks/form", () => ({}));
jest.mock("@/features/bundles/hooks", () => ({}));
jest.mock("@/features/bundles/services", () => ({}));
jest.mock("@/features/bundles/stores", () => ({}));
jest.mock("@/features/bundles/types", () => ({}));
jest.mock("@/features/bundles/components", () => ({}));
jest.mock("@/features/settings/constants", () => ({
    getDefaultValuesFromConfig: () => ({}),
}));

jest.mock("@/shared/constants", () => ({}));

jest.mock("@/shared/stores", () => ({}));
jest.mock("@/shared/types", () => ({}));

jest.mock("isomorphic-dompurify", () => ({
    sanitize: (dirty: string) => dirty,
}));

beforeEach(() => {
    resetPrismaMock();
    shopifyMock.reset();
});

process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.SHOPIFY_API_KEY = "test-api-key";
process.env.SHOPIFY_API_SECRET = "test-api-secret";
process.env.HOST = "http://localhost:3000";
process.env.SCOPES = "read_products,write_products";
