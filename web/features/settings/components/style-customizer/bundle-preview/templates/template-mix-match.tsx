"use client";

import {
    BundleTemplateProps,
    getSpacing,
    MixMatchGroup,
    useCustomizerStore,
} from "@/features/settings";
import { GroupHeader } from "../../bundle-layout/elements/group-header";
import { SectionDivider } from "../../bundle-layout/elements/section-divider";
import { SelectableProductCard } from "../../bundle-layout/cards/selectable-product-card";
import { useTranslations } from "@/lib/i18n/provider";

export function TemplateMixMatch({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const tm = useTranslations("Settings.MixMatch");

    const GROUPS: ReadonlyArray<MixMatchGroup> = [
        { name: tm("groupTop"), min: 1, max: 2, count: 3 },
        { name: tm("groupBottom"), min: 1, max: 1, count: 2 },
    ];
    const gap = getSpacing(styles.spacing);
    const groupHeaderColor =
        styles.mixMatchGroupHeaderColor || styles.primaryColor;
    const selectionStyle = styles.mixMatchSelectionStyle || "checkbox";

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
            }}
        >
            {GROUPS.map((group, gi) => (
                <div
                    key={gi}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <GroupHeader
                        name={group.name}
                        min={group.min}
                        max={group.max}
                        color={groupHeaderColor}
                    />

                    <div
                        style={{
                            display: activeLayout === "GRID" ? "grid" : "flex",
                            gridTemplateColumns:
                                activeLayout === "GRID"
                                    ? `repeat(${styles.gridColumns ?? 3}, 1fr)`
                                    : undefined,
                            flexDirection:
                                activeLayout !== "GRID" ? "column" : undefined,
                            gap: "8px",
                        }}
                    >
                        {Array.from({ length: group.count }).map((_, pi) => (
                            <SelectableProductCard
                                key={pi}
                                selected={pi < group.min}
                                selectionStyle={selectionStyle}
                                accentColor={groupHeaderColor}
                            />
                        ))}
                    </div>

                    {gi < GROUPS.length - 1 && (
                        <SectionDivider borderColor={styles.borderColor} />
                    )}
                </div>
            ))}
        </div>
    );
}
