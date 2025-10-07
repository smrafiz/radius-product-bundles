import "@testing-library/jest-dom";
import { resetPrismaMock } from "../mocks/prisma/prisma.mock";
import { shopifyMock } from "../mocks/shopify/shopify-graphql.mock";

// Reset mocks before each test
beforeEach(() => {
    resetPrismaMock();
    shopifyMock.reset();
});

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.SHOPIFY_API_KEY = "test-api-key";
process.env.SHOPIFY_API_SECRET = "test-api-secret";
