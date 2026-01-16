interface ScoreCardProps {
	title: string;
	score: number;
	maxScore?: number;
	description?: string;
}

const getScoreClass = (score: number) => {
	if (score >= 80) return "score-excellent";
	if (score >= 60) return "score-good";
	if (score >= 40) return "score-fair";
	return "score-poor";
};

const getScoreLabel = (score: number) => {
	if (score >= 80) return "Excellent";
	if (score >= 60) return "Good";
	if (score >= 40) return "Fair";
	return "Needs Improvement";
};

export default function ScoreCard({
	title,
	score,
	maxScore = 100,
	description,
}: ScoreCardProps) {
	const percentage = (score / maxScore) * 100;

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

			<div className="flex items-center justify-between mb-4">
				<div>
					<p className="text-4xl font-bold text-gray-900">{score.toFixed(1)}</p>
					<p className="text-sm text-gray-600">out of {maxScore}</p>
				</div>
				<span
					className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getScoreClass(
						score,
					)}`}
				>
					{getScoreLabel(score)}
				</span>
			</div>

			{/* Progress bar */}
			<div className="w-full bg-gray-200 rounded-full h-3 mb-4">
				<div
					className={`h-3 rounded-full transition-all ${
						score >= 80
							? "bg-green-600"
							: score >= 60
								? "bg-green-600"
								: score >= 40
									? "bg-yellow-600"
									: "bg-red-600"
					}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>

			{description && <p className="text-sm text-gray-600">{description}</p>}
		</div>
	);
}
