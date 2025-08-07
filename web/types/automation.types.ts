import type {
    AutomationStatus as PrismaAutomationStatus,
    TriggerType as PrismaTriggerType
} from "@prisma/client";

export type AutomationStatus = PrismaAutomationStatus;
export type TriggerType = PrismaTriggerType;

export interface Automation {
    id: string;
    shop: string;
    name: string;
    description?: string;
    status: AutomationStatus;
    triggerType: TriggerType;
    triggerConfig: any; // JSON
    conditions: any; // JSON
    actions: any; // JSON
    triggerCount: number;
    successCount: number;
    errorCount: number;
    lastTriggered?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface AutomationLog {
    id: string;
    automationId: string;
    event: string;
    success: boolean;
    data?: any; // JSON
    error?: string;
    createdAt: Date;
}

export interface CreateAutomationPayload {
    name: string;
    description?: string;
    triggerType: TriggerType;
    triggerConfig: any;
    conditions: any;
    actions: any;
    bundleIds?: string[];
}

export interface AutomationPerformance {
    totalTriggers: number;
    successRate: number;
    averageResponseTime: number;
    revenueGenerated: number;
    lastTriggered?: Date;
}