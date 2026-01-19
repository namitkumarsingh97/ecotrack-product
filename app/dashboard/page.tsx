"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonKPICard } from "@/components/Skeleton";
import PieChart from "@/components/charts/PieChart";
import DoughnutChart from "@/components/charts/DoughnutChart";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import { companyAPI, esgAPI, metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import {
	Building2,
	TrendingUp,
	Users,
	Leaf,
	Shield,
	FileText,
	Activity,
	Zap,
	Droplets,
	Wind,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useCompanyStore, useMetricsStore, useESGStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";

export default function DashboardPage() {
	const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
	const { t } = useTranslation();
	
	// Use stores
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const { 
		environmental: environmentalMetricsMap, 
		social: socialMetricsMap, 
		governance: governanceMetricsMap,
		fetchAllMetrics,
		isLoading: metricsLoading
	} = useMetricsStore();
	const { 
		scores: esgScoresMap, 
		fetchScores,
		isLoading: esgLoading
	} = useESGStore();

	// Get metrics for selected company
	const environmentalMetrics = selectedCompany?._id ? (environmentalMetricsMap[selectedCompany._id] || []) : [];
	const socialMetrics = selectedCompany?._id ? (socialMetricsMap[selectedCompany._id] || []) : [];
	const governanceMetrics = selectedCompany?._id ? (governanceMetricsMap[selectedCompany._id] || []) : [];
	const esgScores = selectedCompany?._id ? (esgScoresMap[selectedCompany._id] || []) : [];
	
	const loading = metricsLoading[selectedCompany?._id || ''] || esgLoading[selectedCompany?._id || ''] || false;

	useEffect(() => {
		// Fetch companies (with caching)
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (selectedCompany?._id) {
			// Fetch metrics and scores from stores (with caching)
			fetchAllMetrics(selectedCompany._id);
			fetchScores(selectedCompany._id);
		}
	}, [selectedCompany?._id, fetchAllMetrics, fetchScores]);

	const latestScore = esgScores[0];

	// Get unique periods for filtering
	const periods = Array.from(
		new Set([
			...environmentalMetrics.map((m) => m.period),
			...socialMetrics.map((m) => m.period),
			...governanceMetrics.map((m) => m.period),
		])
	).sort()
		.reverse();

	// Filter metrics by selected period
	const filteredEnvMetrics = selectedPeriod === "all" 
		? environmentalMetrics 
		: environmentalMetrics.filter((m) => m.period === selectedPeriod);
	const filteredSocialMetrics = selectedPeriod === "all" 
		? socialMetrics 
		: socialMetrics.filter((m) => m.period === selectedPeriod);
	const filteredGovMetrics = selectedPeriod === "all" 
		? governanceMetrics 
		: governanceMetrics.filter((m) => m.period === selectedPeriod);

	// Chart data for ESG Score Distribution
	const esgScoreDistribution = latestScore
		? [
				{ name: "Environmental", value: latestScore.environmentalScore, color: "#10b981" },
				{ name: "Social", value: latestScore.socialScore, color: "#3b82f6" },
				{ name: "Governance", value: latestScore.governanceScore, color: "#8b5cf6" },
			]
		: [];

	// Chart data for Environmental Metrics (latest period)
	const latestEnvMetric = filteredEnvMetrics[0];
	const environmentalChartData = latestEnvMetric
		? [
				{ name: "Electricity (kWh)", value: latestEnvMetric.electricityUsageKwh, color: "#f59e0b" },
				{ name: "Fuel (L)", value: latestEnvMetric.fuelConsumptionLitres, color: "#ef4444" },
				{ name: "Water (KL)", value: latestEnvMetric.waterUsageKL, color: "#06b6d4" },
				{ name: "Waste (kg)", value: latestEnvMetric.wasteGeneratedKg, color: "#8b5cf6" },
			]
		: [];

	// Trend data for ESG scores over time
	const scoreTrendData = esgScores.slice(0, 6).reverse().map((score) => ({
		period: score.period,
		Overall: score.overallScore,
		Environmental: score.environmentalScore,
		Social: score.socialScore,
		Governance: score.governanceScore,
	}));

	// Environmental metrics trend
	const envTrendData = filteredEnvMetrics.slice(0, 6).reverse().map((metric) => ({
		period: metric.period,
		"Carbon (tons)": metric.carbonEmissionsTons || 0,
		"Renewable (%)": metric.renewableEnergyPercent || 0,
	}));

	if (loading) {
		return (
			<DashboardLayout>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<SkeletonKPICard />
					<SkeletonKPICard />
					<SkeletonKPICard />
					<SkeletonKPICard />
				</div>
			</DashboardLayout>
		);
	}


	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Building2 className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("dashboard.noCompanySelected")}</p>
					<p className="text-xs text-gray-500 mb-2">{t("dashboard.selectCompanyFromNav")}</p>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("dashboard.title")}</h1>
						<p className="text-xs text-gray-600">
							{selectedCompany?.name} - {selectedCompany?.reportingYear}
						</p>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("dashboard.overallScore")}</div>
						<div className="text-lg font-semibold text-gray-900">
							{latestScore ? latestScore.overallScore.toFixed(1) : "N/A"}
						</div>
						{latestScore && (
							<div className="text-xs text-gray-500 mt-0.5">
								{t("dashboard.period")}: {latestScore.period}
							</div>
						)}
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("environment.title")}</div>
						<div className="text-lg font-semibold text-green-600">
							{filteredEnvMetrics.length}
						</div>
						<div className="text-xs text-gray-500 mt-0.5">
							{periods.length} {t("dashboard.periodsTracked")}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("social.title")}</div>
						<div className="text-lg font-semibold text-blue-600">
							{filteredSocialMetrics.length}
						</div>
						<div className="text-xs text-gray-500 mt-0.5">
							{periods.length} {t("dashboard.periodsTracked")}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("governance.title")}</div>
						<div className="text-lg font-semibold text-purple-600">
							{filteredGovMetrics.length}
						</div>
						<div className="text-xs text-gray-500 mt-0.5">
							{periods.length} {t("dashboard.periodsTracked")}
						</div>
					</div>
				</div>

				{/* Charts Row 1: ESG Scores */}
				{latestScore && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
						{/* ESG Score Distribution - Doughnut Chart */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<h3 className="text-xs font-semibold text-gray-900 mb-2">{t("dashboard.esgScoreDistribution")}</h3>
							<div className="flex items-center justify-center">
								<DoughnutChart
									data={esgScoreDistribution}
									height={200}
									showLegend={true}
									centerText={latestScore.overallScore.toFixed(1)}
								/>
							</div>
							<div className="mt-2 grid grid-cols-3 gap-2 text-center">
								<div>
									<div className="text-lg font-semibold text-green-600">
										{latestScore.environmentalScore.toFixed(1)}
									</div>
									<div className="text-xs text-gray-500">{t("dashboard.environmentalScore")}</div>
								</div>
								<div>
									<div className="text-lg font-semibold text-blue-600">
										{latestScore.socialScore.toFixed(1)}
									</div>
									<div className="text-xs text-gray-500">{t("dashboard.socialScore")}</div>
								</div>
								<div>
									<div className="text-lg font-semibold text-purple-600">
										{latestScore.governanceScore.toFixed(1)}
									</div>
									<div className="text-xs text-gray-500">{t("dashboard.governanceScore")}</div>
								</div>
							</div>
						</div>

						{/* ESG Score Trend - Line Chart */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<h3 className="text-xs font-semibold text-gray-900 mb-2">{t("dashboard.esgScoreTrend")}</h3>
							{scoreTrendData.length > 0 ? (
								<LineChart
									data={scoreTrendData}
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
									{t("dashboard.noTrendData")}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Charts Row 2: Environmental Metrics */}
				{latestEnvMetric && (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
						{/* Environmental Metrics Distribution - Pie Chart */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<h3 className="text-xs font-semibold text-gray-900 mb-2">
								{t("dashboard.environmentalMetrics")} - {latestEnvMetric.period}
							</h3>
							<PieChart data={environmentalChartData} height={200} showLegend={true} />
						</div>

						{/* Environmental Trend - Bar Chart */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<h3 className="text-xs font-semibold text-gray-900 mb-2">{t("dashboard.carbonEmissionsTrend")}</h3>
							{envTrendData.length > 0 ? (
								<BarChart
									data={envTrendData}
									xKey="period"
									barKeys={[{ key: "Carbon (tons)", name: t("dashboard.carbonEmissionsTons"), color: "#ef4444" }]}
									height={200}
								/>
							) : (
								<div className="flex items-center justify-center h-[200px] text-xs text-gray-500">
									{t("dashboard.noTrendData")}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Detailed Score Cards */}
				{latestScore ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="text-xs text-gray-600 mb-1">{t("dashboard.overallScore")}</div>
							<div className="text-lg font-semibold text-gray-900">
								{latestScore.overallScore.toFixed(1)}
							</div>
							<div className="text-xs text-gray-500 mt-0.5">{t("dashboard.overallScoreDesc")}</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="text-xs text-gray-600 mb-1">{t("reports.environmental")}</div>
							<div className="text-lg font-semibold text-green-600">
								{latestScore.environmentalScore.toFixed(1)}
							</div>
							<div className="text-xs text-gray-500 mt-0.5">{t("dashboard.environmentalScoreDesc")}</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="text-xs text-gray-600 mb-1">{t("reports.social")}</div>
							<div className="text-lg font-semibold text-blue-600">
								{latestScore.socialScore.toFixed(1)}
							</div>
							<div className="text-xs text-gray-500 mt-0.5">{t("dashboard.socialScoreDesc")}</div>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="text-xs text-gray-600 mb-1">{t("reports.governance")}</div>
							<div className="text-lg font-semibold text-purple-600">
								{latestScore.governanceScore.toFixed(1)}
							</div>
							<div className="text-xs text-gray-500 mt-0.5">{t("dashboard.governanceScoreDesc")}</div>
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
						<TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
						<h3 className="text-sm font-semibold text-gray-900 mb-2">{t("dashboard.noEsgScoresYet")}</h3>
						<p className="text-xs text-gray-600 mb-4">{t("dashboard.addMetricsToCalculate")}</p>
						<Link
							href="/dashboard/environment"
							className="inline-block px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
						>
							{t("dashboard.addMetrics")}
						</Link>
					</div>
				)}

				{/* Quick Stats Grid */}
				{latestEnvMetric && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="flex items-center justify-between mb-1">
								<h4 className="text-xs font-medium text-gray-600">{t("dashboard.renewableEnergy")}</h4>
								<Zap className="text-yellow-500" size={14} />
							</div>
							<div className="text-lg font-semibold text-gray-900">
								{(latestEnvMetric.renewableEnergyPercent || 0).toFixed(1)}%
							</div>
							<p className="text-xs text-gray-500 mt-0.5">{t("dashboard.ofTotalEnergy")}</p>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="flex items-center justify-between mb-1">
								<h4 className="text-xs font-medium text-gray-600">{t("environment.carbonEmissions")}</h4>
								<Wind className="text-red-500" size={14} />
							</div>
							<div className="text-lg font-semibold text-gray-900">
								{(latestEnvMetric.carbonEmissionsTons || 0).toLocaleString()} {t("dashboard.tons")}
							</div>
							<p className="text-xs text-gray-500 mt-0.5">{t("dashboard.period")}: {latestEnvMetric.period}</p>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="flex items-center justify-between mb-1">
								<h4 className="text-xs font-medium text-gray-600">{t("environment.waterUsage")}</h4>
								<Droplets className="text-blue-500" size={14} />
							</div>
							<div className="text-lg font-semibold text-gray-900">
								{(latestEnvMetric.waterUsageKL || 0).toLocaleString()} KL
							</div>
							<p className="text-xs text-gray-500 mt-0.5">{t("dashboard.period")}: {latestEnvMetric.period}</p>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
							<div className="flex items-center justify-between mb-1">
								<h4 className="text-xs font-medium text-gray-600">{t("environment.wasteGenerated")}</h4>
								<Activity className="text-orange-500" size={14} />
							</div>
							<div className="text-lg font-semibold text-gray-900">
								{(latestEnvMetric.wasteGeneratedKg || 0).toLocaleString()} kg
							</div>
							<p className="text-xs text-gray-500 mt-0.5">{t("dashboard.period")}: {latestEnvMetric.period}</p>
						</div>
					</div>
				)}

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					<QuickActionCard
						icon={Leaf}
						title={t("dashboard.environmentalData")}
						description={t("dashboard.environmentalDataDesc")}
						href="/dashboard/environment"
						color="green"
					/>
					<QuickActionCard
						icon={Users}
						title={t("dashboard.socialMetrics")}
						description={t("dashboard.socialMetricsDesc")}
						href="/dashboard/social"
						color="blue"
					/>
					<QuickActionCard
						icon={Shield}
						title={t("dashboard.governanceInfo")}
						description={t("dashboard.governanceInfoDesc")}
						href="/dashboard/governance"
						color="purple"
					/>
				</div>
			</div>
		</DashboardLayout>
	);
}

function QuickActionCard({ icon: Icon, title, description, href, color }: { icon: any; title: string; description: string; href: string; color: "green" | "blue" | "purple" }) {
	const colorClasses: Record<"green" | "blue" | "purple", string> = {
		green: "bg-green-50 text-green-600 hover:bg-green-100",
		blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
		purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
	};

	return (
		<Link
			href={href}
			className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all group"
		>
			<div className={`inline-flex p-2 rounded-lg mb-2 ${colorClasses[color]}`}>
				<Icon size={18} />
			</div>
			<h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-green-600">
				{title}
			</h3>
			<p className="text-gray-600 text-xs">{description}</p>
		</Link>
	);
}
