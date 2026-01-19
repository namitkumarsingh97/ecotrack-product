"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BarChartProps {
	data: Array<Record<string, any>>;
	xKey: string;
	barKeys: Array<{ key: string; name: string; color?: string }>;
	height?: number;
	showGrid?: boolean;
	showLegend?: boolean;
}

const DEFAULT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function BarChart({
	data,
	xKey,
	barKeys,
	height = 300,
	showGrid = true,
	showLegend = true,
}: BarChartProps) {
	return (
		<ResponsiveContainer width="100%" height={height}>
			<RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
				{showGrid && <CartesianGrid strokeDasharray="3 3" />}
				<XAxis dataKey={xKey} />
				<YAxis />
				<Tooltip />
				{showLegend && <Legend />}
				{barKeys.map((bar, index) => (
					<Bar
						key={bar.key}
						dataKey={bar.key}
						name={bar.name}
						fill={bar.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
					/>
				))}
			</RechartsBarChart>
		</ResponsiveContainer>
	);
}

