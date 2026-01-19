"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCompanyStore, useMetricsStore } from "@/stores";
import ETTable from "@/components/ETTable";

interface SocialMetric {
	_id: string;
	companyId: string;
	period: string;
	totalEmployees?: number;
	femaleEmployees?: number;
	avgTrainingHours?: number;
	workplaceIncidents?: number;
	employeeTurnoverPercent?: number;
	createdAt: string;
	updatedAt: string;
}

export default function SocialPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [selectedCompanyId, setSelectedCompanyId] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPeriod, setFilterPeriod] = useState("all");
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	// Use stores
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const { 
		social: socialMetricsMap,
		fetchSocial,
		deleteSocial,
		isLoading: metricsLoading
	} = useMetricsStore();

	// Get metrics for selected company
	const metrics = selectedCompanyId ? (socialMetricsMap[selectedCompanyId] || []) : [];
	const loading = metricsLoading[selectedCompanyId] || false;

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
		// Fetch metrics when company changes (with caching)
		if (selectedCompanyId) {
			fetchSocial(selectedCompanyId);
		}
	}, [selectedCompanyId, fetchSocial]);

	const handleDelete = async (id: string) => {
		if (!confirm(t("social.deleteConfirm"))) return;

		try {
			setActionLoading(`delete-${id}`);
			await metricsAPI.deleteSocial(id);
			// Update store
			deleteSocial(id, selectedCompanyId);
			showToast.success(t("social.deleteSuccess"));
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to delete metric");
		} finally {
			setActionLoading(null);
		}
	};

	// Get unique periods for chips
	const periods = Array.from(new Set(metrics.map((m) => m.period))).sort().reverse();

	// Filter metrics
	const filteredMetrics = metrics.filter((metric) => {
		const matchesSearch = searchTerm === "" || metric.period.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesPeriod = filterPeriod === "all" || metric.period === filterPeriod;
		return matchesSearch && matchesPeriod;
	});

	// Prepare table columns
	const tableColumns = [
		{ label: t("dashboard.period"), field: "period", sortable: true },
		{ label: t("social.totalEmployees"), field: "totalEmployees", sortable: true },
		{ label: t("social.femaleEmployees"), field: "femaleEmployees", sortable: true },
		{ label: t("social.avgTrainingHours"), field: "avgTrainingHours", sortable: true },
		{ label: t("social.workplaceIncidents"), field: "workplaceIncidents", sortable: true },
		{ label: t("social.employeeTurnover"), field: "employeeTurnoverPercent", sortable: true },
		{
			label: t("common.actions"),
			field: "actions",
			sortable: false,
			formatFn: (value: any, row: any) => {
				const metricId = row?._id;
				if (!metricId) return null;
				
				return (
					<div className="flex items-center justify-end gap-1">
						<Link
							href={`/dashboard/social/edit/${metricId}`}
							className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
							title={t("social.editMetric")}
							onClick={(e) => e.stopPropagation()}
						>
							<Edit size={14} />
						</Link>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleDelete(metricId);
							}}
							disabled={actionLoading === `delete-${metricId}`}
							className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
							title={t("common.delete")}
						>
							<Trash2 size={14} />
						</button>
					</div>
				);
			},
		},
	];

	// Prepare table rows
	const tableRows = filteredMetrics.map((metric) => ({
		_id: metric._id,
		period: metric.period,
		totalEmployees: metric.totalEmployees != null ? metric.totalEmployees.toLocaleString() : "0",
		femaleEmployees: metric.femaleEmployees != null ? metric.femaleEmployees.toLocaleString() : "0",
		avgTrainingHours: metric.avgTrainingHours != null ? metric.avgTrainingHours.toFixed(1) : "0",
		workplaceIncidents: metric.workplaceIncidents != null ? metric.workplaceIncidents.toLocaleString() : "0",
		employeeTurnoverPercent: metric.employeeTurnoverPercent != null ? `${metric.employeeTurnoverPercent.toFixed(1)}%` : "0%",
		actions: { _id: metric._id },
	}));

	if (companies.length === 0) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Users className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("social.noCompany")}</p>
					<Link href="/dashboard/company" className="text-green-600 hover:underline">
						{t("social.goToCompany")}
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header with Create Button at Top Right */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("social.title")}</h1>
						<p className="text-xs text-gray-600">{t("social.subtitle")}</p>
					</div>
					<Link
						href="/dashboard/social/create"
						className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
					>
						<Plus size={14} />
						{t("common.create")}
					</Link>
				</div>

				{/* Period Chips - At Top */}
				{periods.length > 0 && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="flex items-center gap-2 flex-wrap">
							<button
								onClick={() => setFilterPeriod("all")}
								className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
									filterPeriod === "all"
										? "bg-green-600 text-white"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}
							>
								{t("dashboard.allPeriods")}
							</button>
							{periods.slice(0, 3).map((period) => (
								<button
									key={period}
									onClick={() => setFilterPeriod(period)}
									className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
										filterPeriod === period
											? "bg-green-600 text-white"
											: "bg-gray-200 text-gray-700 hover:bg-gray-300"
									}`}
								>
									{period}
								</button>
							))}
							{periods.length > 3 && (
								<span className="text-xs text-gray-500 px-2">
									+{periods.length - 3} more
								</span>
							)}
						</div>
					</div>
				)}

				{/* Company Selector */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
					<label className="block text-xs font-medium text-gray-700 mb-1">{t("dashboard.selectCompany")}</label>
					<select
						value={selectedCompanyId}
						onChange={(e) => setSelectedCompanyId(e.target.value)}
						className="w-full md:w-auto px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
					>
						{companies.map((company) => (
							<option key={company._id} value={company._id}>
								{company.name}
							</option>
						))}
					</select>
				</div>

				{/* Metrics Table */}
				<ETTable
					columns={tableColumns}
					rows={tableRows}
					loading={loading}
					title={t("social.title")}
					showSearch={true}
					showDownloadBtn={true}
					showRefreshBtn={false}
					showSettingsBtn={false}
					disableDownload={filteredMetrics.length === 0}
					placeholder={t("common.search") + " by period..."}
					rowCount={20}
					downloadName={`social-metrics-${new Date().toISOString().split("T")[0]}`}
					excelColumns={{
						period: t("dashboard.period"),
						totalEmployees: t("social.totalEmployees"),
						femaleEmployees: t("social.femaleEmployees"),
						avgTrainingHours: t("social.avgTrainingHours"),
						workplaceIncidents: t("social.workplaceIncidents"),
						employeeTurnoverPercent: t("social.employeeTurnover"),
					}}
					excelRows={filteredMetrics.map((metric) => ({
						period: metric.period,
						totalEmployees: metric.totalEmployees,
						femaleEmployees: metric.femaleEmployees,
						avgTrainingHours: metric.avgTrainingHours,
						workplaceIncidents: metric.workplaceIncidents,
						employeeTurnoverPercent: metric.employeeTurnoverPercent,
					}))}
					emptyText={t("social.noMetrics")}
					totalRecords={filteredMetrics.length}
					onSearch={(params) => setSearchTerm(params.searchTerm || "")}
				>
					{filteredMetrics.length === 0 && (
						<div className="text-center py-8">
							<Users size={32} className="mx-auto mb-2 text-gray-300" />
							<p className="text-xs text-gray-500 mb-2">{t("social.noMetrics")}</p>
							<Link
								href="/dashboard/social/create"
								className="text-green-600 hover:underline text-xs"
							>
								{t("social.addFirstMetric")}
							</Link>
						</div>
					)}
				</ETTable>
			</div>
		</DashboardLayout>
	);
}
