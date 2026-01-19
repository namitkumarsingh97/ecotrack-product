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

	useEffect(() => {
		fetchCompanies();
	}, [fetchCompanies]);

	useEffect(() => {
		if (params.id) {
			loadMetric(params.id as string);
		}
	}, [params.id]);

	const loadMetric = async (id: string) => {
		try {
			setMetricLoading(true);
			const response = await metricsAPI.getGovernanceById(id);
			const metric = response.data.metric;

			setFormData({
				period: metric.period || "",
				companyId: metric.companyId || "",
				// Tab 1
				boardMembers: metric.boardMembers?.toString() || "",
				independentDirectors: metric.independentDirectors?.toString() || "",
				boardDiversityPercent: metric.boardDiversityPercent?.toString() || "",
				esgCommitteeExists: metric.esgCommitteeExists || false,
				esgCommitteeStructure: metric.esgCommitteeStructure || "",
				boardEsgDiscussionFrequency: metric.boardEsgDiscussionFrequency || "",
				// Tab 2
				codeOfConductExists: metric.codeOfConductExists || false,
				codeOfConductDetails: metric.codeOfConductDetails || "",
				antiCorruptionPolicy: metric.antiCorruptionPolicy || false,
				antiCorruptionPolicyDetails: metric.antiCorruptionPolicyDetails || "",
				whistleblowerPolicyExists: metric.whistleblowerPolicyExists || false,
				whistleblowerPolicyDetails: metric.whistleblowerPolicyDetails || "",
				// Tab 3
				identifiedEsgRisks: metric.identifiedEsgRisks || "",
				riskMitigationPlans: metric.riskMitigationPlans || "",
				monitoringEscalationMechanisms: metric.monitoringEscalationMechanisms || "",
				complianceViolations: metric.complianceViolations?.toString() || "",
				auditResults: metric.auditResults || "",
				// Tab 4
				materialEsgRisksDisclosed: metric.materialEsgRisksDisclosed || false,
				materialEsgRisksDetails: metric.materialEsgRisksDetails || "",
				reportingGovernancePolicies: metric.reportingGovernancePolicies || "",
				thirdPartyAuditExists: metric.thirdPartyAuditExists || false,
				thirdPartyAuditDetails: metric.thirdPartyAuditDetails || "",
				// Tab 5
				supplierEsgGuidelinesExists: metric.supplierEsgGuidelinesExists || false,
				supplierEsgGuidelinesDetails: metric.supplierEsgGuidelinesDetails || "",
				fairBusinessPractices: metric.fairBusinessPractices || "",
				contractualGovernanceClauses: metric.contractualGovernanceClauses || "",
				// Legacy
				dataPrivacyPolicy: metric.dataPrivacyPolicy || false,
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
				<div className="text-center py-12">
					<div className="text-xs text-gray-500">Loading...</div>
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
			<div className="max-w-6xl mx-auto">
				<div className="mb-4">
					<Link
						href="/dashboard/governance"
						className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-2"
					>
						<ArrowLeft size={14} />
						{t("common.back")} {t("governance.title")}
					</Link>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-lg font-semibold text-gray-900 mb-0.5">{t("governance.editMetric")}</h1>
							<p className="text-xs text-gray-600">{t("governance.updateMetrics")}</p>
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
						{/* Period Selection */}
						<div className="pb-4 border-b border-gray-200">
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">
									{t("dashboard.period")} *
								</label>
								<input
									type="text"
									required
									value={formData.period}
									onChange={(e) => setFormData({ ...formData, period: e.target.value })}
									className="w-full md:w-auto px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
									placeholder="2026-Q1"
								/>
								<p className="text-xs text-gray-500 mt-0.5">{t("governance.periodFormat") || "Format: YYYY-QN (e.g., 2026-Q1)"}</p>
							</div>
						</div>

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

