"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Shield, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCompanyStore, useMetricsStore } from "@/stores";
import ETTable from "@/components/ETTable";

interface GovernanceMetric {
	_id: string;
	companyId: string;
	period: string;
	boardMembers?: number;
	independentDirectors?: number;
	antiCorruptionPolicy?: boolean;
	dataPrivacyPolicy?: boolean;
	complianceViolations?: number;
	createdAt: string;
	updatedAt: string;
}

export default function GovernancePage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [selectedCompanyId, setSelectedCompanyId] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPeriod, setFilterPeriod] = useState("all");
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	// Use stores
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const { 
		governance: governanceMetricsMap,
		fetchGovernance,
		deleteGovernance,
		isLoading: metricsLoading
	} = useMetricsStore();

	// Get metrics for selected company
	const metrics = selectedCompanyId ? (governanceMetricsMap[selectedCompanyId] || []) : [];
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
			fetchGovernance(selectedCompanyId);
		}
	}, [selectedCompanyId, fetchGovernance]);

	const handleDelete = async (id: string) => {
		if (!confirm(t("governance.deleteConfirm"))) return;

		try {
			setActionLoading(`delete-${id}`);
			await metricsAPI.deleteGovernance(id);
			// Update store
			deleteGovernance(id, selectedCompanyId);
			showToast.success(t("governance.deleteSuccess"));
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
		{ label: t("governance.boardMembers"), field: "boardMembers", sortable: true },
		{ label: t("governance.independentDirectors"), field: "independentDirectors", sortable: true },
		{ label: t("governance.antiCorruptionPolicy"), field: "antiCorruptionPolicy", sortable: true },
		{ label: t("governance.dataPrivacyPolicy"), field: "dataPrivacyPolicy", sortable: true },
		{ label: t("governance.complianceViolations"), field: "complianceViolations", sortable: true },
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
							href={`/dashboard/governance/edit/${metricId}`}
							className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
							title={t("governance.editMetric")}
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
		boardMembers: metric.boardMembers != null ? metric.boardMembers.toLocaleString() : "0",
		independentDirectors: metric.independentDirectors != null ? metric.independentDirectors.toLocaleString() : "0",
		antiCorruptionPolicy: metric.antiCorruptionPolicy ? "Yes" : "No",
		dataPrivacyPolicy: metric.dataPrivacyPolicy ? "Yes" : "No",
		complianceViolations: metric.complianceViolations != null ? metric.complianceViolations.toLocaleString() : "0",
		actions: { _id: metric._id },
	}));

	if (companies.length === 0) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Shield className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("governance.noCompany")}</p>
					<Link href="/dashboard/company" className="text-green-600 hover:underline">
						{t("governance.goToCompany")}
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
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("governance.title")}</h1>
						<p className="text-xs text-gray-600">{t("governance.subtitle")}</p>
					</div>
					<Link
						href="/dashboard/governance/create"
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
					title={t("governance.title")}
					showSearch={true}
					showDownloadBtn={true}
					showRefreshBtn={false}
					showSettingsBtn={false}
					disableDownload={filteredMetrics.length === 0}
					placeholder={t("common.search") + " by period..."}
					rowCount={20}
					downloadName={`governance-metrics-${new Date().toISOString().split("T")[0]}`}
					excelColumns={{
						period: t("dashboard.period"),
						boardMembers: t("governance.boardMembers"),
						independentDirectors: t("governance.independentDirectors"),
						antiCorruptionPolicy: t("governance.antiCorruptionPolicy"),
						dataPrivacyPolicy: t("governance.dataPrivacyPolicy"),
						complianceViolations: t("governance.complianceViolations"),
					}}
					excelRows={filteredMetrics.map((metric) => ({
						period: metric.period,
						boardMembers: metric.boardMembers,
						independentDirectors: metric.independentDirectors,
						antiCorruptionPolicy: metric.antiCorruptionPolicy ? "Yes" : "No",
						dataPrivacyPolicy: metric.dataPrivacyPolicy ? "Yes" : "No",
						complianceViolations: metric.complianceViolations,
					}))}
					emptyText={t("governance.noMetrics")}
					totalRecords={filteredMetrics.length}
					onSearch={(params) => setSearchTerm(params.searchTerm || "")}
				>
					{filteredMetrics.length === 0 && (
						<div className="text-center py-8">
							<Shield size={32} className="mx-auto mb-2 text-gray-300" />
							<p className="text-xs text-gray-500 mb-2">{t("governance.noMetrics")}</p>
							<Link
								href="/dashboard/governance/create"
								className="text-green-600 hover:underline text-xs"
							>
								{t("governance.addFirstMetric")}
							</Link>
						</div>
					)}
				</ETTable>
			</div>
		</DashboardLayout>
	);
}
