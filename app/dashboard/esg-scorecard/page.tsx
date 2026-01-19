"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { esgAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import LineChart from "@/components/charts/LineChart";
import DoughnutChart from "@/components/charts/DoughnutChart";

interface ScoreGrade {
	grade: string;
	color: string;
	label: string;
}

interface Scorecard {
	period: string;
	overallScore: number;
	overallGrade: ScoreGrade;
	environmentalScore: number;
	environmentalGrade: ScoreGrade;
	socialScore: number;
	socialGrade: ScoreGrade;
	governanceScore: number;
	governanceGrade: ScoreGrade;
	calculatedAt: string;
	previousPeriod: {
		period: string;
		overallScore: number;
		change: number;
		environmentalChange: number;
		socialChange: number;
		governanceChange: number;
	} | null;
}

interface Trend {
	period: string;
	overallScore: number;
	environmentalScore: number;
	socialScore: number;
	governanceScore: number;
	calculatedAt: string;
	change: {
		overall: number;
		environmental: number;
		social: number;
		governance: number;
	} | null;
}

export default function ESGScorecardPage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [scorecard, setScorecard] = useState<Scorecard | null>(null);
	const [trends, setTrends] = useState<Trend[]>([]);
	const [periods, setPeriods] = useState<string[]>([]);
	const [selectedPeriod, setSelectedPeriod] = useState<string>("latest");
	const [refreshing, setRefreshing] = useState(false);

	// Use company store
	const { selectedCompany, fetchCompanies } = useCompanyStore();

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (selectedCompany?._id) {
			loadScorecard();
		}
	}, [selectedCompany?._id, selectedPeriod]);

	const loadScorecard = async () => {
		if (!selectedCompany?._id) return;

		setLoading(true);
		try {
			const period = selectedPeriod === "latest" ? undefined : selectedPeriod;
			const response = await esgAPI.getScorecard(selectedCompany._id, period);
			
			if (response.data.scorecard) {
				setScorecard(response.data.scorecard);
			} else {
				setScorecard(null);
			}
			setTrends(response.data.trends || []);
			setPeriods(response.data.periods || []);
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("esgScorecard.loadError"));
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		if (!selectedCompany?._id) return;
		
		setRefreshing(true);
		try {
			// Recalculate latest score
			if (periods.length > 0) {
				const latestPeriod = periods[0];
				await esgAPI.calculate(selectedCompany._id, latestPeriod);
				showToast.success(t("esgScorecard.scoreRecalculated"));
			}
			await loadScorecard();
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("esgScorecard.recalculateError"));
		} finally {
			setRefreshing(false);
		}
	};

	const getChangeIcon = (change: number) => {
		if (change > 0) return <TrendingUp size={14} className="text-green-600" />;
		if (change < 0) return <TrendingDown size={14} className="text-red-600" />;
		return <Minus size={14} className="text-gray-400" />;
	};

	const getChangeColor = (change: number) => {
		if (change > 0) return "text-green-600";
		if (change < 0) return "text-red-600";
		return "text-gray-600";
	};

	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("esgScorecard.noCompanySelected")}</p>
					<p className="text-xs text-gray-500">{t("esgScorecard.selectCompanyFromNav")}</p>
				</div>
			</DashboardLayout>
		);
	}

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center py-12">
					<div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
				</div>
			</DashboardLayout>
		);
	}

	if (!scorecard) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
					<h3 className="text-sm font-semibold text-gray-900 mb-2">{t("esgScorecard.noScoreYet")}</h3>
					<p className="text-xs text-gray-600 mb-4">{t("esgScorecard.addMetricsToCalculate")}</p>
				</div>
			</DashboardLayout>
		);
	}

	// Chart data for score distribution
	const scoreDistribution = [
		{ name: "Environmental", value: scorecard.environmentalScore, color: "#10b981" },
		{ name: "Social", value: scorecard.socialScore, color: "#3b82f6" },
		{ name: "Governance", value: scorecard.governanceScore, color: "#8b5cf6" },
	];

	// Trend data for line chart
	const trendData = trends.map((trend) => ({
		period: trend.period,
		Overall: trend.overallScore,
		Environmental: trend.environmentalScore,
		Social: trend.socialScore,
		Governance: trend.governanceScore,
	}));

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("esgScorecard.title")}
						</h1>
						<p className="text-xs text-gray-600">
							{selectedCompany?.name} - {scorecard.period}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{periods.length > 0 && (
							<select
								value={selectedPeriod}
								onChange={(e) => setSelectedPeriod(e.target.value)}
								className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="latest">{t("esgScorecard.latestPeriod")}</option>
								{periods.map((period) => (
									<option key={period} value={period}>
										{period}
									</option>
								))}
							</select>
						)}
						<button
							onClick={handleRefresh}
							disabled={refreshing}
							className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
							title={t("esgScorecard.recalculate")}
						>
							<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
							{t("esgScorecard.refresh")}
						</button>
					</div>
				</div>

				{/* Overall Score Card */}
				<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-4">
					<div className="flex items-center justify-between mb-3">
						<div>
							<h2 className="text-xs font-medium text-gray-700 mb-1">
								{t("esgScorecard.overallScore")}
							</h2>
							<div className="flex items-baseline gap-3">
								<div className="text-4xl font-bold text-gray-900">
									{scorecard.overallScore.toFixed(1)}
								</div>
								<div
									className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
									style={{ backgroundColor: scorecard.overallGrade.color }}
								>
									{scorecard.overallGrade.grade}
								</div>
								<div className="text-sm font-medium text-gray-600">
									{scorecard.overallGrade.label}
								</div>
							</div>
						</div>
						{scorecard.previousPeriod && (
							<div className="text-right">
								<div className="text-xs text-gray-600 mb-1">
									{t("esgScorecard.vsPrevious")} {scorecard.previousPeriod.period}
								</div>
								<div className={`flex items-center gap-1 ${getChangeColor(scorecard.previousPeriod.change)}`}>
									{getChangeIcon(scorecard.previousPeriod.change)}
									<span className="text-sm font-semibold">
										{scorecard.previousPeriod.change > 0 ? "+" : ""}
										{scorecard.previousPeriod.change.toFixed(1)}
									</span>
								</div>
							</div>
						)}
					</div>
					{/* Progress Bar */}
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="h-2 rounded-full transition-all"
							style={{
								width: `${scorecard.overallScore}%`,
								backgroundColor: scorecard.overallGrade.color,
							}}
						></div>
					</div>
				</div>

				{/* E, S, G Score Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					{/* Environmental */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-xs font-semibold text-gray-700">
								{t("reports.environmental")}
							</h3>
							{scorecard.previousPeriod && (
								<div className={`flex items-center gap-1 ${getChangeColor(scorecard.previousPeriod.environmentalChange)}`}>
									{getChangeIcon(scorecard.previousPeriod.environmentalChange)}
									<span className="text-xs font-medium">
										{scorecard.previousPeriod.environmentalChange > 0 ? "+" : ""}
										{scorecard.previousPeriod.environmentalChange.toFixed(1)}
									</span>
								</div>
							)}
						</div>
						<div className="flex items-baseline gap-2 mb-2">
							<div className="text-2xl font-bold text-green-600">
								{scorecard.environmentalScore.toFixed(1)}
							</div>
							<div
								className="px-2 py-0.5 rounded text-xs font-semibold text-white"
								style={{ backgroundColor: scorecard.environmentalGrade.color }}
							>
								{scorecard.environmentalGrade.grade}
							</div>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1.5">
							<div
								className="h-1.5 rounded-full"
								style={{
									width: `${scorecard.environmentalScore}%`,
									backgroundColor: scorecard.environmentalGrade.color,
								}}
							></div>
						</div>
					</div>

					{/* Social */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-xs font-semibold text-gray-700">
								{t("reports.social")}
							</h3>
							{scorecard.previousPeriod && (
								<div className={`flex items-center gap-1 ${getChangeColor(scorecard.previousPeriod.socialChange)}`}>
									{getChangeIcon(scorecard.previousPeriod.socialChange)}
									<span className="text-xs font-medium">
										{scorecard.previousPeriod.socialChange > 0 ? "+" : ""}
										{scorecard.previousPeriod.socialChange.toFixed(1)}
									</span>
								</div>
							)}
						</div>
						<div className="flex items-baseline gap-2 mb-2">
							<div className="text-2xl font-bold text-blue-600">
								{scorecard.socialScore.toFixed(1)}
							</div>
							<div
								className="px-2 py-0.5 rounded text-xs font-semibold text-white"
								style={{ backgroundColor: scorecard.socialGrade.color }}
							>
								{scorecard.socialGrade.grade}
							</div>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1.5">
							<div
								className="h-1.5 rounded-full"
								style={{
									width: `${scorecard.socialScore}%`,
									backgroundColor: scorecard.socialGrade.color,
								}}
							></div>
						</div>
					</div>

					{/* Governance */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-xs font-semibold text-gray-700">
								{t("reports.governance")}
							</h3>
							{scorecard.previousPeriod && (
								<div className={`flex items-center gap-1 ${getChangeColor(scorecard.previousPeriod.governanceChange)}`}>
									{getChangeIcon(scorecard.previousPeriod.governanceChange)}
									<span className="text-xs font-medium">
										{scorecard.previousPeriod.governanceChange > 0 ? "+" : ""}
										{scorecard.previousPeriod.governanceChange.toFixed(1)}
									</span>
								</div>
							)}
						</div>
						<div className="flex items-baseline gap-2 mb-2">
							<div className="text-2xl font-bold text-purple-600">
								{scorecard.governanceScore.toFixed(1)}
							</div>
							<div
								className="px-2 py-0.5 rounded text-xs font-semibold text-white"
								style={{ backgroundColor: scorecard.governanceGrade.color }}
							>
								{scorecard.governanceGrade.grade}
							</div>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1.5">
							<div
								className="h-1.5 rounded-full"
								style={{
									width: `${scorecard.governanceScore}%`,
									backgroundColor: scorecard.governanceGrade.color,
								}}
							></div>
						</div>
					</div>
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
					{/* Score Distribution - Doughnut Chart */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<h3 className="text-xs font-semibold text-gray-900 mb-2">
							{t("esgScorecard.scoreDistribution")}
						</h3>
						<div className="flex items-center justify-center">
							<DoughnutChart
								data={scoreDistribution}
								height={200}
								showLegend={true}
								centerText={scorecard.overallScore.toFixed(1)}
							/>
						</div>
					</div>

					{/* Score Trend - Line Chart */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
						<h3 className="text-xs font-semibold text-gray-900 mb-2">
							{t("esgScorecard.scoreTrend")}
						</h3>
						{trendData.length > 0 ? (
							<LineChart
								data={trendData}
								xKey="period"
								lineKeys={[
									{ key: "Overall", name: t("reports.overall"), color: "#10b981" },
									{ key: "Environmental", name: t("reports.environmental"), color: "#10b981" },
									{ key: "Social", name: t("reports.social"), color: "#3b82f6" },
									{ key: "Governance", name: t("reports.governance"), color: "#8b5cf6" },
								]}
								height={200}
							/>
						) : (
							<div className="flex items-center justify-center h-[200px] text-xs text-gray-500">
								{t("esgScorecard.noTrendData")}
							</div>
						)}
					</div>
				</div>

				{/* Additional Info */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
						<div>
							<div className="text-gray-600 mb-1">{t("esgScorecard.calculatedAt")}</div>
							<div className="text-gray-900 font-medium">
								{new Date(scorecard.calculatedAt).toLocaleString()}
							</div>
						</div>
						<div>
							<div className="text-gray-600 mb-1">{t("esgScorecard.scoringMethod")}</div>
							<div className="text-gray-900 font-medium">
								{t("esgScorecard.weightedAverage")}
							</div>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}

