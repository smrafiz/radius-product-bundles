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
    {
        name: "Page A",
        uv: 0,
        pv: 2400,
        amt: 2400,
    },
    {
        name: "Page B",
        uv: 200,
        pv: 4567,
        amt: 2400,
    },
    {
        name: "Page C",
        uv: 320,
        pv: 1398,
        amt: 2400,
    },
    {
        name: "Page D",
        uv: 500,
        pv: 6000,
        amt: 2400,
    },
    {
        name: "Page E",
        uv: 400,
        pv: 3908,
        amt: 2400,
    },
    {
        name: "Page F",
        uv: 189,
        pv: 4800,
        amt: 2400,
    },
    {
        name: "Page G",
        uv: 320,
        pv: 4800,
        amt: 2400,
    },
    {
        name: "Page H",
        uv: 500,
        pv: 4800,
        amt: 2400,
    },
];

export function AnalyticsChart() {
    return (
        <s-section>
            <LineChart
                style={{
                    width: "100%",
                    height: 340,
                    aspectRatio: 1.618,
                }}
                responsive
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 5,
                    left: 0,
                }}
            >
                <CartesianGrid stroke="#e3e3e3" strokeDasharray="5 5" />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#e3e3e3"
                    strokeWidth={1}
                    name="My data series name"
                />
                <XAxis
                    dataKey="name"
                    axisLine={{ stroke: "#e3e3e3", strokeWidth: 1 }}
                    tickLine={false}
                />
                <YAxis
                    width="auto"
                    label={{ value: "UV", position: "insideLeft", angle: -90 }}
                    axisLine={{ stroke: "#e3e3e3", strokeWidth: 1 }}
                    tickLine={false}
                />
                <Legend align="right" />
            </LineChart>
        </s-section>
    );
}
