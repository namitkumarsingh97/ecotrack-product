"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Database, CheckCircle2, XCircle, AlertCircle, Leaf, Users, Shield, Plus, Edit, ArrowRight } from "lucide-react";
import { useCompanyStore } from "@/stores";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import ETTable from "@/components/ETTable";

interface ModuleStatus {
	exists: boolean;
	metricId?: string;
	lastUpdated?: string;
}

interface PeriodStatus {
	period: string;
	isComplete: boolean;
	completionPercentage: number;
	modules: {
		environment: ModuleStatus;
		social: ModuleStatus;
		governance: ModuleStatus;
	};
	lastUpdated: string | null;
}

interface CollectionHubData {
	company: {
		name: string;
		industry: string;
	};
	statistics: {
		totalPeriods: number;
		completePeriods: number;
		incompletePeriods: number;
		overallCompletion: number;
		totalMetrics: number;
		moduleCounts: {
			environment: number;
			social: number;
			governance: number;
		};
	};
	collectionStatus: PeriodStatus[];
	periods: string[];
}

export default function DataCollectionHubPage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<CollectionHubData | null>(null);
	const [filterPeriod, setFilterPeriod] = useState("all");
	const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "incomplete">("all");

	// Use company store
	const { selectedCompany, fetchCompanies } = useCompanyStore();

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (selectedCompany?._id) {
			loadCollectionHub();
		}
	}, [selectedCompany?._id]);

	const loadCollectionHub = async () => {
		if (!selectedCompany?._id) return;

		setLoading(true);
		try {
			const response = await metricsAPI.getCollectionHub(selectedCompany._id);
			setData(response.data);
			showToast.success(t("dataCollection.refreshSuccess") || "Data refreshed successfully");
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("dataCollection.loadError"));
		} finally {
			setLoading(false);
		}
	};

	if (!selectedCompany) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<Database className="mx-auto text-gray-400 mb-4" size={48} />
					<p className="text-gray-600 mb-4">{t("dataCollection.noCompanySelected")}</p>
					<p className="text-xs text-gray-500">{t("dataCollection.selectCompanyFromNav")}</p>
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
					<Database className="mx-auto text-gray-400 mb-4" size={48} />
					<h3 className="text-sm font-semibold text-gray-900 mb-2">{t("dataCollection.noData")}</h3>
					<p className="text-xs text-gray-600 mb-4">{t("dataCollection.startCollecting")}</p>
				</div>
			</DashboardLayout>
		);
	}

	// Filter collection status
	const filteredStatus = data.collectionStatus.filter((status) => {
		const matchesPeriod = filterPeriod === "all" || status.period === filterPeriod;
		const matchesStatus =
			filterStatus === "all" ||
			(filterStatus === "complete" && status.isComplete) ||
			(filterStatus === "incomplete" && !status.isComplete);
		return matchesPeriod && matchesStatus;
	});

	// Prepare table columns
	const tableColumns = [
		{ label: t("dataCollection.period"), field: "period", sortable: true },
		{ label: t("dataCollection.status"), field: "status", sortable: false },
		{ label: t("dataCollection.completion"), field: "completion", sortable: true },
		{ label: t("environment.title"), field: "environment", sortable: false },
		{ label: t("social.title"), field: "social", sortable: false },
		{ label: t("governance.title"), field: "governance", sortable: false },
		{ label: t("dataCollection.lastUpdated"), field: "lastUpdated", sortable: true },
		{ label: t("common.actions"), field: "actions", sortable: false },
	];

	// Prepare table rows
	const tableRows = filteredStatus.map((status) => {
		// Determine status color based on completion percentage
		let statusColor = "";
		let statusBg = "";
		let statusIcon = null;
		
		if (status.isComplete) {
			// Complete - green shades
			statusColor = "text-green-700";
			statusBg = "bg-green-100";
			statusIcon = <CheckCircle2 size={12} className="text-green-600" />;
		} else if (status.completionPercentage >= 66) {
			// Almost complete - blue shades
			statusColor = "text-blue-700";
			statusBg = "bg-blue-100";
			statusIcon = <AlertCircle size={12} className="text-blue-600" />;
		} else if (status.completionPercentage >= 33) {
			// Partially complete - yellow/orange shades
			statusColor = "text-orange-700";
			statusBg = "bg-orange-100";
			statusIcon = <AlertCircle size={12} className="text-orange-600" />;
		} else {
			// Incomplete - red shades
			statusColor = "text-red-700";
			statusBg = "bg-red-100";
			statusIcon = <AlertCircle size={12} className="text-red-600" />;
		}

		return {
			_id: status.period,
			period: status.period,
			status: (
				<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${statusBg} ${statusColor} rounded-md text-xs font-semibold shadow-sm`}>
					{statusIcon}
					{status.isComplete ? t("dataCollection.complete") : t("dataCollection.incomplete")}
				</span>
			),
		completion: `${status.completionPercentage}%`,
		environment: status.modules.environment.exists ? (
			<Link
				href={`/dashboard/environment/edit/${status.modules.environment.metricId}`}
				className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs"
			>
				<CheckCircle2 size={12} />
				{t("common.edit")}
			</Link>
		) : (
			<Link
				href="/dashboard/environment/create"
				className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
			>
				<Plus size={12} />
				{t("common.create")}
			</Link>
		),
		social: status.modules.social.exists ? (
			<Link
				href={`/dashboard/social/edit/${status.modules.social.metricId}`}
				className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs"
			>
				<CheckCircle2 size={12} />
				{t("common.edit")}
			</Link>
		) : (
			<Link
				href="/dashboard/social/create"
				className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
			>
				<Plus size={12} />
				{t("common.create")}
			</Link>
		),
		governance: status.modules.governance.exists ? (
			<Link
				href={`/dashboard/governance/edit/${status.modules.governance.metricId}`}
				className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs"
			>
				<CheckCircle2 size={12} />
				{t("common.edit")}
			</Link>
		) : (
			<Link
				href="/dashboard/governance/create"
				className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
			>
				<Plus size={12} />
				{t("common.create")}
			</Link>
		),
			lastUpdated: status.lastUpdated
				? new Date(status.lastUpdated).toLocaleDateString()
				: "-",
			actions: { period: status.period },
		};
	});

	return (
		<DashboardLayout>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold text-gray-900 mb-0.5">
							{t("dataCollection.title")}
						</h1>
						<p className="text-xs text-gray-600">
							{selectedCompany?.name} - {t("dataCollection.subtitle")}
						</p>
					</div>
					<button
						onClick={loadCollectionHub}
						disabled={loading}
						className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
					>
						<Database size={14} className={loading ? "animate-spin" : ""} />
						{t("dataCollection.refresh")}
					</button>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("dataCollection.totalPeriods")}</div>
						<div className="text-lg font-semibold text-gray-900">
							{data.statistics.totalPeriods}
						</div>
						<div className="text-xs text-gray-500 mt-0.5">
							{data.statistics.completePeriods} {t("dataCollection.complete")}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("dataCollection.overallCompletion")}</div>
						<div className="text-lg font-semibold text-green-600">
							{data.statistics.overallCompletion}%
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
							<div
								className="bg-green-600 h-1.5 rounded-full transition-all"
								style={{ width: `${data.statistics.overallCompletion}%` }}
							></div>
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("dataCollection.totalMetrics")}</div>
						<div className="text-lg font-semibold text-blue-600">
							{data.statistics.totalMetrics}
						</div>
						<div className="text-xs text-gray-500 mt-0.5">
							E: {data.statistics.moduleCounts.environment}, S: {data.statistics.moduleCounts.social}, G: {data.statistics.moduleCounts.governance}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
						<div className="text-xs text-gray-600">{t("dataCollection.incompletePeriods")}</div>
						<div className="text-lg font-semibold text-yellow-600">
							{data.statistics.incompletePeriods}
						</div>
						<div className="text-xs text-gray-500 mt-0.5">
							{t("dataCollection.needsAttention")}
						</div>
					</div>
				</div>

				{/* Module Status Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
					<Link
						href="/dashboard/environment"
						className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all group"
					>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-green-100 rounded-lg">
									<Leaf size={16} className="text-green-600" />
								</div>
								<h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600">
									{t("environment.title")}
								</h3>
							</div>
							<ArrowRight size={14} className="text-gray-400 group-hover:text-green-600" />
						</div>
						<div className="text-xs text-gray-600 mb-1">{t("dataCollection.metricsCollected")}</div>
						<div className="text-lg font-semibold text-green-600">
							{data.statistics.moduleCounts.environment}
						</div>
					</Link>

					<Link
						href="/dashboard/social"
						className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all group"
					>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-blue-100 rounded-lg">
									<Users size={16} className="text-blue-600" />
								</div>
								<h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
									{t("social.title")}
								</h3>
							</div>
							<ArrowRight size={14} className="text-gray-400 group-hover:text-blue-600" />
						</div>
						<div className="text-xs text-gray-600 mb-1">{t("dataCollection.metricsCollected")}</div>
						<div className="text-lg font-semibold text-blue-600">
							{data.statistics.moduleCounts.social}
						</div>
					</Link>

					<Link
						href="/dashboard/governance"
						className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all group"
					>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-purple-100 rounded-lg">
									<Shield size={16} className="text-purple-600" />
								</div>
								<h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600">
									{t("governance.title")}
								</h3>
							</div>
							<ArrowRight size={14} className="text-gray-400 group-hover:text-purple-600" />
						</div>
						<div className="text-xs text-gray-600 mb-1">{t("dataCollection.metricsCollected")}</div>
						<div className="text-lg font-semibold text-purple-600">
							{data.statistics.moduleCounts.governance}
						</div>
					</Link>
				</div>

				{/* Filters */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
					<div className="flex items-center gap-2 flex-wrap">
						{/* Period Filter */}
						<select
							value={filterPeriod}
							onChange={(e) => setFilterPeriod(e.target.value)}
							className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
						>
							<option value="all">{t("dataCollection.allPeriods")}</option>
							{data.periods.slice(0, 10).map((period) => (
								<option key={period} value={period}>
									{period}
								</option>
							))}
						</select>

						{/* Status Filter */}
						<button
							onClick={() => setFilterStatus("all")}
							className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
								filterStatus === "all"
									? "bg-green-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							{t("dataCollection.all")}
						</button>
						<button
							onClick={() => setFilterStatus("complete")}
							className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
								filterStatus === "complete"
									? "bg-green-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							{t("dataCollection.complete")}
						</button>
						<button
							onClick={() => setFilterStatus("incomplete")}
							className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
								filterStatus === "incomplete"
									? "bg-yellow-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							{t("dataCollection.incomplete")}
						</button>
					</div>
				</div>

				{/* Collection Status Table */}
				<ETTable
					columns={tableColumns}
					rows={tableRows}
					loading={loading}
					title={`${t("dataCollection.collectionStatus")} (${filteredStatus.length})`}
					showSearch={false}
					showDownloadBtn={true}
					showRefreshBtn={true}
					showSettingsBtn={false}
					disableDownload={filteredStatus.length === 0}
					downloadName={`data-collection-${new Date().toISOString().split("T")[0]}`}
					onRefresh={loadCollectionHub}
					excelColumns={{
						period: t("dataCollection.period"),
						status: t("dataCollection.status"),
						completion: t("dataCollection.completion"),
						environment: t("environment.title"),
						social: t("social.title"),
						governance: t("governance.title"),
						lastUpdated: t("dataCollection.lastUpdated"),
					}}
					excelRows={filteredStatus.map((status) => ({
						period: status.period,
						status: status.isComplete ? t("dataCollection.complete") : t("dataCollection.incomplete"),
						completion: `${status.completionPercentage}%`,
						environment: status.modules.environment.exists ? "Yes" : "No",
						social: status.modules.social.exists ? "Yes" : "No",
						governance: status.modules.governance.exists ? "Yes" : "No",
						lastUpdated: status.lastUpdated ? new Date(status.lastUpdated).toLocaleDateString() : "-",
					}))}
					emptyText={t("dataCollection.noDataFound")}
					totalRecords={filteredStatus.length}
					paginationEnabled={true}
					rowCount={15}
				>
					{filteredStatus.length === 0 && (
						<div className="text-center py-8">
							<Database size={32} className="mx-auto mb-2 text-gray-300" />
							<p className="text-xs text-gray-500">{t("dataCollection.noDataFound")}</p>
						</div>
					)}
				</ETTable>
			</div>
		</DashboardLayout>
	);
}

