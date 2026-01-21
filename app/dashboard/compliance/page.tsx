"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { complianceAPI, metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { CheckCircle2, AlertCircle, XCircle, CheckCircle, ArrowRight, Shield } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import ETTable from "@/components/ETTable";

interface BreakdownItem {
	area: "Environmental" | "Social" | "Governance";
	covered: number;
	total: number;
	missing: number;
	status: "complete" | "warning" | "critical";
	requirements: Array<{
		id: string;
		requirement: string;
		covered: boolean;
		mandatory: boolean;
		category: string;
	}>;
}

interface NextStep {
	priority: "high" | "medium" | "low";
	action: string;
	area: "Environmental" | "Social" | "Governance";
	requirement: string;
}

interface ComplianceDashboard {
	readiness: number;
	message: string;
	breakdown: BreakdownItem[];
	nextSteps: NextStep[];
	period: string;
}

export default function ComplianceCenterPage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<ComplianceDashboard | null>(null);
	const [periods, setPeriods] = useState<string[]>([]);
	const [selectedPeriod, setSelectedPeriod] = useState<string>("latest");

	// Use company store
	const { selectedCompany, fetchCompanies } = useCompanyStore();

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		// Load periods
		const loadPeriods = async () => {
			try {
				const response = await metricsAPI.getPeriods();
				const backendPeriods = response.data.periods || [];
				setPeriods(backendPeriods);
			} catch (error) {
				console.error("Failed to load periods:", error);
			}
		};
		loadPeriods();
	}, []);

	useEffect(() => {
		if (selectedCompany?._id) {
			loadDashboard();
		}
	}, [selectedCompany?._id, selectedPeriod]);

	const loadDashboard = async () => {
		if (!selectedCompany?._id) return;

		setLoading(true);
		try {
			const period = selectedPeriod === "latest" ? undefined : selectedPeriod;
			const response = await complianceAPI.getDashboard(selectedCompany._id, period);
			setData(response.data);
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to load compliance dashboard");
		} finally {
			setLoading(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "complete":
				return <CheckCircle2 size={16} className="text-green-600" />;
			case "warning":
				return <AlertCircle size={16} className="text-yellow-600" />;
			case "critical":
				return <XCircle size={16} className="text-red-600" />;
			default:
				return null;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "complete":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
						<CheckCircle2 size={12} />
						Complete
					</span>
				);
			case "warning":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
						<AlertCircle size={12} />
						Warning
					</span>
				);
			case "critical":
				return (
					<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
						<XCircle size={12} />
						Critical
					</span>
				);
			default:
				return null;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "text-red-600";
			case "medium":
				return "text-yellow-600";
			case "low":
				return "text-blue-600";
			default:
				return "text-gray-600";
		}
	};

	const getReadinessColor = (readiness: number) => {
		if (readiness >= 80) return "text-green-600";
		if (readiness >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	const getReadinessBgColor = (readiness: number) => {
		if (readiness >= 80) return "bg-green-50 border-green-200";
		if (readiness >= 60) return "bg-yellow-50 border-yellow-200";
		return "bg-red-50 border-red-200";
	};

	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Shield className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("compliance.noCompanySelected") || "No company selected"}</p>
					<p className="text-xs text-gray-500">{t("compliance.selectCompanyFromNav") || "Please select a company from the top navigation"}</p>
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

	if (!data) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Shield className="mx-auto text-gray-400 mb-4" size={48} />
					<h3 className="text-sm font-semibold text-gray-900 mb-2">{t("compliance.noData") || "No compliance data available"}</h3>
					<p className="text-xs text-gray-600 mb-4">{t("compliance.addMetrics") || "Add metrics to calculate compliance readiness"}</p>
				</div>
			</DashboardLayout>
		);
	}

	// Prepare table columns for breakdown
	const breakdownColumns = [
		{ label: "Area", field: "area", sortable: true },
		{ label: "Covered", field: "covered", sortable: true },
		{ label: "Missing", field: "missing", sortable: true },
		{ 
			label: "Status", 
			field: "status", 
			sortable: true,
			formatFn: (value: any, row: any) => {
				return getStatusBadge(row.statusValue);
			}
		},
	];

	// Prepare table rows for breakdown
	const breakdownRows = data.breakdown.map((item) => ({
		_id: item.area,
		area: item.area,
		covered: `${item.covered} / ${item.total}`,
		missing: item.missing,
		status: item.status, // Keep original for sorting
		statusValue: item.status, // For rendering
	}));

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("compliance.title") || "Compliance Center"}
						</h1>
						<p className="text-xs text-gray-600">
							{selectedCompany?.name} - {t("compliance.subtitle") || "BRSR Readiness Assessment"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{periods.length > 0 && (
							<select
								value={selectedPeriod}
								onChange={(e) => setSelectedPeriod(e.target.value)}
								className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
							>
								<option value="latest">Latest Period</option>
								{periods.map((period) => (
									<option key={period} value={period}>
										{period}
									</option>
								))}
							</select>
						)}
					</div>
				</div>

				{/* Compliance Health Card */}
				<div className={`rounded-lg shadow-sm border-2 p-6 ${getReadinessBgColor(data.readiness)}`}>
					<div className="text-center">
						<div className="text-xs font-medium text-gray-700 mb-2">BRSR Readiness</div>
						<div className={`text-6xl font-bold mb-2 ${getReadinessColor(data.readiness)}`}>
							{data.readiness}%
						</div>
						<p className="text-sm text-gray-700 font-medium">{data.message}</p>
						<div className="mt-4 w-full bg-gray-200 rounded-full h-3">
							<div
								className={`h-3 rounded-full transition-all ${
									data.readiness >= 80
										? "bg-green-600"
										: data.readiness >= 60
										? "bg-yellow-600"
										: "bg-red-600"
								}`}
								style={{ width: `${data.readiness}%` }}
							></div>
						</div>
					</div>
				</div>

				{/* Readiness Breakdown Table */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<h2 className="text-sm font-semibold text-gray-900 mb-3">Readiness Breakdown</h2>
					<ETTable
						columns={breakdownColumns}
						rows={breakdownRows}
						loading={false}
						title=""
						showSearch={false}
						showDownloadBtn={false}
						showRefreshBtn={false}
						showSettingsBtn={false}
						emptyText="No data available"
						totalRecords={data.breakdown.length}
					/>
				</div>

				{/* What You Should Do Next */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<h2 className="text-sm font-semibold text-gray-900 mb-3">What You Should Do Next</h2>
					{data.nextSteps.length === 0 ? (
						<div className="text-center py-4">
							<CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
							<p className="text-sm text-gray-600">All requirements are covered! Great job!</p>
						</div>
					) : (
						<div className="space-y-2">
							{data.nextSteps.map((step, index) => (
								<div
									key={index}
									className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<div className={`mt-0.5 ${getPriorityColor(step.priority)}`}>
										{step.priority === "high" ? (
											<AlertCircle size={16} />
										) : step.priority === "medium" ? (
											<AlertCircle size={16} />
										) : (
											<CheckCircle size={16} />
										)}
									</div>
									<div className="flex-1">
										<div className="text-sm font-medium text-gray-900">{step.action}</div>
										<div className="text-xs text-gray-600 mt-0.5">
											{step.area} • {step.requirement}
										</div>
									</div>
									<Link
										href={
											step.area === "Environmental"
												? "/dashboard/environment/create"
												: step.area === "Social"
												? "/dashboard/social/create"
												: "/dashboard/governance/create"
										}
										className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
									>
										Go to Form
										<ArrowRight size={12} />
									</Link>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}

