"use client";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

const data = [
    { name: "Dec 01, 2025", uv: 0 },
    { name: "Dec 02, 2025", uv: 2 },
    { name: "Dec 03, 2025", uv: 5 },
    { name: "Dec 04, 2025", uv: 8 },
    { name: "Dec 05, 2025", uv: 5 },
    { name: "Dec 06, 2025", uv: 6 },
    { name: "Dec 07, 2025", uv: 3 },
    { name: "Dec 08, 2025", uv: 1 },
    { name: "Dec 09, 2025", uv: 4 },
    { name: "Dec 10, 2025", uv: 6 },
    { name: "Dec 11, 2025", uv: 4 },
    { name: "Dec 12, 2025", uv: 1 },
    { name: "Dec 13, 2025", uv: 3 },
    { name: "Dec 14, 2025", uv: 6 },
    { name: "Dec 15, 2025", uv: 9 },
    { name: "Dec 16, 2025", uv: 1 },
];

export function AnalyticsChart() {
    return (
        <s-section>
            <s-heading>Additional revenue</s-heading>
            <LineChart
                style={{
                    width: "100%",
                    aspectRatio: 1.618,
                    height: 340,
                    paddingBottom: 40,
                }}
                data={data}
                responsive
                margin={{ top: 10, right: 30, bottom: 20, left: 25 }}
            >
                <div className="mb-3 block pb-5">
                    <CartesianGrid
                        stroke="#e3e3e3"
                        horizontal={true}
                        vertical={false}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e3e3e3",
                            padding: 10,
                            background: "#fff",
                            fontSize: 11,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                        cursor={{ stroke: "#e3e3e3", strokeWidth: 1 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="uv"
                        stroke="#13ACF0"
                        strokeWidth={1}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#6B7280", fontSize: 11, dy: 12 }}
                        axisLine={{ stroke: "#13ACF0", strokeWidth: 1.5 }}
                        tickLine={true}
                    />
                    <YAxis
                        ticks={[0, 5, 10]}
                        domain={[0, 10]}
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width="auto"
                    />
                </div>
                <Legend align="center" verticalAlign="bottom" />
            </LineChart>
        </s-section>
    );
}
