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
  // New fields
  totalEmployeesPermanent?: number;
  totalEmployeesContractual?: number;
  femalePercentWorkforce?: number;
  totalTrainingHoursPerEmployee?: number;
  accidentIncidents?: number;
  csrSpend?: number;
  // Legacy fields
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
  const [periods, setPeriods] = useState<string[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  // Use stores
  const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
  const {
    social: socialMetricsMap,
    fetchSocial,
    deleteSocial,
    clearCompanyCache,
    setSocial,
    isLoading: metricsLoading,
  } = useMetricsStore();

  // Get metrics for selected company
  const metrics = selectedCompanyId
    ? socialMetricsMap[selectedCompanyId] || []
    : [];
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

  useEffect(() => {
    // Load periods from backend
    const loadPeriods = async () => {
      setLoadingPeriods(true);
      try {
        const response = await metricsAPI.getPeriods();
        const backendPeriods = response.data.periods || [];
        
        // Get unique periods from actual metrics
        const metricPeriods = Array.from(new Set(metrics.map((m) => m.period)));
        
        // Combine and deduplicate, prioritizing backend periods order
        const allPeriods = [...backendPeriods];
        metricPeriods.forEach((period) => {
          if (!allPeriods.includes(period)) {
            allPeriods.push(period);
          }
        });
        
        // Sort descending (newest first)
        allPeriods.sort().reverse();
        
        setPeriods(allPeriods);
      } catch (error: any) {
        console.error('Failed to load periods:', error);
        // Fallback to periods from metrics if backend fails
        const metricPeriods = Array.from(new Set(metrics.map((m) => m.period)))
          .sort()
          .reverse();
        setPeriods(metricPeriods);
      } finally {
        setLoadingPeriods(false);
      }
    };
    
    loadPeriods();
  }, [metrics]);

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

  const handleRefresh = async () => {
    if (!selectedCompanyId) return;
    
    try {
      // Clear cache for this company to force fresh fetch
      clearCompanyCache(selectedCompanyId);
      
      // Fetch fresh data directly from server, bypassing cache
      setActionLoading("refresh");
      const response = await metricsAPI.getSocial(selectedCompanyId);
      const metrics = response.data.metrics || response.data.social || [];
      
      // Update store with fresh data from server
      setSocial(selectedCompanyId, metrics);
      
      showToast.success(t("social.refreshSuccess") || "Data refreshed successfully");
    } catch (error: any) {
      showToast.error(error.response?.data?.error || "Failed to refresh data");
    } finally {
      setActionLoading(null);
    }
  };

  // Get unique periods from metrics (for display purposes)
  const metricPeriods = Array.from(new Set(metrics.map((m) => m.period)))
    .sort()
    .reverse();

  // Filter metrics
  const filteredMetrics = metrics.filter((metric) => {
    const matchesSearch =
      searchTerm === "" ||
      metric.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod =
      filterPeriod === "all" || metric.period === filterPeriod;
    return matchesSearch && matchesPeriod;
  });

  // Prepare table columns
  const tableColumns = [
    { label: t("dashboard.period"), field: "period", sortable: true },
    {
      label: "Permanent Employees",
      field: "totalEmployeesPermanent",
      sortable: true,
    },
    {
      label: "Contractual Employees",
      field: "totalEmployeesContractual",
      sortable: true,
    },
    {
      label: "Female %",
      field: "femalePercentWorkforce",
      sortable: true,
    },
    {
      label: "Training Hours/Employee",
      field: "totalTrainingHoursPerEmployee",
      sortable: true,
    },
    {
      label: "Accident Incidents",
      field: "accidentIncidents",
      sortable: true,
    },
    {
      label: "CSR Spend",
      field: "csrSpend",
      sortable: true,
    },
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
    totalEmployeesPermanent:
      metric.totalEmployeesPermanent != null
        ? metric.totalEmployeesPermanent.toLocaleString()
        : metric.totalEmployees != null
        ? metric.totalEmployees.toLocaleString()
        : "0",
    totalEmployeesContractual:
      metric.totalEmployeesContractual != null
        ? metric.totalEmployeesContractual.toLocaleString()
        : "0",
    femalePercentWorkforce:
      metric.femalePercentWorkforce != null
        ? `${metric.femalePercentWorkforce.toFixed(1)}%`
        : metric.femaleEmployees != null && metric.totalEmployees != null && metric.totalEmployees > 0
        ? `${((metric.femaleEmployees / metric.totalEmployees) * 100).toFixed(1)}%`
        : "0%",
    totalTrainingHoursPerEmployee:
      metric.totalTrainingHoursPerEmployee != null
        ? metric.totalTrainingHoursPerEmployee.toFixed(1)
        : metric.avgTrainingHours != null
        ? metric.avgTrainingHours.toFixed(1)
        : "0",
    accidentIncidents:
      metric.accidentIncidents != null
        ? metric.accidentIncidents.toLocaleString()
        : metric.workplaceIncidents != null
        ? metric.workplaceIncidents.toLocaleString()
        : "0",
    csrSpend:
      metric.csrSpend != null
        ? metric.csrSpend.toLocaleString()
        : "0",
    actions: { _id: metric._id },
  }));

  if (companies.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">{t("social.noCompany")}</p>
          <Link
            href="/dashboard/company"
            className="text-green-600 hover:underline"
          >
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
            <h1 className="text-lg font-semibold text-gray-900 mb-0.5">
              {t("social.title")}
            </h1>
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
                metricPeriods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Metrics Table */}
        <ETTable
          columns={tableColumns}
          rows={tableRows}
          loading={loading}
          title={`${t("social.title")} (${filteredMetrics.length})`}
          showSearch={true}
          showDownloadBtn={true}
          showRefreshBtn={true}
          onRefresh={handleRefresh}
          showSettingsBtn={false}
          disableDownload={filteredMetrics.length === 0}
          placeholder={t("common.search") + " by period..."}
          rowCount={20}
          downloadName={`social-metrics-${new Date().toISOString().split("T")[0]}`}
          excelColumns={{
            period: t("dashboard.period"),
            totalEmployeesPermanent: "Permanent Employees",
            totalEmployeesContractual: "Contractual Employees",
            femalePercentWorkforce: "Female %",
            totalTrainingHoursPerEmployee: "Training Hours/Employee",
            accidentIncidents: "Accident Incidents",
            csrSpend: "CSR Spend",
          }}
          excelRows={filteredMetrics.map((metric) => ({
            period: metric.period,
            totalEmployeesPermanent: metric.totalEmployeesPermanent ?? metric.totalEmployees ?? 0,
            totalEmployeesContractual: metric.totalEmployeesContractual ?? 0,
            femalePercentWorkforce: metric.femalePercentWorkforce ?? (metric.femaleEmployees && metric.totalEmployees ? (metric.femaleEmployees / metric.totalEmployees) * 100 : 0),
            totalTrainingHoursPerEmployee: metric.totalTrainingHoursPerEmployee ?? metric.avgTrainingHours ?? 0,
            accidentIncidents: metric.accidentIncidents ?? metric.workplaceIncidents ?? 0,
            csrSpend: metric.csrSpend ?? 0,
          }))}
          emptyText={t("social.noMetrics")}
          totalRecords={filteredMetrics.length}
          onSearch={(params) => setSearchTerm(params.searchTerm || "")}
        >
          {filteredMetrics.length === 0 && (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-gray-500 mb-2">
                {t("social.noMetrics")}
              </p>
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
