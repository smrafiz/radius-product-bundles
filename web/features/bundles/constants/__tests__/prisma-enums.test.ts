/**
 * Sync-check: verifies client-safe enum constants match Prisma schema enum values.
 * Parses schema.prisma directly to avoid Prisma runtime (import.meta incompatible with Jest).
 * If schema.prisma adds/removes values but prisma-enums.ts is not updated, this test fails.
 */

import fs from "node:fs";
import path from "node:path";
import {
    BundleLayout,
    BundleProductRole,
    DiscountApplication,
    PriorityType,
    RedirectAfterCart,
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
});
