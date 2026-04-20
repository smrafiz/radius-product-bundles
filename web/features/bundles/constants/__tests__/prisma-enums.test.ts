/**
 * Sync-check: verifies client-safe enum constants match Prisma schema enum values.
 * Parses schema.prisma directly to avoid Prisma runtime (import.meta incompatible with Jest).
 * If schema.prisma adds/removes values but prisma-enums.ts is not updated, this test fails.
 */

import fs from "node:fs";
import path from "node:path";
import {
    AIInsightType,
    AlertFrequency,
    AlertRuleStatus,
    AutomationStatus,
    BundleLayout,
    BundleProductRole,
    DiscountApplication,
    NotificationPriority,
    NotificationType,
    PriorityType,
    RedirectAfterCart,
    TestStatus,
    TestType,
    TriggerType,
} from "../prisma-enums";

function extractSchemaEnum(schema: string, enumName: string): string[] {
    const match = schema.match(
        new RegExp(`enum\\s+${enumName}\\s*\\{([^}]*)\\}`, "s"),
    );
    if (!match) throw new Error(`Enum "${enumName}" not found in schema.prisma`);
    return match[1]
        .split("\n")
        .map((line) => line.replace(/\/\/.*$/, "").trim())
        .filter(Boolean);
}

const schemaPath = path.resolve(__dirname, "../../../../prisma/schema.prisma");
const schema = fs.readFileSync(schemaPath, "utf-8");

describe("prisma-enums sync check", () => {
    it("DiscountApplication matches schema", () => {
        expect(Object.values(DiscountApplication).sort()).toEqual(
            extractSchemaEnum(schema, "DiscountApplication").sort(),
        );
    });

    it("PriorityType matches schema", () => {
        expect(Object.values(PriorityType).sort()).toEqual(
            extractSchemaEnum(schema, "PriorityType").sort(),
        );
    });

    it("RedirectAfterCart matches schema", () => {
        expect(Object.values(RedirectAfterCart).sort()).toEqual(
            extractSchemaEnum(schema, "RedirectAfterCart").sort(),
        );
    });

    it("BundleLayout matches schema", () => {
        expect(Object.values(BundleLayout).sort()).toEqual(
            extractSchemaEnum(schema, "BundleLayout").sort(),
        );
    });

    it("BundleProductRole matches schema", () => {
        expect(Object.values(BundleProductRole).sort()).toEqual(
            extractSchemaEnum(schema, "BundleProductRole").sort(),
        );
    });

    it("TestType matches schema", () => {
        expect(Object.values(TestType).sort()).toEqual(
            extractSchemaEnum(schema, "TestType").sort(),
        );
    });

    it("TestStatus matches schema", () => {
        expect(Object.values(TestStatus).sort()).toEqual(
            extractSchemaEnum(schema, "TestStatus").sort(),
        );
    });

    it("AutomationStatus matches schema", () => {
        expect(Object.values(AutomationStatus).sort()).toEqual(
            extractSchemaEnum(schema, "AutomationStatus").sort(),
        );
    });

    it("TriggerType matches schema", () => {
        expect(Object.values(TriggerType).sort()).toEqual(
            extractSchemaEnum(schema, "TriggerType").sort(),
        );
    });

    it("AIInsightType matches schema", () => {
        expect(Object.values(AIInsightType).sort()).toEqual(
            extractSchemaEnum(schema, "AIInsightType").sort(),
        );
    });

    it("NotificationType matches schema", () => {
        expect(Object.values(NotificationType).sort()).toEqual(
            extractSchemaEnum(schema, "NotificationType").sort(),
        );
    });

    it("NotificationPriority matches schema", () => {
        expect(Object.values(NotificationPriority).sort()).toEqual(
            extractSchemaEnum(schema, "NotificationPriority").sort(),
        );
    });

    it("AlertRuleStatus matches schema", () => {
        expect(Object.values(AlertRuleStatus).sort()).toEqual(
            extractSchemaEnum(schema, "AlertRuleStatus").sort(),
        );
    });

    it("AlertFrequency matches schema", () => {
        expect(Object.values(AlertFrequency).sort()).toEqual(
            extractSchemaEnum(schema, "AlertFrequency").sort(),
        );
    });
});
