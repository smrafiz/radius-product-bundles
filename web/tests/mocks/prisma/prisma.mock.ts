import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

/**
 * Mock Prisma Client for testing
 */
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

/**
 * Reset Prisma mock before each test
 */
export function resetPrismaMock() {
    mockReset(prismaMock);
}

/**
 * Mock Prisma module
 */
jest.mock('@/lib/db/prisma', () => ({
    __esModule: true,
    default: prismaMock,
}));