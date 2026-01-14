/**
 * Common Recharts Configuration
 */

/**
 * Shopify-style CartesianGrid configuration
 */
export const CHART_GRID_CONFIG = {
    strokeDasharray: "0",
    stroke: "#F0F0F0",
    horizontal: true,
    vertical: false,
} as const;

/**
 * Shopify-style Tooltip configuration
 */
export const CHART_TOOLTIP_CONFIG = {
    contentStyle: {
        borderRadius: 8,
        border: "1px solid #E5E5E5",
        padding: "8px 12px",
        background: "#fff",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    labelStyle: {
        color: "#6B7280",
        fontSize: 11,
        marginBottom: 4,
        fontWeight: "bold",
    },
    cursor: {
        stroke: "#E5E5E5",
        strokeWidth: 1,
        strokeDasharray: "4 4",
    },
} as const;

/**
 * X-Axis configuration
 */
export const CHART_XAXIS_CONFIG = {
    axisLine: false,
    tickLine: false,
    tick: {
        fill: "#70707B",
        fontSize: 11,
        dy: 10,
    },
    minTickGap: 30,
} as const;

/**
 * Y-Axis configuration
 */
export const CHART_YAXIS_CONFIG = {
    axisLine: false,
    tickLine: false,
    tick: {
        fill: "#70707B",
        fontSize: 11,
    },
    width: 40,
} as const;

/**
 * Legend configuration
 */
export const CHART_LEGEND_CONFIG = {
    align: "center" as const,
    verticalAlign: "bottom" as const,
    wrapperStyle: {
        paddingTop: 10,
        fontSize: 12,
    },
    iconType: "line" as const,
};

/**
 * Chart margins configuration
 */
export const CHART_MARGINS = {
    default: { top: 10, right: 10, bottom: 0, left: 0 },
    withRightAxis: { top: 10, right: 0, bottom: 0, left: 0 },
} as const;

/**
 * Active dot configuration
 */
export function getActiveDotConfig(color: string) {
    return {
        r: 4,
        strokeWidth: 2,
        stroke: color,
        fill: "#fff",
    };
}

/**
 * Line configuration
 */
export function getLineConfig(color: string, strokeWidth = 2) {
    return {
        type: "monotone" as const,
        strokeWidth,
        dot: false,
        activeDot: getActiveDotConfig(color),
        animationDuration: 700,
    };
}
