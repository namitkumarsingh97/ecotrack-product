"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { esgAPI, metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { FileText, Download, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { useCompanyStore, useESGStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import ETTable from "@/components/ETTable";

export default function ReportsPage() {
	const { t } = useTranslation();
	const [selectedCompanyId, setSelectedCompanyId] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPeriod, setFilterPeriod] = useState("all");
	const [loading, setLoading] = useState<string | null>(null);
	const [periods, setPeriods] = useState<string[]>([]);
	const [loadingPeriods, setLoadingPeriods] = useState(false);

	// Use stores
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const { 
		scores: esgScoresMap, 
		fetchScores,
		isLoading: esgLoading
	} = useESGStore();

	// Get scores for selected company
	const esgScores = selectedCompanyId ? (esgScoresMap[selectedCompanyId] || []) : [];
	const loadingState = esgLoading[selectedCompanyId] || false;

	useEffect(() => {
		// Fetch companies from store (with caching)
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		// Set initial selected company
		if (selectedCompany?._id && !selectedCompanyId) {
			setSelectedCompanyId(selectedCompany._id);
		}
	}, [selectedCompany, selectedCompanyId]);

	useEffect(() => {
		// Fetch scores when company changes (with caching)
		if (selectedCompanyId) {
			fetchScores(selectedCompanyId);
		}
	}, [selectedCompanyId, fetchScores]);

	useEffect(() => {
		// Load periods from backend
		const loadPeriods = async () => {
			setLoadingPeriods(true);
			try {
				const response = await metricsAPI.getPeriods();
				const backendPeriods = response.data.periods || [];
				
				// Get unique periods from actual scores
				const scorePeriods = Array.from(new Set(esgScores.map((s) => s.period)));
				
				// Combine and deduplicate, prioritizing backend periods order
				const allPeriods = [...backendPeriods];
				scorePeriods.forEach((period) => {
					if (!allPeriods.includes(period)) {
						allPeriods.push(period);
					}
				});
				
				// Sort descending (newest first)
				allPeriods.sort().reverse();
				
				setPeriods(allPeriods);
			} catch (error: any) {
				console.error('Failed to load periods:', error);
				// Fallback to periods from scores if backend fails
				const scorePeriods = Array.from(new Set(esgScores.map((s) => s.period)))
					.sort()
					.reverse();
				setPeriods(scorePeriods);
			} finally {
				setLoadingPeriods(false);
			}
		};
		
		loadPeriods();
	}, [esgScores]);

	const handleDownloadPDF = async (period: string) => {
		if (!selectedCompanyId) {
			showToast.error("Please select a company");
			return;
		}

		setLoading(`pdf-${period}`);
		try {
			const response = await esgAPI.getReport(selectedCompanyId, "pdf", period);

			// Create blob and download
			const blob = new Blob([response.data], { type: "application/pdf" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `ESG-Report-${period}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			showToast.success(t("reports.pdfDownloadSuccess"));
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("reports.pdfDownloadFailed"));
		} finally {
			setLoading(null);
		}
	};

	const handleDownloadExcel = async (period: string) => {
		if (!selectedCompanyId) {
			showToast.error("Please select a company");
			return;
		}

		setLoading(`excel-${period}`);
		try {
			const response = await esgAPI.getReport(
				selectedCompanyId,
				"excel",
				period,
			);

			// Create blob and download
			const blob = new Blob([response.data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `ESG-Report-${period}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			showToast.success(t("reports.excelDownloadSuccess"));
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("reports.excelDownloadFailed"));
		} finally {
			setLoading(null);
		}
	};

	// Get unique periods from scores (for display purposes)
	const scorePeriods = Array.from(new Set(esgScores.map((s) => s.period)))
		.sort()
		.reverse();

	// Filter scores
	const filteredScores = esgScores.filter((score) => {
		const matchesSearch =
			searchTerm === "" ||
			score.period.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesPeriod =
			filterPeriod === "all" || score.period === filterPeriod;
		return matchesSearch && matchesPeriod;
	});

	// Calculate stats
	const avgOverallScore =
		esgScores.length > 0
			? esgScores.reduce((sum, s) => sum + s.overallScore, 0) / esgScores.length
			: 0;
	const avgEnvironmentalScore =
		esgScores.length > 0
			? esgScores.reduce((sum, s) => sum + s.environmentalScore, 0) / esgScores.length
			: 0;
	const avgSocialScore =
		esgScores.length > 0
			? esgScores.reduce((sum, s) => sum + s.socialScore, 0) / esgScores.length
			: 0;
	const avgGovernanceScore =
		esgScores.length > 0
			? esgScores.reduce((sum, s) => sum + s.governanceScore, 0) / esgScores.length
			: 0;

	// Prepare table columns
	const tableColumns = [
		{ label: t("dashboard.period"), field: "period", sortable: true },
		{ label: t("reports.overall"), field: "overallScore", sortable: true },
		{ label: t("reports.environmental"), field: "environmentalScore", sortable: true },
		{ label: t("reports.social"), field: "socialScore", sortable: true },
		{ label: t("reports.governance"), field: "governanceScore", sortable: true },
		{ label: t("reports.calculatedAt"), field: "calculatedAt", sortable: true },
		{
			label: t("common.actions"),
			field: "actions",
			sortable: false,
			formatFn: (value: any, row: any) => {
				const period = row?.period;
				if (!period) return null;

				return (
					<div className="flex items-center justify-end gap-1">
						<button
							onClick={() => handleDownloadPDF(period)}
							disabled={loading === `pdf-${period}`}
							className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
							title={t("reports.downloadPDF")}
						>
							<Download size={12} />
							PDF
						</button>
						<button
							onClick={() => handleDownloadExcel(period)}
							disabled={loading === `excel-${period}`}
							className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
							title={t("reports.downloadExcel")}
						>
							<Download size={12} />
							Excel
						</button>
					</div>
				);
			},
		},
	];

	// Prepare table rows
	const tableRows = filteredScores.map((score) => ({
		_id: score._id,
		period: score.period,
		overallScore: score.overallScore.toFixed(1),
		environmentalScore: score.environmentalScore.toFixed(1),
		socialScore: score.socialScore.toFixed(1),
		governanceScore: score.governanceScore.toFixed(1),
		calculatedAt: score.calculatedAt
			? new Date(score.calculatedAt).toLocaleDateString("en-IN")
			: "-",
		actions: { period: score.period },
	}));

	if (companies.length === 0) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<FileText className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("reports.noCompany")}</p>
					<Link
						href="/dashboard/company"
						className="text-green-600 hover:underline"
					>
						{t("reports.goToCompany")}
					</Link>
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
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("reports.title")}
						</h1>
						<p className="text-xs text-gray-600">{t("reports.subtitle")}</p>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Total Reports</div>
						<div className="text-lg font-semibold text-gray-900">
							{esgScores.length}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Periods</div>
						<div className="text-lg font-semibold text-green-600">
							{scorePeriods.length}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Avg Overall Score</div>
						<div className="text-lg font-semibold text-blue-600">
							{avgOverallScore.toFixed(1)}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Latest Score</div>
						<div className="text-lg font-semibold text-orange-600">
							{esgScores.length > 0 ? esgScores[0].overallScore.toFixed(1) : "0"}
						</div>
					</div>
				</div>

				{/* Period Filter Dropdown */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
					<div className="flex items-center gap-3">
						<label className="text-xs font-medium text-gray-700 whitespace-nowrap">
							{t("dashboard.period")}:
						</label>
						<select
							value={filterPeriod}
							onChange={(e) => setFilterPeriod(e.target.value)}
							disabled={loadingPeriods}
							className="flex-1 max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
						>
							<option value="all">{t("dashboard.allPeriods")}</option>
							{loadingPeriods ? (
								<option value="" disabled>{t("common.loading")}...</option>
							) : periods.length > 0 ? (
								periods.map((period) => (
									<option key={period} value={period}>
										{period}
									</option>
								))
							) : (
								scorePeriods.map((period) => (
									<option key={period} value={period}>
										{period}
									</option>
								))
							)}
						</select>
					</div>
				</div>

				{/* Reports Table */}
				{esgScores.length === 0 ? (
					<div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
						<FileText className="mx-auto text-gray-400 mb-3" size={36} />
						<h3 className="text-sm font-semibold text-gray-900 mb-1">
							{t("reports.noReports")}
						</h3>
						<p className="text-xs text-gray-600 mb-4">
							{t("reports.generateReport")}
						</p>
						<a
							href="/dashboard/environment"
							className="inline-block px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
						>
							{t("dashboard.addMetrics")}
						</a>
					</div>
				) : (
					<ETTable
						columns={tableColumns}
						rows={tableRows}
						loading={loadingState}
						title={t("reports.title")}
						showSearch={true}
						showDownloadBtn={false}
						showRefreshBtn={false}
						showSettingsBtn={false}
						placeholder={t("common.search") + " by period..."}
						rowCount={20}
						excelColumns={{
							period: t("dashboard.period"),
							overallScore: t("reports.overall"),
							environmentalScore: t("reports.environmental"),
							socialScore: t("reports.social"),
							governanceScore: t("reports.governance"),
							calculatedAt: t("reports.calculatedAt"),
						}}
						excelRows={filteredScores.map((score) => ({
							period: score.period,
							overallScore: score.overallScore,
							environmentalScore: score.environmentalScore,
							socialScore: score.socialScore,
							governanceScore: score.governanceScore,
							calculatedAt: score.calculatedAt
								? new Date(score.calculatedAt).toLocaleDateString("en-IN")
								: "-",
						}))}
						emptyText={t("reports.noReports")}
						totalRecords={filteredScores.length}
						onSearch={(params) => setSearchTerm(params.searchTerm || "")}
					>
						{filteredScores.length === 0 && (
							<div className="text-center py-8">
								<FileText size={32} className="mx-auto mb-2 text-gray-300" />
								<p className="text-xs text-gray-500 mb-2">
									{t("reports.noReports")}
								</p>
							</div>
						)}
					</ETTable>
				)}
			</div>
		</DashboardLayout>
	);
}
