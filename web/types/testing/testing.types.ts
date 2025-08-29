import type {
    TestType as PrismaTestType,
    TestStatus as PrismaTestStatus
} from "@prisma/client";

export type TestType = PrismaTestType;
export type TestStatus = PrismaTestStatus;

export interface ABTest {
    id: string;
    shop: string;
    name: string;
    hypothesis?: string;
    type: TestType;
    status: TestStatus;
    trafficSplit: number;
    duration: number;
    minSampleSize: number;
    controlBundleId: string;
    variantConfig: any; // JSON
    winner?: string;
    significance?: number;
    improvement?: number;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface TestResult {
    id: string;
    testId: string;
    variant: string;
    date: Date;
    views: number;
    conversions: number;
    revenue: number;
    recordedAt: Date;
}

export interface CreateTestPayload {
    name: string;
    hypothesis?: string;
    type: TestType;
    controlBundleId: string;
    variantConfig: any;
    trafficSplit?: number;
    duration?: number;
    minSampleSize?: number;
}

export interface TestPerformance {
    variant: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
}