"use client";

import type { LayoutSidebarProps, WidgetLayout } from "@/features/settings";

export function LayoutSidebar({
    layouts,
    activeLayout,
    onLayoutChange,
    primaryColor,
    heading,
}: LayoutSidebarProps & { heading: string }) {
    return (
        <div className="md:w-64 border-r border-gray-200 bg-white">
            <s-stack padding="base">
                <s-heading>{heading}</s-heading>
            </s-stack>

            <s-stack gap="none">
                {layouts.map(({ label, value }) => {
                    const isActive = activeLayout === value;

                    return (
                        <button
                            key={value}
                            onClick={() =>
                                onLayoutChange(value as WidgetLayout)
                            }
                            className={`text-left px-4 py-3 border-l-4 transition text-[#303030]! cursor-pointer
                                ${
                                    isActive
                                        ? "border-current bg-gray-50 font-semibold"
                                        : "border-transparent hover:bg-gray-50"
                                }
                            `}
                            style={{
                                color: isActive ? primaryColor : undefined,
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </s-stack>
        </div>
    );
}
