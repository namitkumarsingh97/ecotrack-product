"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { esgAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import LineChart from "@/components/charts/LineChart";
import DoughnutChart from "@/components/charts/DoughnutChart";
import ETTabs, { Tab } from "@/components/ETTabs";

interface ScoreGrade {
	grade: string;
	color: string;
	label: string;
}

interface Scorecard {
	period: string;
	overallScore: number;
	overallGrade: ScoreGrade;
	overallRisk: 'Low' | 'Medium' | 'High';
	overallRiskColor: string;
	dataCompleteness: number;
	environmentalScore: number;
	environmentalGrade: ScoreGrade;
	environmentalRisk: 'Low' | 'Medium' | 'High';
	environmentalRiskColor: string;
	environmentalCompleteness: number;
	environmentalCompleted: string[];
	environmentalMissing: string[];
	environmentalMissingCritical: string[];
	environmentalImpact: string;
	socialScore: number;
	socialGrade: ScoreGrade;
	socialRisk: 'Low' | 'Medium' | 'High';
	socialRiskColor: string;
	socialCompleteness: number;
	socialCompleted: string[];
	socialMissing: string[];
	socialMissingCritical: string[];
	socialImpact: string;
	governanceScore: number;
	governanceGrade: ScoreGrade;
	governanceRisk: 'Low' | 'Medium' | 'High';
	governanceRiskColor: string;
	governanceCompleteness: number;
	governanceCompleted: string[];
	governanceMissing: string[];
	governanceMissingCritical: string[];
	governanceImpact: string;
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
	const [activeTab, setActiveTab] = useState<string>("overall");

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

	// Tabs configuration
	const tabs: Tab[] = [
		{ key: "overall", label: t("esgScorecard.overallESG") || "Overall ESG Score" },
		{ key: "environmental", label: t("reports.environmental") || "Environmental" },
		{ key: "social", label: t("reports.social") || "Social" },
		{ key: "governance", label: t("reports.governance") || "Governance" },
	];

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

				{/* Tabs */}
				<ETTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
					{/* Tab 1: Overall ESG Score */}
					{activeTab === "overall" && (
						<div className="space-y-4">
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

							{/* Risk Level & Data Completeness */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
									<div className="text-xs text-gray-600 mb-1">Risk Level</div>
									<div className="flex items-center gap-2">
										<span
											className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
											style={{ backgroundColor: scorecard.overallRiskColor }}
										>
											{scorecard.overallRisk}
										</span>
										<span className="text-xs text-gray-600">
											{scorecard.overallRisk === 'Low' ? 'Low risk - Good performance' : 
											 scorecard.overallRisk === 'Medium' ? 'Medium risk - Needs improvement' : 
											 'High risk - Immediate attention required'}
										</span>
									</div>
								</div>
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
									<div className="text-xs text-gray-600 mb-1">Data Completeness</div>
									<div className="flex items-center gap-2">
										<div className="text-2xl font-bold text-blue-600">
											{scorecard.dataCompleteness}%
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-blue-600 h-2 rounded-full transition-all"
												style={{ width: `${scorecard.dataCompleteness}%` }}
											></div>
										</div>
									</div>
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
						</div>
					)}

					{/* Tab 2: Environmental Score */}
					{activeTab === "environmental" && (
						<div className="space-y-4">
							{/* Environmental Score Card */}
							<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-4">
								<div className="flex items-center justify-between mb-3">
									<div>
										<h2 className="text-xs font-medium text-gray-700 mb-1">
											{t("reports.environmental")} Score
										</h2>
										<div className="flex items-baseline gap-3">
											<div className="text-4xl font-bold text-gray-900">
												{scorecard.environmentalScore.toFixed(1)}
											</div>
											<div
												className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
												style={{ backgroundColor: scorecard.environmentalGrade.color }}
											>
												{scorecard.environmentalGrade.grade}
											</div>
											<span
												className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
												style={{ backgroundColor: scorecard.environmentalRiskColor }}
											>
												{scorecard.environmentalRisk} Risk
											</span>
										</div>
									</div>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="h-2 rounded-full transition-all"
										style={{
											width: `${scorecard.environmentalScore}%`,
											backgroundColor: scorecard.environmentalGrade.color,
										}}
									></div>
								</div>
							</div>

							{/* Impact Explanation */}
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
								<div className="flex items-start gap-2">
									<AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-gray-700">{scorecard.environmentalImpact}</p>
								</div>
							</div>

							{/* Data Completeness */}
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">Data Completeness: {scorecard.environmentalCompleteness}%</h3>
								<div className="space-y-3">
									{scorecard.environmentalCompleted.length > 0 && (
										<div>
											<div className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
												<CheckCircle2 size={12} />
												Completed ({scorecard.environmentalCompleted.length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.environmentalCompleted.map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{scorecard.environmentalMissingCritical.length > 0 && (
										<div>
											<div className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
												<XCircle size={12} />
												Missing Critical ({scorecard.environmentalMissingCritical.length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.environmentalMissingCritical.map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{scorecard.environmentalMissing.filter(m => !scorecard.environmentalMissingCritical.includes(m)).length > 0 && (
										<div>
											<div className="text-xs font-medium text-yellow-700 mb-2 flex items-center gap-1">
												<AlertTriangle size={12} />
												Missing Optional ({scorecard.environmentalMissing.filter(m => !scorecard.environmentalMissingCritical.includes(m)).length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.environmentalMissing.filter(m => !scorecard.environmentalMissingCritical.includes(m)).map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Tab 3: Social Score */}
					{activeTab === "social" && (
						<div className="space-y-4">
							{/* Social Score Card */}
							<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-4">
								<div className="flex items-center justify-between mb-3">
									<div>
										<h2 className="text-xs font-medium text-gray-700 mb-1">
											{t("reports.social")} Score
										</h2>
										<div className="flex items-baseline gap-3">
											<div className="text-4xl font-bold text-gray-900">
												{scorecard.socialScore.toFixed(1)}
											</div>
											<div
												className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
												style={{ backgroundColor: scorecard.socialGrade.color }}
											>
												{scorecard.socialGrade.grade}
											</div>
											<span
												className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
												style={{ backgroundColor: scorecard.socialRiskColor }}
											>
												{scorecard.socialRisk} Risk
											</span>
										</div>
									</div>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="h-2 rounded-full transition-all"
										style={{
											width: `${scorecard.socialScore}%`,
											backgroundColor: scorecard.socialGrade.color,
										}}
									></div>
								</div>
							</div>

							{/* Impact Explanation */}
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
								<div className="flex items-start gap-2">
									<AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-gray-700">{scorecard.socialImpact}</p>
								</div>
							</div>

							{/* Data Completeness */}
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">Data Completeness: {scorecard.socialCompleteness}%</h3>
								<div className="space-y-3">
									{scorecard.socialCompleted.length > 0 && (
										<div>
											<div className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
												<CheckCircle2 size={12} />
												Completed ({scorecard.socialCompleted.length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.socialCompleted.map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{scorecard.socialMissingCritical.length > 0 && (
										<div>
											<div className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
												<XCircle size={12} />
												Missing Critical ({scorecard.socialMissingCritical.length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.socialMissingCritical.map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{scorecard.socialMissing.filter(m => !scorecard.socialMissingCritical.includes(m)).length > 0 && (
										<div>
											<div className="text-xs font-medium text-yellow-700 mb-2 flex items-center gap-1">
												<AlertTriangle size={12} />
												Missing Optional ({scorecard.socialMissing.filter(m => !scorecard.socialMissingCritical.includes(m)).length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.socialMissing.filter(m => !scorecard.socialMissingCritical.includes(m)).map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Tab 4: Governance Score */}
					{activeTab === "governance" && (
						<div className="space-y-4">
							{/* Governance Score Card */}
							<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-4">
								<div className="flex items-center justify-between mb-3">
									<div>
										<h2 className="text-xs font-medium text-gray-700 mb-1">
											{t("reports.governance")} Score
										</h2>
										<div className="flex items-baseline gap-3">
											<div className="text-4xl font-bold text-gray-900">
												{scorecard.governanceScore.toFixed(1)}
											</div>
											<div
												className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
												style={{ backgroundColor: scorecard.governanceGrade.color }}
											>
												{scorecard.governanceGrade.grade}
											</div>
											<span
												className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
												style={{ backgroundColor: scorecard.governanceRiskColor }}
											>
												{scorecard.governanceRisk} Risk
											</span>
										</div>
									</div>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div
										className="h-2 rounded-full transition-all"
										style={{
											width: `${scorecard.governanceScore}%`,
											backgroundColor: scorecard.governanceGrade.color,
										}}
									></div>
								</div>
							</div>

							{/* Impact Explanation */}
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
								<div className="flex items-start gap-2">
									<AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-gray-700">{scorecard.governanceImpact}</p>
								</div>
							</div>

							{/* Data Completeness */}
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
								<h3 className="text-sm font-semibold text-gray-900 mb-3">Data Completeness: {scorecard.governanceCompleteness}%</h3>
								<div className="space-y-3">
									{scorecard.governanceCompleted.length > 0 && (
										<div>
											<div className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
												<CheckCircle2 size={12} />
												Completed ({scorecard.governanceCompleted.length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.governanceCompleted.map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{scorecard.governanceMissingCritical.length > 0 && (
										<div>
											<div className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
												<XCircle size={12} />
												Missing Critical ({scorecard.governanceMissingCritical.length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.governanceMissingCritical.map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
									{scorecard.governanceMissing.filter(m => !scorecard.governanceMissingCritical.includes(m)).length > 0 && (
										<div>
											<div className="text-xs font-medium text-yellow-700 mb-2 flex items-center gap-1">
												<AlertTriangle size={12} />
												Missing Optional ({scorecard.governanceMissing.filter(m => !scorecard.governanceMissingCritical.includes(m)).length})
											</div>
											<div className="flex flex-wrap gap-1.5">
												{scorecard.governanceMissing.filter(m => !scorecard.governanceMissingCritical.includes(m)).map((item, idx) => (
													<span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
														{item}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)}
				</ETTabs>
			</div>
		</DashboardLayout>
	);
}

