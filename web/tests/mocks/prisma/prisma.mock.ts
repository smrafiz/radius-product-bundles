/**
 * Mock Prisma Client for testing.
 * Provides a deep mock of the PrismaClient for unit tests.
 */

import { PrismaClient } from "@/prisma/generated/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

export const prismaMock =
    mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

/**
 * Resets all Prisma mock implementations.
 * Call this in beforeEach to ensure clean test state.
 */
export function resetPrismaMock(): void {
    mockReset(prismaMock);
}

jest.mock("@/shared/repositories/prisma-connect", () => ({
    __esModule: true,
    default: prismaMock,
    prisma: prismaMock,
}));
