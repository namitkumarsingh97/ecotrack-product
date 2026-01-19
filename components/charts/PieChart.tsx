"use client";

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PieChartProps {
	data: Array<{ name: string; value: number; color?: string }>;
	colors?: string[];
	height?: number;
	showLegend?: boolean;
	showTooltip?: boolean;
}

const DEFAULT_COLORS = [
	"#10b981", // green
	"#3b82f6", // blue
	"#f59e0b", // yellow
	"#ef4444", // red
	"#8b5cf6", // purple
	"#06b6d4", // cyan
	"#f97316", // orange
	"#ec4899", // pink
];

export default function PieChart({
	data,
	colors = DEFAULT_COLORS,
	height = 300,
	showLegend = true,
	showTooltip = true,
}: PieChartProps) {
	const chartData = data.map((item, index) => ({
		...item,
		color: item.color || colors[index % colors.length],
	}));

	return (
		<ResponsiveContainer width="100%" height={height}>
			<RechartsPieChart>
				<Pie
					data={chartData}
					cx="50%"
					cy="50%"
					labelLine={false}
					label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
					outerRadius={80}
					fill="#8884d8"
					dataKey="value"
				>
					{chartData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>
				{showTooltip && <Tooltip />}
				{showLegend && <Legend />}
			</RechartsPieChart>
		</ResponsiveContainer>
	);
}

