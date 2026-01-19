"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { companyAPI, metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Leaf, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCompanyStore, useMetricsStore } from "@/stores";
import ETTable from "@/components/ETTable";

interface EnvironmentalMetric {
	_id: string;
	companyId: string;
	period: string;
	electricityUsageKwh: number;
	fuelConsumptionLitres: number;
	waterUsageKL: number;
	wasteGeneratedKg: number;
	renewableEnergyPercent: number;
	carbonEmissionsTons: number;
	createdAt: string;
	updatedAt: string;
}

export default function EnvironmentPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const [selectedCompanyId, setSelectedCompanyId] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPeriod, setFilterPeriod] = useState("all");
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	// Use stores
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const { 
		environmental: environmentalMetricsMap,
		fetchEnvironmental,
		deleteEnvironmental,
		isLoading: metricsLoading
	} = useMetricsStore();

	// Get metrics for selected company
	const metrics = selectedCompanyId ? (environmentalMetricsMap[selectedCompanyId] || []) : [];
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
			fetchEnvironmental(selectedCompanyId);
		}
	}, [selectedCompanyId, fetchEnvironmental]);

	const handleDelete = async (id: string) => {
		if (!confirm(t("environment.deleteConfirm"))) return;

		try {
			setActionLoading(`delete-${id}`);
			await metricsAPI.deleteEnvironmental(id);
			// Update store
			deleteEnvironmental(id, selectedCompanyId);
			showToast.success(t("environment.deleteSuccess"));
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
		{ label: t("environment.electricityUsage"), field: "electricityUsageKwh", sortable: true },
		{ label: t("environment.fuelConsumption"), field: "fuelConsumptionLitres", sortable: true },
		{ label: t("environment.waterUsage"), field: "waterUsageKL", sortable: true },
		{ label: t("environment.wasteGenerated"), field: "wasteGeneratedKg", sortable: true },
		{ label: t("environment.renewableEnergy"), field: "renewableEnergyPercent", sortable: true },
		{ label: t("environment.carbonEmissions"), field: "carbonEmissionsTons", sortable: true },
		{
			label: t("common.actions"),
			field: "actions",
			sortable: false,
			formatFn: (value: any, row: any) => {
				// Use row._id directly since we're passing the full row now
				const metricId = row?._id;
				if (!metricId) return null;
				
				return (
					<div className="flex items-center justify-end gap-1">
						<Link
							href={`/dashboard/environment/edit/${metricId}`}
							className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
							title={t("environment.editMetric")}
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
		electricityUsageKwh: metric.electricityUsageKwh != null ? metric.electricityUsageKwh.toLocaleString() : "0",
		fuelConsumptionLitres: metric.fuelConsumptionLitres != null ? metric.fuelConsumptionLitres.toLocaleString() : "0",
		waterUsageKL: metric.waterUsageKL != null ? metric.waterUsageKL.toLocaleString() : "0",
		wasteGeneratedKg: metric.wasteGeneratedKg != null ? metric.wasteGeneratedKg.toLocaleString() : "0",
		renewableEnergyPercent: metric.renewableEnergyPercent != null ? `${metric.renewableEnergyPercent.toFixed(1)}%` : "0%",
		carbonEmissionsTons: metric.carbonEmissionsTons != null ? metric.carbonEmissionsTons.toLocaleString() : "0",
		actions: { _id: metric._id },
	}));

	if (companies.length === 0) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Leaf className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("environment.noCompany")}</p>
					<Link href="/dashboard/company" className="text-green-600 hover:underline">
						{t("environment.goToCompany")}
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
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("environment.title")}</h1>
						<p className="text-xs text-gray-600">{t("environment.subtitle")}</p>
					</div>
					<Link
						href="/dashboard/environment/create"
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
								className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
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
									className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
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
					title={t("environment.title")}
					showSearch={true}
					showDownloadBtn={true}
					showRefreshBtn={false}
					showSettingsBtn={false}
					disableDownload={filteredMetrics.length === 0}
					placeholder={t("common.search") + " by period..."}
					rowCount={20}
					downloadName={`environmental-metrics-${new Date().toISOString().split("T")[0]}`}
					excelColumns={{
						period: t("dashboard.period"),
						electricityUsageKwh: t("environment.electricityUsage"),
						fuelConsumptionLitres: t("environment.fuelConsumption"),
						waterUsageKL: t("environment.waterUsage"),
						wasteGeneratedKg: t("environment.wasteGenerated"),
						renewableEnergyPercent: t("environment.renewableEnergy"),
						carbonEmissionsTons: t("environment.carbonEmissions"),
					}}
					excelRows={filteredMetrics.map((metric) => ({
						period: metric.period,
						electricityUsageKwh: metric.electricityUsageKwh,
						fuelConsumptionLitres: metric.fuelConsumptionLitres,
						waterUsageKL: metric.waterUsageKL,
						wasteGeneratedKg: metric.wasteGeneratedKg,
						renewableEnergyPercent: metric.renewableEnergyPercent,
						carbonEmissionsTons: metric.carbonEmissionsTons,
					}))}
					emptyText={t("environment.noMetrics")}
					totalRecords={filteredMetrics.length}
					onSearch={(params) => setSearchTerm(params.searchTerm || "")}
				>
					{filteredMetrics.length === 0 && (
						<div className="text-center py-8">
							<Leaf size={32} className="mx-auto mb-2 text-gray-300" />
							<p className="text-xs text-gray-500 mb-2">{t("environment.noMetrics")}</p>
							<Link
								href="/dashboard/environment/create"
								className="text-green-600 hover:underline text-xs"
							>
								{t("environment.addFirstMetric")}
							</Link>
						</div>
					)}
				</ETTable>

				{/* Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Total Metrics</div>
						<div className="text-lg font-semibold text-gray-900">{metrics.length}</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Periods</div>
						<div className="text-lg font-semibold text-green-600">{periods.length}</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Avg Renewable Energy</div>
						<div className="text-lg font-semibold text-blue-600">
							{metrics.length > 0
								? (metrics.reduce((sum, m) => sum + m.renewableEnergyPercent, 0) / metrics.length).toFixed(1)
								: "0"}
							%
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">Total Carbon (tons)</div>
						<div className="text-lg font-semibold text-orange-600">
							{metrics.reduce((sum, m) => sum + m.carbonEmissionsTons, 0).toLocaleString()}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
