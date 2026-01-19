"use client";

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface LineChartProps {
	data: Array<Record<string, any>>;
	xKey: string;
	lineKeys: Array<{ key: string; name: string; color?: string }>;
	height?: number;
	showGrid?: boolean;
	showLegend?: boolean;
}

const DEFAULT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function LineChart({
	data,
	xKey,
	lineKeys,
	height = 300,
	showGrid = true,
	showLegend = true,
}: LineChartProps) {
	return (
		<ResponsiveContainer width="100%" height={height}>
			<RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
				{showGrid && <CartesianGrid strokeDasharray="3 3" />}
				<XAxis dataKey={xKey} />
				<YAxis />
				<Tooltip />
				{showLegend && <Legend />}
				{lineKeys.map((line, index) => (
					<Line
						key={line.key}
						type="monotone"
						dataKey={line.key}
						name={line.name}
						stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
						strokeWidth={2}
					/>
				))}
			</RechartsLineChart>
		</ResponsiveContainer>
	);
}

