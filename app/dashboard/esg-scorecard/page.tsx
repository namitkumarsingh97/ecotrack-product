"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { esgAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Shield } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { getPlanMessaging } from "@/lib/planMessaging";
import LineChart from "@/components/charts/LineChart";
import DoughnutChart from "@/components/charts/DoughnutChart";
import ETTabs, { Tab } from "@/components/ETTabs";
import Link from "next/link";

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
	const [activeTab, setActiveTab] = useState<string | null>(null); // null = initial view, string = detailed view

	// Use company store
	const { selectedCompany, fetchCompanies } = useCompanyStore();
	const { plan } = usePlanFeatures();
	const planMessaging = getPlanMessaging(plan);

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

	const getStatusIcon = (status: string) => {
		if (status === "Strong" || status === "Complete") return <CheckCircle2 size={16} className="text-green-600" />;
		if (status.includes("Needs") || status.includes("Moderate")) return <AlertTriangle size={16} className="text-yellow-600" />;
		return <XCircle size={16} className="text-red-600" />;
	};

	const getStatusText = (score: number, completeness: number, missingCritical: string[]) => {
		if (score >= 70 && completeness >= 80) return "✅ Strong";
		if (score >= 60 && completeness >= 60) return "⚠️ Moderate";
		if (missingCritical.length > 0) return "⚠️ Needs data";
		return "❌ Needs improvement";
	};

	// Generate "What's Hurting Your Score" list
	const getHurtingScoreItems = () => {
		const items: Array<{ text: string; link: string; area: string }> = [];
		
		if (scorecard) {
			// Environmental missing critical
			scorecard.environmentalMissingCritical.forEach((item) => {
				if (item.toLowerCase().includes('electricity')) {
					items.push({ text: "Electricity consumption not added", link: "/dashboard/environment/create", area: "Environmental" });
				} else if (item.toLowerCase().includes('waste')) {
					items.push({ text: "Waste disposal proof missing", link: "/dashboard/evidence-vault", area: "Environmental" });
				} else if (item.toLowerCase().includes('water')) {
					items.push({ text: "Water consumption data missing", link: "/dashboard/environment/create", area: "Environmental" });
				}
			});

			// Social missing critical
			scorecard.socialMissingCritical.forEach((item) => {
				if (item.toLowerCase().includes('employee')) {
					items.push({ text: "Employee count data missing", link: "/dashboard/social/create", area: "Social" });
				} else if (item.toLowerCase().includes('training')) {
					items.push({ text: "Training hours data missing", link: "/dashboard/social/create", area: "Social" });
				}
			});

			// Governance missing critical
			scorecard.governanceMissingCritical.forEach((item) => {
				if (item.toLowerCase().includes('posh')) {
					items.push({ text: "POSH policy not uploaded", link: "/dashboard/evidence-vault", area: "Governance" });
				} else if (item.toLowerCase().includes('code')) {
					items.push({ text: "Code of conduct missing", link: "/dashboard/governance/create", area: "Governance" });
				} else if (item.toLowerCase().includes('anti')) {
					items.push({ text: "Anti-bribery policy missing", link: "/dashboard/governance/create", area: "Governance" });
				}
			});
		}

		return items.slice(0, 5); // Top 5 items
	};

	const getConfidenceLevel = (completeness: number) => {
		if (completeness >= 80) return { level: "High", color: "text-green-600" };
		if (completeness >= 60) return { level: "Medium", color: "text-yellow-600" };
		return { level: "Low", color: "text-red-600" };
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

	// If a tab is selected, show detailed view
	if (activeTab) {
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
							<button
								onClick={() => setActiveTab(null)}
								className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
							>
								← Back to Overview
							</button>
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
							>
								<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
								{t("esgScorecard.refresh")}
							</button>
						</div>
					</div>

					{/* Detailed Tabs View */}
					<ETTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
						{/* Overall Detail */}
						{activeTab === "overall" && (
							<div className="space-y-4">
								{/* Score Explanation */}
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<h2 className="text-sm font-semibold text-gray-900 mb-3">Score Explanation</h2>
									<p className="text-sm text-gray-700 mb-2">
										Environment data has slightly more weight (40%) compared to Social (30%) and Governance (30%).
									</p>
									<div className="grid grid-cols-3 gap-2 mt-3">
										<div className="text-center p-2 bg-green-50 rounded">
											<div className="text-xs text-gray-600">Environment</div>
											<div className="text-sm font-semibold text-green-600">40%</div>
										</div>
										<div className="text-center p-2 bg-blue-50 rounded">
											<div className="text-xs text-gray-600">Social</div>
											<div className="text-sm font-semibold text-blue-600">30%</div>
										</div>
										<div className="text-center p-2 bg-purple-50 rounded">
											<div className="text-xs text-gray-600">Governance</div>
											<div className="text-sm font-semibold text-purple-600">30%</div>
										</div>
									</div>
								</div>

								{/* Risk Assessment */}
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<h2 className="text-sm font-semibold text-gray-900 mb-3">Risk Assessment</h2>
									<div className="flex items-center gap-3">
										<span
											className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
											style={{ backgroundColor: scorecard.overallRiskColor }}
										>
											{scorecard.overallRisk} Risk
										</span>
										<span className="text-sm text-gray-700">
											{scorecard.overallRisk === 'Low' 
												? planMessaging.enterpriseReady
												: scorecard.overallRisk === 'Medium' 
												? 'Data gaps present' 
												: 'Deal blocker'}
										</span>
									</div>
								</div>

								{/* Data Completeness */}
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<h2 className="text-sm font-semibold text-gray-900 mb-3">Data Completeness</h2>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-700">Environment</span>
											<span className="text-sm font-semibold text-gray-900">{scorecard.environmentalCompleteness}%</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-700">Social</span>
											<span className="text-sm font-semibold text-gray-900">{scorecard.socialCompleteness}%</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-700">Governance</span>
											<span className="text-sm font-semibold text-gray-900">{scorecard.governanceCompleteness}%</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Environmental Detail */}
						{activeTab === "environmental" && (
							<div className="space-y-4">
								{/* Score Card */}
								<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-4">
									<div className="text-center">
										<div className="text-xs font-medium text-gray-700 mb-1">Environment Score</div>
										<div className="text-4xl font-bold text-gray-900 mb-2">
											{scorecard.environmentalScore.toFixed(1)} / 100
										</div>
										<div className="text-sm font-medium text-gray-700">
											Status: {getStatusText(scorecard.environmentalScore, scorecard.environmentalCompleteness, scorecard.environmentalMissingCritical)}
										</div>
									</div>
								</div>

								{/* Completed vs Missing */}
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<h2 className="text-sm font-semibold text-gray-900 mb-3">Completed vs Missing</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<div className="text-xs font-medium text-green-700 mb-2">Completed</div>
											<div className="space-y-1">
												{scorecard.environmentalCompleted.slice(0, 5).map((item, idx) => (
													<div key={idx} className="flex items-center gap-1 text-xs text-gray-700">
														<CheckCircle2 size={12} className="text-green-600" />
														{item}
													</div>
												))}
											</div>
										</div>
										<div>
											<div className="text-xs font-medium text-red-700 mb-2">Missing</div>
											<div className="space-y-1">
												{scorecard.environmentalMissingCritical.slice(0, 5).map((item, idx) => (
													<div key={idx} className="flex items-center gap-1 text-xs text-gray-700">
														<XCircle size={12} className="text-red-600" />
														{item}
													</div>
												))}
											</div>
										</div>
									</div>
								</div>

								{/* Score Impact View */}
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<h2 className="text-sm font-semibold text-gray-900 mb-3">Score Impact</h2>
									<div className="space-y-2">
										{scorecard.environmentalMissingCritical.slice(0, 3).map((item, idx) => (
											<div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
												<span className="text-xs text-gray-700">{item}</span>
												<span className="text-xs font-medium text-red-600">High Impact</span>
											</div>
										))}
									</div>
									<p className="text-xs text-gray-600 mt-3">
										Adding missing data can improve your Environment score significantly.
									</p>
								</div>
							</div>
						)}

						{/* Social Detail */}
						{activeTab === "social" && (
							<div className="space-y-4">
								{/* Score Card */}
								<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-4">
									<div className="text-center">
										<div className="text-xs font-medium text-gray-700 mb-1">Social Score</div>
										<div className="text-4xl font-bold text-gray-900 mb-2">
											{scorecard.socialScore.toFixed(1)} / 100
										</div>
										<div className="text-sm font-medium text-gray-700">
											Status: {getStatusText(scorecard.socialScore, scorecard.socialCompleteness, scorecard.socialMissingCritical)}
										</div>
									</div>
								</div>

								{/* Data Coverage */}
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<h2 className="text-sm font-semibold text-gray-900 mb-3">Data Coverage</h2>
									<div className="space-y-2">
										{scorecard.socialCompleted.map((item, idx) => (
											<div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
												<CheckCircle2 size={14} className="text-green-600" />
												{item} ✅
											</div>
										))}
										{scorecard.socialMissingCritical.map((item, idx) => (
											<div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
												<AlertTriangle size={14} className="text-yellow-600" />
												{item} ⚠️ Partial
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Governance Detail */}
						{activeTab === "governance" && (
							<div className="space-y-4">
								{/* Score Card */}
								<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-4">
									<div className="text-center">
										<div className="text-xs font-medium text-gray-700 mb-1">Governance Score</div>
										<div className="text-4xl font-bold text-gray-900 mb-2">
											{scorecard.governanceScore.toFixed(1)} / 100
										</div>
										<div className="text-sm font-medium text-gray-700">
											Status: {getStatusText(scorecard.governanceScore, scorecard.governanceCompleteness, scorecard.governanceMissingCritical)}
										</div>
									</div>
								</div>

								{/* Policy Checklist */}
								<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
									<h2 className="text-sm font-semibold text-gray-900 mb-3">Policy Checklist</h2>
									<div className="space-y-2">
										<div className="flex items-center justify-between p-2 bg-gray-50 rounded">
											<div className="flex items-center gap-2">
												{scorecard.governanceCompleted.includes('Code of Conduct') ? (
													<CheckCircle2 size={14} className="text-green-600" />
												) : (
													<XCircle size={14} className="text-red-600" />
												)}
												<span className="text-sm text-gray-700">Code of Conduct</span>
											</div>
											{!scorecard.governanceCompleted.includes('Code of Conduct') && (
												<Link href="/dashboard/evidence-vault" className="text-xs text-green-600 hover:text-green-700">
													Upload policy →
												</Link>
											)}
										</div>
										<div className="flex items-center justify-between p-2 bg-gray-50 rounded">
											<div className="flex items-center gap-2">
												{scorecard.governanceCompleted.includes('POSH') || scorecard.governanceCompleted.some(c => c.toLowerCase().includes('posh')) ? (
													<CheckCircle2 size={14} className="text-green-600" />
												) : (
													<XCircle size={14} className="text-red-600" />
												)}
												<span className="text-sm text-gray-700">POSH Policy</span>
											</div>
											{!scorecard.governanceCompleted.includes('POSH') && !scorecard.governanceCompleted.some(c => c.toLowerCase().includes('posh')) && (
												<Link href="/dashboard/evidence-vault" className="text-xs text-green-600 hover:text-green-700">
													Upload policy →
												</Link>
											)}
										</div>
										<div className="flex items-center justify-between p-2 bg-gray-50 rounded">
											<div className="flex items-center gap-2">
												{scorecard.governanceCompleted.includes('Anti-Corruption') ? (
													<CheckCircle2 size={14} className="text-green-600" />
												) : (
													<XCircle size={14} className="text-red-600" />
												)}
												<span className="text-sm text-gray-700">Anti-bribery</span>
											</div>
											{!scorecard.governanceCompleted.includes('Anti-Corruption') && (
												<Link href="/dashboard/governance/create" className="text-xs text-green-600 hover:text-green-700">
													Add policy →
												</Link>
											)}
										</div>
									</div>
								</div>

								{/* Compliance Readiness Hint */}
								<div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
									<p className="text-sm text-gray-700">
										Strong governance builds enterprise trust faster.
									</p>
								</div>
							</div>
						)}
					</ETTabs>
				</div>
			</DashboardLayout>
		);
	}

	// Initial view (no tabs)
	const confidence = getConfidenceLevel(scorecard.dataCompleteness);
	const hurtingItems = getHurtingScoreItems();

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

				{/* 1. ESG Health Snapshot */}
				<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border-2 border-green-200 p-6">
					<div className="text-center">
						<div className="text-xs font-medium text-gray-700 mb-2">ESG Score</div>
						<div className="text-6xl font-bold text-gray-900 mb-2">
							{scorecard.overallScore.toFixed(0)} / 100
						</div>
						<div className="flex items-center justify-center gap-3 mb-2">
							<span
								className="px-3 py-1 rounded-lg text-sm font-semibold text-white"
								style={{ backgroundColor: scorecard.overallRiskColor }}
							>
								Risk Level: {scorecard.overallRisk}
							</span>
							<span className="text-sm font-medium text-gray-700">
								Data Completeness: {scorecard.dataCompleteness}%
							</span>
						</div>
						<p className="text-xs text-gray-600 mt-2">
							Score is based on Environment, Social & Governance data provided.
						</p>
					</div>
				</div>

				{/* 2. E / S / G Mini Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					{/* Environment Card */}
					<button
						onClick={() => setActiveTab("environmental")}
						className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-semibold text-gray-900">Environment</h3>
							<ArrowRight size={14} className="text-gray-400" />
						</div>
						<div className="text-2xl font-bold text-green-600 mb-1">
							Score: {scorecard.environmentalScore.toFixed(0)}
						</div>
						<div className="text-xs text-gray-600 mb-1">
							Status: {getStatusText(scorecard.environmentalScore, scorecard.environmentalCompleteness, scorecard.environmentalMissingCritical)}
						</div>
						{scorecard.environmentalMissingCritical.length > 0 && (
							<div className="text-xs text-gray-500">
								Missing: {scorecard.environmentalMissingCritical.slice(0, 2).join(", ")}
							</div>
						)}
					</button>

					{/* Social Card */}
					<button
						onClick={() => setActiveTab("social")}
						className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-semibold text-gray-900">Social</h3>
							<ArrowRight size={14} className="text-gray-400" />
						</div>
						<div className="text-2xl font-bold text-blue-600 mb-1">
							Score: {scorecard.socialScore.toFixed(0)}
						</div>
						<div className="text-xs text-gray-600 mb-1">
							Status: {getStatusText(scorecard.socialScore, scorecard.socialCompleteness, scorecard.socialMissingCritical)}
						</div>
					</button>

					{/* Governance Card */}
					<button
						onClick={() => setActiveTab("governance")}
						className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all text-left"
					>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-semibold text-gray-900">Governance</h3>
							<ArrowRight size={14} className="text-gray-400" />
						</div>
						<div className="text-2xl font-bold text-purple-600 mb-1">
							Score: {scorecard.governanceScore.toFixed(0)}
						</div>
						<div className="text-xs text-gray-600 mb-1">
							Status: {getStatusText(scorecard.governanceScore, scorecard.governanceCompleteness, scorecard.governanceMissingCritical)}
						</div>
						{scorecard.governanceMissingCritical.length > 0 && (
							<div className="text-xs text-gray-500">
								Missing: Policies
							</div>
						)}
					</button>
				</div>

				{/* 3. What's Hurting Your Score */}
				{hurtingItems.length > 0 && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
						<h2 className="text-sm font-semibold text-gray-900 mb-3">What's Hurting Your Score</h2>
						<div className="space-y-2">
							{hurtingItems.map((item, idx) => (
								<div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
									<div className="flex items-center gap-2">
										<XCircle size={14} className="text-red-600" />
										<span className="text-sm text-gray-700">{item.text}</span>
									</div>
									<Link
										href={item.link}
										className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
									>
										Fix now
										<ArrowRight size={12} />
									</Link>
								</div>
							))}
						</div>
					</div>
				)}

				{/* 4. Score Confidence Indicator */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-700">Score reliability:</span>
						<span className={`text-sm font-semibold ${confidence.color}`}>
							{confidence.level} (based on {scorecard.dataCompleteness}% data completion)
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
						<div
							className={`h-2 rounded-full transition-all ${
								scorecard.dataCompleteness >= 80
									? "bg-green-600"
									: scorecard.dataCompleteness >= 60
									? "bg-yellow-600"
									: "bg-red-600"
							}`}
							style={{ width: `${scorecard.dataCompleteness}%` }}
						></div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
