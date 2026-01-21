"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { metricsAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Shield, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompanyStore } from "@/stores";
import GovernanceFormTabs from "@/components/GovernanceFormTabs";

export default function EditGovernancePage() {
	const router = useRouter();
	const params = useParams();
	const { t } = useTranslation();
	const { companies, selectedCompany, fetchCompanies } = useCompanyStore();
	const [formData, setFormData] = useState({
		period: "",
		companyId: "",
		// Tab 1: Board & Leadership
		boardMembers: "",
		independentDirectors: "",
		boardDiversityPercent: "",
		esgCommitteeExists: false,
		esgCommitteeStructure: "",
		boardEsgDiscussionFrequency: "",
		// Tab 2: Policies & Ethics
		codeOfConductExists: false,
		codeOfConductDetails: "",
		antiCorruptionPolicy: false,
		antiCorruptionPolicyDetails: "",
		whistleblowerPolicyExists: false,
		whistleblowerPolicyDetails: "",
		// Tab 3: Risk Management
		identifiedEsgRisks: "",
		riskMitigationPlans: "",
		monitoringEscalationMechanisms: "",
		complianceViolations: "",
		auditResults: "",
		// Tab 4: Transparency & Reporting
		materialEsgRisksDisclosed: false,
		materialEsgRisksDetails: "",
		reportingGovernancePolicies: "",
		thirdPartyAuditExists: false,
		thirdPartyAuditDetails: "",
		// Tab 5: Supplier & Customer Governance
		supplierEsgGuidelinesExists: false,
		supplierEsgGuidelinesDetails: "",
		fairBusinessPractices: "",
		contractualGovernanceClauses: "",
		// Legacy fields
		dataPrivacyPolicy: false,
	});
	const [loading, setLoading] = useState(false);
	const [metricLoading, setMetricLoading] = useState(true);
	const [periods, setPeriods] = useState<string[]>([]);
	const [loadingPeriods, setLoadingPeriods] = useState(false);

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (params.id) {
			loadMetric(params.id as string);
		}
	}, [params.id]);

	useEffect(() => {
		const loadPeriods = async () => {
			setLoadingPeriods(true);
			try {
				const response = await metricsAPI.getPeriods();
				const loadedPeriods = response.data.periods || [];
				
				// If formData.period exists and is not in the list, add it
				if (formData.period && !loadedPeriods.includes(formData.period)) {
					loadedPeriods.push(formData.period);
					loadedPeriods.sort().reverse(); // Sort descending
				}
				
				setPeriods(loadedPeriods);
			} catch (error: any) {
				console.error('Failed to load periods:', error);
				showToast.error("Failed to load periods");
			} finally {
				setLoadingPeriods(false);
			}
		};
		loadPeriods();
	}, [formData.period]);

	const loadMetric = async (id: string) => {
		try {
			setMetricLoading(true);
			const response = await metricsAPI.getGovernanceById(id);
			const metric = response.data.metric;

			if (!metric) {
				showToast.error("Metric not found");
				router.push("/dashboard/governance");
				return;
			}

			// Helper function to safely convert number to string
			const numToString = (value: any): string => {
				if (value === null || value === undefined) return "";
				if (typeof value === "number") return value.toString();
				return String(value);
			};

			// Helper function to safely convert ObjectId to string
			const idToString = (value: any): string => {
				if (!value) return "";
				if (typeof value === "object" && value.toString) return value.toString();
				return String(value);
			};

			const periodValue = metric.period || "";
			
			// Ensure the period from backend is in the periods list
			if (periodValue && !periods.includes(periodValue)) {
				setPeriods((prev) => {
					const updated = [...prev, periodValue];
					return updated.sort().reverse(); // Sort descending
				});
			}

			setFormData({
				period: periodValue,
				companyId: idToString(metric.companyId),
				// Tab 1
				boardMembers: numToString(metric.boardMembers),
				independentDirectors: numToString(metric.independentDirectors),
				boardDiversityPercent: numToString(metric.boardDiversityPercent),
				esgCommitteeExists: Boolean(metric.esgCommitteeExists),
				esgCommitteeStructure: metric.esgCommitteeStructure || "",
				boardEsgDiscussionFrequency: metric.boardEsgDiscussionFrequency || "",
				// Tab 2
				codeOfConductExists: Boolean(metric.codeOfConductExists),
				codeOfConductDetails: metric.codeOfConductDetails || "",
				antiCorruptionPolicy: Boolean(metric.antiCorruptionPolicy),
				antiCorruptionPolicyDetails: metric.antiCorruptionPolicyDetails || "",
				whistleblowerPolicyExists: Boolean(metric.whistleblowerPolicyExists),
				whistleblowerPolicyDetails: metric.whistleblowerPolicyDetails || "",
				// Tab 3
				identifiedEsgRisks: metric.identifiedEsgRisks || "",
				riskMitigationPlans: metric.riskMitigationPlans || "",
				monitoringEscalationMechanisms: metric.monitoringEscalationMechanisms || "",
				complianceViolations: numToString(metric.complianceViolations),
				auditResults: metric.auditResults || "",
				// Tab 4
				materialEsgRisksDisclosed: Boolean(metric.materialEsgRisksDisclosed),
				materialEsgRisksDetails: metric.materialEsgRisksDetails || "",
				reportingGovernancePolicies: metric.reportingGovernancePolicies || "",
				thirdPartyAuditExists: Boolean(metric.thirdPartyAuditExists),
				thirdPartyAuditDetails: metric.thirdPartyAuditDetails || "",
				// Tab 5
				supplierEsgGuidelinesExists: Boolean(metric.supplierEsgGuidelinesExists),
				supplierEsgGuidelinesDetails: metric.supplierEsgGuidelinesDetails || "",
				fairBusinessPractices: metric.fairBusinessPractices || "",
				contractualGovernanceClauses: metric.contractualGovernanceClauses || "",
				// Legacy
				dataPrivacyPolicy: Boolean(metric.dataPrivacyPolicy),
			});
		} catch (error: any) {
			showToast.error(error.response?.data?.error || "Failed to load metric");
			router.push("/dashboard/governance");
		} finally {
			setMetricLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const companyId = selectedCompany?._id || formData.companyId;
			if (!companyId) {
				showToast.error("Please select a company from the top navigation");
				return;
			}

			const data: any = {
				companyId: companyId,
				period: formData.period,
			};

			// Tab 1: Board & Leadership
			if (formData.boardMembers) data.boardMembers = parseInt(formData.boardMembers);
			if (formData.independentDirectors) data.independentDirectors = parseInt(formData.independentDirectors);
			if (formData.boardDiversityPercent) data.boardDiversityPercent = parseFloat(formData.boardDiversityPercent);
			data.esgCommitteeExists = formData.esgCommitteeExists;
			if (formData.esgCommitteeStructure) data.esgCommitteeStructure = formData.esgCommitteeStructure;
			if (formData.boardEsgDiscussionFrequency) data.boardEsgDiscussionFrequency = formData.boardEsgDiscussionFrequency;

			// Tab 2: Policies & Ethics
			data.codeOfConductExists = formData.codeOfConductExists;
			if (formData.codeOfConductDetails) data.codeOfConductDetails = formData.codeOfConductDetails;
			data.antiCorruptionPolicy = formData.antiCorruptionPolicy;
			if (formData.antiCorruptionPolicyDetails) data.antiCorruptionPolicyDetails = formData.antiCorruptionPolicyDetails;
			data.whistleblowerPolicyExists = formData.whistleblowerPolicyExists;
			if (formData.whistleblowerPolicyDetails) data.whistleblowerPolicyDetails = formData.whistleblowerPolicyDetails;

			// Tab 3: Risk Management
			if (formData.identifiedEsgRisks) data.identifiedEsgRisks = formData.identifiedEsgRisks;
			if (formData.riskMitigationPlans) data.riskMitigationPlans = formData.riskMitigationPlans;
			if (formData.monitoringEscalationMechanisms) data.monitoringEscalationMechanisms = formData.monitoringEscalationMechanisms;
			if (formData.complianceViolations) data.complianceViolations = parseInt(formData.complianceViolations);
			if (formData.auditResults) data.auditResults = formData.auditResults;

			// Tab 4: Transparency & Reporting
			data.materialEsgRisksDisclosed = formData.materialEsgRisksDisclosed;
			if (formData.materialEsgRisksDetails) data.materialEsgRisksDetails = formData.materialEsgRisksDetails;
			if (formData.reportingGovernancePolicies) data.reportingGovernancePolicies = formData.reportingGovernancePolicies;
			data.thirdPartyAuditExists = formData.thirdPartyAuditExists;
			if (formData.thirdPartyAuditDetails) data.thirdPartyAuditDetails = formData.thirdPartyAuditDetails;

			// Tab 5: Supplier & Customer Governance
			data.supplierEsgGuidelinesExists = formData.supplierEsgGuidelinesExists;
			if (formData.supplierEsgGuidelinesDetails) data.supplierEsgGuidelinesDetails = formData.supplierEsgGuidelinesDetails;
			if (formData.fairBusinessPractices) data.fairBusinessPractices = formData.fairBusinessPractices;
			if (formData.contractualGovernanceClauses) data.contractualGovernanceClauses = formData.contractualGovernanceClauses;

			// Legacy fields
			data.dataPrivacyPolicy = formData.dataPrivacyPolicy;

			await metricsAPI.updateGovernance(params.id as string, data);
			showToast.success(t("governance.updateSuccess"));
			router.push("/dashboard/governance");
		} catch (error: any) {
			showToast.error(error.response?.data?.error || t("common.error"));
		} finally {
			setLoading(false);
		}
	};

	if (metricLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
				</div>
			</DashboardLayout>
		);
	}

	if (companies.length === 0 || !selectedCompany) {
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
			<div className="px-4 md:px-6 lg:px-8">
				<div className="mb-4">
					<Link
						href="/dashboard/governance"
						className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-2"
					>
						<ArrowLeft size={14} />
						{t("common.back")} {t("governance.title")}
					</Link>
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-4 flex-1">
							<div>
								<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("governance.editMetric")}</h1>
								<p className="text-xs text-gray-600">{t("governance.updateMetrics")}</p>
							</div>
							{/* Period Selection */}
							<div className="flex flex-col">
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("dashboard.period")} *
								</label>
								<select
									required
									value={formData.period || ""}
									onChange={(e) => setFormData({ ...formData, period: e.target.value })}
									disabled={loadingPeriods || metricLoading}
									className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								>
									{loadingPeriods || metricLoading ? (
										<option value="">{t("common.loading")}...</option>
									) : periods.length > 0 ? (
										<>
											{!formData.period && <option value="">Select period</option>}
											{periods.map((period) => (
												<option key={period} value={period}>
													{period}
												</option>
											))}
											{formData.period && !periods.includes(formData.period) && (
												<option value={formData.period}>{formData.period}</option>
											)}
										</>
									) : formData.period ? (
										<option value={formData.period}>{formData.period}</option>
									) : (
										<option value="">No periods available</option>
									)}
								</select>
							</div>
						</div>
						<div className="flex gap-2">
							<Link
								href="/dashboard/governance"
								className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded font-medium transition-colors"
							>
								{t("common.cancel")}
							</Link>
							<button
								onClick={(e) => {
									e.preventDefault();
									const form = document.querySelector('form');
									if (form) {
										form.requestSubmit();
									}
								}}
								disabled={loading}
								className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								<Save size={14} />
								{loading ? t("common.loading") : t("common.update")}
							</button>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<form onSubmit={handleSubmit} className="space-y-4">

						{/* Tab Form Component */}
						<GovernanceFormTabs
							formData={formData}
							setFormData={setFormData}
						/>
					</form>
				</div>
			</div>
		</DashboardLayout>
	);
}

