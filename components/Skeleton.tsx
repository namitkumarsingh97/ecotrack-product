/**
 * Skeleton loading components
 * Based on the reference SaaS product's loading patterns
 */
export function SkeletonCard() {
	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
			<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
			<div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
			<div className="h-4 bg-gray-200 rounded w-full"></div>
		</div>
	);
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
	return (
		<div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
			{/* Header */}
			<div className="border-b border-gray-200 p-4">
				<div className="flex gap-4">
					{Array.from({ length: cols }).map((_, i) => (
						<div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
					))}
				</div>
			</div>
			{/* Rows */}
			{Array.from({ length: rows }).map((_, rowIndex) => (
				<div key={rowIndex} className="border-b border-gray-200 p-4">
					<div className="flex gap-4">
						{Array.from({ length: cols }).map((_, colIndex) => (
							<div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function SkeletonKPICard() {
	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
			<div className="flex items-center justify-between mb-4">
				<div className="h-4 bg-gray-200 rounded w-24"></div>
				<div className="h-8 w-8 bg-gray-200 rounded"></div>
			</div>
			<div className="h-10 bg-gray-200 rounded w-20 mb-2"></div>
			<div className="h-3 bg-gray-200 rounded w-32"></div>
		</div>
	);
}

export function SkeletonLine() {
	return <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>;
}

