"use client";

import { getGridClass, SectionConfig } from "@/features/settings";
import { DynamicField } from "./dynamic-field";
import { useTranslations } from "@/lib/i18n/provider";
import { PlanGate } from "@/shared";
import { useFormContext, useWatch } from "react-hook-form";

/**
 * Universal section renderer - renders ANY section from config.
 */
export function DynamicSection({
    config,
    parentPath,
    tabId,
}: {
    config: SectionConfig;
    parentPath?: string;
    tabId: string;
}) {
    const { id, title, tooltip, fields, columns = 1 } = config;

    const switchFields = fields.filter((f) => f.type === "switch");
    const gridFields = fields.filter(
        (f) => f.type !== "switch" && !f.fullWidth,
    );
    const fullWidthFields = fields.filter(
        (f) => f.type !== "switch" && f.fullWidth,
    );
    const gridClass = getGridClass(columns);
    const t = useTranslations("Settings.Tabs");

    const tooltipId = `${id}-tooltip`;
    const tabKey = parentPath || tabId || "global"; // "global" fallback string
    const sectionTitleKey = `${tabKey}.Sections.${id}.title`;
    const sectionTooltipKey = `${tabKey}.Sections.${id}.tooltip`;

    return (
        <s-section>
            <s-stack gap="base">
                {/* Section Header */}
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>
                        {t(sectionTitleKey, undefined, title)}
                    </s-heading>
                    {tooltip && (
                        <>
                            <s-tooltip id={tooltipId}>
                                <s-text>
                                    {t(sectionTooltipKey, undefined, tooltip)}
                                </s-text>
                            </s-tooltip>
                            <s-icon
                                tone="neutral"
                                type="info"
                                interestFor={tooltipId}
                            />
                        </>
                    )}
                </s-stack>

                {/* Section Description */}
                {config.description && (
                    <s-text tone="neutral">
                        {t(
                            `${tabKey}.Sections.${id}.description`,
                            undefined,
                            config.description,
                        )}
                    </s-text>
                )}

                {config.proFeature ? (
                    <PlanGate feature={config.proFeature as any}>
                        <SectionFields
                            gridFields={gridFields}
                            fullWidthFields={fullWidthFields}
                            switchFields={switchFields}
                            gridClass={gridClass}
                            parentPath={parentPath}
                            tabId={tabId}
                        />
                    </PlanGate>
                ) : (
                    <SectionFields
                        gridFields={gridFields}
                        fullWidthFields={fullWidthFields}
                        switchFields={switchFields}
                        gridClass={gridClass}
                        parentPath={parentPath}
                        tabId={tabId}
                    />
                )}
            </s-stack>
        </s-section>
    );
}

function SectionFields({
    gridFields,
    fullWidthFields,
    switchFields,
    gridClass,
    parentPath,
    tabId,
}: {
    gridFields: any[];
    fullWidthFields: any[];
    switchFields: any[];
    gridClass: string;
    parentPath?: string;
    tabId: string;
}) {
    const { control } = useFormContext();
    const defaultDiscountType = useWatch({ control, name: "defaultDiscountType" });
    const isNoDiscount = defaultDiscountType === "NO_DISCOUNT";

    const resolvedGridFields = isNoDiscount
        ? gridFields.filter((f) => f.name !== "defaultDiscountValue")
        : gridFields;
    const resolvedFullWidthFields = isNoDiscount
        ? [
              ...gridFields.filter((f) => f.name === "defaultDiscountType"),
              ...fullWidthFields,
          ]
        : fullWidthFields;
    const resolvedGridFieldsFinal = isNoDiscount
        ? resolvedGridFields.filter((f) => f.name !== "defaultDiscountType")
        : resolvedGridFields;

    return (
        <s-stack gap="base">
            {resolvedGridFieldsFinal.length > 0 && (
                <div className={gridClass}>
                    {resolvedGridFieldsFinal.map((field: any) => (
                        <DynamicField
                            key={String(field.name)}
                            config={field}
                            parentPath={parentPath}
                            tabId={tabId}
                        />
                    ))}
                </div>
            )}

            {resolvedFullWidthFields.map((field: any) => (
                <DynamicField
                    key={String(field.name)}
                    config={field}
                    parentPath={parentPath}
                    tabId={tabId}
                />
            ))}

            {switchFields.length > 0 && (
                <s-stack gap="base">
                    {switchFields.map((field: any) => (
                        <DynamicField
                            key={String(field.name)}
                            config={field}
                            parentPath={parentPath}
                            tabId={tabId}
                        />
                    ))}
                </s-stack>
            )}
        </s-stack>
    );
}
