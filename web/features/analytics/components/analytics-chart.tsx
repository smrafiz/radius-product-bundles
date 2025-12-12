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
    { name: "Dec 05, 2025", uv: 0 },
    { name: "Dec 08, 2025", uv: 2 },
    { name: "Dec 10, 2025", uv: 5 },
    { name: "Dec 11, 2025", uv: 8 },
    { name: "Dec 14, 2025", uv: 5 },
    { name: "Dec 15, 2025", uv: 6 },
    { name: "Dec 16, 2025", uv: 3 },
    { name: "Dec 18, 2025", uv: 0.5 },
];

export function AnalyticsChart() {
    return (
        <s-section>
            <s-heading>Additional revenue</s-heading>

            <LineChart
                style={{ width: "100%", aspectRatio: 1.618, height: 340 }}
                data={data}
                responsive
                margin={{ top: 10, right: 30, bottom: 20, left: 0 }}
            >
                <div className="mt-2 block">
                    {/* Shopify style grid (horizontal only) */}
                    <CartesianGrid
                        stroke="#e3e3e3"
                        horizontal={true}
                        vertical={false}
                    />

                    {/* Soft Shopify tooltip */}
                    <Tooltip
                        contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e3e3e3",
                            padding: 10,
                            background: "#fff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                        cursor={{ stroke: "#e3e3e3", strokeWidth: 1 }}
                    />

                    {/* Smooth single line */}
                    <Line
                        type="monotone"
                        dataKey="uv"
                        stroke="#13ACF0"
                        strokeWidth={1}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />

                    {/* X-Axis formatting */}
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#6B7280", fontSize: 12, dy: 12 }}
                        axisLine={{ stroke: "#13ACF0", strokeWidth: 1.5 }}
                        tickLine={true}
                    />

                    {/* Y-Axis: 3 Grid Levels (Shopify style) */}
                    <YAxis
                        ticks={[0, 5, 10]}
                        domain={[0, 10]}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                </div>

                {/* Legend – clean Shopify style */}
                <div className="mt-2 block">
                    <Legend align="center" verticalAlign="bottom" />
                </div>
            </LineChart>


            <LineChart
                style={{ width: "100%", aspectRatio: 1.618, height: 340 }}
                responsive
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 5,
                    left: 0,
                }}
            >
                <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="uv" stroke="purple" strokeWidth={2} name="My data series name" />
                <XAxis dataKey="name" />
                <YAxis width="auto" label={{ value: 'UV', position: 'insideLeft', angle: -90 }} />
                <Legend align="right" />
            </LineChart>
        </s-section>
    );
}
