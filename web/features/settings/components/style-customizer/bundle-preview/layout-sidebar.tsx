"use client";

import type { LayoutSidebarProps, WidgetLayout } from "@/features/settings";
import { useTranslations } from "@/lib/i18n/provider";
import { ProBadge, useCrossSellStore } from "@/shared";

export function LayoutSidebar({
    layouts,
    activeLayout,
    onLayoutChange,
    primaryColor,
    heading,
    bundleType,
    isLayoutLocked,
}: LayoutSidebarProps & {
    heading: string;
    bundleType?: string;
    isLayoutLocked?: (value: string) => boolean;
}) {
    const t = useTranslations("Settings.Customizer");
    const { open: openCrossSell } = useCrossSellStore();

    return (
        <div className="md:w-64 border-r border-gray-200 bg-white">
            <s-stack padding="base">
                <s-heading>{heading}</s-heading>
            </s-stack>

            <s-stack gap="none">
                {layouts.map(({ label, value }) => {
                    const isActive = activeLayout === value;
                    const isLocked = isLayoutLocked?.(value) ?? false;

                    const displayLabel =
                        bundleType === "CART_BANNER"
                            ? t(
                                  `layoutNames.CART_BANNER_${value}`,
                                  undefined,
                                  label,
                              )
                            : t(`layoutNames.${value}`, undefined, label);

                    return (
                        <button
                            key={value}
                            onClick={() => {
                                if (isLocked) {
                                    openCrossSell(displayLabel);
                                } else {
                                    onLayoutChange(value as WidgetLayout);
                                }
                            }}
                            className={`text-start px-4 py-3 border-l-4 transition text-[#303030]! ${
                                isLocked
                                    ? "rtpb-pro-locked cursor-default border-transparent"
                                    : `cursor-pointer ${
                                          isActive
                                              ? "border-current bg-gray-50 font-semibold"
                                              : "border-transparent hover:bg-gray-50"
                                      }`
                            }`}
                            style={{
                                color:
                                    isActive && !isLocked
                                        ? primaryColor
                                        : undefined,
                            }}
                        >
                            <span className="flex items-center justify-between gap-2">
                                {displayLabel}
                                {isLocked && <ProBadge label={displayLabel} />}
                            </span>
                        </button>
                    );
                })}
            </s-stack>
        </div>
    );
}
