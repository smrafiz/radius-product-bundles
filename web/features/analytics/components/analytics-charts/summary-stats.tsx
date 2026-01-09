"use client";

import { ReactNode } from "react";

/**
 * Summary Stat Item
 */
interface SummaryStatItem {
    label: string;
    value: string | number;
    icon?: string;
    tone?: "success" | "critical" | "warning" | "info";
}

/**
 * Summary Stats Table Props
 */
interface SummaryStatsTableProps {
    stats: SummaryStatItem[];
}

/**
 * Summary Stats Table Component
 *
 * Displays summary statistics in a clean table format
 * Better UX than stacked text elements
 *
 * @example
 * <SummaryStatsTable
 *     stats={[
 *         { label: "Views", value: "1,234" },
 *         { label: "Add-to-Cart", value: "567" },
 *         { label: "Purchases", value: "89" },
 *     ]}
 * />
 */
export function SummaryStatsTable({ stats }: SummaryStatsTableProps) {
    return (
        <s-box>
            <s-table>
                <tbody>
                    {stats.map((stat, index) => (
                        <tr key={index}>
                            <td>
                                <s-stack
                                    direction="inline"
                                    gap="small-200"
                                    alignItems="center"
                                >
                                    {stat.icon && <s-icon type={stat.icon} />}
                                    <s-text tone="neutral">{stat.label}</s-text>
                                </s-stack>
                            </td>
                            <td align="right">
                                <s-text type="strong" tone={stat.tone}>
                                    {stat.value}
                                </s-text>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </s-table>
        </s-box>
    );
}

/**
 * Compact Stats Bar Component
 *
 * Alternative horizontal layout for 3-4 stats
 * Clean, inline display with dividers
 *
 * @example
 * <CompactStatsBar
 *     stats={[
 *         { label: "Views", value: "1,234" },
 *         { label: "Conversion", value: "14.3%" },
 *     ]}
 * />
 */
export function CompactStatsBar({ stats }: SummaryStatsTableProps) {
    return (
        <s-card>
            <s-stack
                direction="inline"
                gap="base"
                justifyContent="space-between"
                alignItems="center"
            >
                {stats.map((stat, index) => (
                    <div key={index} style={{ flex: 1 }}>
                        <s-stack gap="small-100" alignItems="center">
                            <s-text tone="subdued" size="small">
                                {stat.label}
                            </s-text>
                            <s-text type="strong" size="large" tone={stat.tone}>
                                {stat.value}
                            </s-text>
                        </s-stack>
                        {index < stats.length - 1 && (
                            <s-divider orientation="vertical" />
                        )}
                    </div>
                ))}
            </s-stack>
        </s-card>
    );
}

/**
 * Stats Grid Component
 *
 * Grid layout for 4+ stats
 * Responsive, wraps on smaller screens
 *
 * @example
 * <StatsGrid
 *     stats={[
 *         { label: "Views", value: "1,234", icon: "eye" },
 *         { label: "Add-to-Cart", value: "567", icon: "cart" },
 *     ]}
 * />
 */
export function StatsGrid({ stats }: SummaryStatsTableProps) {
    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))"
            gap="small"
        >
            {stats.map((stat, index) => (
                <s-grid-item key={index}>
                    <s-card>
                        <s-stack gap="small-100">
                            <s-stack
                                direction="inline"
                                gap="small-200"
                                alignItems="center"
                            >
                                {stat.icon && <s-icon type={stat.icon} />}
                                <s-text tone="subdued" size="small">
                                    {stat.label}
                                </s-text>
                            </s-stack>
                            <s-text type="strong" size="large" tone={stat.tone}>
                                {stat.value}
                            </s-text>
                        </s-stack>
                    </s-card>
                </s-grid-item>
            ))}
        </s-grid>
    );
}
